-- Pre-verified clinic invitation: a verified Clerk email + secret delivered by a trusted clinical channel
-- automatically binds a patient. Issuing an invitation requires the clinic owner and is auditable.
create table public.private_care_invitations (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 2 and 120),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  created_by_clerk_id text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by_clerk_id text,
  patient_id uuid references public.private_care_patients(id) on delete restrict,
  check (expires_at > created_at),
  check ((redeemed_at is null and patient_id is null and redeemed_by_clerk_id is null)
      or (redeemed_at is not null and patient_id is not null and redeemed_by_clerk_id is not null))
);
create index private_care_invitations_active_idx on public.private_care_invitations(expires_at)
  where redeemed_at is null and revoked_at is null;
alter table public.private_care_invitations enable row level security;
revoke all on public.private_care_invitations from public, anon, authenticated;
grant select, insert, update on public.private_care_invitations to service_role;

create function public.private_care_claim_invitation(
  p_token_hash text, p_email text, p_clerk_user_id text
) returns uuid
language plpgsql security definer
set search_path = public, pg_temp
as $care_claim$
declare
  v_invite public.private_care_invitations%rowtype;
  v_patient_id uuid;
begin
  if p_token_hash !~ '^[a-f0-9]{64}$' or p_email is null
     or p_email <> lower(btrim(p_email)) or length(p_email) > 254
     or p_email not like '%@%' or p_clerk_user_id is null
     or length(p_clerk_user_id) not between 3 and 255 then
     raise exception 'invalid_invitation';
  end if;
  select * into v_invite from public.private_care_invitations
    where token_hash=p_token_hash and revoked_at is null
    and redeemed_at is null and expires_at > now() for update;
  if not found then raise exception 'invalid_or_expired_invitation'; end if;

  if exists (select 1 from public.private_care_patients
              where email=p_email or clerk_user_id=p_clerk_user_id) then
    raise exception 'existing_patient_requires_manual_resolution';
  end if;
  insert into public.private_care_patients
    (email,display_name,status,clerk_user_id,created_by_clerk_id)
  values (p_email,v_invite.display_name,'active',p_clerk_user_id,v_invite.created_by_clerk_id)
  returning id into v_patient_id;

  update public.private_care_invitations
    set redeemed_at=now(),patient_id=v_patient_id,redeemed_by_clerk_id=p_clerk_user_id
    where id=v_invite.id and redeemed_at is null;
  if not found then raise exception 'invitation_already_used'; end if;

  -- A prior request is automatically resolved only when it matches the same verified identity.
  update public.private_care_access_requests
    set status='approved',patient_id=v_patient_id,reviewed_at=now(),
        reviewed_by_clerk_id=v_invite.created_by_clerk_id
    where clerk_user_id=p_clerk_user_id and email=p_email and status='pending';
  return v_patient_id;
end;
$care_claim$;
revoke all on function public.private_care_claim_invitation(text,text,text) from public, anon, authenticated;
grant execute on function public.private_care_claim_invitation(text,text,text) to service_role;
comment on table public.private_care_invitations is
'Trusted-channel one-time clinic invitations; only SHA-256 hashes persisted, no plaintext code stored. Owner must verify the recipient through an existing clinical channel.';
