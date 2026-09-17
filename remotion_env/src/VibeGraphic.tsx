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
  titleText = 'VERSUS ESPORTS',
  subtitleText = 'CHAMPIONSHIP SERIES',
  badgeText = 'TOURNAMENT COUNTDOWN',
  accentColor = '#00f2fe',
  secondaryColor = '#ff0055',
  backgroundColor = '#0a0d14',
  isTransparent = true,
  scale = 1,
  textOffsetX = 0,
  textOffsetY = 0,
  glowIntensity = 15,
  speedMultiplier = 1,
  customAssetUrl
}) => {
  const rawFrame = useCurrentFrame()
  const frame = rawFrame * speedMultiplier
  const { width, height, fps = 30 } = useVideoConfig()

  const minDim = Math.min(width, height)
  const baseScale = minDim / 1080

  // -------------------------------------------------------------
  // TIMING & STATE CALCULATIONS
  // Total 15 seconds (450 frames @ 30fps)
  // Frames 0-300: Countdown 10 down to 1 (30 frames per second)
  // Frames 300-330: Final "0" / Lock-in state
  // Frames 330-450: Explosive "MATCH START" climax
  // -------------------------------------------------------------
  const isMatchStart = frame >= 330

  // Current digit (10 down to 0)
  const currentNum = Math.max(0, 10 - Math.floor(frame / 30))
  const localFrame = frame % 30

  // Smooth pop spring for each number tick
  const numSpring = spring({
    frame: isMatchStart ? frame - 330 : localFrame,
    fps,
    config: { damping: 11, stiffness: 220, mass: 0.6 }
  })

  // Intro entrance animation
  const introProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 }
  })

  const globalOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
  const globalScale = interpolate(introProgress, [0, 1], [0.85, 1.0])

  // Radial HUD ring progress (100% full at frame 0 -> 0% at frame 330)
  const ringProgress = interpolate(frame, [0, 330], [1, 0], { extrapolateRight: 'clamp' })
  const ringRadius = 180 * baseScale
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringStrokeDashoffset = ringCircumference * (1 - ringProgress)

  // Shockwave ring pulse on every beat
  const pulseScale = interpolate(localFrame, [0, 12, 29], [1.0, 1.35, 1.0], { extrapolateRight: 'clamp' })
  const pulseOpacity = interpolate(localFrame, [0, 8, 25], [0.7, 0.2, 0], { extrapolateRight: 'clamp' })

  // Colors
  const primaryNeon = accentColor
  const secondaryNeon = secondaryColor
  const goldNeon = '#ffea00'

  // MATCH START visual transition variables
  const matchStartSpring = spring({
    frame: Math.max(0, frame - 330),
    fps,
    config: { damping: 10, stiffness: 180 }
  })

  const matchStartOpacity = interpolate(frame, [330, 340], [0, 1], { extrapolateRight: 'clamp' })
  const matchStartScale = interpolate(matchStartSpring, [0, 1], [0.4, 1.0])
  const flashOpacity = interpolate(frame, [330, 336, 355], [0, 0.85, 0], { extrapolateRight: 'clamp' })

  // Continuous background geometric rotation
  const bgRotation = (frame * 0.4) % 360
  const counterRotation = (-frame * 0.6) % 360

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: isTransparent ? 'transparent' : backgroundColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        position: 'relative',
        opacity: globalOpacity
      }}
    >
      {/* FLASH SHOCKWAVE OVERLAY ON MATCH START */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: primaryNeon,
            opacity: flashOpacity,
            zIndex: 30,
            pointerEvents: 'none',
            filter: 'blur(20px)'
          }}
        />
      )}

      {/* MAIN CONTAINER */}
      <div
        style={{
          transform: `scale(${globalScale * scale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: '100%',
          height: '100%'
        }}
      >
        {/* TOP HEADER BADGE */}
        <div
          style={{
            position: 'absolute',
            top: `${height * 0.16}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 20,
            transform: `translate(${textOffsetX}px, ${textOffsetY}px)`
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${14 * baseScale}px`,
              padding: `${8 * baseScale}px ${24 * baseScale}px`,
              background: 'rgba(10, 15, 25, 0.75)',
              border: `1px solid ${primaryNeon}66`,
              borderRadius: `${30 * baseScale}px`,
              boxShadow: `0 0 ${glowIntensity * baseScale}px ${primaryNeon}66`,
              backdropFilter: 'blur(8px)'
            }}
          >
            <span
              style={{
                width: `${10 * baseScale}px`,
                height: `${10 * baseScale}px`,
                borderRadius: '50%',
                backgroundColor: isMatchStart ? secondaryNeon : primaryNeon,
                boxShadow: `0 0 10px ${isMatchStart ? secondaryNeon : primaryNeon}`
              }}
            />
            <span
              style={{
                color: '#ffffff',
                fontSize: `${20 * baseScale}px`,
                fontWeight: 900,
                letterSpacing: `${4 * baseScale}px`,
                textTransform: 'uppercase',
                fontFamily: 'Impact, "Arial Black", sans-serif'
              }}
            >
              {titleText}
            </span>
          </div>

          {/* SUBTITLE & BADGE BAR */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${8 * baseScale}px`,
              marginTop: `${8 * baseScale}px`
            }}
          >
            <span
              style={{
                color: primaryNeon,
                fontSize: `${11 * baseScale}px`,
                fontWeight: 800,
                letterSpacing: `${3 * baseScale}px`,
                textTransform: 'uppercase',
                background: `${primaryNeon}22`,
                padding: `${2 * baseScale}px ${8 * baseScale}px`,
                borderRadius: `${4 * baseScale}px`,
                border: `1px solid ${primaryNeon}44`
              }}
            >
              {badgeText}
            </span>
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: `${13 * baseScale}px`,
                fontWeight: 700,
                letterSpacing: `${4 * baseScale}px`,
                textTransform: 'uppercase'
              }}
            >
              {isMatchStart ? 'BATTLE IS LIVE' : subtitleText}
            </span>
          </div>
        </div>

        {/* CENTRAL HUD DISPLAY */}
        <div
          style={{
            position: 'relative',
            width: `${480 * baseScale}px`,
            height: `${480 * baseScale}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          {/* ROTATING OUTER CYBER GEAR */}
          <svg
            width={480 * baseScale}
            height={480 * baseScale}
            viewBox="0 0 480 480"
            style={{
              position: 'absolute',
              transform: `rotate(${bgRotation}deg)`,
              filter: `drop-shadow(0 0 12px ${primaryNeon}44)`
            }}
          >
            <circle
              cx="240"
              cy="240"
              r="220"
              stroke={`${primaryNeon}22`}
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="240"
              cy="240"
              r="220"
              stroke={primaryNeon}
              strokeWidth="3"
              strokeDasharray="20 40 80 40"
              fill="none"
              opacity="0.6"
            />
          </svg>

          {/* COUNTER-ROTATING INNER RING */}
          <svg
            width={400 * baseScale}
            height={400 * baseScale}
            viewBox="0 0 400 400"
            style={{
              position: 'absolute',
              transform: `rotate(${counterRotation}deg)`
            }}
          >
            <circle
              cx="200"
              cy="200"
              r="180"
              stroke={`${secondaryNeon}33`}
              strokeWidth="1.5"
              strokeDasharray="8 12"
              fill="none"
            />
          </svg>

          {/* PROGRESS TIMER RING */}
          {!isMatchStart && (
            <svg
              width={440 * baseScale}
              height={440 * baseScale}
              viewBox="0 0 440 440"
              style={{
                position: 'absolute',
                transform: 'rotate(-90deg)',
                filter: `drop-shadow(0 0 16px ${primaryNeon})`
              }}
            >
              <circle
                cx="220"
                cy="220"
                r={ringRadius}
                stroke={primaryNeon}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringStrokeDashoffset}
              />
            </svg>
          )}

          {/* SHOCKWAVE PULSE RING ON SECOND TICK */}
          {!isMatchStart && pulseOpacity > 0 && (
            <div
              style={{
                position: 'absolute',
                width: `${360 * baseScale}px`,
                height: `${360 * baseScale}px`,
                borderRadius: '50%',
                border: `2px solid ${primaryNeon}`,
                transform: `scale(${pulseScale})`,
                opacity: pulseOpacity,
                boxShadow: `0 0 25px ${primaryNeon}`,
                pointerEvents: 'none'
              }}
            />
          )}

          {/* GLASS CENTER HUD PANEL */}
          <div
            style={{
              position: 'absolute',
              width: `${320 * baseScale}px`,
              height: `${320 * baseScale}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(15,23,42,0.85) 0%, rgba(5,8,16,0.95) 100%)',
              border: `1px solid ${isMatchStart ? secondaryNeon : primaryNeon}88`,
              boxShadow: `inset 0 0 30px ${isMatchStart ? secondaryNeon : primaryNeon}33, 0 0 40px rgba(0,0,0,0.8)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* COUNTDOWN DIGIT */}
            {!isMatchStart && (
              <div
                key={currentNum}
                style={{
                  transform: `scale(${0.85 + numSpring * 0.25})`,
                  fontSize: `${180 * baseScale}px`,
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: '#ffffff',
                  lineHeight: 1,
                  textAlign: 'center',
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  textShadow: `0 0 ${35 * baseScale}px ${primaryNeon}, 0 0 ${70 * baseScale}px ${primaryNeon}66`,
                  userSelect: 'none'
                }}
              >
                {currentNum}
              </div>
            )}

            {/* MATCH START FINAL TEXT */}
            {isMatchStart && (
              <div
                style={{
                  opacity: matchStartOpacity,
                  transform: `scale(${matchStartScale})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: `${54 * baseScale}px`,
                    fontWeight: 900,
                    fontStyle: 'italic',
                    fontFamily: 'Impact, "Arial Black", sans-serif',
                    letterSpacing: `${4 * baseScale}px`,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    lineHeight: 1.05,
                    background: `linear-gradient(180deg, #ffffff 0%, ${goldNeon} 50%, ${secondaryNeon} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: `drop-shadow(0 0 25px ${secondaryNeon})`
                  }}
                >
                  MATCH
                  <br />
                  START
                </span>
              </div>
            )}
          </div>
        </div>

        {/* LEFT & RIGHT FUTURISTIC HUD WINGS */}
        <div
          style={{
            position: 'absolute',
            width: `${height * 0.9}px`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 5
          }}
        >
          {/* LEFT HUD BRACKET & EQUALIZER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${10 * baseScale}px`, alignItems: 'flex-start' }}>
            <div
              style={{
                width: `${140 * baseScale}px`,
                height: `${4 * baseScale}px`,
                background: `linear-gradient(90deg, ${primaryNeon}, transparent)`
              }}
            />
            <div style={{ display: 'flex', gap: `${4 * baseScale}px`, alignItems: 'flex-end', height: `${28 * baseScale}px` }}>
              {[0.4, 0.9, 0.5, 1.0, 0.7, 0.3, 0.85].map((heightFactor, idx) => {
                const barHeight = Math.sin((frame * 0.2) + idx) * 0.4 + 0.6
                return (
                  <div
                    key={idx}
                    style={{
                      width: `${5 * baseScale}px`,
                      height: `${heightFactor * barHeight * 28 * baseScale}px`,
                      backgroundColor: primaryNeon,
                      borderRadius: '1px',
                      boxShadow: `0 0 8px ${primaryNeon}`
                    }}
                  />
                )
              })}
            </div>
            <span style={{ color: `${primaryNeon}aa`, fontSize: `${11 * baseScale}px`, fontWeight: 800, letterSpacing: '2px' }}>
              SYS.READY // 60FPS
            </span>
          </div>

          {/* RIGHT HUD BRACKET & STATUS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${10 * baseScale}px`, alignItems: 'flex-end' }}>
            <div
              style={{
                width: `${140 * baseScale}px`,
                height: `${4 * baseScale}px`,
                background: `linear-gradient(-90deg, ${secondaryNeon}, transparent)`
              }}
            />
            <span style={{ color: '#ffffff', fontSize: `${12 * baseScale}px`, fontWeight: 800, letterSpacing: '2px' }}>
              PHASE: {isMatchStart ? 'ENGAGED' : 'COUNTDOWN'}
            </span>
            <span style={{ color: `${secondaryNeon}aa`, fontSize: `${11 * baseScale}px`, fontWeight: 800, letterSpacing: '2px' }}>
              SYNC // 100%
            </span>
          </div>
        </div>

        {/* CUSTOM BRANDING LOGO INTEGRATION */}
        {customAssetUrl && (
          <div
            style={{
              position: 'absolute',
              bottom: `${height * 0.12}px`,
              zIndex: 20,
              filter: `drop-shadow(0 0 12px ${primaryNeon}66)`
            }}
          >
            <Img
              src={customAssetUrl}
              style={{
                height: `${50 * baseScale}px`,
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