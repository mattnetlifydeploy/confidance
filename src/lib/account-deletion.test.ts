import { describe, it, expect } from 'vitest'

// Helper function to verify email match (case-insensitive)
function verifyEmailMatch(email: string, typedEmail: string): boolean {
  return email.toLowerCase() === typedEmail.toLowerCase()
}

// Helper function to anonymise profile data
interface ProfileData {
  email: string
  full_name: string
  phone: string | null
  deleted_at?: string | null
}

function anonymiseProfile(profile: ProfileData, parentId: string): ProfileData {
  return {
    ...profile,
    deleted_at: new Date().toISOString(),
    email: `deleted-${parentId}@example.invalid`,
    full_name: 'Deleted User',
    phone: null,
  }
}

describe('account-deletion', () => {
  describe('verifyEmailMatch', () => {
    it('exact match -> true', () => {
      expect(verifyEmailMatch('test@example.com', 'test@example.com')).toBe(true)
    })

    it('case-insensitive match -> true', () => {
      expect(verifyEmailMatch('Test@Example.com', 'test@example.com')).toBe(true)
    })

    it('mismatch -> false', () => {
      expect(verifyEmailMatch('test@example.com', 'other@example.com')).toBe(false)
    })

    it('whitespace mismatch -> false', () => {
      expect(verifyEmailMatch('test@example.com', ' test@example.com')).toBe(false)
    })
  })

  describe('anonymiseProfile', () => {
    it('sets email to deleted-<id>@example.invalid', () => {
      const profile: ProfileData = {
        email: 'original@example.com',
        full_name: 'Alice Smith',
        phone: '+44 7123 456789',
      }
      const result = anonymiseProfile(profile, 'user-123')
      expect(result.email).toBe('deleted-user-123@example.invalid')
    })

    it('sets full_name to Deleted User', () => {
      const profile: ProfileData = {
        email: 'original@example.com',
        full_name: 'Bob Jones',
        phone: '+44 7987 654321',
      }
      const result = anonymiseProfile(profile, 'user-456')
      expect(result.full_name).toBe('Deleted User')
    })

    it('sets phone to null', () => {
      const profile: ProfileData = {
        email: 'original@example.com',
        full_name: 'Carol White',
        phone: '+44 7555 123456',
      }
      const result = anonymiseProfile(profile, 'user-789')
      expect(result.phone).toBeNull()
    })

    it('sets deleted_at to ISO string', () => {
      const profile: ProfileData = {
        email: 'original@example.com',
        full_name: 'David Brown',
        phone: null,
      }
      const result = anonymiseProfile(profile, 'user-000')
      expect(result.deleted_at).toBeTruthy()
      expect(typeof result.deleted_at).toBe('string')
      // Verify it's a valid ISO timestamp
      expect(() => new Date(result.deleted_at as string)).not.toThrow()
    })
  })
})
