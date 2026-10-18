begin;
create table public.nimbo_note_operations (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null,
  digest text not null unique check (digest ~ '^[a-f0-9]{64}$'),
  sealed text not null,
  state text not null default 'draft' check (state in ('draft','submitting','verified','uncertain')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  approved_at timestamptz,
  remote_id bigint,
  verified_at timestamptz,
  check (state <> 'verified' or (remote_id is not null and remote_id > 0 and verified_at is not null)),
  check (state = 'draft' or approved_at is not null)
);
alter table public.nimbo_note_operations enable row level security;
revoke all on public.nimbo_note_operations from public, anon, authenticated;
grant select, insert, update on public.nimbo_note_operations to service_role;

-- No clinical body or demographic data in the audit trail.
create table public.nimbo_note_audit (
  id bigint generated always as identity primary key,
  operation_id uuid not null references public.nimbo_note_operations(id),
  actor_id text not null,
  state text not null,
  recorded_at timestamptz not null default now()
);
alter table public.nimbo_note_audit enable row level security;
revoke all on public.nimbo_note_audit from public, anon, authenticated;
grant select, insert on public.nimbo_note_audit to service_role;
grant usage on sequence public.nimbo_note_audit_id_seq to service_role;

create function public.nimbo_note_transition_guard() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP = 'UPDATE' then
    if (new.id,new.actor_id,new.digest,new.sealed,new.created_at,new.expires_at)
       is distinct from (old.id,old.actor_id,old.digest,old.sealed,old.created_at,old.expires_at) then
      raise exception 'immutable_note_operation';
    end if;
    if not ((old.state='draft' and new.state='submitting' and old.expires_at > now())
         or (old.state='submitting' and new.state in ('verified','uncertain'))) then
      raise exception 'invalid_note_transition';
    end if;
    if old.state <> 'draft' and new.approved_at is distinct from old.approved_at then
      raise exception 'immutable_note_approval';
    end if;
  elsif new.state <> 'draft' then
    raise exception 'initial_state_must_be_draft';
  end if;
  return new;
end;
$$;
create function public.nimbo_note_audit_transition() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.nimbo_note_audit(operation_id,actor_id,state) values(new.id,new.actor_id,new.state);
  return new;
end;
$$;
revoke all on function public.nimbo_note_transition_guard() from public, anon, authenticated;
revoke all on function public.nimbo_note_audit_transition() from public, anon, authenticated;
grant execute on function public.nimbo_note_transition_guard(), public.nimbo_note_audit_transition() to service_role;
create trigger nimbo_note_guard before insert or update on public.nimbo_note_operations for each row execute function public.nimbo_note_transition_guard();
create trigger nimbo_note_audit after insert or update on public.nimbo_note_operations for each row execute function public.nimbo_note_audit_transition();
commit;
