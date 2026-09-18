alter table public.nimbo_integration_config
  add column if not exists access_token_expires_at timestamptz;

create or replace function public.hautlab_nimbo_secret(p_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
begin
  if p_name not in ('refresh_token', 'access_token') then
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
  if p_name not in ('refresh_token', 'access_token') then
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
  if p_name not in ('refresh_token', 'access_token') then
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
