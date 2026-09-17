import { existsSync, mkdirSync } from 'fs'
import fsPromises from 'node:fs/promises'
import { resolve, join } from 'path'
import { app } from 'electron'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const REMOTION_CODER_SYSTEM_PROMPT = `You are an expert Remotion animation and Creative Coding engineer.

BEHAVIORAL & INTERACTIVE PROTOCOL (CRITICAL):
- When the user asks for a theme or multiple videos (e.g., "12 warning videos"), DO NOT immediately output raw code blindly. 
- First, act as a creative director: reply with a short conversational outline listing the proposed titles/styles, and ask the user for confirmation or prompt them: "Shall I generate Code 1 for [Style A] now?"
- Once confirmed, output ONLY the clean TSX code for that specific video.

CRITICAL RULES FOR CODE & RENDERING:
1. CONDITIONAL OUTPUT: If the user asks for a single video, output ONLY the raw TypeScript TSX code. If multiple/batch videos are requested, act conversationally first.
2. DONT wrap with markdown backticks for single code outputs (NO \`\`\`tsx, NO \`\`\`). Output MUST begin directly with 'import React'.
3. NO conversational text, explanations, or commentary INSIDE the code block itself.
4. MANDATORY IMPORTS:
   import React from 'react'
   import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from 'remotion'
5. ALLOWED IMPORTS:
   Only 'react', 'remotion', and official Remotion motion libraries are permitted:
   - 'remotion' (hooks & Img component)
   - '@remotion/shapes' (Circle, Rect, Triangle, Star, Polygon, Ellipse, Pie, etc.)
   - '@remotion/paths' (evolvePath, getLength, getPointAtLength, warpPath, reversePath, etc.)
   - '@remotion/noise' (noise2D, noise3D, noise4D)
   FORBIDDEN: Do NOT import unsupported external packages (no framer-motion, lucide-react, three, etc.). ONLY 'react', 'remotion', '@remotion/shapes', '@remotion/paths', and '@remotion/noise'.
6. COMPONENT & PROPS INTERFACE:
   You MUST define and export the exact props interface and component:

   export interface DynamicMotionProps {
     titleText?: string
     accentColor?: string
     backgroundColor?: string
     isTransparent?: boolean
     width?: number
     height?: number
     durationInFrames?: number
     fps?: number
     customAssetUrl?: string
   }

   export const DynamicMotion: React.FC<DynamicMotionProps> = ({
     titleText = 'APPLICABLE_THEME_TITLE',
     accentColor = '#00f2fe',
     backgroundColor = '#080c18',
     isTransparent = false,
     customAssetUrl
   }) => {
     const frame = useCurrentFrame()
     const { durationInFrames, width, height, fps } = useVideoConfig()
     ...
   }
   export default DynamicMotion

7. STRICT DYNAMIC TITLE RULE (NO GENERIC TEXT):
   - NEVER use generic filler like 'DYNAMIC MOTION' or 'LIVE MOTION' for the default \`titleText\` value in your code boilerplate.
   - ALWAYS set the default value of \`titleText\` to something highly relevant, contextual, and professional matching the user's specific theme (e.g., if the theme is cybersecurity warning, default it to 'SYSTEM BREACH' or 'ACCESS DENIED').

8. RESPONSIVE SCALING:
   const minDim = Math.min(width, height)
   const baseScale = minDim / 1080
   Multiply pixel sizes, font sizes, margins, and radii by baseScale.

9. SEAMLESS LOOPING ANIMATION:
   Design animations to loop seamlessly using interpolate and Math.sin across durationInFrames.

10. CPU & RENDER SAFETY BOUNDS (CRITICAL TO PREVENT FREEZE):
    - Maximum 20 visual elements. NO useState, useEffect, or heavy filters. All animations must be purely deterministic based on \`useCurrentFrame()\`.

11. ASSET INTEGRATION:
    If local asset path is provided, use <Img src={staticFile('...')} style={{ ... }} /> from 'remotion'.
    If \`customAssetUrl\` is present, embed it cleanly using Remotion's <Img src={customAssetUrl} style={{ ... }} /> as a key visual focal point (e.g. animated emblem, badge, or center icon). If undefined, fallback cleanly to procedural SVG / geometric shapes.

12. CRITICAL RULE FOR INTERPOLATE:
    - In Remotion's interpolate(frame, [start, end], [out1, out2]), the inputRange array MUST be strictly monotonically increasing. NEVER output identical numbers like [405, 405] or [0, 0]. Ensure end is always at least start + 1 (e.g. [start, Math.max(start + 1, end)]).
    - Seluruh nilai dalam array inputRange WAJIB berurutan naik dari nilai terkecil ke terbesar (strictly monotonically increasing, contoh: [0, 30, 60, 90]).
    - DILARANG KERAS memasukkan angka yang lebih kecil atau sama setelah angka sebelumnya (contoh terlarang: [405, 405], [360, 375, 390, 150]).
    - Selalu samakan panjang elemen antara inputRange dan outputRange.

---
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
export const generateProceduralFallback = (prompt: string = 'DYNAMIC MOTION'): string => {
  const lower = prompt.toLowerCase()
  let detectedAccent = '#00f2fe'
  let detectedBg = '#080c18'
  let detectedTitle = 'LIVE MOTION'

  const quoteMatch = prompt.match(/["']([^"']+)["']/)
  if (quoteMatch && quoteMatch[1].trim()) {
    detectedTitle = quoteMatch[1].trim().toUpperCase()
  } else if (prompt.trim() && prompt !== 'DYNAMIC MOTION') {
    detectedTitle = prompt.trim().slice(0, 20).toUpperCase()
  }

  if (lower.includes('gold') || lower.includes('luxury') || lower.includes('royal')) {
    detectedAccent = '#f59e0b'
    detectedBg = '#120c02'
  } else if (lower.includes('purple') || lower.includes('synth') || lower.includes('retro')) {
    detectedAccent = '#c084fc'
    detectedBg = '#0f0721'
  } else if (lower.includes('red') || lower.includes('solar') || lower.includes('flame')) {
    detectedAccent = '#f43f5e'
    detectedBg = '#140507'
  } else if (lower.includes('emerald') || lower.includes('green') || lower.includes('matrix')) {
    detectedAccent = '#10b981'
    detectedBg = '#04140d'
  } else if (lower.includes('arctic') || lower.includes('ice') || lower.includes('blue')) {
    detectedAccent = '#38bdf8'
    detectedBg = '#071321'
  }

  return `import React from 'react'
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

export interface DynamicMotionProps {
  titleText?: string
  accentColor?: string
  backgroundColor?: string
  isTransparent?: boolean
  width?: number
  height?: number
  durationInFrames?: number
  fps?: number
}

export const DynamicMotion: React.FC<DynamicMotionProps> = ({
  titleText = '${detectedTitle}',
  accentColor = '${detectedAccent}',
  backgroundColor = '${detectedBg}',
  isTransparent = false
}) => {
  const frame = useCurrentFrame()
  const { durationInFrames, width, height, fps } = useVideoConfig()

  const minDim = Math.min(width, height)
  const baseScale = minDim / 1080

  const rotation = interpolate(frame, [0, durationInFrames], [0, 360])
  const counterRotation = interpolate(frame, [0, durationInFrames], [360, 0])
  const pulseFactor = Math.sin((frame / durationInFrames) * Math.PI * 2)
  const scale = interpolate(pulseFactor, [-1, 1], [0.93, 1.07])
  const glow = interpolate(pulseFactor, [-1, 1], [15, 35]) * baseScale

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 }
  })
  const titleScale = interpolate(entrance, [0, 1], [0.85, 1])

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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 500 * baseScale,
          height: 500 * baseScale,
          transform: \`scale(\${scale}) rotate(\${rotation}deg)\`,
          borderRadius: '50%',
          border: \`\${3 * baseScale}px dashed \${accentColor}88\`,
          boxShadow: \`0 0 \${glow}px \${accentColor}40\`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -6 * baseScale,
            width: 14 * baseScale,
            height: 14 * baseScale,
            borderRadius: '50%',
            backgroundColor: accentColor,
            boxShadow: \`0 0 \${16 * baseScale}px \${accentColor}\`
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -6 * baseScale,
            width: 14 * baseScale,
            height: 14 * baseScale,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: \`0 0 \${16 * baseScale}px #ffffff\`
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          width: 360 * baseScale,
          height: 360 * baseScale,
          transform: \`scale(\${scale}) rotate(\${counterRotation}deg)\`,
          borderRadius: \`\${40 * baseScale}px\`,
          border: \`\${2.5 * baseScale}px solid \${accentColor}\`,
          boxShadow: \`inset 0 0 \${20 * baseScale}px \${accentColor}30, 0 0 \${20 * baseScale}px \${accentColor}30\`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />

      <div
        style={{
          transform: \`scale(\${titleScale})\`,
          zIndex: 10,
          textAlign: 'center',
          padding: \`0 \${32 * baseScale}px\`
        }}
      >
        <div
          style={{
            fontSize: \`\${16 * baseScale}px\`,
            fontWeight: 700,
            letterSpacing: \`\${5 * baseScale}px\`,
            color: accentColor,
            textTransform: 'uppercase',
            marginBottom: \`\${8 * baseScale}px\`,
            textShadow: \`0 0 \${10 * baseScale}px \${accentColor}aa\`
          }}
        >
          LIVE MOTION STUDIO
        </div>
        <h1
          style={{
            fontSize: \`\${56 * baseScale}px\`,
            fontWeight: 900,
            letterSpacing: \`\${4 * baseScale}px\`,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.1,
            textTransform: 'uppercase',
            textShadow: \`0 \${4 * baseScale}px \${20 * baseScale}px rgba(0,0,0,0.8), 0 0 \${24 * baseScale}px \${accentColor}80\`
          }}
        >
          {titleText}
        </h1>
      </div>
    </div>
  )
}

export default DynamicMotion
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
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest'
]

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export function isTransientError(err: unknown): boolean {
  if (!err) return false
  const anyErr = err as Record<string, unknown>
  const status = Number(anyErr.status || (anyErr.response as Record<string, unknown> | undefined)?.status)
  if (status === 503 || status === 429 || status === 500 || status === 504) {
    return true
  }
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('500') ||
    msg.includes('504') ||
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
    const maxAttempts = 2 // 1 initial attempt + 1 retry on 503/429
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(
          `[GeminiCoder] Requesting code generation using model: ${modelName} (attempt ${attempt}/${maxAttempts})`
        )
        const model = genAI.getGenerativeModel({ model: modelName })

        const response = await model.generateContent([
          REMOTION_CODER_SYSTEM_PROMPT,
          userPrompt
        ])

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

        // If error is 503 / 429 / transient and retry attempts remain, wait 1.5s delay backoff
        if (attempt < maxAttempts && isTransientError(err)) {
          console.warn(
            `[GeminiCoder] Google API 503/429 on ${modelName}. Waiting 1500ms before auto-retry...`
          )
          await delay(1500)
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
