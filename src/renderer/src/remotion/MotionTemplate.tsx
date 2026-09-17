import React from 'react'
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion'

export interface MotionTemplateProps {
  titleText?: string
  accentColor?: string
  backgroundColor?: string
  isTransparent?: boolean
  width?: number
  height?: number
  durationInFrames?: number
  fps?: number
}

export const MotionTemplate: React.FC<MotionTemplateProps> = ({
  titleText = 'MOTION GRAPHICS',
  accentColor = '#00f2fe',
  backgroundColor = '#0a0d14',
  isTransparent = false
}) => {
  const frame = useCurrentFrame()
  const { durationInFrames, width, height, fps } = useVideoConfig()

  // Base responsive scaling factor based on canvas resolution (1080p base: minDimension = 1080)
  const minDimension = Math.min(width, height)
  const baseScale = minDimension / 1080
  const cornerMargin = Math.round(36 * baseScale)
  const cornerSize = Math.round(28 * baseScale)
  const cornerStroke = Math.max(2, Math.round(2 * baseScale))

  // 1. Smooth 360-degree continuous rotation across duration for seamless looping
  const rotation = interpolate(frame, [0, durationInFrames], [0, 360], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  // Counter-rotation for concentric geometric layers
  const counterRotation = interpolate(frame, [0, durationInFrames], [360, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  // Fast rotation (720 deg = 2 full cycles) for technical HUD elements
  const fastRotation = interpolate(frame, [0, durationInFrames], [0, 720], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  // 2. Pulse scale: Sinusoidal pulse so frame 0 and frame durationInFrames match perfectly
  const pulseFactor = Math.sin((frame / durationInFrames) * Math.PI * 2)
  const scale = interpolate(pulseFactor, [-1, 1], [0.93, 1.07])
  const textGlow = interpolate(pulseFactor, [-1, 1], [10, 26]) * baseScale

  // Dynamic moving stroke offset
  const strokeOffset = interpolate(frame, [0, durationInFrames], [0, 240])

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: isTransparent ? 'transparent' : backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      {/* Background Ambient Radial Glow */}
      {!isTransparent && (
        <div
          style={{
            position: 'absolute',
            width: 900 * baseScale,
            height: 900 * baseScale,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`,
            transform: `scale(${scale * 1.15})`,
            filter: `blur(${60 * baseScale}px)`,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Decorative Grid Pattern (Microstock Tech / Motion Graphic Aesthetic) */}
      {!isTransparent && (
        <svg
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.12,
            pointerEvents: 'none'
          }}
        >
          <defs>
            <pattern
              id="grid-pattern"
              width={70 * baseScale}
              height={70 * baseScale}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${70 * baseScale} 0 L 0 0 0 ${70 * baseScale}`}
                fill="none"
                stroke={accentColor}
                strokeWidth={Math.max(1, baseScale)}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      )}

      {/* Central Geometric Composition */}
      <div
        style={{
          position: 'relative',
          width: 580,
          height: 580,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${baseScale})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Outer Dashed HUD Ring */}
        <div
          style={{
            position: 'absolute',
            width: 540,
            height: 540,
            borderRadius: '50%',
            border: `2px dashed ${accentColor}60`,
            transform: `rotate(${rotation}deg) scale(${scale})`
          }}
        />

        {/* Orbiting Multi-Arc SVG */}
        <svg
          width="480"
          height="480"
          viewBox="0 0 480 480"
          style={{
            position: 'absolute',
            transform: `rotate(${counterRotation}deg) scale(${scale})`,
            filter: `drop-shadow(0 0 10px ${accentColor}80)`
          }}
        >
          <circle
            cx="240"
            cy="240"
            r="225"
            fill="none"
            stroke={accentColor}
            strokeWidth="3.5"
            strokeDasharray="140 80 50 60"
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          />
          <circle
            cx="240"
            cy="240"
            r="205"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeDasharray="12 28"
            opacity={0.5}
          />
        </svg>

        {/* Layer: Rotating Diamond Frame */}
        <div
          style={{
            position: 'absolute',
            width: 350,
            height: 350,
            border: `2px solid ${accentColor}85`,
            borderRadius: '24px',
            transform: `rotate(${rotation * 1.5}deg) scale(${scale})`,
            boxShadow: `0 0 30px ${accentColor}30, inset 0 0 25px ${accentColor}18`
          }}
        />

        {/* Layer: Counter-Rotating Secondary Diamond */}
        <div
          style={{
            position: 'absolute',
            width: 350,
            height: 350,
            border: `1.5px solid ${accentColor}45`,
            borderRadius: '24px',
            transform: `rotate(${counterRotation * 1.5 + 45}deg) scale(${scale})`
          }}
        />

        {/* Inner Octagon HUD Dial */}
        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          style={{
            position: 'absolute',
            transform: `rotate(${fastRotation}deg)`,
            opacity: 0.8
          }}
        >
          <polygon
            points="140,20 242,62 260,140 242,218 140,260 38,218 20,140 38,62"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeDasharray="12 12"
          />
        </svg>

        {/* Central Glassmorphic Typography Badge */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            padding: '28px 46px',
            background: 'rgba(8, 12, 22, 0.78)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '22px',
            border: `1.5px solid ${accentColor}75`,
            boxShadow: `0 16px 40px rgba(0,0,0,0.65), 0 0 35px ${accentColor}35`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: 440,
            transform: `scale(${scale})`
          }}
        >
          {/* Header Subtitle Pill */}
          <div
            style={{
              fontSize: 12,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: accentColor,
              fontWeight: 700,
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: accentColor,
                display: 'inline-block',
                boxShadow: `0 0 8px ${accentColor}`
              }}
            />
            MOTION STUDIO
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: accentColor,
                display: 'inline-block',
                boxShadow: `0 0 8px ${accentColor}`
              }}
            />
          </div>

          {/* Main Title Text */}
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              lineHeight: 1.25,
              textShadow: `0 0 ${textGlow}px ${accentColor}, 0 2px 10px rgba(0,0,0,0.8)`,
              wordBreak: 'break-word',
              maxWidth: 390
            }}
          >
            {titleText || 'GEOMETRIC MOTION'}
          </h1>

          {/* Footer Metadata */}
          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              letterSpacing: '2.5px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600
            }}
          >
            {width}×{height} • {fps} FPS • SEAMLESS LOOP
          </div>
        </div>

        {/* Orbiting Satellite Particle Points */}
        {[0, 90, 180, 270].map((angle, idx) => {
          const orbitAngle = ((rotation + angle) * Math.PI) / 180
          const radius = 255
          const cx = Math.cos(orbitAngle) * radius
          const cy = Math.sin(orbitAngle) * radius

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: accentColor,
                transform: `translate(${cx}px, ${cy}px) scale(${scale})`,
                boxShadow: `0 0 14px ${accentColor}, 0 0 24px ${accentColor}`
              }}
            />
          )
        })}
      </div>

      {/* Frame Corner Markers (Microstock Video HUD Overlay) */}
      <div
        style={{
          position: 'absolute',
          top: cornerMargin,
          left: cornerMargin,
          width: cornerSize,
          height: cornerSize,
          borderTop: `${cornerStroke}px solid ${accentColor}90`,
          borderLeft: `${cornerStroke}px solid ${accentColor}90`
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: cornerMargin,
          right: cornerMargin,
          width: cornerSize,
          height: cornerSize,
          borderTop: `${cornerStroke}px solid ${accentColor}90`,
          borderRight: `${cornerStroke}px solid ${accentColor}90`
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: cornerMargin,
          left: cornerMargin,
          width: cornerSize,
          height: cornerSize,
          borderBottom: `${cornerStroke}px solid ${accentColor}90`,
          borderLeft: `${cornerStroke}px solid ${accentColor}90`
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: cornerMargin,
          right: cornerMargin,
          width: cornerSize,
          height: cornerSize,
          borderBottom: `${cornerStroke}px solid ${accentColor}90`,
          borderRight: `${cornerStroke}px solid ${accentColor}90`
        }}
      />
    </div>
  )
}

export default MotionTemplate
