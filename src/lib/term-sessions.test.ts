import { describe, it, expect } from 'vitest'
import { applyExclusions, getTermSessions } from './term-sessions'
import { TERMS } from './constants'

describe('applyExclusions', () => {
  it('returns unchanged list when no exclusions', () => {
    const dates = ['2026-04-16', '2026-04-23', '2026-04-30']
    const result = applyExclusions(dates, [])
    expect(result).toEqual(dates)
  })

  it('removes one exclusion from session dates', () => {
    const dates = ['2026-04-16', '2026-04-23', '2026-04-30']
    const result = applyExclusions(dates, ['2026-04-23'])
    expect(result).toEqual(['2026-04-16', '2026-04-30'])
  })

  it('ignores exclusion date not in session list', () => {
    const dates = ['2026-04-16', '2026-04-23', '2026-04-30']
    const result = applyExclusions(dates, ['2026-04-25'])
    expect(result).toEqual(dates)
  })

  it('removes multiple exclusions', () => {
    const dates = ['2026-04-16', '2026-04-23', '2026-04-30', '2026-05-07']
    const result = applyExclusions(dates, ['2026-04-23', '2026-05-07'])
    expect(result).toEqual(['2026-04-16', '2026-04-30'])
  })

  it('handles empty session list', () => {
    const result = applyExclusions([], ['2026-04-23'])
    expect(result).toEqual([])
  })

  it('handles multiple exclusions including non-matching dates', () => {
    const dates = ['2026-04-16', '2026-04-23', '2026-04-30']
    const result = applyExclusions(dates, ['2026-04-15', '2026-04-23', '2026-05-01'])
    expect(result).toEqual(['2026-04-16', '2026-04-30'])
  })
})

describe('getTermSessions', () => {
  it('returns full session dates when no exclusions provided', async () => {
    const term = TERMS.find((t) => t.name === 'Summer' && t.year === 2026)!
    const result = await getTermSessions(term, undefined, [])
    expect(result.length).toBeGreaterThan(0)
    expect(result).toEqual(
      result.filter((date) => {
        const d = new Date(date + 'T00:00:00Z')
        return d.getDay() === 4
      }),
    )
  })

  it('removes exclusions when injected as array', async () => {
    const term = TERMS.find((t) => t.name === 'Summer' && t.year === 2026)!
    const allSessions = await getTermSessions(term, undefined, [])
    if (allSessions.length < 2) {
      expect.skip()
    }
    const toExclude = [allSessions[0]]
    const result = await getTermSessions(term, undefined, toExclude)
    expect(result).not.toContain(toExclude[0])
    expect(result.length).toBe(allSessions.length - 1)
  })

  it('uses injected fetch function', async () => {
    const term = TERMS.find((t) => t.name === 'Summer' && t.year === 2026)!
    const mockExclusions = ['2026-04-16']
    const fetchFn = async () => mockExclusions
    const result = await getTermSessions(term, undefined, fetchFn)
    expect(result).not.toContain('2026-04-16')
  })

  it('accepts classType param (currently unused)', async () => {
    const term = TERMS.find((t) => t.name === 'Summer' && t.year === 2026)!
    const result1 = await getTermSessions(term, 'baby-boogie', [])
    const result2 = await getTermSessions(term, 'confidance-kids', [])
    expect(result1).toEqual(result2)
  })

  it('composes correctly with applyExclusions logic', async () => {
    const term = TERMS.find((t) => t.name === 'Summer' && t.year === 2026)!
    const exclusions = ['2026-04-23', '2026-05-07']
    const result = await getTermSessions(term, undefined, exclusions)
    expect(result).not.toContain('2026-04-23')
    expect(result).not.toContain('2026-05-07')
  })

  it('handles term with no session dates', async () => {
    const emptyTerm = {
      name: 'Empty',
      year: 9999,
      startDate: '2026-04-16',
      endDate: '2026-04-15',
      noClassDates: [],
      displayStart: '',
    }
    const result = await getTermSessions(emptyTerm, undefined, [])
    expect(result).toEqual([])
  })
})
