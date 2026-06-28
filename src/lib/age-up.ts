import { CLASSES, type ClassType } from './constants'

export type AgeUpBooking = {
  parent_id: string
  child_id: string
  class_type: string
  status: string
  term_name: string | null
  term_year: number | null
}

export type AgeUpChild = {
  id: string
  parent_id: string
  name: string
  age: number
}

export type AgeUpCandidate = {
  parent_id: string
  child_id: string
  child_name: string
  child_age: number
  current_class: ClassType
  suggested_class: ClassType | null
}

export function suggestNextClass(currentClass: string): ClassType | null {
  if (currentClass === 'baby-boogie') {
    return 'confidance-kids'
  }
  return null
}

export function selectAgeUpCandidates(
  bookings: AgeUpBooking[],
  children: AgeUpChild[],
  currentTerm: { name: string; year: number },
): AgeUpCandidate[] {
  const childMap = new Map(children.map((c) => [c.id, c]))

  const candidates: AgeUpCandidate[] = []
  const seenChildIds = new Set<string>()

  for (const booking of bookings) {
    if (booking.status !== 'confirmed') continue
    if (booking.term_name !== currentTerm.name || booking.term_year !== currentTerm.year) continue
    if (!(booking.class_type in CLASSES)) continue

    const child = childMap.get(booking.child_id)
    if (!child) continue

    const ageMax = CLASSES[booking.class_type as ClassType].ageMax

    // ageMax is inclusive upper bound: age 4 in baby-boogie (ageMax 4) is NOT over-age
    // Age 5+ IS over-age
    if (child.age > ageMax && !seenChildIds.has(child.id)) {
      seenChildIds.add(child.id)
      candidates.push({
        parent_id: child.parent_id,
        child_id: child.id,
        child_name: child.name,
        child_age: child.age,
        current_class: booking.class_type as ClassType,
        suggested_class: suggestNextClass(booking.class_type),
      })
    }
  }

  // Sort by child_id ascending for deterministic tests
  candidates.sort((a, b) => a.child_id.localeCompare(b.child_id))

  return candidates
}
