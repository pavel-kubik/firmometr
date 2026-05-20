ALTER TABLE public.api_calls
  ADD COLUMN IF NOT EXISTS env TEXT NOT NULL DEFAULT 'prod';

CREATE INDEX IF NOT EXISTS api_calls_env_idx ON public.api_calls (env);
