import React from 'react'
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

export interface VibeGraphicProps {
  titleText?: string
  accentColor?: string
  backgroundColor?: string
  isTransparent?: boolean
  width?: number
  height?: number
  durationInFrames?: number
  fps?: number
  scale?: number
  textOffsetX?: number
  textOffsetY?: number
  glowIntensity?: number
  speedMultiplier?: number
  customAssetUrl?: string
}

export const VibeGraphic: React.FC<VibeGraphicProps> = ({
  titleText = 'TOTAL AUDIENCE REACH',
  accentColor = '#FF007F',
  backgroundColor = '#1E1B4B',
  isTransparent = false,
}) => {
  const frame = useCurrentFrame()
  const { durationInFrames, width, height, fps } = useVideoConfig()
  const minDim = Math.min(width, height)
  const baseScale = minDim / 1080

  const introEnd = Math.floor(durationInFrames * 0.2)
  const climaxFrame = Math.floor(durationInFrames * 0.7) // frame 420 for 600f (20s @ 30fps)
  const actionEnd = Math.floor(durationInFrames * 0.8)

  const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.05], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const floatingY = Math.sin(frame / 12) * (15 * baseScale)
  const sunburstRotation = (frame * 0.3) % 360

  // Counter logic over 20s (600 frames)
  // Phase 1 (0-120): 1,240 -> 25,000
  // Phase 2 (120-420): 25,000 -> 2,450,000
  // Phase 3 (420-600): 2,450,000 -> 2,485,320 + micro fluctuation
  let currentCount = 1240
  if (frame <= 120) {
    const p = interpolate(frame, [0, 120], [0, 1], { extrapolateRight: 'clamp' })
    currentCount = Math.floor(1240 + p * (25000 - 1240))
  } else if (frame <= climaxFrame) {
    const p = interpolate(frame, [120, climaxFrame], [0, 1], { extrapolateRight: 'clamp' })
    // easeOutQuad curve for rush
    const eased = 1 - (1 - p) * (1 - p)
    currentCount = Math.floor(25000 + eased * (2450000 - 25000))
  } else {
    const p = interpolate(frame, [climaxFrame, durationInFrames], [0, 1], { extrapolateRight: 'clamp' })
    const baseVal = 2450000 + Math.floor(p * 35320)
    const micro = Math.floor(Math.sin(frame * 2) * 45)
    currentCount = baseVal + micro
  }

  const formattedCount = currentCount.toLocaleString('en-US')

  // Spring bounce for climax badge
  const climaxProgress = spring({
    frame: frame - climaxFrame,
    fps,
    config: { damping: 10, stiffness: 120 }
  })
  const showClimax = frame >= climaxFrame

  // Progress bar fill 0 to 100%
  const progressFill = interpolate(frame, [0, durationInFrames], [5, 100], { extrapolateRight: 'clamp' })

  // Floating hearts generator data
  const hearts = [
    { id: 1, x: 15, speed: 2.2, size: 50, offset: 0 },
    { id: 2, x: 35, speed: 1.8, size: 70, offset: 120 },
    { id: 3, x: 65, speed: 2.5, size: 45, offset: 60 },
    { id: 4, x: 85, speed: 1.5, size: 85, offset: 200 },
    { id: 5, x: 50, speed: 2.0, size: 60, offset: 150 },
  ]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: isTransparent ? 'transparent' : backgroundColor,
        overflow: 'hidden',
        position: 'relative',
        fontFamily: '"Arial Black", Impact, sans-serif',
        transform: `scale(${cameraZoom})`,
        transformOrigin: 'center center',
      }}
    >
      {/* 1. RETRO SUNBURST BACKGROUND */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${sunburstRotation}deg)`,
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1000 1000">
          <g transform="translate(500,500)">
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16
              return (
                <polygon
                  key={i}
                  points="0,0 -200,-1200 200,-1200"
                  fill={i % 2 === 0 ? '#4338CA' : '#312E81'}
                  transform={`rotate(${angle})`}
                />
              )
            })}
          </g>
        </svg>
      </div>

      {/* FLOATING TIKTOK HEARTS PARTICLES */}
      {hearts.map((h) => {
        const yPos = (height + 100) - (((frame * h.speed * 4 + h.offset) % (height + 200)))
        const wobble = Math.sin((frame + h.offset) / 15) * 25
        const currentX = (width * (h.x / 100)) + wobble
        const opacity = interpolate(yPos, [-50, 100, height - 200, height + 100], [0, 1, 2, 0])

        return (
          <div
            key={h.id}
            style={{
              position: 'absolute',
              left: currentX,
              top: yPos,
              width: h.size * baseScale,
              height: h.size * baseScale,
              opacity: Math.max(0, Math.min(1, opacity)),
              transform: `scale(${1 + Math.sin(frame / 10 + h.id) * 0.15}) rotate(${wobble}deg)`,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 8px 0px rgba(0,0,0,0.3))',
            }}
          >
            <svg viewBox="0 0 24 24" width="100%" height="100%">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={h.id % 2 === 0 ? '#FF007F' : '#00F2FE'}
                stroke="#000000"
                strokeWidth="2"
              />
            </svg>
          </div>
        )
      })}

      {/* 2. MAIN POP-ART CARD CONTAINER */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '85%',
          maxWidth: '1800px',
          height: '650px',
          marginLeft: '-42.5%',
          marginTop: `calc(-325px + ${floatingY}px)`,
          backgroundColor: '#FFFFFF',
          borderRadius: `${50 * baseScale}px`,
          border: `${14 * baseScale}px solid #000000`,
          boxShadow: `${20 * baseScale}px ${20 * baseScale}px 0px #000000`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: `${50 * baseScale}px`,
          boxSizing: 'border-box',
          zIndex: 10,
        }}
      >
        {/* MASKOT / EYES ON TOP OF CARD */}
        <div
          style={{
            position: 'absolute',
            top: `${-90 * baseScale}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: `${40 * baseScale}px`,
            zIndex: 20,
          }}
        >
          {/* Left Eye */}
          <div
            style={{
              width: `${110 * baseScale}px`,
              height: `${110 * baseScale}px`,
              backgroundColor: '#FFFFFF',
              border: `${10 * baseScale}px solid #000000`,
              borderRadius: '50%',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 ${8 * baseScale}px 0px #000000`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: currentCount > 2000000 ? `${70 * baseScale}px` : `${50 * baseScale}px`,
                height: currentCount > 2000000 ? `${70 * baseScale}px` : `${50 * baseScale}px`,
                backgroundColor: '#000000',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: `${18 * baseScale}px`,
                  height: `${18 * baseScale}px`,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  top: `${8 * baseScale}px`,
                  right: `${8 * baseScale}px`,
                }}
              />
            </div>
          </div>
          {/* Right Eye */}
          <div
            style={{
              width: `${110 * baseScale}px`,
              height: `${110 * baseScale}px`,
              backgroundColor: '#FFFFFF',
              border: `${10 * baseScale}px solid #000000`,
              borderRadius: '50%',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 ${8 * baseScale}px 0px #000000`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: currentCount > 2000000 ? `${70 * baseScale}px` : `${50 * baseScale}px`,
                height: currentCount > 2000000 ? `${70 * baseScale}px` : `${50 * baseScale}px`,
                backgroundColor: '#000000',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: `${18 * baseScale}px`,
                  height: `${18 * baseScale}px`,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  top: `${8 * baseScale}px`,
                  right: `${8 * baseScale}px`,
                }}
              />
            </div>
          </div>
        </div>

        {/* CARD HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* LIVE BADGE */}
          <div
            style={{
              backgroundColor: '#FF0055',
              border: `${6 * baseScale}px solid #000000`,
              borderRadius: `${30 * baseScale}px`,
              padding: `${12 * baseScale}px ${32 * baseScale}px`,
              display: 'flex',
              alignItems: 'center',
              gap: `${14 * baseScale}px`,
              boxShadow: `4px ${4 * baseScale}px 0px #000000`,
              transform: `scale(${1 + Math.sin(frame / 6) * 0.05})`,
            }}
          >
            <div
              style={{
                width: `${20 * baseScale}px`,
                height: `${20 * baseScale}px`,
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                boxShadow: '0 0 10px #FFFFFF',
              }}
            />
            <span
              style={{
                color: '#FFFFFF',
                fontSize: `${28 * baseScale}px`,
                fontWeight: 900,
                letterSpacing: '2px',
              }}
            >
              LIVE
            </span>
          </div>

          {/* TITLE TEXT */}
          <span
            style={{
              color: '#1E1B4B',
              fontSize: `${36 * baseScale}px`,
              fontWeight: 900,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {titleText}
          </span>
        </div>

        {/* CENTERPIECE: GIANT COUNTER */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto 0',
          }}
        >
          <div
            style={{
              fontSize: `${130 * baseScale}px`,
              fontWeight: 900,
              color: '#000000',
              letterSpacing: '3px',
              textShadow: `${6 * baseScale}px ${6 * baseScale}px 0px #FF007F`,
              transform: `scale(${currentCount % 100000 < 2000 ? 1.03 : 1})`,
              transition: 'transform 0.05s ease',
            }}
          >
            {formattedCount}
          </div>
          <div
            style={{
              backgroundColor: '#00F2FE',
              border: `${4 * baseScale}px solid #000000`,
              borderRadius: `${16 * baseScale}px`,
              padding: `${6 * baseScale}px ${20 * baseScale}px`,
              fontSize: `${20 * baseScale}px`,
              fontWeight: 900,
              color: '#000000',
              marginTop: `${10 * baseScale}px`,
              boxShadow: `3px ${3 * baseScale}px 0px #000000`,
            }}
          >
            ⚡ REAL-TIME VIEWER SURGE ACTIVE
          </div>
        </div>

        {/* CARD FOOTER */}
        <div>
          {/* PROGRESS BAR */}
          <div
            style={{
              width: '100%',
              height: `${36 * baseScale}px`,
              backgroundColor: '#E5E7EB',
              border: `${6 * baseScale}px solid #000000`,
              borderRadius: `${18 * baseScale}px`,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: `inset 0 ${4 * baseScale}px 0px rgba(0,0,0,0.15)`,
              marginBottom: `${18 * baseScale}px`,
            }}
          >
            <div
              style={{
                width: `${progressFill}%`,
                height: '100%',
                backgroundColor: '#FFD200',
                borderRight: `${4 * baseScale}px solid #000000`,
              }}
            />
          </div>

          {/* FOOTER LABEL */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: `${22 * baseScale}px`,
              fontWeight: 900,
              color: '#4B5563',
            }}
          >
            <span>VIRAL RATIO: 99.8%</span>
            <span style={{ color: '#10B981' }}>// ENGAGEMENT: ULTRA HIGH</span>
          </div>
        </div>
      </div>

      {/* 4. CLIMAX EVENT TRIGGER (VIRAL EXPLOSION BADGE & PARTICLES) */}
      {showClimax && (
        <div
          style={{
            position: 'absolute',
            top: '32%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${climaxProgress})`,
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {/* Golden Star Badge */}
          <div
            style={{
              backgroundColor: '#FFD200',
              border: `${10 * baseScale}px solid #000000`,
              borderRadius: `${40 * baseScale}px`,
              padding: `${20 * baseScale}px ${50 * baseScale}px`,
              boxShadow: `${12 * baseScale}px ${12 * baseScale}px 0px #000000`,
              transform: `rotate(${Math.sin(frame / 4) * 6}deg)`,
            }}
          >
            <span
              style={{
                fontSize: `${48 * baseScale}px`,
                fontWeight: 900,
                color: '#000000',
                letterSpacing: '2px',
                textShadow: `3px ${3 * baseScale}px 0px #FFFFFF`,
              }}
            >
              🌟 VIRAL EXPLOSION! 🌟
            </span>
          </div>

          {/* Burst Particles around climax */}
          {Array.from({ length: 8 }).map((_, idx) => {
            const angle = (idx * 360) / 8
            const rad = (angle * Math.PI) / 180
            const dist = 250 * climaxProgress
            const px = Math.cos(rad) * dist
            const py = Math.sin(rad) * dist

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: px,
                  top: py,
                  width: `${40 * baseScale}px`,
                  height: `${40 * baseScale}px`,
                  backgroundColor: idx % 2 === 0 ? '#FF007F' : '#00F2FE',
                  border: `${4 * baseScale}px solid #000000`,
                  borderRadius: '50%',
                  boxShadow: `3px ${3 * baseScale}px 0px #000000`,
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default VibeGraphic
export const DynamicMotion = VibeGraphic
export type DynamicMotionProps = VibeGraphicProps