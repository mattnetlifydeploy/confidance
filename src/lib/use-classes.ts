'use client'

// Client-side accessor for DB-backed classes + venue. State initialises to the
// CLASSES / VENUE constants so there is NO loading flash and a fetch failure
// degrades to identical day-one behaviour. Result is cached at module level so
// many components share a single /api/classes request.

import { useState, useEffect } from 'react'
import { CLASSES, VENUE } from './constants'
import type { ClassMap, Venue } from './classes'

type ClassesData = { classes: ClassMap; venue: Venue }

const FALLBACK: ClassesData = {
  classes: { ...CLASSES } as ClassMap,
  venue: { ...VENUE } as Venue,
}

let cache: ClassesData | null = null
let inflight: Promise<ClassesData> | null = null

async function load(): Promise<ClassesData> {
  if (cache) return cache
  if (!inflight) {
    inflight = fetch('/api/classes')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad status'))))
      .then((j: Partial<ClassesData>) => {
        cache = {
          classes: j.classes ?? FALLBACK.classes,
          venue: j.venue ?? FALLBACK.venue,
        }
        return cache
      })
      .catch(() => FALLBACK)
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

export function useClasses(): ClassesData & { loaded: boolean } {
  const [data, setData] = useState<ClassesData>(cache ?? FALLBACK)
  const [loaded, setLoaded] = useState<boolean>(!!cache)

  useEffect(() => {
    let alive = true
    load().then((d) => {
      if (alive) {
        setData(d)
        setLoaded(true)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  return { classes: data.classes, venue: data.venue, loaded }
}
