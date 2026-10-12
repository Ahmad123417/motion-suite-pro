import { existsSync } from 'fs'
import fsPromises from 'node:fs/promises'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getVibeGraphicPath, writeExternalComponentCode } from './remotionStudio'

export const REMOTION_CODER_SYSTEM_PROMPT = `You are an expert Remotion animation and Creative Coding engineer for Motion Suite Pro.

BEHAVIORAL PROTOCOL:
- For a single video request: output ONLY the raw TypeScript TSX code. DO NOT wrap with markdown backticks. Output MUST begin directly with 'import React'.
- For multiple/batch videos: act as creative director first — outline proposed titles/styles and ask for confirmation before generating.
- NO conversational text, explanations, or commentary inside the code output.

==================================================
MANDATORY STRICT RULES (ZERO TOLERANCE)
==================================================

RULE 1 — ANTI-HARDCODE TEXT & NO ENGINE BRANDING (ABSOLUTE):
  NEVER write literal display text directly inside JSX tags.
  WRONG: <h1>70% OFF</h1>  or  <span>FLASH SALE</span>
  CORRECT: <h1>{titleText}</h1>  and  <span>{badgeText}</span>
  ALL visual text MUST come from props: {titleText}, {subtitleText}, {badgeText}.
  DILARANG menyisipkan teks watermark, branding engine, atau footer placeholder seperti 'REMOTION KINETIC ENGINE' kecuali diminta spesifik oleh user.

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

RULE 5 — STRICT INTERFACE (VibeGraphicProps 4-KATEGORI STANDAR):
  Setiap komponen WAJIB mendeklarasikan dan men-destructure interface props standar berikut dengan nilai default:

  export interface VibeGraphicProps {
    // 1. KONTEN TEKS
    titleText?: string          // Judul Utama / Angka Utama
    subtitleText?: string       // Sub-judul / Tagline / Info Sekunder
    badgeText?: string          // Label Kategori / Status (contoh: 'LIVE', 'PROMO')
    
    // 2. SKEMA WARNA
    accentColor?: string        // Warna Aksen Utama (#FF007F, dll)
    secondaryColor?: string     // Warna Aksen Kedua (#00F2FE, dll)
    backgroundColor?: string    // Warna Background Kanvas
    isTransparent?: boolean     // Mode Transparan

    // 3. TRANSFORM (KONTROL TATA LETAK MANUAL)
    scale?: number              // Skala Objek Utama (default: 1)
    offsetX?: number            // Geser Horizontal px (default: 0)
    offsetY?: number            // Geser Vertikal px (default: 0)
    textOffsetX?: number        // Alias kompatibilitas
    textOffsetY?: number        // Alias kompatibilitas

    // 4. EFEK & RITME
    glowIntensity?: number      // Pengali Intensitas Cahaya / Shadow (default: 1)
    speedMultiplier?: number    // Pengali Kecepatan Animasi (default: 1)
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

RULE 10 — UNIVERSAL DYNAMIC TIMELINE & REVISI DISTRIBUSI DURASI (5s, 10s, 15s, 20s):
  DILARANG KERAS MENGGUNAKAN ANGKA FRAME STATIS / HARDCODED (seperti [0, 60] atau [0, 180]).
  Pembagian fase timeline WAJIB mengisi secara proporsional hingga frame akhir:
  - Fase Masuk (Intro/Reveal): [0, Math.floor(durationInFrames * 0.15)]
  - Fase Aksi Utama (Progression/Main Action): [Math.floor(durationInFrames * 0.15), Math.floor(durationInFrames * 0.85)]
  - Fase Puncak & Ambient Loop: [Math.floor(durationInFrames * 0.85), durationInFrames]
  DILARANG menghentikan kalkulasi interpolasi di bawah 80% durasi kecuali diikuti transisi atau variasi adegan berikutnya.
  Dengan rumus ini, video durasi 5s, 10s, 15s, maupun 20s otomatis membagi fase gerakannya secara presisi tanpa membeku di tengah jalan.

RULE 11 — NEVER-FREEZE ENGINE & CONTINUOUS LOOPING (DARI FRAME 0 S.D. AKHIR):
  Elemen visual TIDAK BOLEH berhenti bergerak total di detik mana pun sepanjang video, terutama pada durasi panjang (15s - 20s / 1200 frame).
  Wajib patuhi 4 aturan anti-freeze berikut:
  1. LIVING COUNTER & DYNAMIC METRICS (ANTI-FREEZE ANGKA):
     Jika animasi memuat angka counter (seperti BPM, persentase baterai/SpO2, saldo uang, kalori, kecepatan HUD):
     - DILARANG mengunci angka mati di tengah video.
     - Jika target angka sudah tercapai di tengah durasi, angka WAJIB tetap bernapas secara organik (organic micro-fluctuation menggunakan Math.sin(frame * ...)) atau naik-turun halus hingga frame terakhir.
  2. CONTINUOUS LOOPING GRAFIS & WAVE:
     Elemen yang berulang (garis detak jantung EKG, gelombang audio, pemindaian radar/laser HUD, kursor terminal hacker, ban kendaraan berputar):
     - WAJIB menggunakan modulasi kontinu/modulo (frame % N atau translasi looping) sehingga grafis terus mengalir dinamis tanpa henti dari frame 0 hingga durationInFrames.
  3. EFEK KETIK TEKS (TYPING EFFECT):
     Jika terdapat teks yang diketik bertahap (terminal/chat), kecepatan munculnya karakter WAJIB dihitung proporsional terhadap durasi aktif teks tersebut, bukan frame mati statis. Kursor ketik wajib berkedip looping sampai akhir video.
  4. AMBIENT DRIFT & CAMERA MOTION:
     - Slow Camera Zoom: interpolate(frame, [0, durationInFrames], [1, 1.04]).
     - Floating / Hover: Math.sin(frame / 15) * amplitude pada translateY/rotasi.
     - Breathing Glow: Intensitas cahaya latar berosilasi halus: 0.4 + Math.sin(frame / 20) * 0.2.

RULE 12 — AUTO-EXPAND PROMPT PENDEK (SMART INTERPRETATION):
  Jika prompt pengguna singkat (misal: "grafik naik", "radar sci-fi", "badge diskon", "crypto pump"):
  - DILARANG membuat grafik statis atau garis lurus instan.
  - Susun visual bertingkat dengan fluktuasi dinamis dan bagikan pertumbuhan merata sepanjang durationInFrames.
  - Jaga visual tetap hidup, berdenyut, dan bergerak sampai frame terakhir.

RULE 13 — ATURAN LATAR BELAKANG & KEBEBASAN VISUAL (BACKGROUND & SCENERY):
  Anda TETAP BEBAS merancang latar belakang visual yang artistik dan atmosferik (warna solid, gradien halus, pemandangan langit malam, bintang, dsb.). JANGAN paksa kode menjadi kosong atau transparan.
  Disarankan meletakkan background utama langsung di atribut style pada tag <AbsoluteFill> (misal: background atau backgroundColor) atau sebagai layer pemandangan. Sistem Motion Suite Pro secara otomatis dan cerdas akan menangani transparansi saat pengguna mengaktifkan mode ekspor transparan tanpa merusak mode solid.

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
  const { width, height, fps = 30, durationInFrames = 150 } = useVideoConfig()
  const baseScale = Math.min(width, height) / 1080

  // Universal Dynamic Timeline (All Durations 5s, 10s, 15s, 20s)
  const introEnd = Math.floor(durationInFrames * 0.15)
  const actionEnd = Math.floor(durationInFrames * 0.85)

  // Anti-Freeze Continuous Micro-Motions (Frame 0 to End)
  const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.04], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
  })
  const floatY = Math.sin(frame / 15) * (6 * baseScale)
  const breathingGlow = 0.4 + Math.sin(frame / 20) * 0.2

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
 * Pre-fix Remotion TSX code to prevent runtime NaN and undefined props crashes:
 * 1. Removes incorrect width and height destructuring from component props.
 * 2. Guarantees useVideoConfig() hook is present inside component body.
 * 3. Adds safe fallback (props.offsetX ?? 0) for transformation props.
 */
export function preFixRemotionCode(code: string): string {
  let fixed = code

  // 1. Detect and remove incorrect { width, height } destructuring from component props parameter
  fixed = fixed.replace(
    /((?:export\s+)?(?:const|function)\s+(?:VibeGraphic|DynamicMotion)[^{]*?\(\s*\{)([\s\S]*?)(\}\s*(?::\s*[^=)]+)?\s*\)\s*(?::\s*[^=>]+)?\s*=>)/g,
    (_full, prefix, propsBody, suffix) => {
      const cleanProps = propsBody
        .replace(/\bwidth(?:\s*:\s*[^,}\n]+|\s*=\s*[^,}\n]+)?\s*,?\s*/g, '')
        .replace(/\bheight(?:\s*:\s*[^,}\n]+|\s*=\s*[^,}\n]+)?\s*,?\s*/g, '')
        .replace(/,\s*,/g, ',')
        .replace(/^\s*,/, '')
        .replace(/,\s*$/, '')
      return `${prefix}${cleanProps}${suffix}`
    }
  )

  // Also replace any standalone props.width or props.height usage with width and height
  fixed = fixed.replace(/\bprops\.width\b/g, 'width')
  fixed = fixed.replace(/\bprops\.height\b/g, 'height')

  // 2. Ensure useVideoConfig is imported from 'remotion'
  if (!fixed.includes('useVideoConfig')) {
    fixed = fixed.replace(/import\s*\{([^}]+)\}\s*from\s*['"]remotion['"]/, (_m, imports) => {
      return `import { useVideoConfig, ${imports.trim()} } from 'remotion'`
    })
  }

  // Ensure const { width, height } = useVideoConfig() is present in component body
  const hasVideoConfigWidthHeight =
    /useVideoConfig\(\)/.test(fixed) && /\bwidth\b/.test(fixed) && /\bheight\b/.test(fixed)
  if (!hasVideoConfigWidthHeight) {
    if (/useVideoConfig\(\)/.test(fixed)) {
      // It calls useVideoConfig but didn't destructure width/height
      fixed = fixed.replace(/const\s*\{([^}]+)\}\s*=\s*useVideoConfig\(\)/, (_m, existing) => {
        const parts = existing.split(',').map((s: string) => s.trim()).filter(Boolean)
        if (!parts.includes('width')) parts.unshift('width')
        if (!parts.includes('height')) parts.unshift('height')
        return `const { ${parts.join(', ')} } = useVideoConfig()`
      })
    } else {
      // Insert right after useCurrentFrame()
      fixed = fixed.replace(
        /(const\s+[a-zA-Z0-9_$]+\s*=\s*useCurrentFrame\(\)[;\s]*)/,
        `$1\n  const { width, height } = useVideoConfig();\n`
      )
    }
  }

  // 3. Fallback safe for transformation props prone to undefined
  fixed = fixed.replace(/\bprops\.offsetX(?!\s*\?\?)/g, '(props.offsetX ?? 0)')
  fixed = fixed.replace(/\bprops\.offsetY(?!\s*\?\?)/g, '(props.offsetY ?? 0)')
  fixed = fixed.replace(/\bprops\.textOffsetX(?!\s*\?\?)/g, '(props.textOffsetX ?? 0)')
  fixed = fixed.replace(/\bprops\.textOffsetY(?!\s*\?\?)/g, '(props.textOffsetY ?? 0)')
  fixed = fixed.replace(/\bprops\.scale(?!\s*\?\?)/g, '(props.scale ?? 1)')
  fixed = fixed.replace(/\bprops\.glowIntensity(?!\s*\?\?)/g, '(props.glowIntensity ?? 1)')
  fixed = fixed.replace(/\bprops\.speedMultiplier(?!\s*\?\?)/g, '(props.speedMultiplier ?? 1)')

  // 4. Auto-Sanitizer Easing Halusinasi (v1.0.7):
  // Ganti pemanggilan fungsi Easing fiktif yang sering dimuntahkan AI menjadi sintaks valid Remotion
  fixed = fixed.replace(/Easing\.backIn\((.*?)\)/g, 'Easing.in(Easing.back($1))')
  fixed = fixed.replace(/Easing\.backOut\((.*?)\)/g, 'Easing.out(Easing.back($1))')
  fixed = fixed.replace(/Easing\.backInOut\((.*?)\)/g, 'Easing.inOut(Easing.back($1))')

  // 5. Auto-Sanitize JSX Backtick Attributes (v1.0.8 Zero-Panic Self-Healing):
  // Auto-wrap bare backtick JSX attributes: attr=`...` -> attr={`...`}
  fixed = sanitizeJsxBacktickAttributes(fixed)

  return fixed
}

/**
 * Post-processing sanitizer for Remotion interpolate:
 * 1. Ensures inputRange is strictly monotonically increasing (incrementing identical values [405, 405] -> [405, 406]).
 * 2. Sanitizes outputRange: detects NaN, Infinity, division by zero, and guards dynamic expressions with
 *    (Number.isFinite(Number(val)) ? Number(val) : 0).
 */
export function sanitizeInterpolateCode(code: string): string {
  // Parse interpolate calls specifically to target inputRange and outputRange accurately
  const regex = /\binterpolate\s*\(/g
  let match: RegExpExecArray | null
  let result = ''
  let lastIdx = 0

  while ((match = regex.exec(code)) !== null) {
    result += code.slice(lastIdx, match.index)
    const startParen = match.index + match[0].length - 1
    let depth = 1
    let i = startParen + 1
    while (i < code.length && depth > 0) {
      if (code[i] === '(') depth++
      else if (code[i] === ')') depth--
      i++
    }

    if (depth !== 0) {
      result += code.slice(match.index, i)
      lastIdx = i
      continue
    }

    const inner = code.slice(startParen + 1, i - 1)
    const args: string[] = []
    let argStart = 0
    let pDepth = 0, bDepth = 0, brDepth = 0

    for (let j = 0; j < inner.length; j++) {
      const c = inner[j]
      if (c === '(') pDepth++
      else if (c === ')') pDepth--
      else if (c === '[') bDepth++
      else if (c === ']') bDepth--
      else if (c === '{') brDepth++
      else if (c === '}') brDepth--
      else if (c === ',' && pDepth === 0 && bDepth === 0 && brDepth === 0) {
        args.push(inner.slice(argStart, j))
        argStart = j + 1
      }
    }
    args.push(inner.slice(argStart))

    if (args.length >= 3) {
      // 1. Sanitize inputRange (args[1])
      let inRangeStr = args[1].trim()
      if (inRangeStr.startsWith('[') && inRangeStr.endsWith(']')) {
        // Detect [num, num]
        inRangeStr = inRangeStr.replace(/\[\s*(\d+)\s*,\s*\1\s*\]/g, (_m, numStr) => {
          const nextNum = parseInt(numStr, 10) + 1
          return `[${numStr}, ${nextNum}]`
        })
        // Detect [float, float]
        inRangeStr = inRangeStr.replace(/\[\s*(\d+\.\d+)\s*,\s*\1\s*\]/g, (_m, numStr) => {
          const nextNum = parseFloat(numStr) + 1
          return `[${numStr}, ${nextNum}]`
        })
        // Multi-element consecutive identicals: [0, 30, 30, 60] -> [0, 30, 31, 60]
        inRangeStr = inRangeStr.replace(
          /(\[\s*(?:\d+(?:\.\d+)?\s*,\s*)*)(\d+)\s*,\s*\2(\s*(?:,\s*\d+(?:\.\d+)?)*\s*\])/g,
          (_m, prefix, numStr, suffix) => {
            const nextNum = parseInt(numStr, 10) + 1
            return `${prefix}${numStr}, ${nextNum}${suffix}`
          }
        )
        // Identical variables [start, start]
        inRangeStr = inRangeStr.replace(
          /\[\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*\1\s*\]/g,
          (_m, varName) => {
            if (varName === 'NaN') return '[0, 1]'
            return `[${varName}, Math.max(${varName} + 1, ${varName} + 1)]`
          }
        )
        args[1] = inRangeStr
      }

      // 2. Sanitize outputRange (args[2])
      let outRangeStr = args[2].trim()
      if (outRangeStr.startsWith('[') && outRangeStr.endsWith(']')) {
        const arrayContent = outRangeStr.slice(1, -1)
        const items: string[] = []
        let itemStart = 0
        let pD = 0, bD = 0, brD = 0

        for (let j = 0; j < arrayContent.length; j++) {
          const c = arrayContent[j]
          if (c === '(') pD++
          else if (c === ')') pD--
          else if (c === '[') bD++
          else if (c === ']') bD--
          else if (c === '{') brD++
          else if (c === '}') brD--
          else if (c === ',' && pD === 0 && bD === 0 && brD === 0) {
            items.push(arrayContent.slice(itemStart, j))
            itemStart = j + 1
          }
        }
        items.push(arrayContent.slice(itemStart))

        const sanitizedItems = items.map((rawItem) => {
          let item = rawItem.trim()
          if (!item) return item
          // Detect literal NaN, Infinity, -Infinity
          if (item === 'NaN' || item === 'Infinity' || item === '-Infinity') return '0'
          // Detect division by zero like expr / 0
          if (/\/\s*0(?:\.0*)?(?!\d)/.test(item)) return '0'
          // Static number literal: 0, 100, -25.5
          if (/^-?\d+(?:\.\d+)?$/.test(item)) return item
          // Already guarded
          if (item.includes('Number.isFinite')) return item
          // Dynamic expression - wrap with guard
          return `(Number.isFinite(Number(${item})) ? Number(${item}) : 0)`
        })

        args[2] = ` [${sanitizedItems.join(', ')}]`
      }

      result += `interpolate(${args.join(',')})`
    } else {
      result += code.slice(match.index, i)
    }
    lastIdx = i
  }

  result += code.slice(lastIdx)

  // Fallback for any standalone inputRange arrays that might have been outside interpolate()
  result = result.replace(/\[\s*(\d+)\s*,\s*\1\s*\]/g, (_m, numStr) => {
    return `[${numStr}, ${parseInt(numStr, 10) + 1}]`
  })

  return result
}

/**
 * Auto-Sanitize Unterminated Strings:
 * Mendeteksi string biasa ("..." atau '...') yang terputus oleh newline tanpa escape (\).
 * Otomatis mengubahnya menjadi template literal dengan backticks (`) atau menyambungkan kembali barisnya
 * agar tidak menimbulkan Remotion SyntaxError: Unterminated string constant.
 */
export function sanitizeUnterminatedStrings(code: string): string {
  let result = ''
  let i = 0
  const n = code.length

  while (i < n) {
    const ch = code[i]
    const next = i + 1 < n ? code[i + 1] : ''

    // 1. Single-line comment: // ...
    if (ch === '/' && next === '/') {
      const lineEnd = code.indexOf('\n', i)
      if (lineEnd === -1) {
        result += code.slice(i)
        break
      } else {
        result += code.slice(i, lineEnd + 1)
        i = lineEnd + 1
        continue
      }
    }

    // 2. Multi-line comment: /* ... */
    if (ch === '/' && next === '*') {
      const commentEnd = code.indexOf('*/', i + 2)
      if (commentEnd === -1) {
        result += code.slice(i)
        break
      } else {
        result += code.slice(i, commentEnd + 2)
        i = commentEnd + 2
        continue
      }
    }

    // 3. Template literal: `...`
    if (ch === '`') {
      let tplContent = '`'
      i++
      while (i < n) {
        if (code[i] === '\\') {
          tplContent += code[i] + (i + 1 < n ? code[i + 1] : '')
          i += 2
        } else if (code[i] === '$' && i + 1 < n && code[i + 1] === '{') {
          tplContent += '${'
          i += 2
          let braceDepth = 1
          while (i < n && braceDepth > 0) {
            if (code[i] === '{') braceDepth++
            else if (code[i] === '}') braceDepth--
            tplContent += code[i]
            i++
          }
        } else if (code[i] === '`') {
          tplContent += '`'
          i++
          break
        } else {
          tplContent += code[i]
          i++
        }
      }
      result += tplContent
      continue
    }

    // 4. Regular string literals: "..." or '...'
    if (ch === '"' || ch === "'") {
      const quote = ch
      i++ // Skip opening quote

      let strContent = ''
      let hasUnescapedNewline = false
      let foundClosingQuote = false

      while (i < n) {
        const c = code[i]

        // Escaped character (including escaped newline '\ \n')
        if (c === '\\') {
          if (i + 1 < n && (code[i + 1] === '\n' || code[i + 1] === '\r')) {
            if (code[i + 1] === '\r' && i + 2 < n && code[i + 2] === '\n') {
              strContent += '\\\r\n'
              i += 3
            } else {
              strContent += '\\' + code[i + 1]
              i += 2
            }
          } else {
            strContent += '\\' + (i + 1 < n ? code[i + 1] : '')
            i += 2
          }
          continue
        }

        // Matching closing quote
        if (c === quote) {
          foundClosingQuote = true
          i++
          break
        }

        // Unescaped newline
        if (c === '\n' || c === '\r') {
          hasUnescapedNewline = true

          // Check lookahead: is this string abandoned because the next line starts a new statement / property?
          const nextNL = c === '\r' && i + 1 < n && code[i + 1] === '\n' ? i + 2 : i + 1
          const restAfterNL = code.slice(nextNL)
          const nextLineTrimmed = restAfterNL.split('\n')[0].trim()

          const isNextStatementBoundary =
            /^(?:const\s|let\s|var\s|function\s|export\s|import\s|return\s|[a-zA-Z_$][a-zA-Z0-9_$]*\s*:|<\/|[}\])])/.test(
              nextLineTrimmed
            )

          // Count unescaped occurrences of quote in nextLineTrimmed
          const cleanNextLine = nextLineTrimmed.replace(new RegExp('\\\\' + quote, 'g'), '')
          const quoteCount = cleanNextLine.split(quote).length - 1

          // If next line starts a new statement / property and has balanced (even) quotes,
          // the current line was an abandoned unclosed string literal: close it here.
          if (isNextStatementBoundary && quoteCount % 2 === 0) {
            foundClosingQuote = true
            break
          }

          strContent += c
          i++
          continue
        }

        strContent += c
        i++
      }

      if (hasUnescapedNewline) {
        // If the string was closed before the newline (abandoned on previous line),
        // keep original quote delimiter and close it cleanly
        if (strContent.indexOf('\n') === -1 && strContent.indexOf('\r') === -1) {
          result += quote + strContent + quote
        } else {
          // Ubah string terputus menjadi template literal dengan backticks (`)
          // Escape backtick di dalam string agar valid
          const escapedContent = strContent.replace(/\\?`/g, '\\`')
          result += '`' + escapedContent + '`'
        }
      } else {
        result += quote + strContent + (foundClosingQuote ? quote : quote)
      }
      continue
    }

    // 5. Normal characters
    result += ch
    i++
  }

  return result
}

/**
 * Auto-Sanitize JSX Backtick Attributes (Zero-Panic Self-Healing):
 * Mendeteksi atribut JSX/SVG yang menggunakan template literal backtick tanpa kurung kurawal,
 * misalnya: <path d=`...` />, points=`...`, style=`...`, transform=`...`.
 * Remotion compiler / esbuild akan mengalami fatal SyntaxError jika atribut JSX menggunakan backtick tanpa kurung kurawal {`...`}.
 * Sanitizer ini secara otomatis mengubah attr=`...` menjadi attr={`...`},
 * termasuk menangani string multiline pada atribut SVG/JSX (d=, points=, style=, dll).
 */
export function sanitizeJsxBacktickAttributes(code: string): string {
  // Regex fixer: detects JSX attributes using template literals without curly braces:
  // Pola: /(\b[a-zA-Z0-9_-]+)=\`([\s\S]*?)\`/g -> $1={`$2`}
  // Guarded against JS variable declarations (const/let/var/return/case) and property access (obj.prop)
  const regex = /(?<!\b(?:const|let|var|return|case)\s+)(?<![.\w])(\b[a-zA-Z0-9_-]+)\s*=\s*`((?:\\`|[^`])*)`/g
  return code.replace(regex, '$1={`$2`}')
}

// Clean any markdown backticks or preamble conversational text from user pasted code
export const cleanGeneratedCode = (rawCode: string): string => {
  let code = rawCode.trim()
  // A. Pembersih Markdown: Hapus pembungkus markdown secara otomatis
  const fenceMatch = code.match(/```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)```/i)
  if (fenceMatch && fenceMatch[1]) {
    code = fenceMatch[1].trim()
  } else {
    code = code
      .replace(/^```(?:tsx|typescript|jsx|javascript)?\s*/i, '')
      .replace(/\s*```+\s*$/i, '')
      .trim()
  }

  // Preserve // @title: metadata if present before import
  const titleIndex = code.indexOf('// @title:')
  const importIndex = code.indexOf('import ')
  if (titleIndex >= 0 && (importIndex === -1 || titleIndex < importIndex)) {
    code = code.slice(titleIndex).trim()
  } else if (importIndex > 0) {
    code = code.slice(importIndex).trim()
  }
  code = code.replace(/```+\s*$/g, '').trim()

  // Auto-Sanitize Unterminated String Constants (v1.0.7):
  code = sanitizeUnterminatedStrings(code)

  // Auto-Sanitize JSX Backtick Attributes (v1.0.8 Zero-Panic Self-Healing):
  code = sanitizeJsxBacktickAttributes(code)

  // B. Auto-Sanitizer Easing Halusinasi (v1.0.7):
  code = code.replace(/Easing\.backIn\((.*?)\)/g, 'Easing.in(Easing.back($1))')
  code = code.replace(/Easing\.backOut\((.*?)\)/g, 'Easing.out(Easing.back($1))')
  code = code.replace(/Easing\.backInOut\((.*?)\)/g, 'Easing.inOut(Easing.back($1))')

  // Pre-fix Remotion code for props, hook, and fallback safety
  code = preFixRemotionCode(code)

  // Sanitize interpolate input and output ranges
  code = sanitizeInterpolateCode(code)

  return code.trim()
}

// Resolve target file path (single source of truth: remotion_env/src/VibeGraphic.tsx)
export const getDynamicMotionFilePath = (): string => {
  return getVibeGraphicPath()
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

  return `// @title: ${detectedTitle}
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
  return await writeExternalComponentCode(rawCode)
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
