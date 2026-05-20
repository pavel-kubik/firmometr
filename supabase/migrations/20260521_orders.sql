create table if not exists orders (
  id          uuid        primary key default gen_random_uuid(),
  plan        text        not null,
  billing     text        not null,
  jmeno       text        not null,
  ico         text        not null,
  dic         text,
  adresa      text        not null,
  email       text        not null,
  telefon     text        not null,
  created_at  timestamptz not null default now()
);
