CREATE TABLE IF NOT EXISTS public.waitlist (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      text        NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
