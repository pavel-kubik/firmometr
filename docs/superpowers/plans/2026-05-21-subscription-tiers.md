# Subscription Tiers & Watch Count Cap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce FREE/BASIC/ENTERPRISE subscription tiers, cap watched companies per tier (FREE=3, BASIC=50, ENTERPRISE=∞), simplify notifications (watch=notify, remove per-company toggle), and show a watch counter with upgrade prompt in the dashboard.

**Architecture:** A `profiles` table stores each user's tier; a Postgres BEFORE INSERT trigger enforces the cap at DB level; Angular's `AuthService` loads the profile on login and `WatchService` checks the cap before inserting. The dashboard displays a live counter and disables the Add button when the limit is reached.

**Tech Stack:** Supabase (PostgreSQL, RLS, triggers), Angular 18 (standalone components, Transloco i18n), Cloudflare Workers (monitor diff)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `supabase/migrations/20260521_profiles.sql` | profiles table + auto-create trigger + RLS |
| Create | `supabase/migrations/20260521_watchlist_cleanup.sql` | Drop notify_email, pending_notification |
| Create | `supabase/migrations/20260521_watch_limit_trigger.sql` | BEFORE INSERT trigger enforcing tier cap |
| Create | `supabase/migrations/20260521_watchlist_with_email_view.sql` | View joining watchlist + profiles.email |
| Create | `src/app/core/models/profile.model.ts` | UserTier, UserProfile, TIER_LIMITS, isWatchLimitReached |
| Modify | `src/app/core/services/auth.service.ts` | Load profile on login, expose currentProfile/tierLimit |
| Modify | `src/app/core/services/watch.service.ts` | Cap check in watch(), remove setNotification, fix toEntity |
| Modify | `src/app/core/models/watch.model.ts` | Remove notifyEmail from WatchedEntity |
| Modify | `src/app/features/dashboard/dashboard.component.ts` | Counter, disabled Add, remove toggle UI |
| Modify | `assets/i18n/en.json` | New keys + pricing renames |
| Modify | `assets/i18n/cs.json` | New keys + pricing renames |
| Modify | `public/assets/i18n/en.json` | Mirror of assets |
| Modify | `public/assets/i18n/cs.json` | Mirror of assets |
| Modify | `workers/monitor/diff.ts` | Query view, use user_email, drop pending_notification |

---

### Task 1: DB — profiles table

**Files:**
- Create: `supabase/migrations/20260521_profiles.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migrations/20260521_profiles.sql

CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  user_tier   text NOT NULL DEFAULT 'free'
                CHECK (user_tier IN ('free', 'basic', 'enterprise')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO service_role;

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 2: Run in Supabase SQL editor**

Paste the full SQL above into **Supabase Dashboard → SQL Editor** and execute.

Verify: `SELECT * FROM public.profiles;` — should show one row per existing user.

---

### Task 2: DB — watchlist cleanup

**Files:**
- Create: `supabase/migrations/20260521_watchlist_cleanup.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migrations/20260521_watchlist_cleanup.sql

ALTER TABLE public.watchlist
  DROP COLUMN IF EXISTS notify_email,
  DROP COLUMN IF EXISTS pending_notification;
```

- [ ] **Step 2: Run in Supabase SQL editor**

Verify: `SELECT column_name FROM information_schema.columns WHERE table_name = 'watchlist';` — confirm neither column appears.

---

### Task 3: DB — watch limit trigger

**Files:**
- Create: `supabase/migrations/20260521_watch_limit_trigger.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migrations/20260521_watch_limit_trigger.sql

CREATE OR REPLACE FUNCTION public.check_watch_limit()
RETURNS trigger AS $$
DECLARE
  v_tier      text;
  v_count     int;
  v_limit     int;
BEGIN
  SELECT user_tier INTO v_tier FROM public.profiles WHERE id = NEW.user_id;
  SELECT COUNT(*) INTO v_count FROM public.watchlist WHERE user_id = NEW.user_id;

  v_limit := CASE v_tier
    WHEN 'free'  THEN 3
    WHEN 'basic' THEN 50
    ELSE 2147483647
  END;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'watch_limit_exceeded';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_watch_limit
  BEFORE INSERT ON public.watchlist
  FOR EACH ROW EXECUTE FUNCTION public.check_watch_limit();
```

- [ ] **Step 2: Run in Supabase SQL editor**

Verify by testing with a FREE user: insert a 4th row for a user who already has 3 — should fail with `watch_limit_exceeded`.

---

### Task 4: DB — watchlist_with_email view

**Files:**
- Create: `supabase/migrations/20260521_watchlist_with_email_view.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migrations/20260521_watchlist_with_email_view.sql

CREATE OR REPLACE VIEW public.watchlist_with_email AS
SELECT
  w.id,
  w.ico,
  w.display_name,
  w.user_id,
  w.added_at,
  w.last_checked_at,
  w.isir_clarity,
  w.dph_nespolehlivy,
  w.ares_stav_kod,
  p.email AS user_email
FROM public.watchlist w
JOIN public.profiles p ON p.id = w.user_id;

GRANT SELECT ON public.watchlist_with_email TO service_role;
```

- [ ] **Step 2: Run in Supabase SQL editor**

Verify: `SELECT * FROM public.watchlist_with_email LIMIT 5;` — should return watchlist rows with `user_email` populated.

---

### Task 5: Frontend — profile model + pure functions

**Files:**
- Create: `src/app/core/models/profile.model.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/app/core/models/profile.model.ts

export type UserTier = 'free' | 'basic' | 'enterprise';

export interface UserProfile {
  id: string;
  email: string;
  user_tier: UserTier;
  created_at: string;
}

export const TIER_LIMITS: Record<UserTier, number> = {
  free: 3,
  basic: 50,
  enterprise: Infinity,
};

export function isWatchLimitReached(count: number, tier: UserTier): boolean {
  return count >= TIER_LIMITS[tier];
}
```

---

### Task 6: AuthService — load profile on login

**Files:**
- Modify: `src/app/core/services/auth.service.ts`

- [ ] **Step 1: Replace the file content**

```typescript
// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile, UserTier, TIER_LIMITS } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );

  private userSubject    = new BehaviorSubject<User | null>(null);
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);

  readonly user$:    Observable<User | null>        = this.userSubject.asObservable();
  readonly profile$: Observable<UserProfile | null> = this.profileSubject.asObservable();

  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      this.userSubject.next(user);
      if (user) this.loadProfile(user.id);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      this.userSubject.next(user);
      if (user) this.loadProfile(user.id);
      else this.profileSubject.next(null);
    });
  }

  private async loadProfile(userId: string): Promise<void> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    this.profileSubject.next(data as UserProfile | null);
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  signInWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signInWithOtp(email: string) {
    return this.supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get currentUserId(): string | null {
    return this.userSubject.value?.id ?? null;
  }

  get currentUserEmail(): string | null {
    return this.userSubject.value?.email ?? null;
  }

  get currentProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  get currentUserTier(): UserTier {
    return this.profileSubject.value?.user_tier ?? 'free';
  }

  get currentTierLimit(): number {
    return TIER_LIMITS[this.currentUserTier];
  }
}
```

---

### Task 7: WatchService — cap check + cleanup

**Files:**
- Modify: `src/app/core/services/watch.service.ts`

- [ ] **Step 1: Replace the file content**

```typescript
// src/app/core/services/watch.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { WatchedEntity, WatchRequest } from '../models/watch.model';
import { AuthService } from './auth.service';
import { isWatchLimitReached } from '../models/profile.model';

export class WatchLimitError extends Error {
  constructor() { super('watch_limit_exceeded'); }
}

@Injectable({ providedIn: 'root' })
export class WatchService {
  private auth = inject(AuthService);

  private get db() {
    return this.auth.client.from('watchlist');
  }

  listAll(): Observable<WatchedEntity[]> {
    return from(this.db.select('*').order('added_at', { ascending: false })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(row => this.toEntity(row));
      })
    );
  }

  watch(req: WatchRequest, currentCount: number): Observable<WatchedEntity> {
    const userId = this.auth.currentUserId;
    if (!userId) return throwError(() => new Error('Not authenticated'));

    if (isWatchLimitReached(currentCount, this.auth.currentUserTier)) {
      return throwError(() => new WatchLimitError());
    }

    return from(
      this.db.upsert({
        user_id: userId,
        ico: req.ico,
        display_name: req.displayName,
        isir_clarity: req.isirClarity ?? null,
        ares_stav_kod: req.aresStavKod ?? null,
        dph_nespolehlivy: req.dphNespolehlivy ?? null,
      }, { onConflict: 'user_id,ico' }).select().single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          if (error.message?.includes('watch_limit_exceeded')) throw new WatchLimitError();
          throw error;
        }
        return this.toEntity(data!);
      })
    );
  }

  unwatch(id: string): Observable<void> {
    return from(this.db.delete().eq('id', id)).pipe(
      map(({ error }) => { if (error) throw error; })
    );
  }

  unwatchByIco(ico: string): Observable<void> {
    return from(this.db.delete().eq('ico', ico)).pipe(
      map(({ error }) => { if (error) throw error; })
    );
  }

  isWatchedByIco(ico: string): Observable<boolean> {
    return from(this.db.select('id').eq('ico', ico).maybeSingle()).pipe(
      map(({ data }) => data !== null)
    );
  }

  private toEntity(row: Record<string, unknown>): WatchedEntity {
    return {
      id:             row['id'] as string,
      ico:            row['ico'] as string,
      displayName:    row['display_name'] as string,
      addedAt:        row['added_at'] as string,
      lastCheckedAt:  row['last_checked_at'] as string | null,
      isirClarity:    row['isir_clarity'] as WatchedEntity['isirClarity'],
      aresStavKod:    row['ares_stav_kod'] as string | null,
      dphNespolehlivy: row['dph_nespolehlivy'] as boolean | null,
    };
  }
}
```

Note: `watch()` now requires `currentCount` as a parameter — the caller (subject-detail or search component) passes `entities.length`. This avoids an extra DB round-trip.

---

### Task 8: WatchedEntity model — remove notifyEmail

**Files:**
- Modify: `src/app/core/models/watch.model.ts`

- [ ] **Step 1: Replace the file content**

```typescript
// src/app/core/models/watch.model.ts

export interface WatchedEntity {
  id: string;
  ico: string;
  displayName: string;
  addedAt: string;
  lastCheckedAt: string | null;
  isirClarity: 'CLEAR' | 'PAST_DEBTOR' | 'ACTIVE_DEBTOR' | 'ACTIVE_CO_DEBTOR' | null;
  aresStavKod: string | null;
  dphNespolehlivy: boolean | null;
}

export interface WatchRequest {
  ico: string;
  displayName: string;
  isirClarity?: string;
  aresStavKod?: string;
  dphNespolehlivy?: boolean;
}
```

---

### Task 9: Dashboard — counter + remove notification toggle

**Files:**
- Modify: `src/app/features/dashboard/dashboard.component.ts`

This task has two parts: template/CSS changes and component class changes.

- [ ] **Step 1: Update imports and inject AuthService**

At the top of the component, ensure `AuthService` and `Router` are injected and `MatSlideToggleModule` is removed from imports array:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, AbstractControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { WatchService } from '../../core/services/watch.service';
import { WatchedEntity } from '../../core/models/watch.model';
import { AuthService } from '../../core/services/auth.service';
// ... rest of existing imports
```

Remove `MatSlideToggleModule` from the `imports` array in `@Component`.

- [ ] **Step 2: Replace the hero section template**

Find the `<section class="dashboard-hero">` block and replace it with:

```html
<section class="dashboard-hero">
  <div class="hero-inner">
    <h1>{{ 'dashboard.title' | transloco }}</h1>
    <div class="watch-counter" [class.at-limit]="atLimit">
      <span>{{ 'dashboard.watch_counter' | transloco: { count: entities.length, limit: tierLimit } }}</span>
      <a *ngIf="atLimit" class="upgrade-link" [routerLink]="'/ceny'">
        {{ 'dashboard.upgrade_cta' | transloco }}
      </a>
    </div>
    <button
      class="pub-btn pub-btn-primary"
      (click)="goSearch()"
      [disabled]="atLimit"
      [title]="atLimit ? ('dashboard.watch_limit_tooltip' | transloco) : ''">
      {{ 'dashboard.add_btn' | transloco }}
    </button>
  </div>
</section>
```

- [ ] **Step 3: Remove notification toggle from card template**

Find and remove the entire `<div class="notify-row">` block from `mat-card-actions`. After removal the actions block should look like:

```html
<mat-card-actions class="card-actions">
  <button class="pub-btn pub-btn-ghost pub-btn-sm" (click)="goDetail(entity.ico)">{{ 'dashboard.btn_detail' | transloco }}</button>
  <button class="pub-btn pub-btn-danger pub-btn-sm" (click)="unwatch(entity)">{{ 'dashboard.btn_remove' | transloco }}</button>
</mat-card-actions>
```

- [ ] **Step 4: Update CSS — remove notify styles, add counter styles**

Remove `.notify-row`, `.notify-label` rules. Update `.card-actions`:

```css
.card-actions { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; }
.watch-counter { font-size: 13px; color: #666; display: flex; align-items: center; gap: 12px; margin: 4px 0 8px; }
.watch-counter.at-limit { color: #e65100; font-weight: 500; }
.upgrade-link { color: #1976d2; text-decoration: none; font-size: 13px; }
.upgrade-link:hover { text-decoration: underline; }
```

- [ ] **Step 5: Update component class**

Add `atLimit` and `tierLimit` getters, remove `toggleNotification`:

```typescript
get tierLimit(): number {
  return this.authService.currentTierLimit;
}

get atLimit(): boolean {
  return this.entities.length >= this.tierLimit;
}
```

Remove the entire `toggleNotification(entity: WatchedEntity, enable: boolean)` method.

- [ ] **Step 6: Add RouterLink import**

Ensure `RouterLink` is in the component's `imports` array (needed for `[routerLink]` on the anchor):

```typescript
import { RouterLink } from '@angular/router';
```

Add `RouterLink` to the `imports: [...]` array in `@Component`.

---

### Task 10: i18n — add new keys + rename pricing tiers

**Files:**
- Modify: `assets/i18n/en.json`
- Modify: `assets/i18n/cs.json`
- Modify: `public/assets/i18n/en.json`
- Modify: `public/assets/i18n/cs.json`

- [ ] **Step 1: Add dashboard keys to en.json (and public mirror)**

After `"dashboard.notify_error"` (or remove that key entirely since toggle is gone), add:

```json
"dashboard.watch_counter": "Watching {{count}} / {{limit}} companies",
"dashboard.watch_limit_tooltip": "Upgrade to BASIC to watch more companies",
"dashboard.upgrade_cta": "Upgrade to BASIC",
```

Remove keys no longer used: `dashboard.notify_toggle_title`, `dashboard.notify_on`, `dashboard.notify_off`, `dashboard.notify_error`, `dashboard.notify_label`.

- [ ] **Step 2: Add dashboard keys to cs.json (and public mirror)**

```json
"dashboard.watch_counter": "Sledujete {{count}} / {{limit}} firem",
"dashboard.watch_limit_tooltip": "Přejděte na BASIC pro více sledovaných firem",
"dashboard.upgrade_cta": "Přejít na BASIC",
```

Remove same obsolete keys as in Step 1.

- [ ] **Step 3: Update pricing tier names in en.json (and public mirror)**

Change values (not keys) for Solo→BASIC and Business→ENTERPRISE:

```json
"landing.plan_solo_name": "BASIC",
"landing.plan_solo_feat1": "50 watched companies",
"landing.plan_solo_feat2": "ISIR + VAT + CR alerts",
"landing.plan_solo_feat3": "Email notifications",
"landing.plan_solo_feat4": "CSV import",
"landing.plan_business_name": "ENTERPRISE",
"landing.plan_business_feat2": "Everything in BASIC +",
"pricing.plan_solo_name": "BASIC",
"pricing.plan_solo_feat1": "50 watched companies",
"pricing.plan_solo_feat2": "ISIR + VAT + CR alerts",
"pricing.plan_solo_feat3": "Email notifications",
"pricing.plan_solo_feat4": "CSV import",
"pricing.plan_business_name": "ENTERPRISE",
"pricing.plan_business_feat2": "Everything in BASIC +",
```

- [ ] **Step 4: Update pricing tier names in cs.json (and public mirror)**

```json
"landing.plan_solo_name": "BASIC",
"landing.plan_solo_feat1": "50 sledovaných firem",
"landing.plan_solo_feat2": "ISIR + DPH + OR upozornění",
"landing.plan_solo_feat3": "E-mail notifikace",
"landing.plan_solo_feat4": "CSV import",
"landing.plan_business_name": "ENTERPRISE",
"landing.plan_business_feat2": "Vše z BASIC +",
"pricing.plan_solo_name": "BASIC",
"pricing.plan_solo_feat1": "50 sledovaných firem",
"pricing.plan_solo_feat2": "ISIR + DPH + OR upozornění",
"pricing.plan_solo_feat3": "E-mail notifikace",
"pricing.plan_solo_feat4": "CSV import",
"pricing.plan_business_name": "ENTERPRISE",
"pricing.plan_business_feat2": "Vše z BASIC +",
```

---

### Task 11: Monitor worker — use watchlist_with_email view

**Files:**
- Modify: `workers/monitor/diff.ts`

- [ ] **Step 1: Replace the file content**

```typescript
// workers/monitor/diff.ts

import { createClient } from '@supabase/supabase-js';
import { fetchIcoStatus } from './registry';
import type { Env } from './index';

interface WatchlistRow {
  id: string;
  ico: string;
  display_name: string;
  user_id: string;
  user_email: string;
  isir_clarity: string | null;
  dph_nespolehlivy: boolean | null;
  ares_stav_kod: string | null;
}

export async function runDiff(env: Env): Promise<void> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { data: rows, error } = await supabase
    .from('watchlist_with_email')
    .select('id, ico, display_name, user_id, user_email, isir_clarity, dph_nespolehlivy, ares_stav_kod');

  if (error) { console.error('[diff] Failed to load watchlist:', error.message); return; }
  if (!rows?.length) return;

  const results = await Promise.allSettled(
    (rows as WatchlistRow[]).map(row => diffRow(row, supabase, env))
  );

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[diff] Failed for row ${(rows as WatchlistRow[])[i].id}:`, r.reason);
    }
  });
}

async function diffRow(
  row: WatchlistRow,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  env: Env,
): Promise<void> {
  const { isirClarity, dphNespolehlivy, aresStavKod } = await fetchIcoStatus(row.ico, env);

  const changed =
    isirClarity  !== row.isir_clarity ||
    dphNespolehlivy !== row.dph_nespolehlivy ||
    aresStavKod  !== row.ares_stav_kod;

  const updateData: Record<string, unknown> = {
    last_checked_at: new Date().toISOString(),
  };

  if (changed) {
    updateData['isir_clarity']    = isirClarity;
    updateData['dph_nespolehlivy'] = dphNespolehlivy;
    updateData['ares_stav_kod']   = aresStavKod;
    console.log(`[diff] Change detected for ico=${row.ico} user=${row.user_email}`);
    // TODO: send email notification to row.user_email (separate feature)
  }

  await supabase.from('watchlist').update(updateData).eq('id', row.id);
}
```

- [ ] **Step 2: Find callers of watch() and update the signature**

Search for all calls to `watchService.watch(` in the codebase:

```bash
grep -rn "watchService.watch\|watchService\.watch" src/ --include="*.ts"
```

For each call site found, pass the current entity count as the second argument. Example — if the call is in `subject-detail.component.ts`:

```typescript
// Before:
this.watchService.watch(req).subscribe(...)

// After — pass the current watched count from the service or component:
this.watchService.watch(req, this.currentWatchCount).subscribe({
  next: ...,
  error: (err) => {
    if (err instanceof WatchLimitError) {
      // show upgrade snackbar or navigate to /ceny
      this.snackBar.open(this.transloco.translate('dashboard.watch_limit_tooltip'), 'OK', { duration: 4000 });
    }
  }
})
```

To get `currentWatchCount` at the call site, either:
- Store it in the component from a prior `listAll()` call, or
- Add a `watchCount$` observable to `WatchService` that is kept in sync after each watch/unwatch

The simplest approach: at the call site, call `watchService.listAll()` once to get the count before watching. Or inject `AuthService` and check `entities.length` if already loaded.

---

### Task 12: Verify end-to-end

- [ ] **Step 1: Run Angular compiler**

```bash
ng build --configuration development 2>&1 | head -50
```

Expected: no TypeScript errors. If there are errors about `notifyEmail` or `setNotification`, those are references in components that haven't been updated yet — find and remove them.

- [ ] **Step 2: Check for remaining references to removed fields**

```bash
grep -rn "notifyEmail\|setNotification\|notify_email\|pending_notification\|toggleNotification\|MatSlideToggleModule" src/ workers/ --include="*.ts" --include="*.html"
```

Expected: zero results (except the new migration files and any comments).

- [ ] **Step 3: Start local dev and verify UI**

Run both:
```bash
# Terminal 1
npm start

# Terminal 2
npm run dev:cf
```

Open `http://localhost:8788`, log in, and verify:
- Watch counter shows "Sledujete X / 3 firem" (FREE tier)
- No bell/toggle on cards
- Add button disabled when at 3 companies
- Upgrade link appears at limit and routes to `/ceny`

- [ ] **Step 4: Test cap enforcement**

If you have fewer than 3 companies, add more from the search page. At 3, verify the Add button is disabled and the counter turns orange.

To test the DB-level trigger directly in Supabase SQL Editor:
```sql
-- Find a free-tier user with 3 watches
SELECT user_id, COUNT(*) FROM watchlist GROUP BY user_id HAVING COUNT(*) >= 3;

-- Try inserting a 4th (should fail):
INSERT INTO watchlist (user_id, ico, display_name)
VALUES ('<user_id_from_above>', '99999999', 'Test');
-- Expected: ERROR: watch_limit_exceeded
```
