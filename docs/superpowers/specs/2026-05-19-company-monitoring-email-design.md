# Company Monitoring & Email Notification — Design Spec

**Date:** 2026-05-19
**Status:** Approved
**Scope:** MVP — toggle per company, immediate notification, account email, Cloudflare Email Workers

---

## Overview

Users can enable email notifications per watched company via a toggle on the dashboard card. When enabled, a scheduled Cloudflare Worker detects any status change (ISIR, DPH, ARES) and sends an email to the user's account address. The feature uses a two-step diff-then-notify pattern for resilience.

---

## Decisions

| Question | Decision |
|---|---|
| What triggers a notification? | Any status change: ISIR clarity, DPH unreliable, ARES status |
| Email address | User's account email (`auth.users.email`). Custom per-company email is a future TODO. |
| Notification style | Immediate — as soon as the monitoring Worker detects a change |
| Backend scheduling | Separate Cloudflare Worker with cron trigger (`0 * * * *`) |
| Architecture | Two-step: diff (detect + flag) then notify (send + clear flag) |
| Email provider | Cloudflare Email Workers (`send_email` binding) — no external account |

---

## Frontend — Toggle on Dashboard Card

### Behaviour
- Each company card in the dashboard gets a notification toggle (slide toggle + bell icon).
- Toggle is only visible to authenticated users.
- Toggle state derives from `entity.notifyEmail !== null`.
- Toggle ON → call `WatchService.setNotification(id, user.email)` → sets `notify_email = user.email` in Supabase.
- Toggle OFF → call `WatchService.setNotification(id, null)` → sets `notify_email = null`.

### UI placement
- Bottom of `mat-card-content`, below the status badges and `last_checked` line.
- Label: "Notifikace" with a bell icon; when active, show the email address below in small text.

### WatchService changes
- Add `setNotification(id: string, email: string | null): Observable<void>` — updates `notify_email` column via Supabase.

### WatchedEntity model
- No changes needed — `notifyEmail: string | null` already exists.

---

## Backend — Cloudflare Worker (`workers/monitor/`)

### File structure
```
workers/
  monitor/
    index.ts          ← Worker entry point, scheduled() handler
    diff.ts           ← Step 1: fetch external APIs, compare, flag changes
    notify.ts         ← Step 2: send emails, clear flags
    email-template.ts ← Plain-text + HTML email body builder
    wrangler.toml     ← Cron trigger + send_email binding + secrets
```

### `wrangler.toml`
```toml
name = "firmometr-monitor"
main = "index.ts"
compatibility_date = "2024-01-01"

[triggers]
crons = ["0 * * * *"]

[[send_email]]
name = "SEND_EMAIL"

[vars]
SUPABASE_URL = "https://lentsvnmpqmrscgfscnc.supabase.co"
FROM_ADDRESS = "noreply@firmometr.cz"
# SUPABASE_SERVICE_KEY set via: npx wrangler secret put SUPABASE_SERVICE_KEY
```

### Cloudflare Email Routing setup (one-time)
1. Enable Email Routing on the domain in Cloudflare dashboard.
2. Verify sender address (`noreply@firmometr.cz`) as a destination or use a custom address worker route.
3. The `send_email` binding allows the Worker to send to any address programmatically.

### Step 1 — Diff (`diff.ts`)

Runs at the start of each scheduled invocation.

1. Query Supabase (service role) for all watchlist rows where `notify_email IS NOT NULL`.
2. For each row, fetch current status from external APIs in parallel:
   - ISIR SOAP → derive `isirClarity`
   - DPH REST (`nespolehliviPlatci`) → derive `dphNespolehlivy`
   - ARES REST → derive `aresStavKod`
3. Compare fetched values against stored `isir_clarity`, `dph_nespolehlivy`, `ares_stav_kod`.
4. If any field changed:
   - Update the changed columns in Supabase.
   - Set `pending_notification = true`.
   - Update `last_checked_at = now()`.
5. If nothing changed, only update `last_checked_at`.

Parallelism: fetch all IČOs concurrently with `Promise.allSettled` — failures for individual IČOs are logged and skipped, they do not abort the run.

### Step 2 — Notify (`notify.ts`)

Runs immediately after Step 1 in the same scheduled invocation.

1. Query Supabase for all watchlist rows where `pending_notification = true` (include `user_id` in select).
2. For each row, call `supabaseAdmin.auth.admin.getUserById(user_id)` to get `user.email`.
3. Build email body (`email-template.ts`):
   - Subject: `Změna stavu firmy: {displayName} (IČO {ico})`
   - Body: what changed (old value → new value), link to `/firma/{ico}`.
4. Send via `SEND_EMAIL` binding (Cloudflare Email Workers).
5. On success: set `pending_notification = false`.
6. On send failure: log error, leave `pending_notification = true` — next run will retry.

### Env bindings

| Binding | Type | Purpose |
|---|---|---|
| `SEND_EMAIL` | Email binding | Send transactional emails |
| `SUPABASE_URL` | Var | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Secret | Supabase service role key |
| `FROM_ADDRESS` | Var | Sender email address |

---

## Database Migration

Single new column on the `watchlist` table:

```sql
ALTER TABLE watchlist
  ADD COLUMN pending_notification BOOLEAN NOT NULL DEFAULT false;
```

All other relevant columns (`notify_email`, `isir_clarity`, `dph_nespolehlivy`, `ares_stav_kod`, `last_checked_at`) already exist.

---

## Error Handling

- **API fetch fails for one IČO:** log and skip; continue with others. `last_checked_at` is not updated for that row.
- **Email send fails:** leave `pending_notification = true`; the next hourly run retries automatically.
- **Supabase unreachable:** Worker throws, Cloudflare logs the failure; no state is corrupted.

---

## Out of Scope (future TODOs)

- Custom notification email per company (field `notify_email` is already there and ready).
- Daily digest mode (vs. immediate).
- Choosing which signals to monitor per company.
- Slack / Teams notification channel.

