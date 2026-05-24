create table if not exists public.orders (
  id          uuid        primary key default gen_random_uuid(),
  plan        text        not null,
  billing     text        not null,
  jmeno       text        not null,
  ico         text,
  dic         text,
  adresa      text        not null,
  email       text        not null,
  telefon     text        not null,
  created_at  timestamptz not null default now()
);

-- RLS: no anon/authenticated access — only the service role (Cloudflare function) can insert/read
alter table public.orders enable row level security;

grant insert, select on public.orders to service_role;
