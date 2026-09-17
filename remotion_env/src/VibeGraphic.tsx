import React from 'react'
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img } from 'remotion'

export interface VibeGraphicProps {
  // Teks
  titleText?: string
  subtitleText?: string
  badgeText?: string
  // Warna & Latar
  accentColor?: string
  secondaryColor?: string
  backgroundColor?: string
  isTransparent?: boolean
  // Transformasi Dinamis
  scale?: number           // Rentang: 0.5 - 2.0 (Default: 1)
  textOffsetX?: number     // Rentang: -500 - 500 px (Default: 0)
  textOffsetY?: number     // Rentang: -500 - 500 px (Default: 0)
  // FX & Aksen
  glowIntensity?: number   // Rentang: 0 - 40 px (Default: 15)
  speedMultiplier?: number // Rentang: 0.5 - 2.0 (Default: 1)
  width?: number
  height?: number
  durationInFrames?: number
  fps?: number
  customAssetUrl?: string
}

export const VibeGraphic: React.FC<VibeGraphicProps> = ({
  titleText = 'CREATIVE ENGINE',
  subtitleText = 'Generate your custom motion graphics with AI',
  badgeText = 'MOTION SUITE PRO',
  accentColor = '#00f2fe',
  secondaryColor = '#7928ca',
  backgroundColor = '#0a0d14',
  isTransparent = false,
  scale = 1,
  textOffsetX = 0,
  textOffsetY = 0,
  glowIntensity = 15,
  speedMultiplier = 1,
  customAssetUrl
}) => {
  const rawFrame = useCurrentFrame()
  const frame = rawFrame * (speedMultiplier || 1)
  const { width, height, fps = 30 } = useVideoConfig()

  const minDim = Math.min(width, height)
  const baseScale = minDim / 1080

  // -------------------------------------------------------------
  // ANIMATION TIMING & SPRINGS
  // -------------------------------------------------------------

  // Subtle global fade-in
  const globalOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })

  // Staggered Springs for Minimalist Elements
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 }
  })

  const titleSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 13, stiffness: 110, mass: 0.9 }
  })

  const lineSpring = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 15, stiffness: 90, mass: 0.8 }
  })

  const subtitleSpring = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 }
  })

  const circleSpring = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 16, stiffness: 80, mass: 1 }
  })

  // Continuous loop animations (smooth sine wave pulses)
  const time = frame / fps
  const subtlePulse = Math.sin(time * 2.5) // ~2.5 rad/s smooth breath
  const pulseScale = interpolate(subtlePulse, [-1, 1], [0.98, 1.02])
  const linePulseOpacity = interpolate(subtlePulse, [-1, 1], [0.75, 1])

  // Orbital rotation for minimalist accent circles
  const rotation1 = (frame * 0.4) % 360
  const rotation2 = (-frame * 0.25) % 360

  // Dynamic glow calculation based on glowIntensity prop
  const glow = glowIntensity * baseScale
  const primaryGlow = `0 0 ${glow}px ${accentColor}cc, 0 0 ${glow * 2.2}px ${accentColor}44`
  const secondaryGlow = `0 0 ${glow * 0.8}px ${secondaryColor}aa`

  // Badge animation
  const badgeOpacity = interpolate(badgeSpring, [0, 1], [0, 1])
  const badgeY = interpolate(badgeSpring, [0, 1], [-20 * baseScale, 0])

  // Title animation
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1])
  const titleY = interpolate(titleSpring, [0, 1], [25 * baseScale, 0])
  const titleScaleSpring = interpolate(titleSpring, [0, 1], [0.92, 1])

  // Neon line width expansion
  const lineWidth = interpolate(lineSpring, [0, 1], [0, 480 * baseScale])

  // Subtitle animation
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 0.85])
  const subtitleY = interpolate(subtitleSpring, [0, 1], [15 * baseScale, 0])

  // Accent circles size & entrance
  const outerCircleSize = 540 * baseScale
  const innerCircleSize = 420 * baseScale
  const circleScale = interpolate(circleSpring, [0, 1], [0.8, 1])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: isTransparent ? 'transparent' : backgroundColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        position: 'relative',
        opacity: globalOpacity
      }}
    >
      {/* MINIMALIST ACCENT CIRCLES (BACKGROUND / AMBIENT) */}
      <div
        style={{
          position: 'absolute',
          width: `${outerCircleSize}px`,
          height: `${outerCircleSize}px`,
          borderRadius: '50%',
          border: `1px solid ${accentColor}25`,
          transform: `scale(${circleScale * pulseScale}) rotate(${rotation1}deg)`,
          pointerEvents: 'none',
          boxShadow: `inset 0 0 ${glow * 1.5}px ${accentColor}10, 0 0 ${glow * 1.5}px ${accentColor}10`
        }}
      >
        {/* Tiny orbiting accent dot */}
        <div
          style={{
            position: 'absolute',
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${8 * baseScale}px`,
            height: `${8 * baseScale}px`,
            borderRadius: '50%',
            backgroundColor: accentColor,
            boxShadow: primaryGlow
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          width: `${innerCircleSize}px`,
          height: `${innerCircleSize}px`,
          borderRadius: '50%',
          border: `1px dashed ${secondaryColor}30`,
          transform: `scale(${circleScale}) rotate(${rotation2}deg)`,
          pointerEvents: 'none'
        }}
      >
        {/* Counter orbiting secondary accent dot */}
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${6 * baseScale}px`,
            height: `${6 * baseScale}px`,
            borderRadius: '50%',
            backgroundColor: secondaryColor,
            boxShadow: secondaryGlow
          }}
        />
      </div>

      {/* CENTRAL GRAPHIC & TYPOGRAPHY CONTAINER (DRIVEN BY VISUAL TWEAKER) */}
      <div
        style={{
          transform: `translate(${textOffsetX}px, ${textOffsetY}px) scale(${scale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 10,
          padding: `0 ${32 * baseScale}px`,
          maxWidth: '90%'
        }}
      >
        {/* ELEGANT MINIMALIST BADGE */}
        {badgeText && (
          <div
            style={{
              opacity: badgeOpacity,
              transform: `translateY(${badgeY}px)`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${8 * baseScale}px`,
              padding: `${6 * baseScale}px ${18 * baseScale}px`,
              borderRadius: `${100 * baseScale}px`,
              border: `1px solid ${accentColor}44`,
              background: `linear-gradient(135deg, ${accentColor}15, ${secondaryColor}15)`,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 ${4 * baseScale}px ${16 * baseScale}px rgba(0, 0, 0, 0.4)`,
              marginBottom: `${20 * baseScale}px`
            }}
          >
            {/* Glowing Accent Indicator */}
            <span
              style={{
                width: `${6 * baseScale}px`,
                height: `${6 * baseScale}px`,
                borderRadius: '50%',
                backgroundColor: accentColor,
                boxShadow: primaryGlow
              }}
            />
            <span
              style={{
                color: '#e2e8f0',
                fontSize: `${13 * baseScale}px`,
                fontWeight: 700,
                letterSpacing: `${3 * baseScale}px`,
                textTransform: 'uppercase'
              }}
            >
              {badgeText}
            </span>
          </div>
        )}

        {/* HERO TITLE */}
        <h1
          style={{
            margin: 0,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px) scale(${titleScaleSpring})`,
            fontSize: `${64 * baseScale}px`,
            fontWeight: 900,
            letterSpacing: `${4 * baseScale}px`,
            lineHeight: 1.1,
            color: '#ffffff',
            textTransform: 'uppercase',
            textShadow: `0 ${4 * baseScale}px ${24 * baseScale}px rgba(0, 0, 0, 0.8), ${primaryGlow}`
          }}
        >
          {titleText}
        </h1>

        {/* PULSING THIN NEON DIVIDER LINE */}
        <div
          style={{
            margin: `${22 * baseScale}px 0`,
            width: `${lineWidth}px`,
            height: `${2 * baseScale}px`,
            background: `linear-gradient(90deg, transparent, ${accentColor}, ${secondaryColor}, transparent)`,
            borderRadius: `${2 * baseScale}px`,
            boxShadow: primaryGlow,
            opacity: linePulseOpacity
          }}
        />

        {/* SUBTITLE */}
        {subtitleText && (
          <p
            style={{
              margin: 0,
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
              fontSize: `${20 * baseScale}px`,
              fontWeight: 400,
              letterSpacing: `${1.5 * baseScale}px`,
              color: '#cbd5e1',
              maxWidth: `${720 * baseScale}px`,
              lineHeight: 1.5,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)'
            }}
          >
            {subtitleText}
          </p>
        )}

        {/* OPTIONAL CUSTOM ASSET / LOGO */}
        {customAssetUrl && (
          <div
            style={{
              marginTop: `${28 * baseScale}px`,
              filter: `drop-shadow(0 0 ${12 * baseScale}px ${accentColor}66)`
            }}
          >
            <Img
              src={customAssetUrl}
              style={{
                height: `${48 * baseScale}px`,
                objectFit: 'contain'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default VibeGraphic
export const DynamicMotion = VibeGraphic
export type DynamicMotionProps = VibeGraphicProps