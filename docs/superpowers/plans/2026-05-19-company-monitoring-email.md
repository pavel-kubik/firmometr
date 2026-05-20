# Company Monitoring & Email Notification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-company email notification toggle to the dashboard; an hourly Cloudflare Worker detects ISIR/DPH/ARES status changes and sends transactional emails via Cloudflare Email Workers.

**Architecture:** Two-step diff+notify Worker (`workers/monitor/`) runs on cron `0 * * * *`. Step 1 reads all watchlist rows with `notify_email IS NOT NULL`, fetches live statuses, compares with stored state, sets `pending_notification = true` on any change. Step 2 reads pending rows, gets user email via Supabase admin, sends email via `SEND_EMAIL` binding, clears flag.

**Tech Stack:** Angular 18 + Angular Material (MatSlideToggle), Supabase JS client, Cloudflare Workers, `cloudflare:email`, `fast-xml-parser` (already installed), Vitest.

**Spec:** `docs/superpowers/specs/2026-05-19-company-monitoring-email-design.md`

---

## Files

### Created
- `workers/monitor/wrangler.toml`
- `workers/monitor/index.ts`
- `workers/monitor/registry.ts` + `registry.test.ts`
- `workers/monitor/diff.ts` + `diff.test.ts`
- `workers/monitor/email-template.ts` + `email-template.test.ts`
- `workers/monitor/notify.ts` + `notify.test.ts`

### Modified
- `src/app/core/services/auth.service.ts` — `currentUserEmail` getter
- `src/app/core/services/watch.service.ts` — `setNotification()` method
- `src/app/features/dashboard/dashboard.component.ts` — toggle UI + handler
- `public/assets/i18n/cs.json` + `en.json` — new i18n keys
- `assets/i18n/cs.json` + `en.json` — same (both dirs are served)
- `vitest.config.ts` — include `workers/**/*.test.ts`

### One-time (outside this plan)
- Supabase SQL: `ALTER TABLE watchlist ADD COLUMN pending_notification BOOLEAN NOT NULL DEFAULT false;`
- Cloudflare dashboard: enable Email Routing on domain, verify sender address `noreply@firmometr.cz`

---

## Task 1: DB Migration

**Files:**
- Run SQL in Supabase Studio (SQL editor)

- [ ] **Step 1: Run migration in Supabase Studio**

Open Supabase Studio → SQL Editor → run:

```sql
ALTER TABLE watchlist
  ADD COLUMN IF NOT EXISTS pending_notification BOOLEAN NOT NULL DEFAULT false;
```

- [ ] **Step 2: Verify column exists**

In Supabase Studio, Table Editor → watchlist → confirm `pending_notification` column is present with default `false`.

- [ ] **Step 3: Commit a migration file for reference**

```bash
mkdir -p supabase/migrations
```

Create `supabase/migrations/20260519_watchlist_pending_notification.sql`:

```sql
ALTER TABLE watchlist
  ADD COLUMN IF NOT EXISTS pending_notification BOOLEAN NOT NULL DEFAULT false;
```

```bash
git add supabase/migrations/20260519_watchlist_pending_notification.sql
git commit -m "feat: add pending_notification column to watchlist"
```

---

## Task 2: WatchService — setNotification()

**Files:**
- Modify: `src/app/core/services/watch.service.ts`

- [ ] **Step 1: Add `setNotification` method**

Open `src/app/core/services/watch.service.ts`. After the `unwatchByIco` method (line 51), add:

```typescript
  setNotification(id: string, email: string | null): Observable<void> {
    return from(
      this.db.update({ notify_email: email }).eq('id', id)
    ).pipe(
      map(({ error }) => { if (error) throw error; })
    );
  }
```

- [ ] **Step 2: Build to verify no TypeScript errors**

```bash
npm run build -- --configuration development 2>&1 | tail -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/core/services/watch.service.ts
git commit -m "feat: add WatchService.setNotification to toggle notify_email"
```

---

## Task 3: AuthService — currentUserEmail getter

**Files:**
- Modify: `src/app/core/services/auth.service.ts`

- [ ] **Step 1: Add getter after `currentUserId`**

In `src/app/core/services/auth.service.ts`, after line 50 (`get currentUserId`), add:

```typescript
  get currentUserEmail(): string | null {
    return this.userSubject.value?.email ?? null;
  }
```

- [ ] **Step 2: Build check**

```bash
npm run build -- --configuration development 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/core/services/auth.service.ts
git commit -m "feat: expose currentUserEmail on AuthService"
```

---

## Task 4: Dashboard — notification toggle UI

**Files:**
- Modify: `src/app/features/dashboard/dashboard.component.ts`
- Modify: `public/assets/i18n/cs.json`
- Modify: `public/assets/i18n/en.json`
- Modify: `assets/i18n/cs.json`
- Modify: `assets/i18n/en.json`

- [ ] **Step 1: Add i18n keys to both cs.json files**

In `public/assets/i18n/cs.json` and `assets/i18n/cs.json`, after `"dashboard.not_checked"` line, add:

```json
  "dashboard.notify_toggle_title": "Zapnout e-mail upozornění",
  "dashboard.notify_on": "Notifikace zapnuty",
  "dashboard.notify_off": "Notifikace vypnuty",
  "dashboard.notify_error": "Chyba při změně notifikací",
```

In `public/assets/i18n/en.json` and `assets/i18n/en.json`, add the English versions after `"dashboard.not_checked"`:

```json
  "dashboard.notify_toggle_title": "Enable email notifications",
  "dashboard.notify_on": "Notifications on",
  "dashboard.notify_off": "Notifications off",
  "dashboard.notify_error": "Failed to change notifications",
```

- [ ] **Step 2: Add MatSlideToggleModule to imports in dashboard.component.ts**

In the `@Component` imports array (around line 28), add `MatSlideToggleModule`:

```typescript
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
```

Add `MatSlideToggleModule` to the `imports` array in `@Component`.

- [ ] **Step 3: Add `toggleNotification` handler to the component class**

In `DashboardComponent` class (after `unwatch()` method, around line 393), add:

```typescript
  toggleNotification(entity: WatchedEntity, enable: boolean) {
    const email = enable ? (this.authService.currentUserEmail ?? '') : null;
    if (enable && !email) return;
    this.watchService.setNotification(entity.id, email).subscribe({
      next: () => {
        entity.notifyEmail = email;
        const key = enable ? 'dashboard.notify_on' : 'dashboard.notify_off';
        this.snackBar.open(this.transloco.translate(key), 'OK', { duration: 2500 });
      },
      error: () => {
        this.snackBar.open(this.transloco.translate('dashboard.notify_error'), 'OK', { duration: 3000 });
      },
    });
  }
```

- [ ] **Step 4: Add toggle to the card template**

In the dashboard template, find the `<mat-card-actions>` block for real entities (around line 82). Replace it with:

```html
            <mat-card-actions class="card-actions">
              <button class="pub-btn pub-btn-ghost pub-btn-sm" (click)="goDetail(entity.ico)">{{ 'dashboard.btn_detail' | transloco }}</button>
              <div class="notify-row">
                <mat-icon class="small-icon">notifications</mat-icon>
                <mat-slide-toggle
                  [checked]="entity.notifyEmail !== null"
                  (change)="toggleNotification(entity, $event.checked)"
                  [title]="'dashboard.notify_toggle_title' | transloco"
                  color="primary">
                </mat-slide-toggle>
              </div>
              <button class="pub-btn pub-btn-danger pub-btn-sm" (click)="unwatch(entity)">{{ 'dashboard.btn_remove' | transloco }}</button>
            </mat-card-actions>
```

- [ ] **Step 5: Add CSS for the toggle row**

In the component `styles`, after `.last-checked, .notify-email { ... }`, add:

```css
    .card-actions { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; flex-wrap: wrap; gap: 8px; }
    .notify-row { display: flex; align-items: center; gap: 6px; color: #555; }
```

- [ ] **Step 6: Build and serve to verify UI**

```bash
npm start
```

Open http://localhost:4200, log in, go to dashboard. Confirm each company card shows a bell icon + slide toggle in the actions row. Toggle it on and check the Supabase watchlist table — `notify_email` should be set to your account email.

- [ ] **Step 7: Commit**

```bash
git add src/app/features/dashboard/dashboard.component.ts \
        public/assets/i18n/cs.json public/assets/i18n/en.json \
        assets/i18n/cs.json assets/i18n/en.json
git commit -m "feat: add per-company email notification toggle to dashboard card"
```

---

## Task 5: Worker scaffold

**Files:**
- Create: `workers/monitor/wrangler.toml`
- Create: `workers/monitor/index.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Create `workers/monitor/` directory and wrangler.toml**

```bash
mkdir -p workers/monitor
```

Create `workers/monitor/wrangler.toml`:

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
# Set secrets with:
#   cd workers/monitor && npx wrangler secret put SUPABASE_SERVICE_KEY
```

- [ ] **Step 2: Create `workers/monitor/index.ts`**

```typescript
import { runDiff } from './diff';
import { runNotify } from './notify';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  FROM_ADDRESS: string;
  SEND_EMAIL: { send(message: EmailMessage): Promise<void> };
}

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log('[monitor] Starting diff...');
    await runDiff(env);
    console.log('[monitor] Starting notify...');
    await runNotify(env);
    console.log('[monitor] Done.');
  },
};
```

- [ ] **Step 3: Update vitest.config.ts to include worker tests**

Open `vitest.config.ts`. Replace `include: ['functions/**/*.test.ts']` with:

```typescript
    include: ['functions/**/*.test.ts', 'workers/**/*.test.ts'],
```

- [ ] **Step 4: Commit scaffold**

```bash
git add workers/monitor/wrangler.toml workers/monitor/index.ts vitest.config.ts
git commit -m "feat: scaffold firmometr-monitor Cloudflare Worker"
```

---

## Task 6: registry.ts — API fetch + XML parse

**Files:**
- Create: `workers/monitor/registry.ts`
- Create: `workers/monitor/registry.test.ts`

The registry module provides stripped-down (no cache, no analytics) versions of the ISIR, DPH, and ARES fetches used in the Pages function. Pure parsing functions are separated so they can be unit tested without network calls.

- [ ] **Step 1: Write the failing tests for parsing functions**

Create `workers/monitor/registry.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseIsirXml, parseDphXml, stavKodFrom } from './registry';

describe('parseIsirXml', () => {
  it('returns CLEAR for empty response (WS2 code)', () => {
    const xml = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <getIsirWsCuzkDataResponse>
      <stav><kodChyby>WS2</kodChyby></stav>
    </getIsirWsCuzkDataResponse>
  </soapenv:Body>
</soapenv:Envelope>`;
    expect(parseIsirXml(xml)).toBe('CLEAR');
  });

  it('returns ACTIVE_DEBTOR for active non-co-debtor record', () => {
    const xml = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <getIsirWsCuzkDataResponse>
      <stav><kodChyby>0</kodChyby></stav>
      <data>
        <ic>12345678</ic>
        <druhStavKonkursu>ÚPADEK</druhStavKonkursu>
        <dalsiDluznikVRizeni>N</dalsiDluznikVRizeni>
      </data>
    </getIsirWsCuzkDataResponse>
  </soapenv:Body>
</soapenv:Envelope>`;
    expect(parseIsirXml(xml)).toBe('ACTIVE_DEBTOR');
  });

  it('returns ACTIVE_CO_DEBTOR when dalsiDluznik is T', () => {
    const xml = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <getIsirWsCuzkDataResponse>
      <stav><kodChyby>0</kodChyby></stav>
      <data>
        <ic>12345678</ic>
        <druhStavKonkursu>ÚPADEK</druhStavKonkursu>
        <dalsiDluznikVRizeni>T</dalsiDluznikVRizeni>
      </data>
    </getIsirWsCuzkDataResponse>
  </soapenv:Body>
</soapenv:Envelope>`;
    expect(parseIsirXml(xml)).toBe('ACTIVE_CO_DEBTOR');
  });

  it('returns PAST_DEBTOR for completed proceedings', () => {
    const xml = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <getIsirWsCuzkDataResponse>
      <stav><kodChyby>0</kodChyby></stav>
      <data>
        <ic>12345678</ic>
        <druhStavKonkursu>PRAVOMOCNA</druhStavKonkursu>
        <dalsiDluznikVRizeni>N</dalsiDluznikVRizeni>
        <datumPmUkonceniUpadku>2020-01-01</datumPmUkonceniUpadku>
      </data>
    </getIsirWsCuzkDataResponse>
  </soapenv:Body>
</soapenv:Envelope>`;
    expect(parseIsirXml(xml)).toBe('PAST_DEBTOR');
  });
});

describe('parseDphXml', () => {
  it('returns null when not a VAT payer (NENALEZEN)', () => {
    const xml = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <StatusNespolehlivyPlatceResponse>
      <statusPlatceDPH nespolehlivyPlatce="NENALEZEN"/>
    </StatusNespolehlivyPlatceResponse>
  </soapenv:Body>
</soapenv:Envelope>`;
    expect(parseDphXml(xml)).toBeNull();
  });

  it('returns false for reliable VAT payer', () => {
    const xml = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <StatusNespolehlivyPlatceResponse>
      <statusPlatceDPH nespolehlivyPlatce="NE"/>
    </StatusNespolehlivyPlatceResponse>
  </soapenv:Body>
</soapenv:Envelope>`;
    expect(parseDphXml(xml)).toBe(false);
  });

  it('returns true for unreliable VAT payer', () => {
    const xml = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <StatusNespolehlivyPlatceResponse>
      <statusPlatceDPH nespolehlivyPlatce="ANO"/>
    </StatusNespolehlivyPlatceResponse>
  </soapenv:Body>
</soapenv:Envelope>`;
    expect(parseDphXml(xml)).toBe(true);
  });
});

describe('stavKodFrom', () => {
  it('returns AKTIVNI from ROS source', () => {
    const data = { seznamRegistraci: { stavZdrojeRos: 'AKTIVNI' } };
    expect(stavKodFrom(data)).toBe('AKTIVNI');
  });

  it('returns null for NEEXISTUJICI', () => {
    const data = { seznamRegistraci: { stavZdrojeRos: 'NEEXISTUJICI' } };
    expect(stavKodFrom(data)).toBeNull();
  });

  it('returns null for empty data', () => {
    expect(stavKodFrom(null)).toBeNull();
    expect(stavKodFrom({})).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:functions -- --reporter=verbose 2>&1 | grep -E "FAIL|PASS|Error" | head -20
```

Expected: FAIL — `Cannot find module './registry'`

- [ ] **Step 3: Create `workers/monitor/registry.ts`**

```typescript
import { XMLParser } from 'fast-xml-parser';

export type IsirClarity = 'CLEAR' | 'PAST_DEBTOR' | 'ACTIVE_DEBTOR' | 'ACTIVE_CO_DEBTOR';

const ISIR_URL = 'https://isir.justice.cz:8443/isir_cuzk_ws/IsirWsCuzkService';
const ISIR_NS = 'http://isirws.cca.cz/types/';
const ARES_BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest';
const DPH_SOAP = 'https://adisrws.mfcr.cz/dpr/axis2/services/rozhraniCRPDPH.rozhraniCRPDPHSOAP';
const DPH_NS = 'http://adis.mfcr.cz/rozhraniCRPDPH/';

const ACTIVE_STATI = new Set([
  'NEVYRIZENA', 'OBZIVLA', 'VYRIZENA', 'KONKURS', 'ZRUŠENO VS',
  'K-PO ZRUŠ.', 'ÚPADEK', 'REORGANIZ', 'ODDLUŽENÍ', 'MORATORIUM', 'NEVYR-POST',
]);

interface IsirRecord {
  druhStavKonkursu?: string;
  dalsiDluznikVRizeni?: string;
  datumPmUkonceniUpadku?: string;
}

function findNode(obj: unknown, key: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const k of Object.keys(obj as Record<string, unknown>)) {
    if (k === key || k.endsWith(`:${key}`)) return (obj as Record<string, unknown>)[k];
    const found = findNode((obj as Record<string, unknown>)[k], key);
    if (found !== undefined) return found;
  }
  return undefined;
}

function collectNodes(obj: unknown, key: string): unknown[] {
  if (!obj || typeof obj !== 'object') return [];
  for (const k of Object.keys(obj as Record<string, unknown>)) {
    if (k === key || k.endsWith(`:${key}`)) {
      const val = (obj as Record<string, unknown>)[k];
      return Array.isArray(val) ? val : [val];
    }
  }
  for (const k of Object.keys(obj as Record<string, unknown>)) {
    const found = collectNodes((obj as Record<string, unknown>)[k], key);
    if (found.length) return found;
  }
  return [];
}

function str(v: unknown): string | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const s = String(v).trim();
  return s === '' ? undefined : s;
}

function isActive(r: IsirRecord): boolean {
  if (r.datumPmUkonceniUpadku) return false;
  const s = r.druhStavKonkursu;
  if (s === 'MYLNÝ ZÁP.' || s === 'PRAVOMOCNA' || s === 'ODSKRTNUTA') return false;
  if (s && ACTIVE_STATI.has(s)) return true;
  return true;
}

export function parseIsirXml(xml: string): IsirClarity {
  const parser = new XMLParser({ ignoreAttributes: false, textNodeName: '_text' });
  const doc = parser.parse(xml);
  const body = findNode(doc, 'Body') ?? doc;
  const resp = findNode(body, 'getIsirWsCuzkDataResponse') ?? findNode(body, 'return') ?? body;
  const stavEl = findNode(resp, 'stav') as Record<string, unknown> | undefined;
  const kodChyby = stavEl?.kodChyby ?? (stavEl as Record<string, unknown> | undefined)?.['ns2:kodChyby'] ?? '';
  if (String(kodChyby).trim() === 'WS2') return 'CLEAR';

  const dataNodes = collectNodes(resp, 'data') as IsirRecord[];
  const records = dataNodes.map((d: Record<string, unknown>) => ({
    druhStavKonkursu: str(d.druhStavKonkursu),
    dalsiDluznikVRizeni: str(d.dalsiDluznikVRizeni),
    datumPmUkonceniUpadku: str(d.datumPmUkonceniUpadku),
  }));

  const active = records.filter(isActive);
  if (active.length > 0) {
    const hasDirect = active.some(r => r.dalsiDluznikVRizeni !== 'T');
    return hasDirect ? 'ACTIVE_DEBTOR' : 'ACTIVE_CO_DEBTOR';
  }
  const INVALID = new Set(['MYLNÝ ZÁP.', 'ODSKRTNUTA']);
  const pastDirect = records.filter(
    r => !isActive(r) && r.dalsiDluznikVRizeni !== 'T' && !INVALID.has(r.druhStavKonkursu ?? '')
  );
  return pastDirect.length > 0 ? 'PAST_DEBTOR' : 'CLEAR';
}

export function parseDphXml(xml: string): boolean | null {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '_text' });
  const doc = parser.parse(xml);
  const statusEl = findNode(doc, 'status') as Record<string, unknown> | undefined;
  if (statusEl && String(statusEl['@_statusCode'] ?? '0') !== '0') return null;
  const platceEl = findNode(doc, 'statusPlatceDPH') as Record<string, unknown> | undefined;
  if (!platceEl) return null;
  const attr = platceEl['@_nespolehlivyPlatce'];
  if (attr === 'NENALEZEN') return null;
  return attr === 'ANO';
}

export function stavKodFrom(data: unknown): string | null {
  const reg = (data as Record<string, unknown>)?.seznamRegistraci as Record<string, unknown> | undefined;
  if (!reg) return null;
  const raw = reg.stavZdrojeRos ?? reg.stavZdrojeVr ?? reg.stavZdrojeRes ?? null;
  return raw === 'NEEXISTUJICI' ? null : (str(raw) ?? null);
}

export async function fetchIsirStatus(ico: string): Promise<IsirClarity> {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns1="${ISIR_NS}">
  <soapenv:Header/>
  <soapenv:Body>
    <ns1:getIsirWsCuzkDataRequest><ic>${ico}</ic></ns1:getIsirWsCuzkDataRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
  try {
    const res = await fetch(ISIR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=UTF-8', SOAPAction: '""' },
      body,
      signal: AbortSignal.timeout(30_000),
    });
    return parseIsirXml(await res.text());
  } catch (e) {
    console.error(`[registry] fetchIsirStatus ico=${ico}:`, e);
    throw e;
  }
}

export async function fetchAresData(ico: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${ARES_BASE}/ekonomicke-subjekty/${ico}`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error(`[registry] fetchAresData ico=${ico}:`, e);
    throw e;
  }
}

export async function fetchDphStatus(dic: string): Promise<boolean | null> {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns1="${DPH_NS}">
  <soapenv:Header/>
  <soapenv:Body>
    <ns1:StatusNespolehlivyPlatceRequest>
      <ns1:dic>${dic}</ns1:dic>
    </ns1:StatusNespolehlivyPlatceRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
  try {
    const res = await fetch(DPH_SOAP, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=UTF-8', SOAPAction: '"getStatusNespolehlivyPlatce"' },
      body,
      signal: AbortSignal.timeout(15_000),
    });
    return parseDphXml(await res.text());
  } catch (e) {
    console.error(`[registry] fetchDphStatus dic=${dic}:`, e);
    throw e;
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:functions -- --reporter=verbose 2>&1 | grep -E "FAIL|PASS|✓|×" | head -30
```

Expected: all `parseIsirXml`, `parseDphXml`, `stavKodFrom` tests PASS.

- [ ] **Step 5: Commit**

```bash
git add workers/monitor/registry.ts workers/monitor/registry.test.ts
git commit -m "feat: registry.ts with ISIR/DPH/ARES fetch and XML parse for monitor worker"
```

---

## Task 7: diff.ts — Status comparison

**Files:**
- Create: `workers/monitor/diff.ts`
- Create: `workers/monitor/diff.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `workers/monitor/diff.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./registry', () => ({
  fetchIsirStatus: vi.fn(),
  fetchAresData: vi.fn(),
  fetchDphStatus: vi.fn(),
  stavKodFrom: vi.fn(),
}));

import { runDiff } from './diff';
import * as registry from './registry';

function makeSupabaseMock(rows: unknown[]) {
  const updateMock = vi.fn().mockResolvedValue({ error: null });
  const eqMock = vi.fn(() => ({ error: null }));
  updateMock.mockReturnValue({ eq: eqMock });

  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        not: vi.fn().mockResolvedValue({ data: rows, error: null }),
      })),
      update: updateMock,
    })),
    _updateMock: updateMock,
    _eqMock: eqMock,
  };
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => makeSupabaseMock([])),
}));

import { createClient } from '@supabase/supabase-js';

const env = {
  SUPABASE_URL: 'http://localhost',
  SUPABASE_SERVICE_KEY: 'test-key',
  FROM_ADDRESS: 'noreply@test.com',
  SEND_EMAIL: { send: vi.fn() },
};

describe('runDiff', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does nothing when no rows with notify_email', async () => {
    const mockClient = makeSupabaseMock([]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    await runDiff(env);
    expect(registry.fetchIsirStatus).not.toHaveBeenCalled();
  });

  it('sets pending_notification when isir_clarity changes', async () => {
    const row = {
      id: 'row-1', ico: '12345678', display_name: 'Test s.r.o.',
      user_id: 'user-1', notify_email: 'user@test.com',
      isir_clarity: 'CLEAR', dph_nespolehlivy: false, ares_stav_kod: 'AKTIVNI',
    };
    const mockClient = makeSupabaseMock([row]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIsirStatus).mockResolvedValue('ACTIVE_DEBTOR');
    vi.mocked(registry.fetchAresData).mockResolvedValue({ dic: 'CZ12345678', seznamRegistraci: { stavZdrojeRos: 'AKTIVNI' } });
    vi.mocked(registry.fetchDphStatus).mockResolvedValue(false);
    vi.mocked(registry.stavKodFrom).mockReturnValue('AKTIVNI');

    await runDiff(env);

    const updateCall = mockClient._eqMock.mock.calls[0];
    expect(updateCall).toBeDefined();
    // Verify pending_notification=true was passed in update
    const updatedData = mockClient._updateMock.mock.calls[0][0] as Record<string, unknown>;
    expect(updatedData.pending_notification).toBe(true);
    expect(updatedData.isir_clarity).toBe('ACTIVE_DEBTOR');
  });

  it('does NOT set pending_notification when nothing changed', async () => {
    const row = {
      id: 'row-2', ico: '99887766', display_name: 'Stable s.r.o.',
      user_id: 'user-2', notify_email: 'user@test.com',
      isir_clarity: 'CLEAR', dph_nespolehlivy: false, ares_stav_kod: 'AKTIVNI',
    };
    const mockClient = makeSupabaseMock([row]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIsirStatus).mockResolvedValue('CLEAR');
    vi.mocked(registry.fetchAresData).mockResolvedValue({ dic: 'CZ99887766', seznamRegistraci: { stavZdrojeRos: 'AKTIVNI' } });
    vi.mocked(registry.fetchDphStatus).mockResolvedValue(false);
    vi.mocked(registry.stavKodFrom).mockReturnValue('AKTIVNI');

    await runDiff(env);

    const updatedData = mockClient._updateMock.mock.calls[0][0] as Record<string, unknown>;
    expect(updatedData.pending_notification).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:functions -- --reporter=verbose workers/monitor/diff.test.ts 2>&1 | tail -15
```

Expected: FAIL — `Cannot find module './diff'`

- [ ] **Step 3: Create `workers/monitor/diff.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';
import { fetchIsirStatus, fetchAresData, fetchDphStatus, stavKodFrom } from './registry';
import type { Env } from './index';

interface WatchlistRow {
  id: string;
  ico: string;
  display_name: string;
  user_id: string;
  notify_email: string;
  isir_clarity: string | null;
  dph_nespolehlivy: boolean | null;
  ares_stav_kod: string | null;
}

export async function runDiff(env: Env): Promise<void> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { data: rows, error } = await supabase
    .from('watchlist')
    .select('id, ico, display_name, user_id, notify_email, isir_clarity, dph_nespolehlivy, ares_stav_kod')
    .not('notify_email', 'is', null);

  if (error) { console.error('[diff] Failed to load watchlist:', error.message); return; }
  if (!rows?.length) return;

  const results = await Promise.allSettled(
    (rows as WatchlistRow[]).map(row => diffRow(row, supabase))
  );

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[diff] Failed for row ${(rows as WatchlistRow[])[i].id}:`, r.reason);
    }
  });
}

async function diffRow(
  row: WatchlistRow,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  const aresData = await fetchAresData(row.ico);
  const dic = (aresData?.dic as string | undefined) ?? ('CZ' + row.ico.padStart(8, '0'));

  const [isirClarity, dphNespolehlivy] = await Promise.all([
    fetchIsirStatus(row.ico),
    fetchDphStatus(dic),
  ]);
  const aresStavKod = stavKodFrom(aresData);

  const changed =
    isirClarity !== row.isir_clarity ||
    dphNespolehlivy !== row.dph_nespolehlivy ||
    aresStavKod !== row.ares_stav_kod;

  const updateData: Record<string, unknown> = {
    last_checked_at: new Date().toISOString(),
  };

  if (changed) {
    updateData.isir_clarity = isirClarity;
    updateData.dph_nespolehlivy = dphNespolehlivy;
    updateData.ares_stav_kod = aresStavKod;
    updateData.pending_notification = true;
    console.log(`[diff] Change detected for ico=${row.ico}`);
  }

  await supabase.from('watchlist').update(updateData).eq('id', row.id);
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:functions -- --reporter=verbose workers/monitor/diff.test.ts 2>&1 | grep -E "✓|×|PASS|FAIL"
```

Expected: all 3 diff tests PASS.

- [ ] **Step 5: Commit**

```bash
git add workers/monitor/diff.ts workers/monitor/diff.test.ts
git commit -m "feat: diff.ts detects status changes and flags pending_notification"
```

---

## Task 8: email-template.ts — Email builder

**Files:**
- Create: `workers/monitor/email-template.ts`
- Create: `workers/monitor/email-template.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `workers/monitor/email-template.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildEmail } from './email-template';

describe('buildEmail', () => {
  const base = {
    ico: '12345678',
    displayName: 'Test s.r.o.',
    notifyEmail: 'user@test.com',
    isirClarity: 'ACTIVE_DEBTOR' as const,
    dphNespolehlivy: false,
    aresStavKod: 'AKTIVNI',
  };

  it('subject includes company name and ICO', () => {
    const email = buildEmail(base);
    expect(email.subject).toContain('Test s.r.o.');
    expect(email.subject).toContain('12345678');
  });

  it('html body mentions ISIR status', () => {
    const email = buildEmail(base);
    expect(email.html).toContain('ACTIVE_DEBTOR');
  });

  it('html body includes link to company detail', () => {
    const email = buildEmail(base);
    expect(email.html).toContain('/firma/12345678');
  });

  it('text body is non-empty and contains ICO', () => {
    const email = buildEmail(base);
    expect(email.text.length).toBeGreaterThan(20);
    expect(email.text).toContain('12345678');
  });

  it('includes DPH warning when nespolehlivy is true', () => {
    const email = buildEmail({ ...base, dphNespolehlivy: true });
    expect(email.html).toContain('DPH');
    expect(email.html).toContain('nespolehlivy');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:functions -- --reporter=verbose workers/monitor/email-template.test.ts 2>&1 | tail -10
```

Expected: FAIL — `Cannot find module './email-template'`

- [ ] **Step 3: Create `workers/monitor/email-template.ts`**

```typescript
import type { IsirClarity } from './registry';

interface EmailInput {
  ico: string;
  displayName: string;
  notifyEmail: string;
  isirClarity: IsirClarity | string | null;
  dphNespolehlivy: boolean | null;
  aresStavKod: string | null;
}

const SITE = 'https://firmometr.cz';

function isirLabel(clarity: string | null): string {
  switch (clarity) {
    case 'ACTIVE_DEBTOR': return 'Aktivní insolvenční řízení (dlužník)';
    case 'ACTIVE_CO_DEBTOR': return 'Aktivní insolvenční řízení (spoludlužník)';
    case 'PAST_DEBTOR': return 'Minulé insolvenční řízení';
    case 'CLEAR': return 'Bez insolvencí';
    default: return clarity ?? 'Neznámý';
  }
}

export function buildEmail(input: EmailInput): { subject: string; html: string; text: string } {
  const { ico, displayName, isirClarity, dphNespolehlivy, aresStavKod } = input;
  const detailUrl = `${SITE}/firma/${ico}`;

  const subject = `Změna stavu firmy: ${displayName} (IČO ${ico})`;

  const changes: string[] = [];
  if (isirClarity) changes.push(`ISIR: ${isirClarity}`);
  if (dphNespolehlivy === true) changes.push('DPH: nespolehlivy plátce');
  if (aresStavKod) changes.push(`ARES stav: ${aresStavKod}`);

  const html = `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
  <h2 style="color:#059669">Firmometr — Upozornění na změnu</h2>
  <p>U sledované firmy <strong>${displayName}</strong> (IČO: ${ico}) došlo ke změně stavu.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><th style="text-align:left;padding:8px;background:#f3f4f6;border:1px solid #e5e7eb">Registr</th>
        <th style="text-align:left;padding:8px;background:#f3f4f6;border:1px solid #e5e7eb">Aktuální stav</th></tr>
    <tr><td style="padding:8px;border:1px solid #e5e7eb">ISIR</td>
        <td style="padding:8px;border:1px solid #e5e7eb">${isirLabel(isirClarity as string | null)}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5e7eb">DPH</td>
        <td style="padding:8px;border:1px solid #e5e7eb">${dphNespolehlivy === true ? '⚠️ Nespolehlivý plátce DPH' : dphNespolehlivy === false ? 'Spolehlivý plátce' : 'Není plátce'}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5e7eb">ARES stav</td>
        <td style="padding:8px;border:1px solid #e5e7eb">${aresStavKod ?? '—'}</td></tr>
  </table>
  <p><a href="${detailUrl}/firma/${ico}" style="background:#059669;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block">Zobrazit detail firmy</a></p>
  <p style="color:#6b7280;font-size:13px">Upozornění odesláno automaticky systémem Firmometr. Notifikaci vypnete na stránce sledovaných subjektů.</p>
</body>
</html>`;

  const text = [
    `Firmometr — Upozornění na změnu`,
    ``,
    `Firma: ${displayName} (IČO: ${ico})`,
    ``,
    `Aktuální stav:`,
    `  ISIR: ${isirLabel(isirClarity as string | null)}`,
    `  DPH: ${dphNespolehlivy === true ? 'Nespolehlivý plátce' : dphNespolehlivy === false ? 'Spolehlivý plátce' : 'Není plátce'}`,
    `  ARES: ${aresStavKod ?? '—'}`,
    ``,
    `Detail: ${detailUrl}`,
    ``,
    `Notifikaci vypnete na stránce sledovaných subjektů.`,
  ].join('\n');

  return { subject, html, text };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:functions -- --reporter=verbose workers/monitor/email-template.test.ts 2>&1 | grep -E "✓|×|PASS|FAIL"
```

Expected: all 5 email-template tests PASS.

- [ ] **Step 5: Commit**

```bash
git add workers/monitor/email-template.ts workers/monitor/email-template.test.ts
git commit -m "feat: email-template.ts builds subject/html/text for change notifications"
```

---

## Task 9: notify.ts — Email dispatch

**Files:**
- Create: `workers/monitor/notify.ts`
- Create: `workers/monitor/notify.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `workers/monitor/notify.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSendEmail = vi.fn().mockResolvedValue(undefined);

function makeNotifySupabaseMock(rows: unknown[], userEmail = 'user@test.com') {
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const updateFn = vi.fn(() => ({ eq: updateEq }));
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: rows, error: null }),
      })),
      update: updateFn,
    })),
    auth: {
      admin: {
        getUserById: vi.fn().mockResolvedValue({ data: { user: { email: userEmail } }, error: null }),
      },
    },
    _updateFn: updateFn,
    _updateEq: updateEq,
  };
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@supabase/supabase-js';
import { runNotify } from './notify';

const env = {
  SUPABASE_URL: 'http://localhost',
  SUPABASE_SERVICE_KEY: 'test-key',
  FROM_ADDRESS: 'noreply@test.com',
  SEND_EMAIL: { send: mockSendEmail },
};

describe('runNotify', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does nothing when no pending rows', async () => {
    const mockClient = makeNotifySupabaseMock([]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    await runNotify(env);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('sends email and clears pending_notification for each row', async () => {
    const row = {
      id: 'row-1', ico: '12345678', display_name: 'Test s.r.o.',
      user_id: 'user-1', notify_email: 'user@test.com',
      isir_clarity: 'ACTIVE_DEBTOR', dph_nespolehlivy: false, ares_stav_kod: 'AKTIVNI',
    };
    const mockClient = makeNotifySupabaseMock([row], 'user@test.com');
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);

    await runNotify(env);

    expect(mockSendEmail).toHaveBeenCalledOnce();
    const sentArg = mockSendEmail.mock.calls[0][0];
    expect(sentArg.to).toBe('user@test.com');
    expect(sentArg.from).toBe('noreply@test.com');
    expect(sentArg.subject).toContain('Test s.r.o.');

    const updatedData = mockClient._updateFn.mock.calls[0][0] as Record<string, unknown>;
    expect(updatedData.pending_notification).toBe(false);
  });

  it('leaves pending_notification=true if send fails', async () => {
    const row = {
      id: 'row-2', ico: '99887766', display_name: 'Error s.r.o.',
      user_id: 'user-2', notify_email: 'fail@test.com',
      isir_clarity: 'CLEAR', dph_nespolehlivy: true, ares_stav_kod: 'AKTIVNI',
    };
    const mockClient = makeNotifySupabaseMock([row], 'fail@test.com');
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    mockSendEmail.mockRejectedValueOnce(new Error('send failed'));

    await runNotify(env);

    // pending_notification should NOT be cleared
    expect(mockClient._updateFn).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:functions -- --reporter=verbose workers/monitor/notify.test.ts 2>&1 | tail -10
```

Expected: FAIL — `Cannot find module './notify'`

- [ ] **Step 3: Create `workers/monitor/notify.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';
import { buildEmail } from './email-template';
import type { Env, EmailMessage } from './index';

interface PendingRow {
  id: string;
  ico: string;
  display_name: string;
  user_id: string;
  notify_email: string;
  isir_clarity: string | null;
  dph_nespolehlivy: boolean | null;
  ares_stav_kod: string | null;
}

export async function runNotify(env: Env): Promise<void> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { data: rows, error } = await supabase
    .from('watchlist')
    .select('id, ico, display_name, user_id, notify_email, isir_clarity, dph_nespolehlivy, ares_stav_kod')
    .eq('pending_notification', true);

  if (error) { console.error('[notify] Failed to load pending rows:', error.message); return; }
  if (!rows?.length) return;

  for (const row of rows as PendingRow[]) {
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(row.user_id);
      const toEmail = userData?.user?.email ?? row.notify_email;

      const { subject, html, text } = buildEmail({
        ico: row.ico,
        displayName: row.display_name,
        notifyEmail: toEmail,
        isirClarity: row.isir_clarity,
        dphNespolehlivy: row.dph_nespolehlivy,
        aresStavKod: row.ares_stav_kod,
      });

      const message: EmailMessage = {
        from: env.FROM_ADDRESS,
        to: toEmail,
        subject,
        html,
        text,
      };

      await env.SEND_EMAIL.send(message);
      await supabase.from('watchlist').update({ pending_notification: false }).eq('id', row.id);
      console.log(`[notify] Sent to ${toEmail} for ico=${row.ico}`);
    } catch (e) {
      console.error(`[notify] Failed for row ${row.id}:`, e);
    }
  }
}
```

- [ ] **Step 4: Run all worker tests to confirm they pass**

```bash
npm run test:functions -- --reporter=verbose 2>&1 | grep -E "✓|×|PASS|FAIL|Tests"
```

Expected: all tests PASS. Count: ~3 diff + 5 email-template + 3 notify + 4 registry = 15 tests.

- [ ] **Step 5: Commit**

```bash
git add workers/monitor/notify.ts workers/monitor/notify.test.ts
git commit -m "feat: notify.ts sends emails for pending notifications and clears flag"
```

---

## Task 10: Deploy Worker

**Files:**
- No code changes — deployment steps.

**Prerequisites:** Cloudflare Email Routing must be enabled on `firmometr.cz` in the Cloudflare dashboard, and `noreply@firmometr.cz` verified as a sender address.

- [ ] **Step 1: Set the SUPABASE_SERVICE_KEY secret**

```bash
cd workers/monitor
npx wrangler secret put SUPABASE_SERVICE_KEY
# Paste the service role key from Supabase Project Settings → API
```

- [ ] **Step 2: Deploy the worker**

```bash
cd workers/monitor
npx wrangler deploy
```

Expected output: `Deployed firmometr-monitor triggers: every hour`

- [ ] **Step 3: Trigger a manual test run via Wrangler**

```bash
npx wrangler tail firmometr-monitor
# In another terminal:
npx wrangler triggers invoke firmometr-monitor
```

Watch the tail output for `[monitor] Starting diff...`, `[monitor] Starting notify...`, `[monitor] Done.`

- [ ] **Step 4: Verify end-to-end**

1. Log into the app, toggle notifications ON for a company.
2. In Supabase Studio: manually set `isir_clarity` to a different value for that watchlist row to simulate a change, and set `pending_notification = true`.
3. Trigger the worker manually (step 3 above).
4. Confirm an email arrives in the inbox.
5. Confirm `pending_notification` is reset to `false` in Supabase.

- [ ] **Step 5: Final commit**

```bash
cd ../..
git add workers/monitor/
git commit -m "deploy: firmometr-monitor worker with cron and email notifications"
```

---

## Self-review checklist

- [x] **Spec coverage:** Toggle UI ✓, WatchService.setNotification ✓, diff step ✓, notify step ✓, DB migration ✓, email provider ✓, error handling (failed email leaves flag for retry) ✓
- [x] **No placeholders:** All steps have complete code
- [x] **Type consistency:** `IsirClarity` defined in `registry.ts`, used in `diff.ts`, `email-template.ts`, `notify.ts`. `Env` and `EmailMessage` defined in `index.ts`, imported in `diff.ts` and `notify.ts`. `WatchlistRow` is local to each file that needs it — intentional, avoids shared mutable state. `buildEmail()` input shape is consistent across `email-template.ts` and `notify.ts` call site.
