'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES, ClassType } from '@/lib/constants'

type WaitlistEntry = {
  id: string
  position: number
  created_at: string
  notified_at: string | null
  expires_at: string | null
  parent_id: string
  child_id: string
  child_name: string
  parent_name: string
  parent_email: string
}

type GroupedWaitlists = {
  [key: string]: WaitlistEntry[]
}

export default function WaitlistsPage() {
  const [waitlists, setWaitlists] = useState<GroupedWaitlists>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWaitlists() {
      try {
        const supabase = getSupabase()

        const { data, error } = await supabase
          .from('waitlists')
          .select(
            `id,
             position,
             created_at,
             notified_at,
             expires_at,
             parent_id,
             child_id,
             class_type,
             term_name,
             term_year,
             session_date,
             profiles!parent_id (full_name, email),
             children!child_id (name)`,
          )
          .order('class_type', { ascending: true })
          .order('term_name', { ascending: true })
          .order('term_year', { ascending: true })
          .order('position', { ascending: true })

        if (error) {
          console.error('Failed to load waitlists:', error)
          setLoading(false)
          return
        }

        const grouped: GroupedWaitlists = {}

        data.forEach((row: any) => {
          const key = `${row.class_type}|${row.term_name || 'any'}|${row.term_year || 'any'}`

          if (!grouped[key]) {
            grouped[key] = []
          }

          grouped[key].push({
            id: row.id,
            position: row.position,
            created_at: row.created_at,
            notified_at: row.notified_at,
            expires_at: row.expires_at,
            parent_id: row.parent_id,
            child_id: row.child_id,
            child_name: row.children?.name || 'Unknown',
            parent_name: row.profiles?.full_name || 'Unknown',
            parent_email: row.profiles?.email || 'Unknown',
          })
        })

        setWaitlists(grouped)
      } catch (err) {
        console.error('Error loading waitlists:', err)
      } finally {
        setLoading(false)
      }
    }

    loadWaitlists()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex gap-2">
          <span className="dancing-dot bg-coral" />
          <span className="dancing-dot bg-lilac" />
          <span className="dancing-dot bg-gold" />
        </div>
      </div>
    )
  }

  if (Object.keys(waitlists).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-warm-gray">No waitlist entries</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(waitlists).map(([key, entries]) => {
        const [classType, termName, termYear] = key.split('|')
        const className = CLASSES[classType as ClassType]?.name || classType
        const displayTerm = termName === 'any' ? 'All Terms' : `${termName} ${termYear}`

        return (
          <div key={key} className="rounded-2xl border border-border p-6">
            <h3 className="font-heading text-lg font-bold text-charcoal">
              {className} - {displayTerm}
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left font-heading font-600 text-warm-gray">Position</th>
                    <th className="px-4 py-2 text-left font-heading font-600 text-warm-gray">Child</th>
                    <th className="px-4 py-2 text-left font-heading font-600 text-warm-gray">Parent</th>
                    <th className="px-4 py-2 text-left font-heading font-600 text-warm-gray">Email</th>
                    <th className="px-4 py-2 text-left font-heading font-600 text-warm-gray">Joined</th>
                    <th className="px-4 py-2 text-left font-heading font-600 text-warm-gray">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-cream-dark hover:bg-cream/50">
                      <td className="px-4 py-3 font-heading font-700 text-coral">#{entry.position}</td>
                      <td className="px-4 py-3">{entry.child_name}</td>
                      <td className="px-4 py-3">{entry.parent_name}</td>
                      <td className="px-4 py-3 text-xs text-warm-gray">{entry.parent_email}</td>
                      <td className="px-4 py-3 text-xs text-warm-gray">
                        {new Date(entry.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        {entry.notified_at ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-600 text-amber-700">
                            Notified
                            {entry.expires_at && new Date(entry.expires_at) < new Date() && ' (Expired)'}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-600 text-blue-700">
                            Waiting
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
