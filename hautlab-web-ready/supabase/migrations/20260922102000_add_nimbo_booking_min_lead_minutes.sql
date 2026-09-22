alter table public.nimbo_integration_config
  add column if not exists booking_min_lead_minutes integer not null default 240
  check (booking_min_lead_minutes between 0 and 10080);

update public.nimbo_integration_config
set booking_min_lead_minutes = 240,
    updated_at = now()
where id='global';
