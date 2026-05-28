# Firmometr — Authentication Guide for Agents

You are an agent. Firmometr supports **agentic registration**: discover → register → (claim if needed) → call API. Follow the steps below.

## Step 1 — Discover

### 1a. Protected Resource Metadata

```http
GET https://firmometr.cz/.well-known/oauth-protected-resource
```

Response includes `resource`, `scopes_supported`, and `bearer_methods_supported`.

### 1b. Authorization Server Metadata

```http
GET https://firmometr.cz/.well-known/oauth-authorization-server
```

Read the `agent_auth` block in full — it contains `register_uri`, `claim_uri`, `identity_types_supported`, and credential types.

## Public Access (No Auth Required)

Both search endpoints are publicly accessible without credentials:
=======
## Public Access (No Auth Required)

Both search endpoints are publicly accessible without authentication:

| Endpoint | Description |
|---|---|
| `GET /api/v1/search?q={name}` | Search Czech companies by name |
| `GET /api/v1/search/ico/{ico}` | Get full company profile by IČO |

**Rate limit:** 20 requests per 5-minute window. Registered agents are exempt.

## Step 2 — Pick a Method

- **You have a user's email** → `identity_assertion + verified_email`. Unlocks watchlist access after claim ceremony.
- **You have neither** → `anonymous`. Get an `api_key` for rate-limit-exempt public API access immediately; optionally claim later.

## Step 3 — Register

### Anonymous

```http
POST https://firmometr.cz/api/v1/agent/auth
Content-Type: application/json

{
  "type": "anonymous",
  "requested_credential_type": "api_key"
}
```

Response (200):

```json
{
  "registration_id": "reg_...",
  "registration_type": "anonymous",
  "credential_type": "api_key",
  "credential": "sk_...",
  "credential_expires": null,
  "scopes": ["api.read"],
  "claim_url": "https://firmometr.cz/api/v1/agent/auth/claim",
  "claim_token": "clm_...",
  "claim_token_expires": "...",
  "post_claim_scopes": ["api.read", "watchlist.read", "watchlist.write"]
}
```

You have a usable `api_key` immediately. To take ownership and unlock watchlist scopes, continue to Step 4. Otherwise skip to Step 5.

### Email Verification (Watchlist access)

```http
POST https://firmometr.cz/api/v1/agent/auth
Content-Type: application/json

{
  "type": "identity_assertion",
  "assertion_type": "verified_email",
  "assertion": "user@example.com",
  "requested_credential_type": "api_key"
}
```

Response (200): no credential yet — the user receives an email with an OTP. Keep `claim_token` and go to Step 4.

## Step 4 — Claim Ceremony

### 4a. Trigger claim email (anonymous only)

Skip for `email` registrations — email was sent in Step 3.

```http
POST https://firmometr.cz/api/v1/agent/auth/claim
Content-Type: application/json

{ "claim_token": "clm_...", "email": "user@example.com" }
```

### 4b. Wait for the user's OTP

The user receives an email with a 6-digit code. Ask: "Check your email and tell me the 6-digit code."

### 4c. Submit the OTP

```http
POST https://firmometr.cz/api/v1/agent/auth/claim/complete
Content-Type: application/json

{ "claim_token": "clm_...", "otp": "123456" }
```

On success, the credential's scopes are upgraded in place. No new credential is issued.

## Step 5 — Use the Credential

```http
Authorization: Bearer <api_key>
```

`api_key` credentials do not expire (`credential_expires: null`) but are subject to revocation. On a 401 for a previously-working credential, drop it and restart at Step 1.

## Watchlist (Authenticated Only)

After claiming, watchlist CRUD is available via the Firmometr API under `watchlist.read` / `watchlist.write` scopes. Contact info@firmometr.cz for enterprise access.
