-- HAUTLAB Telegram secrets in Supabase Vault + database-owned scheduler.

create or replace function public.hautlab_telegram_secret(p_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
begin
  if p_name not in (
    'bot_token',
    'webhook_secret',
    'pairing_secret_doctor',
    'pairing_secret_karen',
    'setup_key',
    'mcp_key',
    'cron_key'
  ) then
    raise exception 'telegram_secret_not_allowed' using errcode = 'P0001';
  end if;

  select decrypted_secret
    into v_secret
    from vault.decrypted_secrets
   where name = 'hautlab_telegram_' || p_name
   limit 1;

  if v_secret is null or btrim(v_secret) = '' then
    raise exception 'telegram_secret_not_configured' using errcode = 'P0001';
  end if;

  return v_secret;
end;
$$;

create or replace function public.hautlab_telegram_set_secret(
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
  if p_name not in (
    'bot_token',
    'webhook_secret',
    'pairing_secret_doctor',
    'pairing_secret_karen',
    'setup_key',
    'mcp_key',
    'cron_key'
  ) then
    raise exception 'telegram_secret_not_allowed' using errcode = 'P0001';
  end if;

  if p_secret is null or btrim(p_secret) = '' then
    raise exception 'telegram_secret_empty' using errcode = 'P0001';
  end if;

  select id
    into v_id
    from vault.secrets
   where name = 'hautlab_telegram_' || p_name
   limit 1;

  if v_id is null then
    perform vault.create_secret(
      p_secret,
      'hautlab_telegram_' || p_name,
      'HAUTLAB Telegram Command Center'
    );
  else
    perform vault.update_secret(
      v_id,
      p_secret,
      'hautlab_telegram_' || p_name,
      'HAUTLAB Telegram Command Center'
    );
  end if;
end;
$$;

create or replace function public.hautlab_telegram_delete_secret(p_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_name not in (
    'bot_token',
    'webhook_secret',
    'pairing_secret_doctor',
    'pairing_secret_karen',
    'setup_key',
    'mcp_key',
    'cron_key'
  ) then
    raise exception 'telegram_secret_not_allowed' using errcode = 'P0001';
  end if;

  delete from vault.secrets
   where name = 'hautlab_telegram_' || p_name;
end;
$$;

revoke all on function public.hautlab_telegram_secret(text)
  from public, anon, authenticated;
revoke all on function public.hautlab_telegram_set_secret(text, text)
  from public, anon, authenticated;
revoke all on function public.hautlab_telegram_delete_secret(text)
  from public, anon, authenticated;

grant execute on function public.hautlab_telegram_secret(text) to service_role;
grant execute on function public.hautlab_telegram_set_secret(text, text) to service_role;
grant execute on function public.hautlab_telegram_delete_secret(text) to service_role;

-- Use database cron so the scheduler can authenticate with a Vault-held secret
-- without requiring a Vercel environment variable.
do $$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid
    from cron.job
   where jobname = 'hautlab-telegram-jobs'
   limit 1;

  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
end;
$$;

select cron.schedule(
  'hautlab-telegram-jobs',
  '*/5 * * * *',
  $cron$
    select net.http_get(
      url := 'https://www.hautlabmx.com/api/telegram/cron',
      headers := jsonb_build_object(
        'Authorization',
        'Bearer ' || public.hautlab_telegram_secret('cron_key')
      ),
      timeout_milliseconds := 10000
    ) as request_id;
  $cron$
);
