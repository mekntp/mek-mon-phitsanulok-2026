-- Run this ONCE in Supabase SQL Editor for the existing project.
-- It adds multi-photo support and the daily journal.

alter table public.photo_missions
  add column if not exists photo_urls jsonb not null default '[]'::jsonb;

alter table public.photo_missions
  add column if not exists notes text;

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
