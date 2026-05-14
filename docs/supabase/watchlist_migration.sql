-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

create table public.watchlist (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  ico             text        not null,
  display_name    text        not null,
  added_at        timestamptz not null default now(),
  last_checked_at timestamptz,
  notify_email    text,
  isir_clarity    text,
  ares_stav_kod   text,
  dph_nespolehlivy boolean,
  unique (user_id, ico)
);

alter table public.watchlist enable row level security;

create policy "Users own their watchlist"
  on public.watchlist for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS filters rows; this grant lets PostgREST reach the table at all
grant select, insert, update, delete on public.watchlist to authenticated;
