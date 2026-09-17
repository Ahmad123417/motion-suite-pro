import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import { existsSync } from 'fs'
import fsPromises from 'fs/promises'
import { ipcMain } from 'electron'
import { writeComponentCode, getVibeGraphicPath } from './remotionStudio'
import { sanitizeInterpolateCode, isTransientError, delay } from './geminiCoder'

export interface GenerateVideoPayload {
  prompt: string
  imageBase64?: string
  apiKey: string
  assetPath?: string
}

export interface RefineVideoPayload {
  instruction: string
  apiKey: string
  currentCode?: string
  assetPath?: string
}

export interface AutoFixVideoPayload {
  errorMessage: string
  apiKey: string
  currentCode?: string
}

export interface AIServiceResult {
  success: boolean
  code?: string
  filePath?: string
  error?: string
}

const SYSTEM_PROMPT_GENERATION = `You are an expert Remotion animation and Creative Coding engineer specializing in diverse, professional microstock motion graphics.

CRITICAL RULES FOR CODE & RENDERING:
1. Output ONLY the raw TypeScript TSX code for the component.
2. DO NOT wrap with markdown backticks (NO \`\`\`tsx, NO \`\`\`). Output MUST begin directly with 'import React'.
3. NO conversational text, explanations, or comments inside or outside the code.
4. MANDATORY IMPORTS:
   import React from 'react'
   import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from 'remotion'
5. ALLOWED IMPORTS:
   Only 'react', 'remotion', and official Remotion motion libraries are permitted:
   - 'remotion' (hooks & Img component)
   - '@remotion/shapes' (Circle, Rect, Triangle, Star, Polygon, Ellipse, Pie, etc.)
   - '@remotion/paths' (evolvePath, getLength, getPointAtLength, warpPath, reversePath, etc.)
   - '@remotion/noise' (noise2D, noise3D, noise4D)
   FORBIDDEN: Do NOT import unsupported external packages (no framer-motion, lucide-react, three, etc.).
6. COMPONENT & PROPS INTERFACE:
   export interface VibeGraphicProps {
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

   export const VibeGraphic: React.FC<VibeGraphicProps> = ({
     titleText = 'CONTEXTUAL_TITLE',
     accentColor = '#00f2fe',
     backgroundColor = '#080c18',
     isTransparent = false,
     customAssetUrl
   }) => {
     const frame = useCurrentFrame()
     const { durationInFrames, width, height, fps } = useVideoConfig()
     const minDim = Math.min(width, height)
     const baseScale = minDim / 1080
     ...
   }
   export default VibeGraphic

7. RESPONSIVE SCALING:
   Scale dimensions, stroke widths, font sizes with \`baseScale = Math.min(width, height) / 1080\`.
8. SEAMLESS LOOP:
   Make animations loop seamlessly across \`durationInFrames\` using sine, cosine, or closed interpolate curves.
9. HARDWARE SAFETY BOUNDS:
   Maximum 20 visual elements (SVG paths/divs). Pure deterministic functions derived strictly from useCurrentFrame(). NO useState, useEffect, or heavy CSS filters.
10. ASSET INTEGRATION:
    If local asset path is provided, use <Img src={staticFile('...')} style={{ ... }} /> from 'remotion'.
    If \`customAssetUrl\` is provided, render it with <Img src={customAssetUrl} style={{ ... }} /> as a visual focal point.
11. VISUAL REFERENCE:
    If an image is attached, inspect its visual composition, colors, geometric layout, and art direction, and translate that visual inspiration into fluid Remotion procedural animation.

CRITICAL RULE FOR INTERPOLATE:
- In Remotion's interpolate(frame, [start, end], [out1, out2]), the inputRange array MUST be strictly monotonically increasing. NEVER output identical numbers like [405, 405] or [0, 0]. Ensure end is always at least start + 1 (e.g. [start, Math.max(start + 1, end)]).
- Seluruh nilai dalam array inputRange WAJIB berurutan naik dari nilai terkecil ke terbesar (strictly monotonically increasing, contoh: [0, 30, 60, 90]).
- DILARANG KERAS memasukkan angka yang lebih kecil atau sama setelah angka sebelumnya (contoh terlarang: [405, 405], [360, 375, 390, 150]).
- Selalu samakan panjang elemen antara inputRange dan outputRange.`

const SYSTEM_PROMPT_REFINEMENT = `Kamu adalah editor video Remotion profesional. Perbarui kode TSX yang ada sesuai instruksi user.
PERUBAHAN WAJIB SIGNIFIKAN: Terapkan perubahan visual yang diminta user secara tegas dan langsung terlihat (warna, teks, ukuran, atau elemen). JANGAN hanya mengubah komentar atau spasi. Kembalikan seluruh kode TSX lengkap.
JANGAN merusak struktur komponen. Kembalikan RAW TSX code murni tanpa pembungkus markdown (tanpa \`\`\`tsx). Kode harus langsung dimulai dengan 'import React'. Pertahankan compatibility dengan props VibeGraphicProps.

CRITICAL RULE FOR INTERPOLATE:
- In Remotion's interpolate(frame, [start, end], [out1, out2]), the inputRange array MUST be strictly monotonically increasing. NEVER output identical numbers like [405, 405] or [0, 0]. Ensure end is always at least start + 1 (e.g. [start, Math.max(start + 1, end)]).
- Seluruh nilai dalam array inputRange WAJIB berurutan naik dari nilai terkecil ke terbesar (strictly monotonically increasing, contoh: [0, 30, 60, 90]).
- DILARANG KERAS memasukkan angka yang lebih kecil atau sama setelah angka sebelumnya (contoh terlarang: [405, 405], [360, 375, 390, 150]).
- Selalu samakan panjang elemen antara inputRange dan outputRange.`

const SYSTEM_PROMPT_AUTO_FIX = `Kamu adalah AI Self-Healing & Debugger ahli untuk Remotion video engine.
Tugas utamamu adalah menganalisis dan memperbaiki error runtime atau bug sintaks pada komponen TSX Remotion.

CRITICAL RULE FOR INTERPOLATE:
- In Remotion's interpolate(frame, [start, end], [out1, out2]), the inputRange array MUST be strictly monotonically increasing. NEVER output identical numbers like [405, 405] or [0, 0]. Ensure end is always at least start + 1 (e.g. [start, Math.max(start + 1, end)]).
- Seluruh nilai dalam array inputRange WAJIB berurutan naik dari nilai terkecil ke terbesar (strictly monotonically increasing, contoh: [0, 30, 60, 90]).
- DILARANG KERAS memasukkan angka yang lebih kecil atau sama setelah angka sebelumnya (contoh terlarang: [405, 405], [360, 375, 390, 150]).
- Selalu samakan panjang elemen antara inputRange dan outputRange.

PERBAIKI ERROR SECARA TUNTAS:
1. Analisis runtime error yang dilaporkan user.
2. Perbaiki kode agar 100% valid dan dapat dikompilasi serta dirender tanpa runtime exception.
3. Kembalikan HANYA RAW TSX code murni tanpa markdown backticks (tanpa \`\`\`tsx).
4. Kode harus langsung dimulai dengan 'import React'.
5. Pertahankan ekspor VibeGraphic dan props VibeGraphicProps.`

/**
 * Clean markdown backticks and extraneous characters from LLM response
 */
export function cleanGeneratedCode(rawText: string): string {
  let cleaned = rawText.trim()

  // Match block inside markdown fences if present
  const fenceMatch = cleaned.match(/```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)```/i)
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim()
  } else {
    cleaned = cleaned.replace(/^```(?:tsx|typescript|jsx|javascript)?\s*/i, '')
    cleaned = cleaned.replace(/\s*```\s*$/i, '')
    cleaned = cleaned.trim()
  }

  // Ensure code begins at first import
  const importIdx = cleaned.indexOf('import ')
  if (importIdx > 0) {
    cleaned = cleaned.slice(importIdx).trim()
  }

  // Strip any remaining markdown backticks at the end
  cleaned = cleaned.replace(/```+\s*$/g, '').trim()

  // Sanitize interpolate input ranges to prevent Remotion crash (e.g. [405, 405] -> [405, 406])
  cleaned = sanitizeInterpolateCode(cleaned)

  // Ensure export compatibility (export both VibeGraphic and DynamicMotion if one is defined)
  if (cleaned.includes('DynamicMotion') && !cleaned.includes('VibeGraphic')) {
    cleaned += '\nexport const VibeGraphic = DynamicMotion\n'
  } else if (cleaned.includes('VibeGraphic') && !cleaned.includes('DynamicMotion')) {
    cleaned += '\nexport const DynamicMotion = VibeGraphic\n'
  }

  // Ensure props export compatibility (export both VibeGraphicProps and DynamicMotionProps if one is defined)
  if (cleaned.includes('VibeGraphicProps') && !cleaned.includes('DynamicMotionProps')) {
    cleaned += '\nexport type DynamicMotionProps = VibeGraphicProps\n'
  } else if (cleaned.includes('DynamicMotionProps') && !cleaned.includes('VibeGraphicProps')) {
    cleaned += '\nexport type VibeGraphicProps = DynamicMotionProps\n'
  }

  // Ensure default export exists
  if (!cleaned.includes('export default')) {
    if (cleaned.includes('VibeGraphic')) {
      cleaned += '\nexport default VibeGraphic\n'
    } else if (cleaned.includes('DynamicMotion')) {
      cleaned += '\nexport default DynamicMotion\n'
    }
  }

  return cleaned
}

/**
 * Validate generated code syntax before writing to disk
 */
export function validateGeneratedCode(code: string): { valid: boolean; error?: string } {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Respons kode dari AI kosong. File fisik tidak diubah.' }
  }
  if (!code.includes('export')) {
    return {
      valid: false,
      error: 'Kode yang dihasilkan AI tidak memiliki ekspresi "export". File fisik tidak diubah.'
    }
  }
  if (!code.includes('return')) {
    return {
      valid: false,
      error: 'Kode yang dihasilkan AI tidak memiliki ekspresi "return" untuk merender visual. File fisik tidak diubah.'
    }
  }
  return { valid: true }
}

/**
 * Read current code from remotion_env/src/VibeGraphic.tsx
 */
export async function readCurrentCode(): Promise<string> {
  try {
    const targetPath = getVibeGraphicPath()
    if (existsSync(targetPath)) {
      return await fsPromises.readFile(targetPath, 'utf-8')
    }
  } catch (err) {
    console.error('[GeminiService] Failed to read current code:', err)
  }
  return ''
}

export const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest'
]

/**
 * Call Gemini model with auto-retry (backoff 1.5s on 503/429) and multi-model fallback across CANDIDATE_MODELS
 */
async function callGemini(
  apiKey: string,
  systemInstruction: string,
  contents: (string | Part)[]
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey)
  let lastError: Error | null = null

  for (const modelName of CANDIDATE_MODELS) {
    const maxAttempts = 2 // 1 initial attempt + 1 retry on 503/429
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(
          `[GeminiService] Requesting generation using model: ${modelName} (attempt ${attempt}/${maxAttempts})`
        )
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction
        })

        const response = await model.generateContent(contents)
        const resultText = response.response.text()
        if (resultText && resultText.trim()) {
          console.log(`[GeminiService] Successfully generated with ${modelName}`)
          return resultText
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.warn(
          `[GeminiService] Model ${modelName} error on attempt ${attempt}:`,
          lastError.message
        )

        // If error is 503 / 429 / transient and retry attempts remain, wait 1.5s delay backoff
        if (attempt < maxAttempts && isTransientError(err)) {
          console.warn(
            `[GeminiService] Google API 503/429 on ${modelName}. Waiting 1500ms before auto-retry...`
          )
          await delay(1500)
          continue
        }

        // Otherwise (non-transient error or retry exhausted), proceed to fallback to next candidate model
        break
      }
    }
    console.warn(
      `[GeminiService] Model ${modelName} unavailable, automatically falling back to next candidate model...`
    )
  }

  throw (
    lastError ||
    new Error('Gagal berkomunikasi dengan model Gemini (seluruh rantai model cadangan tidak merespon).')
  )
}

/**
 * Generate video component TSX from prompt and optional image reference
 */
export async function generateVideoWithAI(payload: GenerateVideoPayload): Promise<AIServiceResult> {
  const { prompt, imageBase64, apiKey, assetPath } = payload

  if (!apiKey || !apiKey.trim()) {
    return { success: false, error: 'Gemini API Key belum dimasukkan.' }
  }

  if (!prompt || !prompt.trim()) {
    return { success: false, error: 'Prompt konsep video tidak boleh kosong.' }
  }

  try {
    const contents: (string | Part)[] = []

    if (imageBase64 && imageBase64.trim()) {
      let mimeType = 'image/png'
      let rawData = imageBase64.trim()

      const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/)
      if (match) {
        mimeType = match[1]
        rawData = match[2]
      }

      contents.push({
        inlineData: {
          mimeType,
          data: rawData
        }
      })
    }

    let assetInstruction = ''
    if (assetPath && assetPath.trim()) {
      assetInstruction = `\n\nASET LOKAL TERSEDIA: Pengguna mengunggah aset gambar lokal pada path: staticFile('${assetPath.trim()}').
Gunakan komponen <Img src={staticFile('${assetPath.trim()}')} /> dari 'remotion' untuk menampilkan logo/ikon ini.
Integrasikan aset tersebut ke dalam komposisi visual secara proporsional (misalnya sebagai logo reveal di tengah, badge animasi mengapung, atau elemen pendukung) lengkap dengan animasi spring/fade-in yang serasi.`
    }

    contents.push(
      `USER PROMPT / CONCEPT REQUEST:\n${prompt}${assetInstruction}\n\nIngat: Berikan HANYA kode TSX murni tanpa penjelasan atau markdown backticks.`
    )

    const rawCode = await callGemini(apiKey.trim(), SYSTEM_PROMPT_GENERATION, contents)
    const cleanedCode = cleanGeneratedCode(rawCode)

    const validation = validateGeneratedCode(cleanedCode)
    if (!validation.valid) {
      console.warn('[GeminiService] Validation error:', validation.error)
      return { success: false, error: validation.error }
    }

    // Write directly to remotion_env/src/VibeGraphic.tsx only after validation passes
    const writeResult = await writeComponentCode(cleanedCode)
    if (!writeResult.success) {
      return { success: false, error: writeResult.error || 'Gagal menyimpan kode ke VibeGraphic.tsx' }
    }

    return {
      success: true,
      code: cleanedCode,
      filePath: writeResult.filePath
    }
  } catch (err) {
    console.error('[GeminiService] generateVideoWithAI error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan saat memanggil API Gemini'
    }
  }
}

/**
 * Refine existing video component based on user instruction
 */
export async function refineVideoWithAI(payload: RefineVideoPayload): Promise<AIServiceResult> {
  const { instruction, apiKey, currentCode, assetPath } = payload

  if (!apiKey || !apiKey.trim()) {
    return { success: false, error: 'Gemini API Key belum dimasukkan.' }
  }

  if (!instruction || !instruction.trim()) {
    return { success: false, error: 'Instruksi revisi tidak boleh kosong.' }
  }

  try {
    const sourceCode = (currentCode && currentCode.trim()) || (await readCurrentCode())
    if (!sourceCode) {
      return {
        success: false,
        error: 'Tidak dapat menemukan kode VibeGraphic.tsx yang sedang berjalan untuk diedit.'
      }
    }

    let assetInstruction = ''
    if (assetPath && assetPath.trim()) {
      assetInstruction = `\n\nASET LOKAL TERSEDIA: Pengguna mengunggah aset gambar lokal pada path: staticFile('${assetPath.trim()}').
Gunakan komponen <Img src={staticFile('${assetPath.trim()}')} /> dari 'remotion' untuk menampilkan logo/ikon ini jika belum ada atau diperbarui.`
    }

    const contents: (string | Part)[] = [
      `KODE TSX SAAT INI (VibeGraphic.tsx):\n\`\`\`tsx\n${sourceCode}\n\`\`\`\n\nINSTRUKSI REVISI DARI PENGGUNA:\n${instruction}${assetInstruction}\n\nPERUBAHAN WAJIB SIGNIFIKAN: Terapkan perubahan visual yang diminta user secara tegas dan langsung terlihat (warna, teks, ukuran, atau elemen). JANGAN hanya mengubah komentar atau spasi. Kembalikan seluruh kode TSX lengkap.`
    ]

    const rawCode = await callGemini(apiKey.trim(), SYSTEM_PROMPT_REFINEMENT, contents)
    const cleanedCode = cleanGeneratedCode(rawCode)

    const validation = validateGeneratedCode(cleanedCode)
    if (!validation.valid) {
      console.warn('[GeminiService] Validation error during refine:', validation.error)
      return { success: false, error: validation.error }
    }

    // Write directly to remotion_env/src/VibeGraphic.tsx only after validation passes
    const writeResult = await writeComponentCode(cleanedCode)
    if (!writeResult.success) {
      return { success: false, error: writeResult.error || 'Gagal menyimpan kode revisi ke VibeGraphic.tsx' }
    }

    return {
      success: true,
      code: cleanedCode,
      filePath: writeResult.filePath
    }
  } catch (err) {
    console.error('[GeminiService] refineVideoWithAI error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses revisi dengan Gemini'
    }
  }
}

/**
 * Self-healing Auto-Fix for Remotion runtime errors (e.g. interpolate inputRange errors)
 */
export async function autoFixVideoWithAI(payload: AutoFixVideoPayload): Promise<AIServiceResult> {
  const { errorMessage, apiKey, currentCode } = payload

  if (!apiKey || !apiKey.trim()) {
    return { success: false, error: 'Gemini API Key belum dimasukkan.' }
  }

  try {
    const sourceCode = (currentCode && currentCode.trim()) || (await readCurrentCode())
    if (!sourceCode) {
      return {
        success: false,
        error: 'Tidak dapat menemukan kode VibeGraphic.tsx yang sedang berjalan untuk diperbaiki.'
      }
    }

    const contents: (string | Part)[] = [
      `Kode TSX Remotion berikut mengalami error runtime: '${errorMessage}'. Analisis dan perbaiki kodenya sekarang. Pastikan semua array inputRange pada interpolate() tersusun berurutan dari kecil ke besar. Kembalikan seluruh kode TSX yang valid tanpa markdown penjelasan.\n\nKODE TSX SAAT INI (VibeGraphic.tsx):\n\`\`\`tsx\n${sourceCode}\n\`\`\``
    ]

    const rawCode = await callGemini(apiKey.trim(), SYSTEM_PROMPT_AUTO_FIX, contents)
    const cleanedCode = cleanGeneratedCode(rawCode)

    const validation = validateGeneratedCode(cleanedCode)
    if (!validation.valid) {
      console.warn('[GeminiService] Validation error during auto-fix:', validation.error)
      return { success: false, error: validation.error }
    }

    // Write directly to remotion_env/src/VibeGraphic.tsx only after validation passes
    const writeResult = await writeComponentCode(cleanedCode)
    if (!writeResult.success) {
      return {
        success: false,
        error: writeResult.error || 'Gagal menyimpan kode perbaikan ke VibeGraphic.tsx'
      }
    }

    return {
      success: true,
      code: cleanedCode,
      filePath: writeResult.filePath
    }
  } catch (err) {
    console.error('[GeminiService] autoFixVideoWithAI error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses auto-fix dengan Gemini'
    }
  }
}

/**
 * Register all Gemini AI IPC handlers in Main Process
 */
export function registerGeminiIPC(): void {
  ipcMain.handle('ai:generate-video', async (_, payload: GenerateVideoPayload) => {
    return await generateVideoWithAI(payload)
  })

  ipcMain.handle('ai:refine-video', async (_, payload: RefineVideoPayload) => {
    return await refineVideoWithAI(payload)
  })

  ipcMain.handle('ai:auto-fix-video', async (_, payload: AutoFixVideoPayload) => {
    return await autoFixVideoWithAI(payload)
  })

  ipcMain.handle('ai:read-code', async () => {
    return await readCurrentCode()
  })
}

