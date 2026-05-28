# Firmometr — Authentication Guide for Agents

## Public Access (No Auth Required)

Both search endpoints are publicly accessible without authentication:

| Endpoint | Description |
|---|---|
| `GET /api/v1/search?q={name}` | Search Czech companies by name |
| `GET /api/v1/search/ico/{ico}` | Get full company profile by IČO |

**Rate limit:** 20 requests per 5-minute window per session (tracked by cookie `srch_cnt`).
Authenticated requests are exempt from the rate limit.

## Authentication

Firmometr uses **Supabase Auth** (OAuth 2.0 / OpenID Connect).

- **Issuer:** `https://lentsvnmpqmrscgfscnc.supabase.co/auth/v1`
- **OpenID configuration:** `https://lentsvnmpqmrscgfscnc.supabase.co/auth/v1/.well-known/openid-configuration`
- **Protected Resource metadata (RFC 9728):** `https://firmometr.cz/.well-known/oauth-protected-resource`

### Obtaining a Token

**Password flow (for testing / scripted access):**

```http
POST https://lentsvnmpqmrscgfscnc.supabase.co/auth/v1/token?grant_type=password
Content-Type: application/json
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbnRzdm5tcHFtcnNjZ2ZzY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3ODk1MjEsImV4cCI6MjA5NDM2NTUyMX0.Qq30-f9UemGt0Xvr_gKH7C69eq0ZuTcE4OhhsG8mbR0

{ "email": "user@example.com", "password": "..." }
```

The response includes `access_token` (JWT, valid ~1 hour) and `refresh_token`.

### Using the Token

Pass the JWT as a Bearer token on every API request:

```
Authorization: Bearer <access_token>
```

### Registration

Human users register at <https://firmometr.cz/register>.
For enterprise/API-only access contact info@firmometr.cz.

## Watchlist (Authenticated Only)

Watchlist CRUD is managed via Supabase directly using the same JWT.
Contact info@firmometr.cz for enterprise API access and webhook delivery.
