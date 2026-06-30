'use client'

import { useEffect, useRef } from 'react'

type Variant = 'navy' | 'light'

type Shape = {
  top: string
  left: string
  size: number
  rgb: string
  opacity: number
  keyframe: string
  duration: number
  delay: number
}

// Brand RGB: teal 46,143,163 / teal-light 79,168,187 / pale 220,235,240 / navy 23,59,76.
// navy = on dark hero (light orbs), light = on pale/cream band (teal/navy orbs).
const SHAPES: Record<Variant, Shape[]> = {
  navy: [
    { top: '-6%', left: '4%', size: 360, rgb: '79, 168, 187', opacity: 0.30, keyframe: 'pmb-drift-a', duration: 13, delay: 0 },
    { top: '46%', left: '80%', size: 300, rgb: '220, 235, 240', opacity: 0.20, keyframe: 'pmb-drift-b', duration: 11, delay: 1.4 },
    { top: '70%', left: '20%', size: 240, rgb: '79, 168, 187', opacity: 0.18, keyframe: 'pmb-drift-c', duration: 14, delay: 0.8 },
  ],
  light: [
    { top: '-8%', left: '8%', size: 320, rgb: '46, 143, 163', opacity: 0.22, keyframe: 'pmb-drift-b', duration: 12, delay: 0 },
    { top: '40%', left: '78%', size: 280, rgb: '23, 59, 76', opacity: 0.15, keyframe: 'pmb-drift-c', duration: 14, delay: 1.2 },
    { top: '64%', left: '30%', size: 220, rgb: '46, 143, 163', opacity: 0.16, keyframe: 'pmb-drift-a', duration: 10, delay: 0.6 },
  ],
}

export function PlayfulMotionBg({ variant = 'navy' }: { variant?: Variant }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        node.dataset.active = entry.isIntersecting ? 'true' : 'false'
      },
      { threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="pmb" data-active="false" aria-hidden="true">
      {SHAPES[variant].map((shape, i) => (
        <span
          key={i}
          className="pmb-shape"
          style={{
            top: shape.top,
            left: shape.left,
            width: shape.size,
            height: shape.size,
            background: `rgba(${shape.rgb}, ${shape.opacity})`,
            animation: `${shape.keyframe} ${shape.duration}s ease-in-out ${shape.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
