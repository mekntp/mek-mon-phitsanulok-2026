-- ====================================================================
-- Supabase Schema for Dad & Son Phitsanulok 2026 Web App
-- Project: xjqpfmcgxvvsnvyjxrac
-- ====================================================================

-- 1. Create table for photo missions
create table if not exists public.photo_missions (
  id bigint generated always as identity primary key,
  mission_id int not null unique,
  stars int not null default 0 check (stars >= 0 and stars <= 3),
  completed boolean not null default false,
  photo_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast lookup by mission_id
create index if not exists idx_photo_missions_mission_id on public.photo_missions (mission_id);

-- Enable Row Level Security (RLS)
alter table public.photo_missions enable row level security;

-- Allow public read & write for this family trip app
create policy "Allow anon read photo_missions"
  on public.photo_missions for select
  to anon, authenticated
  using (true);

create policy "Allow anon insert photo_missions"
  on public.photo_missions for insert
  to anon, authenticated
  with check (true);

create policy "Allow anon update photo_missions"
  on public.photo_missions for update
  to anon, authenticated
  using (true)
  with check (true);

-- 2. Storage Bucket setup for 'trip-photos'
-- Note: Create bucket 'trip-photos' in Supabase Dashboard > Storage with 'Public bucket' enabled,
-- or run the following if storage schema is accessible:
insert into storage.buckets (id, name, public)
values ('trip-photos', 'trip-photos', true)
on conflict (id) do nothing;

create policy "Allow public read on trip-photos"
  on storage.objects for select
  to public
  using (bucket_id = 'trip-photos');

create policy "Allow public upload to trip-photos"
  on storage.objects for insert
  to public
  with check (bucket_id = 'trip-photos');

create policy "Allow public update on trip-photos"
  on storage.objects for update
  to public
  using (bucket_id = 'trip-photos');
