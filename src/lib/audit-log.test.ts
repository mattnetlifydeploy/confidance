import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('auditLog', () => {
  let insertMock: ReturnType<typeof vi.fn>
  let fromMock: ReturnType<typeof vi.fn>
  let auditLog: any

  beforeEach(async () => {
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')

    insertMock = vi.fn().mockResolvedValue({ error: null })
    fromMock = vi.fn().mockReturnValue({
      insert: insertMock,
    })

    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn().mockReturnValue({
        from: fromMock,
      }),
    }))

    // Import after mock is set up
    const auditLogModule = await import('./audit-log')
    auditLog = auditLogModule.auditLog
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unmock('@supabase/supabase-js')
  })

  it('returns { ok: true } on successful insert', async () => {
    insertMock.mockResolvedValue({ error: null })

    const result = await auditLog('user-123', 'session.cancelled', 'session', 'session-456', { reason: 'test' })

    expect(result).toEqual({ ok: true })
    expect(fromMock).toHaveBeenCalledWith('admin_audit_log')
    expect(insertMock).toHaveBeenCalledWith({
      actor_id: 'user-123',
      action: 'session.cancelled',
      target_type: 'session',
      target_id: 'session-456',
      payload: { reason: 'test' },
    })
  })

  it('returns { ok: false, error: <msg> } when supabase returns error', async () => {
    const error = { message: 'Insert failed' }
    insertMock.mockResolvedValue({ error })

    const result = await auditLog('user-123', 'session.cancelled', 'session', 'session-456')

    expect(result).toEqual({ ok: false, error: 'Insert failed' })
  })

  it('returns { ok: false, error: <msg> } when insert throws', async () => {
    insertMock.mockRejectedValue(new Error('Network error'))

    const result = await auditLog('user-123', 'session.cancelled', 'session', 'session-456')

    expect(result).toEqual({ ok: false, error: 'Network error' })
  })

  it('passes targetId: null through to the DB unchanged', async () => {
    insertMock.mockResolvedValue({ error: null })

    await auditLog('user-123', 'test.action', 'booking', null)

    expect(insertMock).toHaveBeenCalledWith({
      actor_id: 'user-123',
      action: 'test.action',
      target_type: 'booking',
      target_id: null,
      payload: {},
    })
  })

  it('defaults payload to {} when caller omits it', async () => {
    insertMock.mockResolvedValue({ error: null })

    await auditLog('user-123', 'test.action', 'booking', 'booking-123')

    expect(insertMock).toHaveBeenCalledWith({
      actor_id: 'user-123',
      action: 'test.action',
      target_type: 'booking',
      target_id: 'booking-123',
      payload: {},
    })
  })

  it('never calls console.error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')
    insertMock.mockRejectedValue(new Error('Network error'))

    await auditLog('user-123', 'test.action', 'booking', 'booking-123')

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('never calls console.log', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    insertMock.mockResolvedValue({ error: null })

    await auditLog('user-123', 'test.action', 'booking', 'booking-123')

    expect(consoleLogSpy).not.toHaveBeenCalled()
    consoleLogSpy.mockRestore()
  })
})
