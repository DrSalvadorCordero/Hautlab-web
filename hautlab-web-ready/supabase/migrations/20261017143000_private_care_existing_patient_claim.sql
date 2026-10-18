-- Preserve access for patients enrolled by the owner before Clerk account binding.
-- A valid one-use invitation plus the same verified email may claim only an active,
-- unbound patient row. A row bound to another Clerk account always fails closed.
create or replace function public.private_care_claim_invitation(
  p_token_hash text, p_email text, p_clerk_user_id text
) returns uuid
language plpgsql security definer
set search_path = public, pg_temp
as $care_claim$
declare
  v_invite public.private_care_invitations%rowtype;
  v_patient_id uuid;
  v_existing_clerk_id text;
  v_patient_status text;
begin
  if p_token_hash !~ '^[a-f0-9]{64}$' or p_email is null
     or p_email <> lower(btrim(p_email)) or length(p_email) > 254
     or p_email not like '%@%' or p_clerk_user_id is null
     or length(p_clerk_user_id) not between 3 and 255 then
    raise exception 'invalid_invitation';
  end if;

  select * into v_invite
    from public.private_care_invitations
    where token_hash = p_token_hash
      and revoked_at is null
      and redeemed_at is null
      and expires_at > now()
    for update;
  if not found then
    raise exception 'invalid_or_expired_invitation';
  end if;

  select id, clerk_user_id, status
    into v_patient_id, v_existing_clerk_id, v_patient_status
    from public.private_care_patients
    where email = p_email
    for update;

  if found then
    if v_patient_status <> 'active' then
      raise exception 'existing_patient_suspended';
    end if;
    if v_existing_clerk_id is not null and v_existing_clerk_id <> p_clerk_user_id then
      raise exception 'patient_already_bound_to_another_account';
    end if;

    update public.private_care_patients
      set clerk_user_id = p_clerk_user_id,
          updated_by_clerk_id = v_invite.created_by_clerk_id,
          updated_at = now()
      where id = v_patient_id
        and status = 'active'
        and (clerk_user_id is null or clerk_user_id = p_clerk_user_id);
    if not found then
      raise exception 'patient_binding_changed';
    end if;
  else
    insert into public.private_care_patients
      (email, display_name, status, clerk_user_id, created_by_clerk_id)
    values (
      p_email,
      v_invite.display_name,
      'active',
      p_clerk_user_id,
      v_invite.created_by_clerk_id
    )
    returning id into v_patient_id;
  end if;

  update public.private_care_invitations
    set redeemed_at = now(),
        patient_id = v_patient_id,
        redeemed_by_clerk_id = p_clerk_user_id
    where id = v_invite.id and redeemed_at is null;
  if not found then
    raise exception 'invitation_already_used';
  end if;

  update public.private_care_access_requests
    set status = 'approved',
        patient_id = v_patient_id,
        reviewed_at = now(),
        reviewed_by_clerk_id = v_invite.created_by_clerk_id
    where clerk_user_id = p_clerk_user_id
      and email = p_email
      and status = 'pending';

  return v_patient_id;
end;
$care_claim$;

revoke all on function public.private_care_claim_invitation(text,text,text)
  from public, anon, authenticated;
grant execute on function public.private_care_claim_invitation(text,text,text)
  to service_role;
