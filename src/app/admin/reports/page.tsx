import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { CLASSES, TERMS, type TermDef } from '@/lib/constants'
import type { Database, Booking, Attendance } from '@/lib/database.types'
import type { ClassType } from '@/lib/constants'
import { formatPence } from '@/lib/refund-formatter'
import { ExportCsvButton } from '@/components/export-csv-button'
import { AdminPageHeader, StatTile, StatGrid, AdminCard, EmptyState } from '@/components/admin'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
)

type TermKey = string

function termKey(name: string, year: number): TermKey {
  return `${name}-${year}`
}

function termLabel(name: string, year: number): string {
  return `${name} ${year}`
}

function findTermForDate(iso: string): TermDef | null {
  return TERMS.find((t) => iso >= t.startDate && iso <= t.endDate) ?? null
}

type RevenueRow = {
  classType: string
  bookings: number
  pence: number
}

type RevenueGroup = {
  termName: string
  termYear: number
  total: number
  rows: RevenueRow[]
}

type AttendanceRow = {
  classType: string
  count: number
}

type AttendanceGroup = {
  termName: string
  termYear: number
  total: number
  rows: AttendanceRow[]
}

type FillRow = {
  classType: string
  count: number
}

type FillGroup = {
  termName: string
  termYear: number
  total: number
  rows: FillRow[]
}

type RefundRow = {
  date: string
  parentName: string
  parentEmail: string
  childName: string
  originalAmountPence: number
  refundAmountPence: number
  reason: string
  processedBy: string
}

async function loadRevenue(): Promise<RevenueGroup[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('class_type, term_name, term_year, amount_paid_pence, status')
    .eq('status', 'confirmed')

  if (error) {
    throw new Error(`Failed to load revenue: ${error.message}`)
  }

  const map = new Map<TermKey, RevenueGroup>()
  for (const row of (data ?? []) as Pick<Booking, 'class_type' | 'term_name' | 'term_year' | 'amount_paid_pence' | 'status'>[]) {
    if (!row.term_name || row.term_year === null) continue
    const key = termKey(row.term_name, row.term_year)
    let group = map.get(key)
    if (!group) {
      group = { termName: row.term_name, termYear: row.term_year, total: 0, rows: [] }
      map.set(key, group)
    }
    const pence = row.amount_paid_pence
    group.total += pence
    let rev = group.rows.find((r) => r.classType === row.class_type)
    if (!rev) {
      rev = { classType: row.class_type, bookings: 0, pence: 0 }
      group.rows.push(rev)
    }
    rev.bookings += 1
    rev.pence += pence
  }

  return sortTermGroups(Array.from(map.values()))
}

async function loadAttendance(): Promise<AttendanceGroup[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('class_type, session_date')

  if (error) {
    throw new Error(`Failed to load attendance: ${error.message}`)
  }

  const map = new Map<TermKey, AttendanceGroup>()
  for (const row of (data ?? []) as Pick<Attendance, 'class_type' | 'session_date'>[]) {
    const term = findTermForDate(row.session_date)
    if (!term) continue
    const key = termKey(term.name, term.year)
    let group = map.get(key)
    if (!group) {
      group = { termName: term.name, termYear: term.year, total: 0, rows: [] }
      map.set(key, group)
    }
    group.total += 1
    let att = group.rows.find((r) => r.classType === row.class_type)
    if (!att) {
      att = { classType: row.class_type, count: 0 }
      group.rows.push(att)
    }
    att.count += 1
  }

  return sortTermGroups(Array.from(map.values()))
}

async function loadFill(): Promise<FillGroup[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('class_type, term_name, term_year, status')
    .eq('status', 'confirmed')

  if (error) {
    throw new Error(`Failed to load fill: ${error.message}`)
  }

  const map = new Map<TermKey, FillGroup>()
  for (const row of (data ?? []) as Pick<Booking, 'class_type' | 'term_name' | 'term_year' | 'status'>[]) {
    if (!row.term_name || row.term_year === null) continue
    const key = termKey(row.term_name, row.term_year)
    let group = map.get(key)
    if (!group) {
      group = { termName: row.term_name, termYear: row.term_year, total: 0, rows: [] }
      map.set(key, group)
    }
    group.total += 1
    let fill = group.rows.find((r) => r.classType === row.class_type)
    if (!fill) {
      fill = { classType: row.class_type, count: 0 }
      group.rows.push(fill)
    }
    fill.count += 1
  }

  return sortTermGroups(Array.from(map.values()))
}

const TERM_ORDER: Record<string, number> = { Spring: 0, Summer: 1, Autumn: 2 }

function sortTermGroups<T extends { termName: string; termYear: number }>(groups: T[]): T[] {
  return groups.sort((a, b) => {
    if (b.termYear !== a.termYear) return b.termYear - a.termYear
    return (TERM_ORDER[a.termName] ?? 99) - (TERM_ORDER[b.termName] ?? 99)
  })
}

function classLabel(classType: string): string {
  return CLASSES[classType as ClassType]?.name ?? classType
}

async function loadRefunds(): Promise<RefundRow[]> {
  const { data: auditLogs, error: auditError } = await supabase
    .from('admin_audit_log')
    .select('id, actor_id, created_at, payload, target_id')
    .eq('action', 'refund_processed')
    .order('created_at', { ascending: false })

  if (auditError) {
    throw new Error(`Failed to load refunds: ${auditError.message}`)
  }

  if (!auditLogs || auditLogs.length === 0) {
    return []
  }

  const refunds: RefundRow[] = []

  for (const log of auditLogs) {
    const payload = log.payload as Record<string, unknown>
    const refundAmountPence = typeof payload.amount === 'number' ? payload.amount : 0
    const reason = typeof payload.reason === 'string' ? payload.reason : 'Session cancelled'

    // Get actor profile
    let actorName = log.actor_id || 'Unknown'
    if (log.actor_id) {
      const { data: actor } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', log.actor_id)
        .single()

      if (actor) {
        actorName = actor.full_name || actor.email || log.actor_id
      }
    }

    // Get bookings for this session to resolve parent and child
    if (log.target_id) {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('parent_id, child_id, amount_paid_pence')
        .eq('session_id', log.target_id)
        .eq('status', 'confirmed')
        .limit(100)

      if (bookings && bookings.length > 0) {
        for (const booking of bookings) {
          // Get parent profile
          const { data: parent } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', booking.parent_id)
            .single()

          // Get child profile
          const { data: child } = await supabase
            .from('children')
            .select('name')
            .eq('id', booking.child_id)
            .single()

          const parentName = parent?.full_name || 'Unknown'
          const parentEmail = parent?.email || 'Unknown'
          const childName = child?.name || 'Unknown'

          refunds.push({
            date: log.created_at,
            parentName,
            parentEmail,
            childName,
            originalAmountPence: booking.amount_paid_pence,
            refundAmountPence,
            reason,
            processedBy: actorName,
          })
        }
      }
    }
  }

  return refunds
}

export default async function ReportsPage() {
  let revenue: RevenueGroup[] = []
  let attendance: AttendanceGroup[] = []
  let fill: FillGroup[] = []
  let refunds: RefundRow[] = []
  let loadError: string | null = null

  try {
    const [revenueData, attendanceData, fillData, refundsData] = await Promise.all([
      loadRevenue(),
      loadAttendance(),
      loadFill(),
      loadRefunds(),
    ])
    revenue = revenueData
    attendance = attendanceData
    fill = fillData
    refunds = refundsData
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load reports'
  }

  const grandRevenue = revenue.reduce((sum, g) => sum + g.total, 0)
  const grandAttendance = attendance.reduce((sum, g) => sum + g.total, 0)
  const grandFill = fill.reduce((sum, g) => sum + g.total, 0)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports"
        description="Revenue, attendance, and term fill across every term."
      />

      {loadError && (
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          {loadError}
        </div>
      )}

      <StatGrid className="grid-cols-1 md:grid-cols-3">
        <StatTile label="Total revenue (confirmed)" value={formatPence(grandRevenue)} tone="teal" />
        <StatTile label="Total check-ins" value={grandAttendance} tone="default" />
        <StatTile label="Total confirmed bookings" value={grandFill} tone="teal" />
      </StatGrid>

      <AdminCard>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="font-heading text-lg font-bold">Revenue by term</h3>
          {revenue.length > 0 && (
            <ExportCsvButton
              label="Export CSV"
              filename="confidance-revenue-all-terms.csv"
              headers={['Term', 'Class Type', 'Bookings', 'Revenue']}
              rows={revenue.flatMap((g) =>
                g.rows.map((r) => [
                  termLabel(g.termName, g.termYear),
                  classLabel(r.classType),
                  String(r.bookings),
                  String(r.pence),
                ])
              )}
            />
          )}
        </div>
        <p className="mt-1 text-sm text-charcoal-light">Sum of amount paid on confirmed bookings.</p>
        {revenue.length === 0 ? (
          <EmptyState title="No revenue recorded" />
        ) : (
          <div className="mt-4 space-y-4">
            {revenue.map((g) => (
              <div key={termKey(g.termName, g.termYear)} className="rounded-2xl bg-cream/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <p className="font-heading text-base font-bold">{termLabel(g.termName, g.termYear)}</p>
                  <span className="inline-block rounded-full bg-teal/15 px-3 py-1 text-xs font-600 text-teal">
                    {formatPence(g.total)}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {g.rows.map((r) => (
                    <div key={r.classType} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-600">{classLabel(r.classType)}</span>
                      <span className="text-charcoal-light">
                        {r.bookings} booking{r.bookings !== 1 ? 's' : ''} . {formatPence(r.pence)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <AdminCard>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="font-heading text-lg font-bold">Attendance by term</h3>
          {attendance.length > 0 && (
            <ExportCsvButton
              label="Export CSV"
              filename="confidance-attendance-all-terms.csv"
              headers={['Term', 'Class Type', 'Check-ins']}
              rows={attendance.flatMap((g) =>
                g.rows.map((r) => [
                  termLabel(g.termName, g.termYear),
                  classLabel(r.classType),
                  String(r.count),
                ])
              )}
            />
          )}
        </div>
        <p className="mt-1 text-sm text-charcoal-light">
          Check-ins grouped by term (derived from session date) and class.
        </p>
        {attendance.length === 0 ? (
          <EmptyState title="No check-ins recorded" />
        ) : (
          <div className="mt-4 space-y-4">
            {attendance.map((g) => (
              <div key={termKey(g.termName, g.termYear)} className="rounded-2xl bg-cream/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <p className="font-heading text-base font-bold">{termLabel(g.termName, g.termYear)}</p>
                  <span className="inline-block rounded-full bg-navy-light/15 px-3 py-1 text-xs font-600 text-navy-light">
                    {g.total} check-in{g.total !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {g.rows.map((r) => (
                    <div key={r.classType} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-600">{classLabel(r.classType)}</span>
                      <span className="text-charcoal-light">{r.count} check-in{r.count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <AdminCard>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="font-heading text-lg font-bold">Term fill</h3>
          {fill.length > 0 && (
            <ExportCsvButton
              label="Export CSV"
              filename="confidance-termfill-all-terms.csv"
              headers={['Term', 'Class Type', 'Bookings']}
              rows={fill.flatMap((g) =>
                g.rows.map((r) => [
                  termLabel(g.termName, g.termYear),
                  classLabel(r.classType),
                  String(r.count),
                ])
              )}
            />
          )}
        </div>
        <p className="mt-1 text-sm text-charcoal-light">
          Confirmed bookings per class per term. Raw counts (no capacity ratio yet).
        </p>
        {fill.length === 0 ? (
          <EmptyState title="No confirmed bookings" />
        ) : (
          <div className="mt-4 space-y-4">
            {fill.map((g) => (
              <div key={termKey(g.termName, g.termYear)} className="rounded-2xl bg-cream/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <p className="font-heading text-base font-bold">{termLabel(g.termName, g.termYear)}</p>
                  <span className="inline-block rounded-full bg-teal-light/15 px-3 py-1 text-xs font-600 text-teal-light">
                    {g.total} booking{g.total !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {g.rows.map((r) => (
                    <div key={r.classType} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-600">{classLabel(r.classType)}</span>
                      <span className="text-charcoal-light">{r.count} booking{r.count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <AdminCard>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="font-heading text-lg font-bold">Refunds</h3>
          {refunds.length > 0 && (
            <ExportCsvButton
              label="Export CSV"
              filename="confidance-refunds.csv"
              headers={['Date', 'Parent Name', 'Parent Email', 'Child Name', 'Original Amount', 'Refund Amount', 'Reason', 'Processed By']}
              rows={refunds.map((r) => [
                new Date(r.date).toLocaleDateString('en-GB'),
                r.parentName,
                r.parentEmail,
                r.childName,
                String(r.originalAmountPence),
                String(r.refundAmountPence),
                r.reason,
                r.processedBy,
              ])}
            />
          )}
        </div>
        <p className="mt-1 text-sm text-charcoal-light">
          Processed refunds from session cancellations.
        </p>
        {refunds.length === 0 ? (
          <EmptyState title="No refunds processed" />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-600">Date</th>
                  <th className="px-3 py-2 text-left font-600">Parent</th>
                  <th className="px-3 py-2 text-left font-600">Child</th>
                  <th className="px-3 py-2 text-right font-600">Original Amount</th>
                  <th className="px-3 py-2 text-right font-600">Refund Amount</th>
                  <th className="px-3 py-2 text-left font-600">Reason</th>
                  <th className="px-3 py-2 text-left font-600">Processed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {refunds.map((r, i) => (
                  <tr key={i} className="hover:bg-cream/25">
                    <td className="px-3 py-3 text-charcoal-light">
                      {new Date(r.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-600">{r.parentName}</div>
                      <div className="text-xs text-charcoal-light">{r.parentEmail}</div>
                    </td>
                    <td className="px-3 py-3 font-600">{r.childName}</td>
                    <td className="px-3 py-3 text-right text-charcoal-light">
                      {formatPence(r.originalAmountPence)}
                    </td>
                    <td className="px-3 py-3 text-right font-600 text-teal">
                      {formatPence(r.refundAmountPence)}
                    </td>
                    <td className="px-3 py-3 text-charcoal-light">{r.reason}</td>
                    <td className="px-3 py-3 text-sm">{r.processedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}
