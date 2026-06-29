import type { Metadata } from 'next'
import { getActiveSchools, getDefaultSchoolId } from '@/lib/schools'
import { BookPageClient } from '@/components/book-page-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Book a Class',
  description:
    'Book your child into a Confidance performing arts club. Choose your school, class and term, then secure the place online.',
}

export default async function BookPage() {
  const [schools, defaultSchoolId] = await Promise.all([
    getActiveSchools(),
    getDefaultSchoolId(),
  ])

  return (
    <BookPageClient
      schools={schools.map((s) => ({ id: s.id, name: s.name }))}
      defaultSchoolId={defaultSchoolId}
    />
  )
}
