import { describe, it, expect } from 'vitest'
import {
  nextSessionDate,
  formatSessionTime,
  formatSessionDate,
  formatFullSession,
  whatToBring,
} from './booking-display'

describe('booking-display', () => {
  describe('nextSessionDate', () => {
    it('should return null if term_name is null', () => {
      const result = nextSessionDate(null, 2026, '2026-05-01')
      expect(result).toBeNull()
    })

    it('should return null if term_year is null', () => {
      const result = nextSessionDate('Summer', null, '2026-05-01')
      expect(result).toBeNull()
    })

    it('should return null if term is not found', () => {
      const result = nextSessionDate('UnknownTerm', 9999, '2026-05-01')
      expect(result).toBeNull()
    })

    it('should return the first session date >= today for Summer 2026', () => {
      // Summer 2026 starts 2026-04-16, first Thursday is 2026-04-16
      const result = nextSessionDate('Summer', 2026, '2026-04-20')
      // First Thursday >= 2026-04-20 is 2026-04-23
      expect(result).toBe('2026-04-23')
    })

    it('should return the next Thursday if today is before the first session', () => {
      const result = nextSessionDate('Summer', 2026, '2026-04-01')
      // First Thursday of the term
      expect(result).toBe('2026-04-16')
    })

    it('should return null if today is after all sessions in term', () => {
      const result = nextSessionDate('Summer', 2026, '2026-07-30')
      // Summer 2026 ends 2026-07-16, no sessions after that
      expect(result).toBeNull()
    })
  })

  describe('formatSessionTime', () => {
    it('should format Baby Boogie time', () => {
      const result = formatSessionTime('baby-boogie')
      expect(result).toBe('3:45pm to 4:15pm')
    })

    it('should format Confidance Kids time', () => {
      const result = formatSessionTime('confidance-kids')
      expect(result).toBe('4:20pm to 4:50pm')
    })

    it('should return TBA for unknown class', () => {
      const result = formatSessionTime('unknown-class')
      expect(result).toBe('TBA')
    })
  })

  describe('formatSessionDate', () => {
    it('should format ISO date to readable format', () => {
      const result = formatSessionDate('2026-07-09')
      expect(result).toBe('Thursday 9 July')
    })

    it('should handle January dates', () => {
      const result = formatSessionDate('2026-01-01')
      expect(result).toMatch(/January/)
    })

    it('should handle different months', () => {
      const result = formatSessionDate('2026-12-25')
      expect(result).toMatch(/December/)
    })
  })

  describe('formatFullSession', () => {
    it('should combine date and time', () => {
      const result = formatFullSession('2026-07-09', 'baby-boogie')
      expect(result).toBe('Thursday 9 July, 3:45pm to 4:15pm')
    })

    it('should format with different class type', () => {
      const result = formatFullSession('2026-07-09', 'confidance-kids')
      expect(result).toBe('Thursday 9 July, 4:20pm to 4:50pm')
    })
  })

  describe('whatToBring', () => {
    it('should return what to bring message', () => {
      const result = whatToBring()
      expect(result).toBe('Bring water and comfy clothes')
    })
  })
})
