import { describe, it, expect } from 'vitest'
import { nextPosition, selectNextToPromote, signWaitlistToken, verifyWaitlistToken, type WaitlistRow } from './waitlist'

describe('waitlist', () => {
  describe('nextPosition', () => {
    it('returns 1 when no existing rows', () => {
      expect(nextPosition([])).toBe(1)
    })

    it('returns max + 1 when rows exist', () => {
      const rows: WaitlistRow[] = [
        { id: '1', position: 1, notified_at: null, expires_at: null },
        { id: '2', position: 3, notified_at: null, expires_at: null },
        { id: '3', position: 2, notified_at: null, expires_at: null },
      ]
      expect(nextPosition(rows)).toBe(4)
    })

    it('handles single row', () => {
      const rows: WaitlistRow[] = [
        { id: '1', position: 5, notified_at: null, expires_at: null },
      ]
      expect(nextPosition(rows)).toBe(6)
    })
  })

  describe('selectNextToPromote', () => {
    it('returns null when no rows', () => {
      expect(selectNextToPromote([])).toBeNull()
    })

    it('returns null when all rows are notified', () => {
      const rows: WaitlistRow[] = [
        { id: '1', position: 1, notified_at: '2026-06-29T10:00:00Z', expires_at: null },
        { id: '2', position: 2, notified_at: '2026-06-29T11:00:00Z', expires_at: null },
      ]
      expect(selectNextToPromote(rows)).toBeNull()
    })

    it('picks lowest position with notified_at == null', () => {
      const rows: WaitlistRow[] = [
        { id: '1', position: 1, notified_at: '2026-06-29T10:00:00Z', expires_at: null },
        { id: '2', position: 2, notified_at: null, expires_at: null },
        { id: '3', position: 3, notified_at: null, expires_at: null },
      ]
      const result = selectNextToPromote(rows)
      expect(result).not.toBeNull()
      expect(result?.id).toBe('2')
      expect(result?.position).toBe(2)
    })

    it('skips notified rows and finds lowest non-notified', () => {
      const rows: WaitlistRow[] = [
        { id: '1', position: 3, notified_at: null, expires_at: null },
        { id: '2', position: 1, notified_at: '2026-06-29T10:00:00Z', expires_at: null },
        { id: '3', position: 2, notified_at: '2026-06-29T11:00:00Z', expires_at: null },
      ]
      const result = selectNextToPromote(rows)
      expect(result?.id).toBe('1')
      expect(result?.position).toBe(3)
    })
  })

  describe('signWaitlistToken and verifyWaitlistToken', () => {
    const secret = 'test-secret-key'

    it('valid token round-trip', () => {
      const id = 'abc123def456'
      const expiresAtIso = '2026-06-30T10:00:00.000Z'
      const token = signWaitlistToken(id, expiresAtIso, secret)

      const verification = verifyWaitlistToken(token, secret)
      expect(verification.valid).toBe(true)
      if (verification.valid) {
        expect(verification.id).toBe(id)
        expect(verification.expiresAtIso).toBe(expiresAtIso)
      }
    })

    it('rejects tampered token', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000'
      const expiresAtIso = '2026-06-30T10:00:00Z'
      const token = signWaitlistToken(id, expiresAtIso, secret)

      const [payload] = token.split('.')
      const tamperedToken = `${payload}.invalidsignature`

      const verification = verifyWaitlistToken(tamperedToken, secret)
      expect(verification.valid).toBe(false)
    })

    it('rejects token with wrong secret', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000'
      const expiresAtIso = '2026-06-30T10:00:00Z'
      const token = signWaitlistToken(id, expiresAtIso, secret)

      const verification = verifyWaitlistToken(token, 'wrong-secret')
      expect(verification.valid).toBe(false)
    })

    it('rejects malformed token', () => {
      const verification = verifyWaitlistToken('invalid-token', secret)
      expect(verification.valid).toBe(false)
    })

    it('rejects token without signature', () => {
      const verification = verifyWaitlistToken('some-payload', secret)
      expect(verification.valid).toBe(false)
    })

    it('rejects token with missing payload parts', () => {
      const token = 'missingsignature.'
      const verification = verifyWaitlistToken(token, secret)
      expect(verification.valid).toBe(false)
    })
  })
})
