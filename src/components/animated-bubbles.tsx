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

export function AnimatedBubbles({ count = 12, className = '' }: { count?: number; className?: string }) {
  const [bubbles, setBubbles] = useState<BubbleData[]>([])

  useEffect(() => {
    const colors = [
      'rgba(255, 90, 60, 0.8)',
      'rgba(160, 120, 230, 0.8)',
      'rgba(255, 200, 50, 0.8)',
      'rgba(255, 80, 180, 0.75)',
      'rgba(255, 140, 80, 0.75)',
      'rgba(120, 80, 220, 0.75)',
      'rgba(0, 200, 150, 0.7)',
      'rgba(255, 50, 120, 0.75)',
    ]

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
        size: 16 + seededRandom(i * 7 + 1) * 52,
        left: seededRandom(i * 7 + 2) * 100,
        delay: seededRandom(i * 7 + 3) * 20,
        duration: 15 + seededRandom(i * 7 + 4) * 20,
        color: colors[i % colors.length],
        type,
        symbol: type !== 'circle' ? symbol : undefined,
      }
    })

    setBubbles(generated)
  }, [count])

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
