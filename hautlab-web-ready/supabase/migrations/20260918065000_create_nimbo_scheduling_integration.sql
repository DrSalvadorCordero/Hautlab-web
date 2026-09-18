-- HAUTLAB Nimbo scheduling integration.
-- Keeps the connector disabled until a Nimbo account is explicitly connected
-- from the protected HAUTLAB admin console. Tokens live in Supabase Vault.

create table if not exists public.nimbo_integration_config (
  id text primary key default 'global' check (id = 'global'),
  enabled boolean not null default false,
  base_url text,
  doctor_account_id bigint,
  doctor_name text,
  organization_id bigint,
  organization_slug text,
  location_id bigint,
  timezone text not null default 'America/Merida',
  consultation_duration_minutes integer check (
    consultation_duration_minutes is null
    or consultation_duration_minutes between 10 and 240
  ),
  portal_url text,
  last_connected_at timestamptz,
  last_verified_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.nimbo_integration_config (id)
values ('global')
on conflict (id) do nothing;

alter table public.nimbo_integration_config enable row level security;
revoke all on table public.nimbo_integration_config from public, anon, authenticated;
grant select, insert, update, delete on table public.nimbo_integration_config to service_role;

drop trigger if exists nimbo_integration_config_set_updated_at on public.nimbo_integration_config;
create trigger nimbo_integration_config_set_updated_at
before update on public.nimbo_integration_config
for each row execute function private.hautlab_set_updated_at();

alter table public.wa_conversations
  add column if not exists nimbo_person_id bigint,
  add column if not exists nimbo_schedule_id bigint,
  add column if not exists nimbo_last_offered_slots jsonb,
  add column if not exists nimbo_offer_expires_at timestamptz;

create or replace function public.hautlab_nimbo_secret(p_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
begin
  if p_name not in ('refresh_token') then
    raise exception 'nimbo_secret_not_allowed' using errcode = 'P0001';
  end if;

  select decrypted_secret
    into v_secret
    from vault.decrypted_secrets
   where name = 'hautlab_nimbo_' || p_name
   limit 1;

  if v_secret is null or btrim(v_secret) = '' then
    raise exception 'nimbo_secret_not_configured' using errcode = 'P0001';
  end if;

  return v_secret;
end;
$$;

create or replace function public.hautlab_nimbo_set_secret(
  p_name text,
  p_secret text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_name not in ('refresh_token') then
    raise exception 'nimbo_secret_not_allowed' using errcode = 'P0001';
  end if;
  if p_secret is null or btrim(p_secret) = '' then
    raise exception 'nimbo_secret_empty' using errcode = 'P0001';
  end if;

  select id
    into v_id
    from vault.secrets
   where name = 'hautlab_nimbo_' || p_name
   limit 1;

  if v_id is null then
    perform vault.create_secret(
      p_secret,
      'hautlab_nimbo_' || p_name,
      'HAUTLAB Nimbo scheduling connector'
    );
  else
    perform vault.update_secret(
      v_id,
      p_secret,
      'hautlab_nimbo_' || p_name,
      'HAUTLAB Nimbo scheduling connector'
    );
  end if;
end;
$$;

create or replace function public.hautlab_nimbo_delete_secret(p_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_name not in ('refresh_token') then
    raise exception 'nimbo_secret_not_allowed' using errcode = 'P0001';
  end if;

  delete from vault.secrets
   where name = 'hautlab_nimbo_' || p_name;
end;
$$;

revoke all on function public.hautlab_nimbo_secret(text) from public, anon, authenticated;
revoke all on function public.hautlab_nimbo_set_secret(text, text) from public, anon, authenticated;
revoke all on function public.hautlab_nimbo_delete_secret(text) from public, anon, authenticated;

grant execute on function public.hautlab_nimbo_secret(text) to service_role;
grant execute on function public.hautlab_nimbo_set_secret(text, text) to service_role;
grant execute on function public.hautlab_nimbo_delete_secret(text) to service_role;
