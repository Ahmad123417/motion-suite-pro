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

// 24 Deterministic Elegant Micro-Particles for ambient depth
const PARTICLES = Array.from({ length: 24 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280
  const rnd1 = seed / 233280
  const rnd2 = ((seed * 9301 + 49297) % 233280) / 233280
  const rnd3 = ((rnd2 * 9301 + 49297) % 233280) / 233280
  return {
    baseX: (rnd1 - 0.5) * 960,
    baseY: (rnd2 - 0.5) * 580,
    size: 2.2 + rnd3 * 3.8,
    speed: 0.35 + rnd1 * 0.75,
    phase: rnd2 * Math.PI * 2,
    colorType: i % 2 === 0 ? 'accent' : 'secondary'
  }
})

export const VibeGraphic: React.FC<VibeGraphicProps> = ({
  titleText = 'MOTION SUITE PRO',
  subtitleText = 'AI Creative Motion Graphics Workstation',
  badgeText = 'OFFICIAL RELEASE v1.0',
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

  // Global smooth fade-in
  const globalOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })

  // Staggered Springs
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 130, mass: 0.8 }
  })

  const titleSpring = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.9 }
  })

  const lineSpring = spring({
    frame: Math.max(0, frame - 11),
    fps,
    config: { damping: 15, stiffness: 95, mass: 0.8 }
  })

  const subtitleSpring = spring({
    frame: Math.max(0, frame - 16),
    fps,
    config: { damping: 14, stiffness: 105, mass: 0.8 }
  })

  const ringSpring = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 16, stiffness: 75, mass: 1 }
  })

  // Continuous subtle sine breathing loops
  const time = frame / fps
  const subtleBreath = Math.sin(time * 2.2)
  const pulseScale = interpolate(subtleBreath, [-1, 1], [0.985, 1.015])
  const linePulseOpacity = interpolate(subtleBreath, [-1, 1], [0.8, 1])

  // Orbital rotations for minimalist futuristic geometry
  const rotation1 = (frame * 0.35) % 360
  const rotation2 = (-frame * 0.22) % 360

  // Dynamic Neon Glow calculation based on glowIntensity prop
  const glow = glowIntensity * baseScale
  const primaryGlow = `0 0 ${glow}px ${accentColor}dd, 0 0 ${glow * 2.2}px ${accentColor}55`
  const secondaryGlow = `0 0 ${glow * 0.9}px ${secondaryColor}bb`

  // Badge transformations
  const badgeOpacity = interpolate(badgeSpring, [0, 1], [0, 1])
  const badgeY = interpolate(badgeSpring, [0, 1], [-22 * baseScale, 0])

  // Title transformations
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1])
  const titleY = interpolate(titleSpring, [0, 1], [24 * baseScale, 0])
  const titleScaleSpring = interpolate(titleSpring, [0, 1], [0.92, 1])

  // Futuristic Line expansions
  const lineWidth = interpolate(lineSpring, [0, 1], [0, 520 * baseScale])
  const bracketSpread = interpolate(lineSpring, [0, 1], [40 * baseScale, 0])

  // Subtitle transformations
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 0.9])
  const subtitleY = interpolate(subtitleSpring, [0, 1], [14 * baseScale, 0])

  // Futuristic orbital circles
  const outerCircleSize = 580 * baseScale
  const innerCircleSize = 440 * baseScale
  const ringScale = interpolate(ringSpring, [0, 1], [0.75, 1])

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
      {/* ELEGANT FLOATING MICRO-PARTICLES */}
      {PARTICLES.map((p, idx) => {
        const py = p.baseY - ((frame * p.speed * 2.2) % 400) + 200
        const px = p.baseX + Math.sin(time * p.speed + p.phase) * (26 * baseScale)
        const pOpacity =
          interpolate(Math.sin(frame * 0.06 + p.phase), [-1, 1], [0.15, 0.8]) * globalOpacity
        const pColor = p.colorType === 'accent' ? accentColor : secondaryColor

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `calc(50% + ${px * baseScale}px)`,
              top: `calc(50% + ${py * baseScale}px)`,
              width: `${p.size * baseScale}px`,
              height: `${p.size * baseScale}px`,
              borderRadius: '50%',
              backgroundColor: pColor,
              boxShadow: `0 0 ${p.size * 3 * baseScale}px ${pColor}`,
              opacity: pOpacity,
              pointerEvents: 'none'
            }}
          />
        )
      })}

      {/* FUTURISTIC ORBITAL RINGS */}
      <div
        style={{
          position: 'absolute',
          width: `${outerCircleSize}px`,
          height: `${outerCircleSize}px`,
          borderRadius: '50%',
          border: `1px solid ${accentColor}25`,
          transform: `scale(${ringScale * pulseScale}) rotate(${rotation1}deg)`,
          pointerEvents: 'none',
          boxShadow: `inset 0 0 ${glow * 1.5}px ${accentColor}10, 0 0 ${glow * 1.5}px ${accentColor}10`
        }}
      >
        {/* Orbiting accent beacon */}
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${9 * baseScale}px`,
            height: `${9 * baseScale}px`,
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
          border: `1px dashed ${secondaryColor}35`,
          transform: `scale(${ringScale}) rotate(${rotation2}deg)`,
          pointerEvents: 'none'
        }}
      >
        {/* Counter-orbiting secondary beacon */}
        <div
          style={{
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${7 * baseScale}px`,
            height: `${7 * baseScale}px`,
            borderRadius: '50%',
            backgroundColor: secondaryColor,
            boxShadow: secondaryGlow
          }}
        />
      </div>

      {/* MAIN CONTENT CONTAINER (HOT-LINKED TO VISUAL TWEAKER) */}
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
          maxWidth: '92%'
        }}
      >
        {/* BADGE: OFFICIAL RELEASE v1.0 */}
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
              background: `linear-gradient(135deg, ${accentColor}18, ${secondaryColor}18)`,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 ${4 * baseScale}px ${16 * baseScale}px rgba(0, 0, 0, 0.45)`,
              marginBottom: `${18 * baseScale}px`
            }}
          >
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
                color: '#f1f5f9',
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

        {/* HERO TITLE: MOTION SUITE PRO */}
        <h1
          style={{
            margin: 0,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px) scale(${titleScaleSpring})`,
            fontSize: `${66 * baseScale}px`,
            fontWeight: 900,
            letterSpacing: `${5 * baseScale}px`,
            lineHeight: 1.1,
            color: '#ffffff',
            textTransform: 'uppercase',
            textShadow: `0 ${4 * baseScale}px ${24 * baseScale}px rgba(0, 0, 0, 0.85), ${primaryGlow}`
          }}
        >
          {titleText}
        </h1>

        {/* FUTURISTIC NEON ACCENT DIVIDER WITH TECH CORNERS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `${20 * baseScale}px 0`,
            width: '100%'
          }}
        >
          {/* Left corner accent */}
          <div
            style={{
              width: `${12 * baseScale}px`,
              height: `${2 * baseScale}px`,
              backgroundColor: accentColor,
              transform: `translateX(-${bracketSpread}px)`,
              opacity: linePulseOpacity,
              boxShadow: primaryGlow
            }}
          />

          {/* Central glowing gradient laser */}
          <div
            style={{
              width: `${lineWidth}px`,
              height: `${2 * baseScale}px`,
              background: `linear-gradient(90deg, transparent, ${accentColor}, ${secondaryColor}, transparent)`,
              borderRadius: `${2 * baseScale}px`,
              boxShadow: primaryGlow,
              opacity: linePulseOpacity,
              margin: `0 ${8 * baseScale}px`
            }}
          />

          {/* Right corner accent */}
          <div
            style={{
              width: `${12 * baseScale}px`,
              height: `${2 * baseScale}px`,
              backgroundColor: secondaryColor,
              transform: `translateX(${bracketSpread}px)`,
              opacity: linePulseOpacity,
              boxShadow: secondaryGlow
            }}
          />
        </div>

        {/* SUBTITLE: AI Creative Motion Graphics Workstation */}
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
              maxWidth: `${740 * baseScale}px`,
              lineHeight: 1.5,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.75)'
            }}
          >
            {subtitleText}
          </p>
        )}

        {/* OPTIONAL CUSTOM BRANDING LOGO */}
        {customAssetUrl && (
          <div
            style={{
              marginTop: `${26 * baseScale}px`,
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