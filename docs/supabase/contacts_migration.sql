-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

create table public.contacts (
  id         uuid        primary key default gen_random_uuid(),
  name       text,
  email      text        not null,
  message    text        not null,
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

-- Only service role (used by the Cloudflare function) can insert and read
grant insert, select on public.contacts to service_role;
