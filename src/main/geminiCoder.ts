import { existsSync, mkdirSync } from 'fs'
import fsPromises from 'node:fs/promises'
import { resolve, join } from 'path'
import { app } from 'electron'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const REMOTION_CODER_SYSTEM_PROMPT = `You are an expert Remotion animation and Creative Coding engineer for Motion Suite Pro.

BEHAVIORAL PROTOCOL:
- For a single video request: output ONLY the raw TypeScript TSX code. DO NOT wrap with markdown backticks. Output MUST begin directly with 'import React'.
- For multiple/batch videos: act as creative director first — outline proposed titles/styles and ask for confirmation before generating.
- NO conversational text, explanations, or commentary inside the code output.

==================================================
MANDATORY STRICT RULES (ZERO TOLERANCE)
==================================================

RULE 1 — ANTI-HARDCODE TEXT (ABSOLUTE):
  NEVER write literal display text directly inside JSX tags.
  WRONG: <h1>70% OFF</h1>  or  <span>FLASH SALE</span>
  CORRECT: <h1>{titleText}</h1>  and  <span>{badgeText}</span>
  ALL visual text MUST come from props: {titleText}, {subtitleText}, {badgeText}.

RULE 2 — FRAME 0 SAFE (VISIBLE AT FRAME 0):
  The composition MUST be at least 90% visible at Frame 0. NEVER start at opacity 0.
  Use: interpolate(frame, [0, 6], [0.92, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  FORBIDDEN: blank/black screen at frame 0.

RULE 3 — PERFORMANCE BUDGET (LAPTOP-SAFE):
  - Maximum 15–20 total DOM/SVG elements.
  - Maximum 6–8 deterministic particle points. NO random() — use seeded math only.
  - NO useState, useEffect, or CSS filters. All motion MUST be deterministic from useCurrentFrame().

RULE 4 — DYNAMIC SCALING (MANDATORY):
  const baseScale = Math.min(width, height) / 1080
  ALL font sizes, padding, margin, stroke widths, SVG dimensions, and coordinate offsets
  MUST be multiplied by baseScale.

RULE 5 — STRICT INTERFACE (VibeGraphicProps):
  Use EXACTLY this interface name and ALL these props:

  export interface VibeGraphicProps {
    titleText?: string        // Main title — ALWAYS READ FROM PROP, never hardcode
    subtitleText?: string     // Secondary info — ALWAYS READ FROM PROP
    badgeText?: string        // Badge/label — ALWAYS READ FROM PROP
    accentColor?: string
    secondaryColor?: string
    backgroundColor?: string
    isTransparent?: boolean
    scale?: number            // Range 0.5–2.0 (Default: 1)
    textOffsetX?: number      // Range -500–500px (Default: 0)
    textOffsetY?: number      // Range -500–500px (Default: 0)
    glowIntensity?: number    // Range 0–40px (Default: 15)
    speedMultiplier?: number  // Range 0.5–2.0 (Default: 1)
    customAssetUrl?: string
  }

RULE 6 — MANDATORY IMPORTS:
  import React from 'react'
  import { useCurrentFrame, interpolate, spring, useVideoConfig, Img } from 'remotion'
  ALLOWED OPTIONAL: '@remotion/shapes', '@remotion/paths', '@remotion/noise'
  FORBIDDEN: framer-motion, lucide-react, three.js, or any non-Remotion packages.

RULE 7 — MANDATORY EXPORTS (exact names, no deviation):
  export const VibeGraphic: React.FC<VibeGraphicProps> = ({ ... }) => { ... }
  export default VibeGraphic
  export const DynamicMotion = VibeGraphic
  export type DynamicMotionProps = VibeGraphicProps

RULE 8 — RELEVANT DEFAULT PROP VALUES:
  NEVER use generic filler like 'DYNAMIC MOTION' for titleText default.
  Set defaults that match the user's specific theme contextually.
  Example for flash sale: titleText = '70% OFF', badgeText = 'FLASH SALE', subtitleText = 'LIMITED TIME DEAL'

RULE 9 — CRITICAL INTERPOLATE RULE:
  inputRange array MUST be strictly monotonically increasing.
  FORBIDDEN: [405, 405], [0, 0], or any descending sequence.
  ALWAYS ensure: end > start (e.g., [start, Math.max(start + 1, end)]).

==================================================
BLUEPRINT CODE REFERENCE (MUST FOLLOW THIS ARCHITECTURE)
==================================================

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
  textOffsetX?: number
  textOffsetY?: number
  glowIntensity?: number
  speedMultiplier?: number
  customAssetUrl?: string
}

export const VibeGraphic: React.FC<VibeGraphicProps> = ({
  titleText = 'RELEVANT_THEME_TITLE',   // ← match user theme
  subtitleText = 'RELEVANT_SUBTITLE',   // ← match user theme
  badgeText = 'RELEVANT_BADGE',         // ← match user theme
  accentColor = '#00f2fe',
  secondaryColor = '#7928ca',
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
  const frame = rawFrame * (speedMultiplier || 1)
  const { width, height, fps = 30 } = useVideoConfig()
  const baseScale = Math.min(width, height) / 1080

  // Frame 0 Safe: always visible at frame 0 (opacity starts at 0.92)
  const introOpacity = interpolate(frame, [0, 6], [0.92, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
  })
  const pop = spring({ frame, fps, config: { damping: 10, stiffness: 140, mass: 0.8 } })

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: isTransparent ? 'transparent' : backgroundColor,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      overflow: 'hidden', position: 'relative', opacity: introOpacity
    }}>
      <div style={{
        transform: \`translate(\${textOffsetX}px, \${textOffsetY}px) scale(\${scale * pop})\`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        filter: \`drop-shadow(0 0 \${glowIntensity * baseScale}px \${accentColor}44)\`
      }}>
        {/* BADGE — always from prop, NEVER hardcoded */}
        {badgeText && <span style={{ /* badge styles */ }}>{badgeText}</span>}
        {/* TITLE — always from prop, NEVER hardcoded */}
        <h1 style={{ /* title styles scaled by baseScale */ }}>{titleText}</h1>
        {/* SUBTITLE — always from prop, NEVER hardcoded */}
        {subtitleText && <p style={{ /* subtitle styles */ }}>{subtitleText}</p>}
        {/* Optional: SVG ornaments, geometric accents, particles (max 6–8) */}
        {/* Optional: customAssetUrl logo */}
      </div>
    </div>
  )
}

export default VibeGraphic
export const DynamicMotion = VibeGraphic
export type DynamicMotionProps = VibeGraphicProps

==================================================
CURRENT USER REQUEST / THEME TO BUILD:
[Tulis tema atau konsep video yang Anda inginkan di sini]
`

export interface GenerateMotionCodeParams {
  prompt: string
  apiKey?: string
  isFix?: boolean
  previousCode?: string
  errorMessage?: string
  forceFallback?: boolean
  assetPath?: string
}

export interface GenerateMotionCodeResult {
  success: boolean
  code?: string
  filePath?: string
  modelUsed?: string
  source?: 'ai' | 'fallback'
  error?: string
  notice?: string
}

export interface ApplyManualCodeResult {
  success: boolean
  code?: string
  filePath?: string
  error?: string
}

/**
 * Post-processing sanitizer for Remotion interpolate:
 * Detects patterns like interpolate(..., [405, 405], ...) or [x, x] where identical numbers are supplied
 * in the inputRange array, and automatically increments the second number (e.g. [405, 406])
 * to ensure inputRange is strictly monotonically increasing and prevent Remotion runtime crash.
 */
export function sanitizeInterpolateCode(code: string): string {
  // 1. Detect [(\d+),\s*\1] inside interpolate or arrays
  let sanitized = code.replace(/\[\s*(\d+)\s*,\s*\1\s*\]/g, (_match, numStr) => {
    const nextNum = parseInt(numStr, 10) + 1
    return `[${numStr}, ${nextNum}]`
  })

  // 2. Handle float numbers with identical values [10.5, 10.5]
  sanitized = sanitized.replace(/\[\s*(\d+\.\d+)\s*,\s*\1\s*\]/g, (_match, numStr) => {
    const nextNum = parseFloat(numStr) + 1
    return `[${numStr}, ${nextNum}]`
  })

  // 3. Handle identical consecutive elements in multi-element arrays: [0, 30, 30, 60] -> [0, 30, 31, 60]
  sanitized = sanitized.replace(
    /(\[\s*(?:\d+(?:\.\d+)?\s*,\s*)*)(\d+)\s*,\s*\2(\s*(?:,\s*\d+(?:\.\d+)?)*\s*\])/g,
    (_match, prefix, numStr, suffix) => {
      const nextNum = parseInt(numStr, 10) + 1
      return `${prefix}${numStr}, ${nextNum}${suffix}`
    }
  )

  // 4. Handle identical variables [start, start]
  sanitized = sanitized.replace(/\[\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*\1\s*\]/g, (_match, varName) => {
    return `[${varName}, Math.max(${varName} + 1, ${varName} + 1)]`
  })

  return sanitized
}

// Clean any markdown backticks or preamble conversational text from user pasted code
export const cleanGeneratedCode = (rawCode: string): string => {
  let code = rawCode.trim()
  // Remove markdown tags if code includes them
  code = code
    .replace(/^```(?:tsx|typescript|jsx|javascript)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  // Ensure it starts from import React or import
  const importIndex = code.indexOf('import ')
  if (importIndex > 0) {
    code = code.slice(importIndex)
  }

  // Sanitize interpolate input ranges
  code = sanitizeInterpolateCode(code)

  return code.trim()
}

// Resolve target file path (dev vs production packaged app)
export const getDynamicMotionFilePath = (): string => {
  // If app is packaged, write to userData so it is writable and can be bundled
  if (app.isPackaged) {
    const userDir = join(app.getPath('userData'), 'remotion')
    if (!existsSync(userDir)) {
      mkdirSync(userDir, { recursive: true })
    }
    return join(userDir, 'DynamicMotion.tsx')
  }

  // Development: save to source folder to trigger Vite HMR
  const candidates = [
    resolve(process.cwd(), 'src/renderer/src/remotion/DynamicMotion.tsx'),
    resolve(app.getAppPath(), 'src/renderer/src/remotion/DynamicMotion.tsx'),
    resolve(__dirname, '../../src/renderer/src/remotion/DynamicMotion.tsx')
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return candidates[0]
}

// Local Procedural Boilerplate / Starter Template (guaranteed 100% compile and never crash)
// Fully compliant with VibeGraphicProps: no hardcoded JSX text, Frame 0 Safe, all text from props.
export const generateProceduralFallback = (prompt: string = 'DYNAMIC MOTION'): string => {
  const lower = prompt.toLowerCase()
  let detectedAccent = '#00f2fe'
  let detectedSecondary = '#7928ca'
  let detectedBg = '#080c18'
  let detectedTitle = 'MOTION SUITE PRO'
  let detectedSubtitle = 'AI Creative Motion Graphics'
  let detectedBadge = 'OFFICIAL RELEASE v1.0'

  const quoteMatch = prompt.match(/["']([^"']+)["']/)
  if (quoteMatch && quoteMatch[1].trim()) {
    detectedTitle = quoteMatch[1].trim().toUpperCase()
  } else if (prompt.trim() && prompt !== 'DYNAMIC MOTION') {
    detectedTitle = prompt.trim().slice(0, 24).toUpperCase()
  }

  if (lower.includes('gold') || lower.includes('luxury') || lower.includes('royal')) {
    detectedAccent = '#f59e0b'
    detectedSecondary = '#fbbf24'
    detectedBg = '#120c02'
    detectedBadge = 'PREMIUM LUXURY'
    detectedSubtitle = 'Exclusive Collection'
  } else if (lower.includes('purple') || lower.includes('synth') || lower.includes('retro')) {
    detectedAccent = '#c084fc'
    detectedSecondary = '#818cf8'
    detectedBg = '#0f0721'
    detectedBadge = 'SYNTHWAVE'
    detectedSubtitle = 'Retro Futuristic Vibes'
  } else if (lower.includes('red') || lower.includes('fire') || lower.includes('flame') || lower.includes('sale') || lower.includes('promo')) {
    detectedAccent = '#ff1744'
    detectedSecondary = '#ffea00'
    detectedBg = '#0b0f19'
    detectedBadge = 'FLASH SALE'
    detectedSubtitle = 'Limited Time Offer'
  } else if (lower.includes('emerald') || lower.includes('green') || lower.includes('matrix')) {
    detectedAccent = '#10b981'
    detectedSecondary = '#34d399'
    detectedBg = '#04140d'
    detectedBadge = 'SYSTEM ONLINE'
    detectedSubtitle = 'Matrix Protocol Active'
  } else if (lower.includes('arctic') || lower.includes('ice') || lower.includes('blue')) {
    detectedAccent = '#38bdf8'
    detectedSecondary = '#818cf8'
    detectedBg = '#071321'
    detectedBadge = 'ARCTIC EDITION'
    detectedSubtitle = 'Ultra Clean Design'
  } else if (lower.includes('cyber') || lower.includes('neon') || lower.includes('hud') || lower.includes('tech')) {
    detectedAccent = '#00f2fe'
    detectedSecondary = '#4facfe'
    detectedBg = '#060913'
    detectedBadge = 'CYBER TECH'
    detectedSubtitle = 'Futuristic HUD Interface'
  }

  return `import React from 'react'
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
  textOffsetX?: number
  textOffsetY?: number
  glowIntensity?: number
  speedMultiplier?: number
  customAssetUrl?: string
}

export const VibeGraphic: React.FC<VibeGraphicProps> = ({
  titleText = '${detectedTitle}',
  subtitleText = '${detectedSubtitle}',
  badgeText = '${detectedBadge}',
  accentColor = '${detectedAccent}',
  secondaryColor = '${detectedSecondary}',
  backgroundColor = '${detectedBg}',
  isTransparent = false,
  scale = 1,
  textOffsetX = 0,
  textOffsetY = 0,
  glowIntensity = 15,
  speedMultiplier = 1
}) => {
  const rawFrame = useCurrentFrame()
  const frame = rawFrame * (speedMultiplier || 1)
  const { durationInFrames, width, height, fps = 30 } = useVideoConfig()
  const baseScale = Math.min(width, height) / 1080

  // Frame 0 Safe: always visible at frame 0 (opacity 0.92 → 1.0)
  const introOpacity = interpolate(frame, [0, 6], [0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const dur = Math.max(durationInFrames, 1)
  const rotation = interpolate(frame, [0, dur], [0, 360], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
  })
  const counterRotation = interpolate(frame, [0, dur], [360, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
  })
  const pulseFactor = Math.sin((frame / dur) * Math.PI * 2)
  const pulseScale = interpolate(pulseFactor, [-1, 1], [0.94, 1.06])
  const glow = (interpolate(pulseFactor, [-1, 1], [12, 28]) * baseScale) * (glowIntensity / 15)

  const entrance = spring({ frame, fps, config: { damping: 13, stiffness: 110, mass: 0.85 } })
  const contentScale = interpolate(entrance, [0, 1], [0.88, 1])
  const contentOpacity = interpolate(entrance, [0, 1], [0, 1])

  const badgeEntrance = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 14, stiffness: 120 } })
  const subtitleEntrance = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 12, stiffness: 100 } })

  const lineWidth = interpolate(entrance, [0, 1], [0, 420 * baseScale])

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isTransparent ? 'transparent' : backgroundColor,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        position: 'relative',
        opacity: introOpacity
      }}
    >
      {/* Outer orbital ring (1 element) */}
      <div
        style={{
          position: 'absolute',
          width: 500 * baseScale,
          height: 500 * baseScale,
          transform: \`scale(\${pulseScale}) rotate(\${rotation}deg)\`,
          borderRadius: '50%',
          border: \`\${2.5 * baseScale}px dashed \${accentColor}55\`,
          boxShadow: \`0 0 \${glow}px \${accentColor}30\`,
          pointerEvents: 'none'
        }}
      >
        {/* Orbiting accent beacon (1 element) */}
        <div style={{
          position: 'absolute',
          top: -(6 * baseScale),
          left: '50%',
          transform: 'translateX(-50%)',
          width: 12 * baseScale,
          height: 12 * baseScale,
          borderRadius: '50%',
          backgroundColor: accentColor,
          boxShadow: \`0 0 \${16 * baseScale}px \${accentColor}\`
        }} />
      </div>

      {/* Inner counter-rotating frame (1 element) */}
      <div
        style={{
          position: 'absolute',
          width: 360 * baseScale,
          height: 360 * baseScale,
          transform: \`scale(\${pulseScale}) rotate(\${counterRotation}deg)\`,
          borderRadius: \`\${36 * baseScale}px\`,
          border: \`\${1.8 * baseScale}px solid \${secondaryColor}50\`,
          boxShadow: \`inset 0 0 \${18 * baseScale}px \${secondaryColor}18\`,
          pointerEvents: 'none'
        }}
      />

      {/* Main content container (hot-linked to Visual Tweaker) */}
      <div
        style={{
          transform: \`translate(\${textOffsetX}px, \${textOffsetY}px) scale(\${scale * contentScale})\`,
          opacity: contentOpacity,
          zIndex: 10,
          textAlign: 'center',
          padding: \`0 \${36 * baseScale}px\`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: \`\${12 * baseScale}px\`,
          filter: \`drop-shadow(0 0 \${glowIntensity * baseScale * 0.5}px \${accentColor}33)\`
        }}
      >
        {/* BADGE — reads from prop, never hardcoded */}
        {badgeText && (
          <div style={{
            opacity: interpolate(badgeEntrance, [0, 1], [0, 1]),
            transform: \`translateY(\${interpolate(badgeEntrance, [0, 1], [-14 * baseScale, 0])}px)\`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: \`\${7 * baseScale}px\`,
            padding: \`\${5 * baseScale}px \${16 * baseScale}px\`,
            borderRadius: \`\${100 * baseScale}px\`,
            border: \`1px solid \${accentColor}44\`,
            background: \`linear-gradient(135deg, \${accentColor}18, \${secondaryColor}14)\`,
            backdropFilter: 'blur(8px)'
          }}>
            <span style={{
              width: \`\${5 * baseScale}px\`, height: \`\${5 * baseScale}px\`,
              borderRadius: '50%', backgroundColor: accentColor,
              boxShadow: \`0 0 \${8 * baseScale}px \${accentColor}\`
            }} />
            <span style={{
              color: '#e2e8f0',
              fontSize: \`\${12 * baseScale}px\`,
              fontWeight: 700,
              letterSpacing: \`\${3 * baseScale}px\`,
              textTransform: 'uppercase'
            }}>
              {badgeText}
            </span>
          </div>
        )}

        {/* TITLE — reads from prop, never hardcoded */}
        <h1 style={{
          fontSize: \`\${60 * baseScale}px\`,
          fontWeight: 900,
          letterSpacing: \`\${4 * baseScale}px\`,
          color: '#ffffff',
          margin: 0,
          lineHeight: 1.05,
          textTransform: 'uppercase',
          textShadow: \`0 \${4 * baseScale}px \${20 * baseScale}px rgba(0,0,0,0.85), 0 0 \${24 * baseScale}px \${accentColor}70\`
        }}>
          {titleText}
        </h1>

        {/* Neon divider line */}
        <div style={{
          width: \`\${lineWidth}px\`,
          height: \`\${2 * baseScale}px\`,
          background: \`linear-gradient(90deg, transparent, \${accentColor}, \${secondaryColor}, transparent)\`,
          borderRadius: \`\${2 * baseScale}px\`,
          boxShadow: \`0 0 \${8 * baseScale}px \${accentColor}60\`
        }} />

        {/* SUBTITLE — reads from prop, never hardcoded */}
        {subtitleText && (
          <p style={{
            margin: 0,
            opacity: interpolate(subtitleEntrance, [0, 1], [0, 0.88]),
            transform: \`translateY(\${interpolate(subtitleEntrance, [0, 1], [12 * baseScale, 0])}px)\`,
            fontSize: \`\${18 * baseScale}px\`,
            fontWeight: 400,
            letterSpacing: \`\${1.5 * baseScale}px\`,
            color: '#94a3b8',
            maxWidth: \`\${680 * baseScale}px\`,
            lineHeight: 1.5,
            textShadow: '0 2px 8px rgba(0,0,0,0.75)'
          }}>
            {subtitleText}
          </p>
        )}
      </div>
    </div>
  )
}

export default VibeGraphic
export const DynamicMotion = VibeGraphic
export type DynamicMotionProps = VibeGraphicProps
`
}

/**
 * Bring-Your-Own-Code Core Engine:
 * Receives raw TSX code directly from frontend, validates syntax,
 * and writes to disk asynchronously using node:fs/promises without blocking the Main Thread.
 */
export async function applyManualCode(rawCode: string): Promise<ApplyManualCodeResult> {
  const targetFilePath = getDynamicMotionFilePath()
  const cleanedCode = cleanGeneratedCode(rawCode)

  if (!cleanedCode) {
    return {
      success: false,
      error: 'Kode TSX kosong. Silakan masukkan kode Remotion yang valid.'
    }
  }

  try {
    // Pure async file write
    await fsPromises.writeFile(targetFilePath, cleanedCode, 'utf-8')
    console.log(
      `[applyManualCode] Berhasil menulis DynamicMotion.tsx secara async ke: ${targetFilePath}`
    )
    return {
      success: true,
      code: cleanedCode,
      filePath: targetFilePath
    }
  } catch (writeErr) {
    console.error('[applyManualCode] Gagal menulis DynamicMotion.tsx:', writeErr)
    return {
      success: false,
      error: writeErr instanceof Error ? writeErr.message : 'Gagal menulis file ke disk'
    }
  }
}

/**
 * Read current DynamicMotion.tsx content from disk
 */
export async function getCurrentMotionCode(): Promise<string> {
  const targetFilePath = getDynamicMotionFilePath()
  try {
    if (existsSync(targetFilePath)) {
      return await fsPromises.readFile(targetFilePath, 'utf-8')
    }
  } catch (err) {
    console.warn('[getCurrentMotionCode] Gagal membaca file:', err)
  }
  return generateProceduralFallback()
}

export const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest'
]

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Executes a promise with an enforced timeout to avoid hanging when upstream AI is congested.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms = 25000,
  errorMsg = 'Request timed out'
): Promise<T> {
  let timer: NodeJS.Timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${errorMsg} after ${ms}ms`))
    }, ms)
  })
  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    clearTimeout(timer!)
  }
}

export function isTransientError(err: unknown): boolean {
  if (!err) return false
  const anyErr = err as Record<string, unknown>
  const status = Number(anyErr.status || (anyErr.response as Record<string, unknown> | undefined)?.status)
  if (status === 503 || status === 429 || status === 500 || status === 504 || status === 408) {
    return true
  }
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('500') ||
    msg.includes('504') ||
    msg.includes('408') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('service unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  )
}

/**
 * AI & Procedural Code Generator:
 * Uses Google Gemini with auto-retry on 503/429 and multi-model fallback across CANDIDATE_MODELS,
 * with graceful procedural fallback if all fail or no API key is provided.
 */
export async function generateMotionCode(
  params: GenerateMotionCodeParams
): Promise<GenerateMotionCodeResult> {
  const { prompt, apiKey, isFix, errorMessage, forceFallback } = params
  const targetFilePath = getDynamicMotionFilePath()

  if (forceFallback || !apiKey || !apiKey.trim()) {
    const fallbackCode = generateProceduralFallback(prompt)
    await fsPromises.writeFile(targetFilePath, fallbackCode, 'utf-8')
    return {
      success: true,
      code: fallbackCode,
      filePath: targetFilePath,
      source: 'fallback',
      modelUsed: 'Procedural Boilerplate'
    }
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim())
  let lastError: Error | null = null

  const userPrompt = isFix
    ? `PERBAIKI ERROR RUNTIME BERIKUT: ${errorMessage}\n\nKODE SAAT INI:\n${params.previousCode || ''}`
    : `BUAT KODE ANIMASI REMOTION TSX UNTUK TEMA BERIKUT: ${prompt}`

  for (const modelName of CANDIDATE_MODELS) {
    const maxAttempts = 2 // 1 initial attempt + 1 retry on 503/429/timeout
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(
          `[GeminiCoder] Requesting code generation using model: ${modelName} (attempt ${attempt}/${maxAttempts})`
        )
        const model = genAI.getGenerativeModel({ model: modelName })

        const response = await withTimeout(
          model.generateContent([
            REMOTION_CODER_SYSTEM_PROMPT,
            userPrompt
          ]),
          25000,
          `Batas waktu (25s) terlampaui saat memanggil model ${modelName}`
        )

        const text = response.response.text()
        const cleanedCode = cleanGeneratedCode(text)

        await fsPromises.writeFile(targetFilePath, cleanedCode, 'utf-8')
        console.log(
          `[GeminiCoder] Successfully generated code with ${modelName} and wrote to ${targetFilePath}`
        )

        return {
          success: true,
          code: cleanedCode,
          filePath: targetFilePath,
          source: 'ai',
          modelUsed: modelName
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.warn(
          `[GeminiCoder] Error with ${modelName} on attempt ${attempt}:`,
          lastError.message
        )

        // If error is 503 / 429 / transient / timeout and retry attempts remain, wait 1000ms delay backoff
        if (attempt < maxAttempts && isTransientError(err)) {
          console.warn(
            `[GeminiCoder] Google API 503/429/Transient error on ${modelName}. Waiting 1000ms before auto-retry...`
          )
          await delay(1000)
          continue
        }

        // Otherwise (non-transient error or retry exhausted), proceed to fallback to next candidate model
        break
      }
    }
    console.warn(
      `[GeminiCoder] Model ${modelName} unavailable, falling back to next candidate model in CANDIDATE_MODELS...`
    )
  }

  const errorMsg = lastError ? lastError.message : 'Semua kandidat model gagal merespon.'
  return {
    success: false,
    error: `[GeminiCoder Error] Gagal menghasilkan kode dengan model Gemini: ${errorMsg}`,
    source: 'ai'
  }
}
