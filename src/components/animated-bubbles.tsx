'use client'

import { useState, useEffect } from 'react'

type BubbleData = {
  size: number
  left: number
  delay: number
  duration: number
  color: string
  type: 'circle' | 'star' | 'note'
  symbol?: string
}

// Seeded pseudo-random to avoid hydration mismatch
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

type Tone = 'dark' | 'light'

// Brand-only palette (navy 23,59,76 / teal 46,143,163 / teal-light 79,168,187 / pale 220,235,240).
// dark = on navy bands (light tints show), light = on cream/pale bands (teal/navy tints show).
const PALETTES: Record<Tone, string[]> = {
  dark: [
    'rgba(79, 168, 187, 0.52)',
    'rgba(220, 235, 240, 0.44)',
    'rgba(46, 143, 163, 0.46)',
    'rgba(79, 168, 187, 0.38)',
  ],
  light: [
    'rgba(46, 143, 163, 0.34)',
    'rgba(23, 59, 76, 0.26)',
    'rgba(79, 168, 187, 0.30)',
    'rgba(46, 143, 163, 0.22)',
  ],
}

export function AnimatedBubbles({
  count = 12,
  className = '',
  tone = 'dark',
}: {
  count?: number
  className?: string
  tone?: Tone
}) {
  const [bubbles, setBubbles] = useState<BubbleData[]>([])

  useEffect(() => {
    const colors = PALETTES[tone]

    const generated = Array.from({ length: count }, (_, i) => {
      const typeRandom = seededRandom(i * 7 + 5)
      let type: 'circle' | 'star' | 'note'

      if (typeRandom < 0.4) {
        type = 'circle'
      } else if (typeRandom < 0.7) {
        type = 'star'
      } else {
        type = 'note'
      }

      const symbol = type === 'star' ? '★' : typeRandom < 0.85 ? '♪' : '♫'

      return {
        size: 16 + seededRandom(i * 7 + 1) * 46,
        left: seededRandom(i * 7 + 2) * 100,
        delay: seededRandom(i * 7 + 3) * 9,
        duration: 13 + seededRandom(i * 7 + 4) * 12,
        color: colors[i % colors.length],
        type,
        symbol: type !== 'circle' ? symbol : undefined,
      }
    })

    setBubbles(generated)
  }, [count, tone])

  if (bubbles.length === 0) return null

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {bubbles.map((bubble, i) => {
        if (bubble.type === 'circle') {
          return (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: bubble.size,
                height: bubble.size,
                left: `${bubble.left}%`,
                bottom: `-${bubble.size}px`,
                background: bubble.color,
                animation: `bubble-float ${bubble.duration}s ease-in-out ${bubble.delay}s infinite`,
              }}
            />
          )
        }

        return (
          <div
            key={i}
            className="absolute pointer-events-none flex items-center justify-center"
            style={{
              width: bubble.size,
              height: bubble.size,
              left: `${bubble.left}%`,
              bottom: `-${bubble.size}px`,
              fontSize: `${bubble.size * 0.85}px`,
              color: bubble.color,
              animation: `symbol-float ${bubble.duration}s ease-in-out ${bubble.delay}s infinite`,
            }}
          >
            {bubble.symbol}
          </div>
        )
      })}
    </div>
  )
}
