-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

create table public.api_calls (
  id           uuid        primary key default gen_random_uuid(),
  called_at    timestamptz not null default now(),
  registry     text        not null,  -- 'ares' | 'isir' | 'dph' | 'or_vr' | 'or_subjekt_id' | 'sbirka_listin' | 'cuzk'
  url          text        not null,
  ico          text,
  source_ip    text,
  user_agent   text,
  user_id      uuid,                  -- null for unauthenticated requests
  cache_hit    boolean     not null default false,
  duration_ms  int,
  error        text                   -- null on success
);

-- Only the service role key can insert (bypasses RLS).
-- No public read policies — use Supabase dashboard or service role to query.
alter table public.api_calls enable row level security;

create index on public.api_calls (called_at desc);
create index on public.api_calls (ico);
create index on public.api_calls (registry);
