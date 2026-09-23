import React from 'react'
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

export interface VibeGraphicProps {
  titleText?: string
  subtitleText?: string
  badgeText?: string
  accentColor?: string
  secondaryColor?: string
  backgroundColor?: string
  isTransparent?: boolean
  scale?: number
  offsetX?: number
  offsetY?: number
  textOffsetX?: number
  textOffsetY?: number
  glowIntensity?: number
  speedMultiplier?: number
  customAssetUrl?: string
}

export const VibeGraphic: React.FC<VibeGraphicProps> = ({
  titleText = '50%',
  subtitleText = 'LIMITED FLASH SALE',
  badgeText = '⚡ FLASH DEAL',
  accentColor = '#FF3366',
  secondaryColor = '#FFD700',
  backgroundColor = '#120418',
  isTransparent = false,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  textOffsetX,
  textOffsetY,
  glowIntensity = 1,
  speedMultiplier = 1,
}) => {
  const posX = offsetX ?? textOffsetX ?? 0
  const posY = offsetY ?? textOffsetY ?? 0
  const rawFrame = useCurrentFrame()
  const frame = rawFrame * (speedMultiplier || 1)
  const { durationInFrames, width, height, fps } = useVideoConfig()
  const minDim = Math.min(width, height)
  const baseScale = minDim / 1080

  const introEnd = Math.floor(durationInFrames * 0.2)
  const actionEnd = Math.floor(durationInFrames * 0.8)

  const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.05], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const floatingY = Math.sin(frame / 12) * (8 * baseScale)
  const pulseScale = 1 + Math.sin(frame / 10) * 0.04
  const breathingGlow = (0.5 + Math.sin(frame / 15) * 0.3) * (glowIntensity || 1)

  const entrance = spring({
    frame: rawFrame,
    fps,
    config: { damping: 12, stiffness: 100 }
  })

  const exitStart = Math.max(0, durationInFrames - Math.floor(fps * 0.5))
  const exitProgress = interpolate(rawFrame, [exitStart, durationInFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const opacity = 1 - exitProgress

  const spinAngle = frame * 1.5

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: isTransparent ? 'transparent' : backgroundColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      position: 'relative',
      opacity
    }}>
      {/* Background Animated Rays / Glow */}
      {!isTransparent && (
        <div style={{
          position: 'absolute',
          width: width * 1.5,
          height: height * 1.5,
          background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`,
          transform: `scale(${cameraZoom})`,
          opacity: breathingGlow,
          pointerEvents: 'none'
        }} />
      )}

      {/* Main Container with Transform & Continuous Micro-Motion */}
      <div style={{
        transform: `translate(${posX}px, ${posY + floatingY}px) scale(${scale * entrance * cameraZoom})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>

        {/* Rotating Sunburst / Badge Backdrop */}
        <div style={{
          position: 'absolute',
          width: 500 * baseScale,
          height: 500 * baseScale,
          borderRadius: '50%',
          background: `conic-gradient(from ${spinAngle}deg, ${accentColor}, ${secondaryColor}, ${accentColor})`,
          opacity: 0.25,
          filter: `blur(${20 * baseScale}px)`,
          zIndex: 0,
        }} />

        {/* Outer Hexagon / Badge Shell */}
        <div style={{
          position: 'relative',
          width: 480 * baseScale,
          height: 480 * baseScale,
          background: `linear-gradient(135deg, #1a0b2e 0%, #2e0824 100%)`,
          borderRadius: '40px',
          border: `4px solid ${accentColor}`,
          boxShadow: `0 0 ${40 * breathingGlow}px ${accentColor}, inset 0 0 ${30 * breathingGlow}px ${secondaryColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40 * baseScale,
          zIndex: 1,
          transform: `scale(${pulseScale})`,
        }}>

          {/* Top Live Flash Badge */}
          <div style={{
            backgroundColor: accentColor,
            color: '#ffffff',
            padding: `${8 * baseScale}px ${24 * baseScale}px`,
            borderRadius: '20px',
            fontSize: `${20 * baseScale}px`,
            fontWeight: 900,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow: `0 4px 20px ${accentColor}88`,
            marginBottom: 16 * baseScale,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            {badgeText}
          </div>

          {/* Main Title / Discount Percentage */}
          <div style={{
            fontSize: `${110 * baseScale}px`,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1,
            textShadow: `0 0 30px ${secondaryColor}, 0 0 60px ${accentColor}`,
            letterSpacing: '-2px',
            textAlign: 'center',
            margin: `${10 * baseScale}px 0`,
          }}>
            {titleText}
          </div>

          {/* Subtitle / Description */}
          <div style={{
            fontSize: `${24 * baseScale}px`,
            fontWeight: 700,
            color: secondaryColor,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginTop: 8 * baseScale,
            textShadow: `0 0 10px ${secondaryColor}aa`,
          }}>
            {subtitleText}
          </div>

          {/* Decorative Corner Accents */}
          <div style={{
            position: 'absolute',
            top: 12 * baseScale,
            left: 12 * baseScale,
            width: 12 * baseScale,
            height: 12 * baseScale,
            borderRadius: '50%',
            backgroundColor: secondaryColor,
            boxShadow: `0 0 10px ${secondaryColor}`,
          }} />
          <div style={{
            position: 'absolute',
            top: 12 * baseScale,
            right: 12 * baseScale,
            width: 12 * baseScale,
            height: 12 * baseScale,
            borderRadius: '50%',
            backgroundColor: secondaryColor,
            boxShadow: `0 0 10px ${secondaryColor}`,
          }} />
          <div style={{
            position: 'absolute',
            bottom: 12 * baseScale,
            left: 12 * baseScale,
            width: 12 * baseScale,
            height: 12 * baseScale,
            borderRadius: '50%',
            backgroundColor: secondaryColor,
            boxShadow: `0 0 10px ${secondaryColor}`,
          }} />
          <div style={{
            position: 'absolute',
            bottom: 12 * baseScale,
            right: 12 * baseScale,
            width: 12 * baseScale,
            height: 12 * baseScale,
            borderRadius: '50%',
            backgroundColor: secondaryColor,
            boxShadow: `0 0 10px ${secondaryColor}`,
          }} />

        </div>

        {/* Floating Sparkles / Particles */}
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2 + (frame / 30)
          const radius = 240 * baseScale + Math.sin(frame / 15 + i) * 15
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const particleScale = (0.5 + Math.sin(frame / 10 + i) * 0.5) * baseScale

          return (
            <div key={i} style={{
              position: 'absolute',
              transform: `translate(${x}px, ${y}px) scale(${particleScale})`,
              width: 16,
              height: 16,
              backgroundColor: i % 2 === 0 ? accentColor : secondaryColor,
              borderRadius: '50%',
              boxShadow: `0 0 12px ${i % 2 === 0 ? accentColor : secondaryColor}`,
              zIndex: 2,
            }} />
          )
        })}

      </div>
    </div>
  )
}

export default VibeGraphic
export const DynamicMotion = VibeGraphic
export type DynamicMotionProps = VibeGraphicProps