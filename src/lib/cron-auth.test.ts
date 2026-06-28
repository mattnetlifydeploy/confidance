import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { requireCronSecret } from './cron-auth'

describe('cron-auth', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns error when CRON_SECRET env is missing', () => {
    vi.stubEnv('CRON_SECRET', '')
    const req = new NextRequest('http://x/cron')
    const result = requireCronSecret(req)
    expect(result).toEqual({
      ok: false,
      status: 401,
      error: 'CRON_SECRET not configured',
    })
  })

  it('returns error when authorization header is missing', () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    const req = new NextRequest('http://x/cron')
    const result = requireCronSecret(req)
    expect(result).toEqual({
      ok: false,
      status: 401,
      error: 'Unauthorized',
    })
  })

  it('returns error when authorization header has wrong secret', () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    const req = new NextRequest('http://x/cron', {
      headers: { authorization: 'Bearer wrongsecret' },
    })
    const result = requireCronSecret(req)
    expect(result).toEqual({
      ok: false,
      status: 401,
      error: 'Unauthorized',
    })
  })

  it('returns ok when Bearer token matches secret', () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    const req = new NextRequest('http://x/cron', {
      headers: { authorization: 'Bearer secret123' },
    })
    const result = requireCronSecret(req)
    expect(result).toEqual({ ok: true })
  })
})
