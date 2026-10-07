-- Supabase schema for Dad & Son Phitsanulok 2026
-- Supports multiple photos per mission + mission notes + daily journal.

create table if not exists public.photo_missions (
  id bigint generated always as identity primary key,
  mission_id int not null unique,
  stars int not null default 0 check (stars >= 0 and stars <= 3),
  completed boolean not null default false,
  photo_url text,
  photo_urls jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.photo_missions
  add column if not exists photo_urls jsonb not null default '[]'::jsonb;

alter table public.photo_missions
  add column if not exists notes text;

create index if not exists idx_photo_missions_mission_id
  on public.photo_missions (mission_id);

alter table public.photo_missions enable row level security;

drop policy if exists "Allow anon read photo_missions" on public.photo_missions;
drop policy if exists "Allow anon insert photo_missions" on public.photo_missions;
drop policy if exists "Allow anon update photo_missions" on public.photo_missions;

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

create table if not exists public.trip_journal (
  id bigint primary key,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trip_journal enable row level security;

drop policy if exists "Allow anon read trip_journal" on public.trip_journal;
drop policy if exists "Allow anon insert trip_journal" on public.trip_journal;
drop policy if exists "Allow anon update trip_journal" on public.trip_journal;

create policy "Allow anon read trip_journal"
  on public.trip_journal for select
  to anon, authenticated
  using (true);

create policy "Allow anon insert trip_journal"
  on public.trip_journal for insert
  to anon, authenticated
  with check (true);

create policy "Allow anon update trip_journal"
  on public.trip_journal for update
  to anon, authenticated
  using (true)
  with check (true);

-- Storage bucket must already exist as: trip-photos
-- Keep the current storage setup if it is already working.
