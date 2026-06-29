# Confidance Upgrades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Layer seven feature epics onto the live Confidance booking system (Next.js 16 / React 19 / Tailwind 4 / Supabase / Stripe) on feature branches, merging each into main as it ships. Quick wins first, multi-week features last.

**Architecture:** Each epic is a self-contained slice on its own feature branch. Pricing and discount logic stay server-side in `/api/checkout`. Schema changes go through `supabase/migrations/NNN_*.sql` and a parallel update to `src/lib/database.types.ts`. No new framework dependencies unless a task explicitly adds one (vitest is added in Epic 1).

**Tech Stack:**
- Next.js 16 App Router, React 19, TypeScript strict
- Tailwind 4
- Supabase (auth + Postgres) accessed via `@/lib/supabase` (anon) and a service-role client in route handlers
- Stripe Checkout (server-side `Stripe.checkout.sessions.create`) + webhook at `/api/webhook`
- Zod for input validation
- Vitest for unit tests (added in Epic 1, Task 0)

---

## Epic Roadmap

Order is locked. Quick wins first so Paul sees value before the big features land.

1. **Sibling discount** (~1 to 2 hrs) — fixed percentage off 2nd+ child's term booking in the same term, applied server-side at checkout.
2. **Multi-page admin shell** (~3 to 4 days) — Today, Bookings, Families, Classes, Terms, Comms, Reports tabs replacing the single `/admin` page.
3. **Admin comms** (~2 to 3 days) — send email to all parents, a class, or a term. In-portal banner too.
4. **Door view + QR check-in** (~3 to 5 days) — Jessica's tablet tool at the venue. QR-based or PIN-based scan.
5. **Waivers create + sign** (~2 to 3 days) — admin creates waiver text, parents sign at booking or in dashboard.
6. **Cron nudges** (~1 day) — term-end re-book reminder, age-up notification.
7. **Audit log + reports** (~2 days) — log admin actions, surface bookings / revenue / attendance reports.

Each epic ships as a feature branch named `epic-N-<slug>`, PR to `main`, Vercel auto-deploys on merge.

---

# Epic 1: Sibling Discount

**Branch:** `epic-1-sibling-discount`

**Goal of this epic:** When a parent books a term pass for a 2nd, 3rd, or 4th child for the same term as an existing confirmed or pending term booking on their account, apply a fixed percentage discount to the new booking's price, computed and enforced server-side.

**Open questions answered before starting** (Paul confirmed all five at session start):
- Discount percentage: TBD with Jessica. Plan ships with a constant `SIBLING_DISCOUNT_PCT` defaulted to `10` (ten percent). Change in one place when Jessica confirms.
- Eligible booking type: term-pass only. Trials and single sessions never get the discount.
- Scope: same term (Summer 2026 etc.), any class. A parent booking baby-boogie for child A and confidance-kids for child B in the same term gets the discount on child B.
- Stacking: 3rd, 4th, Nth child each get the same flat percentage off (not escalating).
- Counted bookings: any term booking on the parent's account for the target term with status `confirmed` or `pending`, excluding the new booking being created and excluding bookings whose `child_id` matches the new booking's child.

**Architecture notes for Epic 1:**

The bookings table currently has no `term_name` / `term_year` columns. We need them to answer "does this parent already have a term booking for the target term?". Add them via migration 002.

The discount math lives in a pure helper `computeTermPassPrice` so we can unit-test it without Supabase or Stripe. The route handler calls it after counting existing term bookings.

The booking summary in `BookingForm` (step 5) currently shows term price client-side. We will surface the discount as an additional row when applicable, computed by the same helper. The server is still the source of truth, but the UI should not lie about the price the parent is about to pay.

## File Structure (Epic 1)

| File | Status | Responsibility |
|---|---|---|
| `supabase/migrations/002_term_columns_and_sibling_discount.sql` | Create | Add `term_name text`, `term_year int`, `sibling_discount_pct int` to `bookings`. |
| `src/lib/database.types.ts` | Modify | Mirror the three new columns in `Row`, `Insert`, `Update`. |
| `src/lib/constants.ts` | Modify | Export `SIBLING_DISCOUNT_PCT = 10`. |
| `src/lib/pricing.ts` | Create | Pure helper `computeTermPassPrice` (used by route handler and form). |
| `src/lib/pricing.test.ts` | Create | Vitest unit tests covering 0, 1, 2, 3 existing term bookings on parent's account. |
| `src/app/api/checkout/route.ts` | Modify | Resolve target term, count existing term bookings for parent in that term excluding the current child, apply discount, persist `term_name`, `term_year`, `sibling_discount_pct` on insert. Same persistence for single + trial (discount stays null). |
| `src/components/booking-form.tsx` | Modify | Step 5 summary: when sibling discount would apply, fetch the count from a new `/api/quote` endpoint or compute it locally from `children` + existing bookings. We will fetch from server to keep one source of truth. |
| `src/app/api/quote/route.ts` | Create | Returns `{ amount, siblingDiscountPct }` for the booking the user is about to submit. Read-only, no DB mutation. |
| `vitest.config.ts` | Create | Vitest config. |
| `package.json` | Modify | Add `vitest` devDep + `test` script. |

## Tasks

### Task 0: Set up Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 0.1: Cut the feature branch**

```bash
cd ~/Desktop/confidance
git checkout main
git pull --ff-only
git checkout -b epic-1-sibling-discount
```

- [ ] **Step 0.2: Install vitest**

```bash
npm install --save-dev vitest@^2
```

- [ ] **Step 0.3: Add test script and config**

Edit `package.json` scripts:

```json
'scripts': {
  'dev': 'next dev',
  'build': 'next build',
  'start': 'next start',
  'lint': 'eslint',
  'test': 'vitest run',
  'test:watch': 'vitest'
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 0.4: Sanity test runs**

```bash
npm test
```

Expected: `No test files found` exit 0 (or `1` depending on vitest version, accept either as long as the binary executed).

- [ ] **Step 0.5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m 'chore: add vitest for unit tests'
```

### Task 1: Schema migration for term columns + sibling discount

**Files:**
- Create: `supabase/migrations/002_term_columns_and_sibling_discount.sql`
- Modify: `src/lib/database.types.ts`

- [ ] **Step 1.1: Write the migration**

Create `supabase/migrations/002_term_columns_and_sibling_discount.sql`:

```sql
-- Add term and sibling-discount columns to bookings.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS term_name text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS term_year int;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS sibling_discount_pct int;

CREATE INDEX IF NOT EXISTS idx_bookings_parent_term
  ON public.bookings (parent_id, term_name, term_year);
```

- [ ] **Step 1.2: Apply migration in Supabase**

In Supabase SQL Editor, paste the migration and run. Verify with:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings' AND column_name IN ('term_name', 'term_year', 'sibling_discount_pct');
```

Expected: 3 rows.

- [ ] **Step 1.3: Update database.types.ts**

In `src/lib/database.types.ts`, inside the `bookings` table block, add to `Row`, `Insert`, `Update`:

```ts
term_name: string | null
term_year: number | null
sibling_discount_pct: number | null
```

For `Insert` and `Update`, mark them optional with `?`:

```ts
term_name?: string | null
term_year?: number | null
sibling_discount_pct?: number | null
```

- [ ] **Step 1.4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 1.5: Commit**

```bash
git add supabase/migrations/002_term_columns_and_sibling_discount.sql src/lib/database.types.ts
git commit -m 'feat(db): add term_name, term_year, sibling_discount_pct to bookings'
```

### Task 2: Pricing helper with failing tests

**Files:**
- Create: `src/lib/pricing.ts`
- Create: `src/lib/pricing.test.ts`

- [ ] **Step 2.1: Write failing tests first**

Create `src/lib/pricing.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { computeTermPassPrice } from './pricing'

describe('computeTermPassPrice', () => {
  it('returns base price when no existing term bookings', () => {
    const result = computeTermPassPrice({
      sessionCount: 10,
      pricePerSession: 1000,
      siblingDiscountPct: 10,
      existingTermBookingsForParent: 0,
    })
    expect(result.amount).toBe(10000)
    expect(result.discountPct).toBe(0)
    expect(result.discountAmount).toBe(0)
  })

  it('applies discount when parent has 1 existing term booking for same term', () => {
    const result = computeTermPassPrice({
      sessionCount: 10,
      pricePerSession: 1000,
      siblingDiscountPct: 10,
      existingTermBookingsForParent: 1,
    })
    expect(result.amount).toBe(9000)
    expect(result.discountPct).toBe(10)
    expect(result.discountAmount).toBe(1000)
  })

  it('applies same discount for 2 existing bookings (3rd child)', () => {
    const result = computeTermPassPrice({
      sessionCount: 10,
      pricePerSession: 1000,
      siblingDiscountPct: 10,
      existingTermBookingsForParent: 2,
    })
    expect(result.amount).toBe(9000)
    expect(result.discountPct).toBe(10)
  })

  it('rounds amount to nearest penny', () => {
    const result = computeTermPassPrice({
      sessionCount: 7,
      pricePerSession: 1000,
      siblingDiscountPct: 10,
      existingTermBookingsForParent: 1,
    })
    expect(result.amount).toBe(6300)
  })

  it('handles zero discount config gracefully', () => {
    const result = computeTermPassPrice({
      sessionCount: 10,
      pricePerSession: 1000,
      siblingDiscountPct: 0,
      existingTermBookingsForParent: 5,
    })
    expect(result.amount).toBe(10000)
    expect(result.discountPct).toBe(0)
  })
})
```

- [ ] **Step 2.2: Run tests, verify they fail**

```bash
npm test
```

Expected: FAIL with `Cannot find module './pricing'`.

- [ ] **Step 2.3: Write the helper**

Create `src/lib/pricing.ts`:

```ts
type ComputeTermPassPriceInput = {
  sessionCount: number
  pricePerSession: number
  siblingDiscountPct: number
  existingTermBookingsForParent: number
}

type ComputeTermPassPriceResult = {
  amount: number
  discountPct: number
  discountAmount: number
}

export function computeTermPassPrice(
  input: ComputeTermPassPriceInput,
): ComputeTermPassPriceResult {
  const base = input.sessionCount * input.pricePerSession
  const eligible = input.existingTermBookingsForParent >= 1 && input.siblingDiscountPct > 0
  const discountPct = eligible ? input.siblingDiscountPct : 0
  const discountAmount = Math.round((base * discountPct) / 100)
  const amount = base - discountAmount
  return { amount, discountPct, discountAmount }
}
```

- [ ] **Step 2.4: Run tests, verify they pass**

```bash
npm test
```

Expected: PASS, 5 tests.

- [ ] **Step 2.5: Commit**

```bash
git add src/lib/pricing.ts src/lib/pricing.test.ts
git commit -m 'feat(pricing): add computeTermPassPrice helper with sibling discount'
```

### Task 3: Add SIBLING_DISCOUNT_PCT constant

**Files:**
- Modify: `src/lib/constants.ts`

- [ ] **Step 3.1: Add constant**

In `src/lib/constants.ts`, under the `PRICING` block, add:

```ts
// Percentage off term passes for 2nd+ child in the same term.
// Confirm exact value with Jessica before launch.
export const SIBLING_DISCOUNT_PCT = 10
```

- [ ] **Step 3.2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3.3: Commit**

```bash
git add src/lib/constants.ts
git commit -m 'feat(config): add SIBLING_DISCOUNT_PCT constant'
```

### Task 4: Apply discount server-side in /api/checkout

**Files:**
- Modify: `src/app/api/checkout/route.ts`

- [ ] **Step 4.1: Import helpers and constant**

At the top of `src/app/api/checkout/route.ts`, add to the existing import from `@/lib/constants`:

```ts
import { PRICING, getRemainingSessionCount, VENUE, getNextTerm, getFullTermSessionCount, getCurrentTerm, SIBLING_DISCOUNT_PCT } from '@/lib/constants'
import { computeTermPassPrice } from '@/lib/pricing'
```

- [ ] **Step 4.2: Persist term_name + term_year on every insert**

Inside the trial branch, in the `.insert({ ... })` payload, add:

```ts
term_name: getCurrentTerm().name,
term_year: getCurrentTerm().year,
```

Inside the single-session branch, in the `.insert({ ... })` payload, add the same two fields.

Inside the term-pass branch, BEFORE the `.insert({ ... })`, resolve the target term:

```ts
const nextTerm = getNextTerm()
const isNextTerm = selectedTerm === 'next' && nextTerm
const targetTerm = isNextTerm ? nextTerm : getCurrentTerm()
```

(Replace the existing duplicate `const nextTerm` / `const isNextTerm` calls in this branch with the consolidated declarations above. The same variable is computed twice in the current code.)

Then in the term-pass `.insert({ ... })` payload, add:

```ts
term_name: targetTerm.name,
term_year: targetTerm.year,
sibling_discount_pct: discountPct,
```

(Note: `discountPct` is defined in Step 4.3 below. Order matters: define before insert.)

- [ ] **Step 4.3: Count existing term bookings and apply discount**

In the term-pass branch, AFTER resolving `targetTerm` and BEFORE the existing booking insert, add:

```ts
const { count: existingTermBookingsForParent } = await supabaseAdmin
  .from('bookings')
  .select('id', { count: 'exact', head: true })
  .eq('parent_id', parentId)
  .eq('booking_type', 'term')
  .eq('term_name', targetTerm.name)
  .eq('term_year', targetTerm.year)
  .neq('child_id', childId)
  .in('status', ['pending', 'confirmed'])

const sessionCount = isNextTerm
  ? getFullTermSessionCount(targetTerm)
  : getRemainingSessionCount()

const priced = computeTermPassPrice({
  sessionCount,
  pricePerSession: PRICING.termPerSession,
  siblingDiscountPct: SIBLING_DISCOUNT_PCT,
  existingTermBookingsForParent: existingTermBookingsForParent ?? 0,
})

const amount = priced.amount
const discountPct = priced.discountPct
```

(This replaces the existing `const sessionCount = ...` and `const amount = ...` lines in that branch.)

- [ ] **Step 4.4: Reflect discount in the Stripe line item description**

In the term-pass branch's `stripe.checkout.sessions.create({ ... })`, update the `description`:

```ts
description: discountPct > 0
  ? `Booking for ${childName} (${sessionCount} sessions, ${discountPct}% sibling discount)`
  : `Booking for ${childName} (${sessionCount} sessions)`,
```

- [ ] **Step 4.5: Manual smoke test (no Stripe charge)**

Run the dev server:

```bash
npm run dev
```

In a browser:
1. Log in as a test parent with 2 children, both within an age range for one of the classes.
2. Book a term pass for child A on the current term, complete Stripe checkout (use Stripe test card `4242 4242 4242 4242`).
3. Book a term pass for child B on the same term. At Stripe checkout, verify the unit amount equals `sessionCount * 1000 * 0.9` pence (10% off).
4. Check `bookings` table: child A's row has `sibling_discount_pct = null`, child B's row has `sibling_discount_pct = 10`, both have correct `term_name`, `term_year`.

If the math is off, debug before committing.

- [ ] **Step 4.6: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m 'feat(checkout): apply sibling discount server-side for term passes'
```

### Task 5: Quote endpoint for the booking summary

**Files:**
- Create: `src/app/api/quote/route.ts`

- [ ] **Step 5.1: Write the route**

Create `src/app/api/quote/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PRICING, SIBLING_DISCOUNT_PCT, getCurrentTerm, getNextTerm, getFullTermSessionCount, getRemainingSessionCount } from '@/lib/constants'
import { computeTermPassPrice } from '@/lib/pricing'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { bookingType, parentId, childId, selectedTerm } = body

  if (bookingType !== 'term-pass') {
    return NextResponse.json({ amount: 0, discountPct: 0 })
  }
  if (!parentId || !childId) {
    return NextResponse.json({ error: 'Missing parentId or childId' }, { status: 400 })
  }

  const nextTerm = getNextTerm()
  const isNextTerm = selectedTerm === 'next' && nextTerm
  const targetTerm = isNextTerm ? nextTerm : getCurrentTerm()

  const { count } = await supabaseAdmin
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', parentId)
    .eq('booking_type', 'term')
    .eq('term_name', targetTerm.name)
    .eq('term_year', targetTerm.year)
    .neq('child_id', childId)
    .in('status', ['pending', 'confirmed'])

  const sessionCount = isNextTerm
    ? getFullTermSessionCount(targetTerm)
    : getRemainingSessionCount()

  const priced = computeTermPassPrice({
    sessionCount,
    pricePerSession: PRICING.termPerSession,
    siblingDiscountPct: SIBLING_DISCOUNT_PCT,
    existingTermBookingsForParent: count ?? 0,
  })

  return NextResponse.json({
    amount: priced.amount,
    discountAmount: priced.discountAmount,
    discountPct: priced.discountPct,
    sessionCount,
  })
}
```

- [ ] **Step 5.2: Manual smoke test**

```bash
npm run dev
```

```bash
curl -X POST http://localhost:3000/api/quote \
  -H 'Content-Type: application/json' \
  -d '{"bookingType":"term-pass","parentId":"<paste a real parent uuid from supabase>","childId":"<paste a real child uuid not booked yet>","selectedTerm":"current"}'
```

Expected: JSON with `amount`, `discountPct`, `sessionCount`. If parent has no prior term bookings, `discountPct: 0`.

- [ ] **Step 5.3: Commit**

```bash
git add src/app/api/quote/route.ts
git commit -m 'feat(api): add /api/quote for live discount preview'
```

### Task 6: Show discount in booking summary

**Files:**
- Modify: `src/components/booking-form.tsx`

- [ ] **Step 6.1: Add quote state**

In `BookingForm` near the other `useState` hooks, add:

```ts
const [quote, setQuote] = useState<{ amount: number; discountPct: number; discountAmount: number; sessionCount: number } | null>(null)
```

- [ ] **Step 6.2: Fetch quote on summary step**

Add a new `useEffect` below the existing emergency-contact one:

```ts
useEffect(() => {
  if (step !== 5) return
  if (form.bookingType !== 'term-pass') {
    setQuote(null)
    return
  }
  const childIdToUse = form.childId || children.find((c) => c.name.toLowerCase() === form.childName.toLowerCase())?.id
  if (!childIdToUse || !user) return
  let cancelled = false
  ;(async () => {
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingType: form.bookingType,
        parentId: user.id,
        childId: childIdToUse,
        selectedTerm: form.selectedTerm,
      }),
    })
    if (!res.ok) return
    const data = await res.json()
    if (!cancelled) setQuote(data)
  })()
  return () => { cancelled = true }
}, [step, form.bookingType, form.childId, form.childName, form.selectedTerm, children, user])
```

- [ ] **Step 6.3: Render the discount row**

In step 5's summary block, after the existing emergency `SummaryRow` and BEFORE the `Total` row, add:

```tsx
{form.bookingType === 'term-pass' && quote && quote.discountPct > 0 && (
  <SummaryRow
    label={`Sibling discount (${quote.discountPct}%)`}
    value={`. ${formatPrice(quote.discountAmount)}`}
  />
)}
```

Update the existing `Total` row's `value` for term-pass to read from `quote`:

```tsx
form.bookingType === 'free-trial'
  ? 'Free'
  : form.bookingType === 'single-session'
    ? formatPrice(PRICING.single_session_price)
    : formatPrice(quote?.amount ?? termPrice)
```

- [ ] **Step 6.4: Manual UI check**

```bash
npm run dev
```

Browser:
1. Log in as parent with 2 children.
2. Book child A's term pass (test card 4242). Confirm.
3. Start child B's term pass booking, reach step 5.
4. Confirm summary shows `Sibling discount (10%)  . £X` row and total = base . discount.

- [ ] **Step 6.5: Commit**

```bash
git add src/components/booking-form.tsx
git commit -m 'feat(booking-form): surface sibling discount in summary'
```

### Task 7: Run full test + typecheck + lint, push, open PR

- [ ] **Step 7.1: Run all gates**

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

Expected: all pass.

- [ ] **Step 7.2: Push branch**

```bash
gh auth switch -u confidancedeploy
git push -u origin epic-1-sibling-discount
```

- [ ] **Step 7.3: Open PR**

```bash
gh pr create --title 'Epic 1: sibling discount for term passes' --body "$(cat <<'EOF'
## Summary
- Term-pass bookings get a flat 10% sibling discount (configurable in src/lib/constants.ts) when the parent already has a confirmed or pending term booking for a different child in the same term.
- Discount math lives in src/lib/pricing.ts and is unit-tested with vitest.
- Server-side enforcement in /api/checkout. /api/quote powers the booking summary preview.
- New columns on bookings: term_name, term_year, sibling_discount_pct (migration 002).

## Test plan
- [ ] Book term pass for child A, complete payment.
- [ ] Start booking term pass for child B same term, confirm 10% line shows in summary and Stripe checkout amount matches.
- [ ] Complete child B booking, verify bookings row has sibling_discount_pct = 10.
- [ ] First child gets no discount.
- [ ] Trial and single-session never get a discount.
EOF
)"
```

- [ ] **Step 7.4: Merge after review**

Wait for review, then:

```bash
gh pr merge --squash --delete-branch
```

Vercel auto-deploys main.

---

# Epic 2: Multi-page Admin Shell

**Branch:** `epic-2-admin-shell`

**Brief outline (detail when Epic 1 ships):**

Replace the single `/admin` route with a nested layout:

- `/admin` -> redirect to `/admin/today`
- `/admin/today` -> bookings for today's date, walk-in capture form
- `/admin/check-in` -> per-class roster for today with tick-to-check-in (was Epic 4, folded in)
- `/admin/bookings` -> filterable table (parent / child / class / term / status)
- `/admin/families` -> parent + children directory, click through to history
- `/admin/classes` -> baby-boogie + confidance-kids config (capacity, time, etc.)
- `/admin/terms` -> term editor (start, end, no-class dates)
- `/admin/comms` -> Epic 3 entry point, stub until then
- `/admin/reports` -> revenue, attendance, term fill rate

Use a Tailwind sidebar layout in `src/app/admin/layout.tsx`. Each tab is its own page component. RLS already allows admins to read everything per `supabase-admin-migration.sql`.

---

# Epic 3: Admin Comms

**Branch:** `epic-3-admin-comms`

**Brief outline:**

- Email backend: Resend (already a stack default in BLM work, no Stripe-style config dance). Add `RESEND_API_KEY` env var on Vercel + dev.
- `/admin/comms` page: textarea for subject + body, dropdown for audience (all parents / parents of a class / parents of a term).
- Server route `/api/admin/send-email` validates admin via service-role lookup of `profiles.is_admin`, expands audience to email list, calls Resend.
- In-portal banner: `banners` table (`id`, `body`, `audience`, `published_at`, `expires_at`). Dashboard reads active banner for the logged-in parent.

---

# Epic 4: DROPPED (folded into Epic 2)

Matt cut scope 2026-06-28: no QR scanning, no per-child QR in confirmation emails, no jsQR dep, no separate `door_staff` role, no separate `/door` URL.

Replacement: a `/admin/check-in` tab inside the Epic 2 admin shell.
- Pick a class (Baby Boogie / Confidance Kids) + a date (defaults to today).
- See the roster of confirmed/pending children booked for that session: child name, parent name, paid status.
- Tick to check in. Writes a row to a new `attendance` table (`id`, `child_id`, `session_date`, `class_type`, `checked_in_at`, `checked_in_by`).
- Untick to undo.

Gated by `profiles.is_admin = true` (Jessica and Jessica both have this). No new role needed.

Ship as the last tab in Epic 2.

---

# Epic 5: Waivers

**Branch:** `epic-5-waivers`

**Brief outline:**

- `/admin/waivers` lets admin create a waiver: title, body (Markdown), `published_at`.
- New table `waivers` (`id`, `title`, `body_md`, `published_at`).
- New table `waiver_signatures` (`id`, `waiver_id`, `parent_id`, `child_id`, `signed_at`, `signature_text`).
- Booking flow: if there's an unsigned active waiver, step 4.5 (between contact and confirm) shows the waiver and a typed-name signature field. Block submission until signed.
- Dashboard surface: parents can view + re-sign past waivers.

---

# Epic 6: Cron Nudges

**Branch:** `epic-6-cron-nudges`

**Brief outline:**

- Vercel cron config in `vercel.json` (`crons` array), two jobs:
  - `/api/cron/term-end-rebook` runs daily. If today is within N days of `getCurrentTerm().endDate`, email parents who have a confirmed term booking on the current term but no booking on the next term yet.
  - `/api/cron/age-up` runs weekly. Finds children whose age now exceeds the max for their booked class type (e.g. baby-boogie age > 4), nudges parent to consider confidance-kids.
- Both cron routes verify the Vercel cron signature header.
- Each route uses Resend (same setup as Epic 3).

---

# Epic 7: Audit Log + Reports

**Branch:** `epic-7-audit-reports`

**Brief outline:**

- New table `admin_audit_log` (`id`, `actor_id`, `action`, `target_type`, `target_id`, `payload jsonb`, `created_at`).
- Wrap admin mutating routes (`/api/admin/cancel-session`, `/api/admin/send-email`, future term edits, etc.) with a small `auditLog(actorId, action, target, payload)` helper.
- `/admin/reports` page:
  - Revenue: sum of confirmed booking amounts (need to backfill `amount_paid` column on bookings OR query Stripe by `metadata.booking_id`). Decide once we hit this epic.
  - Attendance: count of `attendance` rows per session.
  - Term fill rate: confirmed term bookings divided by configured capacity per class.

---

## Self-Review Notes (writer's checklist)

Spec coverage: All 7 wishlist items present and ordered as Paul instructed. Decisions locked at session start (no photos, single-session trial, Jessica-only door staff, brand kept) flow through to relevant epics.

Placeholder scan: Epic 1 contains no TBDs or placeholders (the discount percentage is a named constant with a justification comment, not a placeholder). Epics 2-7 are explicitly outlines pending detailed expansion at their start.

Type consistency: `computeTermPassPrice` input shape is consistent across Task 2 (definition), Task 4 (route handler), Task 5 (quote endpoint). Database column names (`term_name`, `term_year`, `sibling_discount_pct`) are identical across migration, types file, route handler, and PR description.
