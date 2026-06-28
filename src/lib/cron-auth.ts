import { NextRequest } from 'next/server'

type CronAuthOk = { ok: true }
type CronAuthFail = { ok: false; status: 401; error: string }
export type CronAuthResult = CronAuthOk | CronAuthFail

export function requireCronSecret(req: NextRequest): CronAuthResult {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    return { ok: false, status: 401, error: 'CRON_SECRET not configured' }
  }
  const header = req.headers.get('authorization')
  if (!header || header !== `Bearer ${expected}`) {
    return { ok: false, status: 401, error: 'Unauthorized' }
  }
  return { ok: true }
}
