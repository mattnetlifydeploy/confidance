import { describe, it, expect } from 'vitest'
import { suggestNextClass, selectAgeUpCandidates, type AgeUpBooking, type AgeUpChild } from './age-up'

describe('age-up', () => {
  describe('suggestNextClass', () => {
    it('baby-boogie -> confidance-kids', () => {
      expect(suggestNextClass('baby-boogie')).toBe('confidance-kids')
    })

    it('confidance-kids -> null', () => {
      expect(suggestNextClass('confidance-kids')).toBeNull()
    })

    it('unknown-class -> null', () => {
      expect(suggestNextClass('unknown-class')).toBeNull()
    })
  })

  describe('selectAgeUpCandidates', () => {
    it('empty inputs -> []', () => {
      const result = selectAgeUpCandidates([], [], { name: 'Summer', year: 2026 })
      expect(result).toEqual([])
    })

    it('baby-boogie booking, child age 5 -> candidate with suggested_class confidance-kids', () => {
      const bookings: AgeUpBooking[] = [
        {
          parent_id: 'p1',
          child_id: 'c1',
          class_type: 'baby-boogie',
          status: 'confirmed',
          term_name: 'Summer',
          term_year: 2026,
        },
      ]
      const children: AgeUpChild[] = [
        {
          id: 'c1',
          parent_id: 'p1',
          name: 'Alice',
          age: 5,
        },
      ]
      const result = selectAgeUpCandidates(bookings, children, { name: 'Summer', year: 2026 })
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        child_id: 'c1',
        child_name: 'Alice',
        child_age: 5,
        current_class: 'baby-boogie',
        suggested_class: 'confidance-kids',
      })
    })

    it('baby-boogie booking, child age 4 -> NO candidate (age not exceeded)', () => {
      const bookings: AgeUpBooking[] = [
        {
          parent_id: 'p1',
          child_id: 'c1',
          class_type: 'baby-boogie',
          status: 'confirmed',
          term_name: 'Summer',
          term_year: 2026,
        },
      ]
      const children: AgeUpChild[] = [
        {
          id: 'c1',
          parent_id: 'p1',
          name: 'Alice',
          age: 4,
        },
      ]
      const result = selectAgeUpCandidates(bookings, children, { name: 'Summer', year: 2026 })
      expect(result).toHaveLength(0)
    })

    it('confidance-kids booking, child age 7 -> candidate with suggested_class null', () => {
      const bookings: AgeUpBooking[] = [
        {
          parent_id: 'p1',
          child_id: 'c1',
          class_type: 'confidance-kids',
          status: 'confirmed',
          term_name: 'Summer',
          term_year: 2026,
        },
      ]
      const children: AgeUpChild[] = [
        {
          id: 'c1',
          parent_id: 'p1',
          name: 'Bob',
          age: 7,
        },
      ]
      const result = selectAgeUpCandidates(bookings, children, { name: 'Summer', year: 2026 })
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        child_id: 'c1',
        child_name: 'Bob',
        child_age: 7,
        current_class: 'confidance-kids',
        suggested_class: null,
      })
    })

    it('cancelled booking, child age 5 in baby-boogie -> no candidate', () => {
      const bookings: AgeUpBooking[] = [
        {
          parent_id: 'p1',
          child_id: 'c1',
          class_type: 'baby-boogie',
          status: 'cancelled',
          term_name: 'Summer',
          term_year: 2026,
        },
      ]
      const children: AgeUpChild[] = [
        {
          id: 'c1',
          parent_id: 'p1',
          name: 'Alice',
          age: 5,
        },
      ]
      const result = selectAgeUpCandidates(bookings, children, { name: 'Summer', year: 2026 })
      expect(result).toHaveLength(0)
    })

    it('booking in non-current term, child age 5 in baby-boogie -> no candidate', () => {
      const bookings: AgeUpBooking[] = [
        {
          parent_id: 'p1',
          child_id: 'c1',
          class_type: 'baby-boogie',
          status: 'confirmed',
          term_name: 'Autumn',
          term_year: 2026,
        },
      ]
      const children: AgeUpChild[] = [
        {
          id: 'c1',
          parent_id: 'p1',
          name: 'Alice',
          age: 5,
        },
      ]
      const result = selectAgeUpCandidates(bookings, children, { name: 'Summer', year: 2026 })
      expect(result).toHaveLength(0)
    })

    it('booking with class_type not in CLASSES -> no candidate', () => {
      const bookings: AgeUpBooking[] = [
        {
          parent_id: 'p1',
          child_id: 'c1',
          class_type: 'unknown-class',
          status: 'confirmed',
          term_name: 'Summer',
          term_year: 2026,
        },
      ]
      const children: AgeUpChild[] = [
        {
          id: 'c1',
          parent_id: 'p1',
          name: 'Alice',
          age: 5,
        },
      ]
      const result = selectAgeUpCandidates(bookings, children, { name: 'Summer', year: 2026 })
      expect(result).toHaveLength(0)
    })

    it('same child in two confirmed bookings same term -> ONE candidate', () => {
      const bookings: AgeUpBooking[] = [
        {
          parent_id: 'p1',
          child_id: 'c1',
          class_type: 'baby-boogie',
          status: 'confirmed',
          term_name: 'Summer',
          term_year: 2026,
        },
        {
          parent_id: 'p1',
          child_id: 'c1',
          class_type: 'baby-boogie',
          status: 'confirmed',
          term_name: 'Summer',
          term_year: 2026,
        },
      ]
      const children: AgeUpChild[] = [
        {
          id: 'c1',
          parent_id: 'p1',
          name: 'Alice',
          age: 5,
        },
      ]
      const result = selectAgeUpCandidates(bookings, children, { name: 'Summer', year: 2026 })
      expect(result).toHaveLength(1)
    })

    it('two distinct overage children -> both, sorted by child_id', () => {
      const bookings: AgeUpBooking[] = [
        {
          parent_id: 'p1',
          child_id: 'c2',
          class_type: 'baby-boogie',
          status: 'confirmed',
          term_name: 'Summer',
          term_year: 2026,
        },
        {
          parent_id: 'p1',
          child_id: 'c1',
          class_type: 'baby-boogie',
          status: 'confirmed',
          term_name: 'Summer',
          term_year: 2026,
        },
      ]
      const children: AgeUpChild[] = [
        {
          id: 'c1',
          parent_id: 'p1',
          name: 'Alice',
          age: 5,
        },
        {
          id: 'c2',
          parent_id: 'p1',
          name: 'Bob',
          age: 5,
        },
      ]
      const result = selectAgeUpCandidates(bookings, children, { name: 'Summer', year: 2026 })
      expect(result).toHaveLength(2)
      expect(result[0].child_id).toBe('c1')
      expect(result[1].child_id).toBe('c2')
    })
  })
})
