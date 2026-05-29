CREATE TABLE public.agent_credentials (
  registration_id    text PRIMARY KEY,
  credential_hash    text UNIQUE,
  credential_type    text NOT NULL DEFAULT 'api_key'
                       CHECK (credential_type IN ('api_key')),
  registration_type  text NOT NULL
                       CHECK (registration_type IN ('anonymous', 'identity_assertion')),
  assertion_email    text,
  user_id            uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scopes             text[] NOT NULL DEFAULT '{}',
  created_at         timestamptz NOT NULL DEFAULT now(),
  claimed_at         timestamptz,
  revoked_at         timestamptz
);

CREATE INDEX agent_credentials_user_id_idx
  ON public.agent_credentials(user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.agent_credentials ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.agent_credentials TO service_role;

CREATE TABLE public.agent_claims (
  claim_token      text PRIMARY KEY,
  registration_id  text NOT NULL REFERENCES public.agent_credentials(registration_id) ON DELETE CASCADE,
  pending_email    text NOT NULL,
  otp_hash         text NOT NULL,
  attempts         int NOT NULL DEFAULT 0,
  expires_at       timestamptz NOT NULL,
  completed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX agent_claims_registration_id_idx
  ON public.agent_claims(registration_id);

ALTER TABLE public.agent_claims ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_claims TO service_role;
