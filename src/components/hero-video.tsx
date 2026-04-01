'use client'

import { useEffect, useRef } from 'react'

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.muted = true
      video.play().catch(() => {})
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/80 aspect-video">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/confidance-hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/ConfidanceHero.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
