import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export interface VibeGraphicProps {
  titleText?: string;
  subtitleText?: string;
  badgeText?: string;
  accentColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  isTransparent?: boolean;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  textOffsetX?: number;
  textOffsetY?: number;
  glowIntensity?: number;
  speedMultiplier?: number;
  customAssetUrl?: string;
}

export const VibeGraphic: React.FC<VibeGraphicProps> = ({
  titleText = "FLASH SALE!",
  subtitleText = "Donat Cokelat Lumer Paling Nikmat & Manis!",
  badgeText = "DISKON 50%",
  accentColor = "#FF3366",
  secondaryColor = "#7B2CBF",
  backgroundColor = "#FFF3B0",
  isTransparent = false,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  textOffsetX = 0,
  textOffsetY = 0,
  glowIntensity = 1,
  speedMultiplier = 1}) => {
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame() * speedMultiplier;
  const minDim = Math.min(width, height);
  const baseScale = minDim / 1080;
  const isLandscape = width > height;

  // Springs & Entrances
  const heroDrop = spring({
    frame,
    fps,
    config: { damping: 9, stiffness: 140 },
  });

  const textSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const subtextSpring = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  const badgeSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 8, stiffness: 180 },
  });

  // Ambient & Kinetic Drifts
  const cameraZoom = interpolate(frame,[0, durationInFrames], [1.0, 1.03]);
  const floatOffset = Math.sin(frame / 14) * (8 * baseScale);
  const pulseScale = 1 + Math.sin(frame / 10) * 0.04 * glowIntensity;
  const sunRotation = (frame * 0.4) % 360;

  // Background Sparks / Confetti calculation
  const sparks = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const seed = i * 45.6;
      const x = (Math.sin(seed) * 0.5 + 0.5) * width;
      const baseY = (Math.cos(seed * 1.2) * 0.5 + 0.5) * height;
      const y = (baseY + frame * (1.5 + (i % 3))) % (height + 100) - 50;
      const rot = (frame * (2 + i)) % 360;
      const size = (12 + (i % 5) * 6) * baseScale;
      const colors = ["#FF3366", "#FFD166", "#06D6A0", "#118AB2", "#FF5964"];
      return { x, y, rot, size, color: colors[i % colors.length] };
    });
  }, [frame, width, height, baseScale]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: isTransparent ? 'transparent' : backgroundColor,
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transform: `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`,
      }}
    >
      {/* KINETIC SUNBURST BACKGROUND */}
      <div
        style={{
          position: 'absolute',
          width: width * 2,
          height: height * 2,
          left: -width / 2,
          top: -height / 2,
          transform: `rotate(${sunRotation}deg) scale(${cameraZoom})`,
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1000 1000">
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = i * (360 / 16);
            return (
              <polygon
                key={i}
                points="500,500 350,0 650,0"
                fill={i % 2 === 0 ? accentColor : secondaryColor}
                transform={`rotate(${angle} 500 500)`}
              />
            );
          })}
        </svg>
      </div>

      {/* FLOATING SPARKLES & CONFETTI */}
      {sparks.map((spark, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: spark.x,
            top: spark.y,
            transform: `rotate(${spark.rot}deg)`,
            width: spark.size,
            height: spark.size,
            backgroundColor: spark.color,
            borderRadius: idx % 2 === 0 ? '50%' : '20%',
            boxShadow: `0 4px 12px ${spark.color}88`,
            border: '2px solid #000000',
          }}
        />
      ))}

      {/* MAIN CONTAINER (SPLIT STAGE FOR LANDSCAPE 16:9) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: isLandscape ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: `${60 * baseScale}px`,
        }}
      >
        {/* ================= ZONA KIRI: INFO & ACTION ================= */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: isLandscape ? 'flex-start' : 'center',
            justifyContent: 'center',
            textAlign: isLandscape ? 'left' : 'center',
            zIndex: 10,
            transform: `translate(${textOffsetX}px, ${textOffsetY}px)`,
            maxWidth: isLandscape ? '52%' : '100%',
          }}
        >
          {/* BADGE KAPSUL / DISKON */}
          <div
            style={{
              transform: `scale(${badgeSpring})`,
              backgroundColor: accentColor,
              color: '#FFFFFF',
              padding: `${12 * baseScale}px ${32 * baseScale}px`,
              borderRadius: '999px',
              fontSize: `${28 * baseScale}px`,
              fontWeight: 900,
              letterSpacing: '2px',
              boxShadow: `0 ${6 * baseScale}px 0px #000000`,
              border: `4px solid #000000`,
              marginBottom: `${24 * baseScale}px`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${10 * baseScale}px`,
            }}
          >
            🔥 {badgeText} 🔥
          </div>

          {/* HEADLINE MASIF */}
          <h1
            style={{
              transform: `translateY(${(1 - textSpring) * 50}px)`,
              opacity: textSpring,
              fontSize: `${64 * baseScale}px`,
              fontWeight: 900,
              lineHeight: 1.05,
              color: '#1A1A1A',
              margin: 0,
              marginBottom: `${20 * baseScale}px`,
              textShadow: `4px 4px 0px ${secondaryColor}, 8px 8px 0px #000000`,
              letterSpacing: '-1px',
            }}
          >
            {titleText}
          </h1>

          {/* SUBTITLE INFORMATIF */}
          <p
            style={{
              transform: `translateY(${(1 - subtextSpring) * 40}px)`,
              opacity: subtextSpring,
              fontSize: `${26 * baseScale}px`,
              fontWeight: 700,
              color: '#2B2B2B',
              margin: 0,
              marginBottom: `${36 * baseScale}px`,
              maxWidth: `${600 * baseScale}px`,
              lineHeight: 1.4,
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              padding: `${12 * baseScale}px ${20 * baseScale}px`,
              borderRadius: `${16 * baseScale}px`,
              border: '3px solid #000000',
              boxShadow: `0 ${4 * baseScale}px 0px #000000`,
            }}
          >
            {subtitleText}
          </p>

          {/* CTA BUTTON / ACCENT TAG */}
          <div
            style={{
              opacity: subtextSpring,
              transform: `scale(${subtextSpring})`,
              display: 'flex',
              gap: `${16 * baseScale}px`,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: '#06D6A0',
                color: '#000000',
                padding: `${16 * baseScale}px ${36 * baseScale}px`,
                borderRadius: `${20 * baseScale}px`,
                fontSize: `${22 * baseScale}px`,
                fontWeight: 900,
                border: '4px solid #000000',
                boxShadow: `0 ${6 * baseScale}px 0px #000000`,
                display: 'flex',
                alignItems: 'center',
                gap: `${10 * baseScale}px`,
              }}
            >
              <span>🛒</span> PESAN SEKARANG
            </div>
            <div
              style={{
                backgroundColor: '#FFF',
                color: '#000000',
                padding: `${16 * baseScale}px ${24 * baseScale}px`,
                borderRadius: `${20 * baseScale}px`,
                fontSize: `${20 * baseScale}px`,
                fontWeight: 800,
                border: '4px solid #000000',
                boxShadow: `0 ${6 * baseScale}px 0px #000000`,
              }}
            >
              ⏳ 24 JAM SAJA
            </div>
          </div>
        </div>

        {/* ================= ZONA KANAN: HERO STAGE (DONAT COKELAT LUMER) ================= */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transform: `translateY(${floatOffset}px) scale(${heroDrop})`,
            maxHeight: '100%',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: `${460 * baseScale}px`,
              height: `${460 * baseScale}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${pulseScale})`,
            }}
          >
            {/* GLOW / SHADOW BASE */}
            <div
              style={{
                position: 'absolute',
                bottom: `${20 * baseScale}px`,
                width: `${380 * baseScale}px`,
                height: `${50 * baseScale}px`,
                backgroundColor: 'rgba(0,0,0,0.25)',
                borderRadius: '50%',
                filter: 'blur(8px)',
              }}
            />

            {/* HIGH-END VECTOR 3D-STYLE DONUT ILLUSTRATION */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 500 500"
              style={{ filter: `drop-shadow(0 ${16 * baseScale}px 0px rgba(0,0,0,0.8))` }}
            >
              <defs>
                <linearGradient id="doughGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F4A261" />
                  <stop offset="100%" stopColor="#D48343" />
                </linearGradient>
                <linearGradient id="chocGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#583101" />
                  <stop offset="100%" stopColor="#311900" />
                </linearGradient>
                <linearGradient id="glossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* DOUGH BASE (BIG THICK DONUT) */}
              <circle cx="250" cy="260" r="190" fill="#000000" />
              <circle cx="250" cy="250" r="190" fill="url(#doughGrad)" stroke="#000000" strokeWidth="12" />

              {/* DOUGH INNER HOLE */}
              <circle cx="250" cy="250" r="70" fill="#000000" />
              <circle cx="250" cy="242" r="70" fill="url(#doughGrad)" stroke="#000000" strokeWidth="10" />

              {/* CHOCOLATE GLAZE WITH DRIPS (MELTING EFFECT) */}
              <path
                d="M 250,70 
                   C 330,70 410,120 420,200
                   C 440,220 460,250 435,280
                   C 420,300 400,280 390,310
                   C 375,350 410,380 380,410
                   C 340,430 300,380 270,410
                   C 230,440 210,400 180,410
                   C 140,420 120,380 100,360
                   C 70,330 90,290 80,260
                   C 60,220 80,160 130,110
                   C 170,75 210,70 250,70 Z"
                fill="url(#chocGrad)"
                stroke="#000000"
                strokeWidth="10"
              />

              {/* INNER HOLE FOR GLAZE */}
              <path
                d="M 250,172 
                   C 285,172 315,205 310,240
                   C 305,275 275,295 250,290
                   C 220,285 200,250 205,225
                   C 210,190 225,172 250,172 Z"
                fill="#FFF3B0"
                stroke="#000000"
                strokeWidth="8"
              />

              {/* GLOSSY HIGHLIGHTS ON CHOCOLATE */}
              <path
                d="M 140,140 C 180,100 240,95 290,105 C 240,115 170,140 140,140 Z"
                fill="url(#glossGrad)"
              />
              <path
                d="M 370,190 C 390,220 400,260 380,280 C 395,250 395,210 370,190 Z"
                fill="url(#glossGrad)"
              />

              {/* SPRINKLES (COLORFUL COLUMNS) */}
              {/* Sprinkle 1 - Pink */}
              <rect x="140" y="200" width="22" height="10" rx="5" fill="#FF3366" stroke="#000" strokeWidth="3" transform="rotate(25 150 205)" />
              {/* Sprinkle 2 - Yellow */}
              <rect x="330" y="150" width="24" height="10" rx="5" fill="#FFD166" stroke="#000" strokeWidth="3" transform="rotate(-30 340 155)" />
              {/* Sprinkle 3 - Cyan */}
              <rect x="300" y="330" width="22" height="10" rx="5" fill="#06D6A0" stroke="#000" strokeWidth="3" transform="rotate(45 310 335)" />
              {/* Sprinkle 4 - White */}
              <rect x="170" y="320" width="22" height="10" rx="5" fill="#FFFFFF" stroke="#000" strokeWidth="3" transform="rotate(-15 180 325)" />
              {/* Sprinkle 5 - Orange */}
              <rect x="360" y="260" width="24" height="10" rx="5" fill="#FF9F1C" stroke="#000" strokeWidth="3" transform="rotate(70 370 265)" />
              {/* Sprinkle 6 - Purple */}
              <rect x="220" y="370" width="22" height="10" rx="5" fill="#7B2CBF" stroke="#000" strokeWidth="3" transform="rotate(-40 230 375)" />

              {/* MELTING CHOCOLATE DROPLETS (EXTRA JUICY) */}
              <circle cx="390" cy="370" r="14" fill="#583101" stroke="#000000" strokeWidth="6" />
              <circle cx="160" cy="385" r="10" fill="#583101" stroke="#000000" strokeWidth="6" />
            </svg>

            {/* FLOATING MINI BADGE ON HERO */}
            <div
              style={{
                position: 'absolute',
                top: `${0 * baseScale}px`,
                right: `${0 * baseScale}px`,
                backgroundColor: '#FFD166',
                color: '#000000',
                padding: `${8 * baseScale}px ${18 * baseScale}px`,
                borderRadius: '999px',
                fontSize: `${18 * baseScale}px`,
                fontWeight: 900,
                border: '4px solid #000000',
                boxShadow: `0 ${4 * baseScale}px 0px #000000`,
                transform: `rotate(12deg) scale(${badgeSpring})`,
              }}
            >
              🍫 LUMER BANGET!
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default VibeGraphic;
export const DynamicMotion = VibeGraphic;
export type DynamicMotionProps = VibeGraphicProps;