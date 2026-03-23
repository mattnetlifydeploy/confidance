'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px 50px 0px' },
    )

    function observeElements() {
      const els = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-rotate')
      els.forEach((el) => {
        if (!el.classList.contains('visible')) {
          observer.observe(el)
        }
      })
    }

    // Run immediately and with a small delay for hydration edge cases
    observeElements()
    const t1 = setTimeout(observeElements, 100)
    const t2 = setTimeout(observeElements, 300)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      observer.disconnect()
    }
  }, [pathname])

  return null
}
