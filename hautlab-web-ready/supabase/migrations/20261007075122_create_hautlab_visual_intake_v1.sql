insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'hautlab-intake',
  'hautlab-intake',
  false,
  8388608,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

create table if not exists public.hautlab_plan_assets (
  id uuid primary key,
  plan_id uuid not null references public.hautlab_plans(id) on delete cascade,
  kind text not null check (kind in ('front','left_oblique','right_oblique','detail')),
  bucket_id text not null default 'hautlab-intake' check (bucket_id = 'hautlab-intake'),
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','image/heic','image/heif')),
  declared_size_bytes bigint not null check (declared_size_bytes > 0 and declared_size_bytes <= 8388608),
  status text not null default 'pending' check (status in ('pending','uploaded','deleted')),
  consent_version text not null check (consent_version = 'visual-intake-v1'),
  consented_at timestamptz not null,
  retention_until timestamptz not null,
  uploaded_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.hautlab_plan_assets is
  'Temporary, private pre-valuation visual intake. Not a clinical record. No patient identity fields. Default retention is 30 days.';

create index if not exists hautlab_plan_assets_plan_status_idx
  on public.hautlab_plan_assets(plan_id, status, created_at desc);

create index if not exists hautlab_plan_assets_retention_idx
  on public.hautlab_plan_assets(retention_until)
  where status <> 'deleted';

alter table public.hautlab_plan_assets enable row level security;
revoke all on table public.hautlab_plan_assets from public, anon, authenticated;
grant select, insert, update, delete on table public.hautlab_plan_assets to service_role;

drop trigger if exists hautlab_plan_assets_set_updated_at on public.hautlab_plan_assets;
create trigger hautlab_plan_assets_set_updated_at
before update on public.hautlab_plan_assets
for each row execute function private.hautlab_set_updated_at();
