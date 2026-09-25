drop index if exists public.growth_conversion_events_event_schedule_uidx;

create unique index growth_conversion_events_event_schedule_uidx
  on public.growth_conversion_events(event_name, nimbo_schedule_id);
