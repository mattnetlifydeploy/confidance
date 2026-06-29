/**
 * Refund policy logic for booking rescheduling.
 *
 * Pure function: given original session date and current time,
 * determine whether a reschedule receives a full refund or only account credit.
 *
 * If originalSessionDate is >= 24h in the future (from now), full refund.
 * Otherwise, credit only. If date is null/unknown, credit only (safe default).
 */
export function refundPolicy(
  originalSessionDate: string | null | undefined,
  nowIso: string,
): 'full_refund' | 'no_refund_credit' {
  if (!originalSessionDate) {
    return 'no_refund_credit'
  }

  const now = new Date(nowIso)
  const sessionDate = new Date(originalSessionDate)

  // Calculate milliseconds until session
  const msUntilSession = sessionDate.getTime() - now.getTime()

  // 24 hours in milliseconds
  const ms24h = 24 * 60 * 60 * 1000

  return msUntilSession >= ms24h ? 'full_refund' : 'no_refund_credit'
}
