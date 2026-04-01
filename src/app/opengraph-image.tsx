import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Confidance — Children\'s Dance & Confidence Classes in Hammersmith'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #FFF9F5 0%, #FFF0E6 40%, #F3EEFF 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(242, 131, 107, 0.12)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(184, 169, 212, 0.12)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 200,
            left: 80,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(245, 197, 99, 0.10)',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            position: 'relative',
          }}
        >
          {/* Brand name */}
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: '-1px',
            }}
          >
            <span style={{ color: '#2D2A32' }}>Confi</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #F2836B, #B8A9D4)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              dance
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: '#4A4650',
              marginTop: 16,
              textAlign: 'center',
              maxWidth: 700,
              lineHeight: 1.4,
            }}
          >
            Children&apos;s Dance & Confidence Classes
          </div>

          {/* Location pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 32,
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 100,
              padding: '12px 28px',
              fontSize: 18,
              color: '#8A8490',
              border: '1px solid rgba(45, 42, 50, 0.06)',
            }}
          >
            <span style={{ color: '#F2836B', fontSize: 20 }}>&#9679;</span>
            Hammersmith, London &middot; Ages 2-6 &middot; Thursdays
          </div>

          {/* Class badges */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                background: 'rgba(242, 131, 107, 0.12)',
                borderRadius: 16,
                padding: '10px 24px',
                fontSize: 16,
                fontWeight: 600,
                color: '#E06A50',
              }}
            >
              Baby Boogie (2-4)
            </div>
            <div
              style={{
                display: 'flex',
                background: 'rgba(184, 169, 212, 0.12)',
                borderRadius: 16,
                padding: '10px 24px',
                fontSize: 16,
                fontWeight: 600,
                color: '#9B89BF',
              }}
            >
              Confidance Kids (3-6)
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #F2836B, #B8A9D4, #F5C563)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size },
  )
}
