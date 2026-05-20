# Subscription Tiers & Watch Count Cap — Design Spec

**Date:** 2026-05-21  
**Status:** Approved

---

## Problem

The watchlist has no limits. Every user can watch unlimited companies regardless of plan. Email notification is a per-company toggle, which adds UI complexity without real value — if you're watching a company, you want to know when it changes.

## Goals

1. Introduce three subscription tiers: **FREE**, **BASIC**, **ENTERPRISE**
2. Hard-cap watched companies per tier (FREE=3, BASIC=50, ENTERPRISE=unlimited)
3. Simplify notifications: watching a company always means receiving email alerts — remove per-company toggle
4. Manual tier management for MVP (admin sets tier in Supabase dashboard)

---

## Tier Definitions

| Tier | Display name (EN + CS) | Watch limit | Price |
|------|----------------------|-------------|-------|
| `free` | FREE | 3 | Free |
| `basic` | BASIC | 50 | Paid (manual) |
| `enterprise` | ENTERPRISE | ∞ | Under development |

Names are English in both language versions.

---

## Data Model

### New: `profiles` table

```sql
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  user_tier   text NOT NULL DEFAULT 'free'
                CHECK (user_tier IN ('free', 'basic', 'enterprise')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

- Auto-created via Postgres trigger on `auth.users` INSERT
- `email` copied from `auth.users.email` at creation
- `user_tier` changed manually by admin in Supabase dashboard to upgrade users
- RLS: users can SELECT their own row, no INSERT/UPDATE from client

### `watchlist` table changes

Drop columns no longer needed:
- `notify_email` — notifications now always use `profiles.email`
- `pending_notification` — monitor reads watchlist, sends to `profiles.email` directly

---

## Tier Limit Config

Single source of truth in frontend and worker:

```ts
export const TIER_LIMITS: Record<string, number> = {
  free: 3,
  basic: 50,
  enterprise: Infinity,
};
```

---

## Enforcement

### Layer 1 — Frontend (WatchService)

Before inserting a watch:
1. Fetch `profiles` row for current user (tier + join watchlist count)
2. If `count >= TIER_LIMITS[tier]` → throw a typed error, show upgrade prompt
3. Else → proceed with insert

Profile is loaded once at login and cached in `AuthService` (new `profile$` observable).

### Layer 2 — Database safety net

Postgres function + check constraint prevents over-limit inserts regardless of client:

```sql
CREATE FUNCTION check_watch_limit() RETURNS trigger AS $$
DECLARE
  tier text;
  watch_count int;
  tier_limit int;
BEGIN
  SELECT user_tier INTO tier FROM profiles WHERE id = NEW.user_id;
  SELECT COUNT(*) INTO watch_count FROM watchlist WHERE user_id = NEW.user_id;
  tier_limit := CASE tier
    WHEN 'free' THEN 3
    WHEN 'basic' THEN 50
    ELSE 2147483647
  END;
  IF watch_count >= tier_limit THEN
    RAISE EXCEPTION 'watch_limit_exceeded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_watch_limit
  BEFORE INSERT ON watchlist
  FOR EACH ROW EXECUTE FUNCTION check_watch_limit();
```

---

## Monitor Worker Changes

Replace `notify_email IS NOT NULL` filter with: fetch all watchlist rows, join `profiles` on `user_id = profiles.id`, use `profiles.email` as the notification target.

```sql
SELECT w.*, p.email AS user_email
FROM watchlist w
JOIN profiles p ON p.id = w.user_id
```

---

## Dashboard UI Changes

- **Watch counter** below hero: `"Sledujete 2 / 3 firem"` (FREE) or `"12 / 50 firem"` (BASIC)
- **At limit:** counter turns amber + Add button disabled + tooltip `"Upgradujte na BASIC pro více firem"`
- **Upgrade link:** routes to `/ceny` pricing page
- **Remove:** notification bell toggle from all cards

---

## Auth Service Changes

- Load `profiles` row on login, store as `currentProfile`
- Expose `currentUserTier: string` getter
- Expose `currentWatchCount: number` (updated after each watch/unwatch)

---

## Pricing Page Changes

- Rename "Solo" → **BASIC**
- Rename "Business" → **ENTERPRISE**
- Update all related i18n keys in `en.json` / `cs.json` / `public/assets/i18n/`

---

## Out of Scope (MVP)

- Payment / Stripe integration
- Self-serve upgrade flow
- Email sending for notifications (separate feature, already planned)
- ENTERPRISE tier features beyond the name
