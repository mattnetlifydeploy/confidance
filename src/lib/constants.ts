// ─── Term Configuration ───

export const VENUE = {
  name: 'Grove Neighbourhood Centre',
  address: '7 Bradmore Park Road, Hammersmith, W6 0DT',
} as const

export const CLASSES = {
  'baby-boogie': {
    name: 'Baby Boogie',
    ages: '2 to 4',
    day: 'Thursday',
    time: '3:45pm to 4:15pm',
    durationMins: 30,
  },
  'confidance-kids': {
    name: 'Confidance Kids',
    ages: '3 to 6',
    day: 'Thursday',
    time: '4:20pm to 4:50pm',
    durationMins: 30,
  },
} as const

export type ClassType = keyof typeof CLASSES

// ─── Pricing (pence) ───

export const PRICING = {
  singleSession: 1200,   // £12
  termPerSession: 1000,  // £10 per session
  freeTrial: 0,
} as const

// ─── Term Dates ───

export type TermDef = {
  name: string
  year: number
  startDate: string
  endDate: string
  noClassDates: string[] // ISO date strings
  displayStart: string
}

// LBHF term dates 2026-2029
export const TERMS: TermDef[] = [
  // 2026
  {
    name: 'Summer',
    year: 2026,
    startDate: '2026-04-16',
    endDate: '2026-07-16',
    noClassDates: ['2026-05-28'],
    displayStart: 'April 16th',
  },
  {
    name: 'Autumn',
    year: 2026,
    startDate: '2026-09-10',
    endDate: '2026-12-10',
    noClassDates: ['2026-10-29'],
    displayStart: 'September 10th',
  },
  // 2027
  {
    name: 'Spring',
    year: 2027,
    startDate: '2027-01-07',
    endDate: '2027-04-01',
    noClassDates: ['2027-02-18'],
    displayStart: 'January 7th',
  },
  {
    name: 'Summer',
    year: 2027,
    startDate: '2027-04-22',
    endDate: '2027-07-22',
    noClassDates: ['2027-05-27'],
    displayStart: 'April 22nd',
  },
  {
    name: 'Autumn',
    year: 2027,
    startDate: '2027-09-09',
    endDate: '2027-12-16',
    noClassDates: ['2027-10-28'],
    displayStart: 'September 9th',
  },
  // 2028
  {
    name: 'Spring',
    year: 2028,
    startDate: '2028-01-06',
    endDate: '2028-03-30',
    noClassDates: ['2028-02-17'],
    displayStart: 'January 6th',
  },
  {
    name: 'Summer',
    year: 2028,
    startDate: '2028-04-20',
    endDate: '2028-07-20',
    noClassDates: ['2028-06-01'],
    displayStart: 'April 20th',
  },
  {
    name: 'Autumn',
    year: 2028,
    startDate: '2028-09-07',
    endDate: '2028-12-21',
    noClassDates: ['2028-10-26'],
    displayStart: 'September 7th',
  },
  // 2029
  {
    name: 'Spring',
    year: 2029,
    startDate: '2029-01-11',
    endDate: '2029-03-29',
    noClassDates: ['2029-02-15'],
    displayStart: 'January 11th',
  },
  {
    name: 'Summer',
    year: 2029,
    startDate: '2029-04-19',
    endDate: '2029-07-19',
    noClassDates: ['2029-05-31'],
    displayStart: 'April 19th',
  },
  {
    name: 'Autumn',
    year: 2029,
    startDate: '2029-09-06',
    endDate: '2029-12-20',
    noClassDates: ['2029-11-01'],
    displayStart: 'September 6th',
  },
]

// Current term is always the first one that hasn't ended yet
export function getCurrentTerm(): TermDef {
  const today = new Date().toISOString().slice(0, 10)
  return TERMS.find((t) => t.endDate >= today) ?? TERMS[0]
}

/** Get the term after the current one (for advance booking) */
export function getNextTerm(): TermDef | null {
  const current = getCurrentTerm()
  const idx = TERMS.indexOf(current)
  return idx >= 0 && idx < TERMS.length - 1 ? TERMS[idx + 1] : null
}

/** Get total session count for an entire term */
export function getFullTermSessionCount(term: TermDef): number {
  return getTermSessionDates(term).length
}

export const CURRENT_TERM = getCurrentTerm()
export const TERM_LABEL = `${CURRENT_TERM.name} Term`
export const TERM_START = `Classes Starting ${CURRENT_TERM.displayStart} Hammersmith`

// ─── Session Date Generation ───

/** Get all Thursday dates between start and end, excluding noClassDates */
export function getTermSessionDates(term: TermDef): string[] {
  const dates: string[] = []
  const start = new Date(term.startDate)
  const end = new Date(term.endDate)
  const noClass = new Set(term.noClassDates)

  // Find first Thursday on or after start
  const current = new Date(start)
  const dayOfWeek = current.getDay()
  const daysUntilThu = (4 - dayOfWeek + 7) % 7
  current.setDate(current.getDate() + daysUntilThu)

  while (current <= end) {
    const iso = current.toISOString().slice(0, 10)
    if (!noClass.has(iso)) {
      dates.push(iso)
    }
    current.setDate(current.getDate() + 7)
  }

  return dates
}

/** Get remaining sessions from today for the current term */
export function getRemainingSessionCount(term?: TermDef): number {
  const t = term ?? CURRENT_TERM
  const today = new Date().toISOString().slice(0, 10)
  return getTermSessionDates(t).filter((d) => d >= today).length
}

/** Calculate term pass price in pence */
export function getTermPrice(term?: TermDef): number {
  return getRemainingSessionCount(term) * PRICING.termPerSession
}

export const CONTACT_EMAIL = 'confidancejessica@gmail.com'
export const INSTAGRAM_HANDLE = 'confidancecommunity'
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`
