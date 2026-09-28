import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import { existsSync } from 'fs'
import fsPromises from 'fs/promises'
import { ipcMain } from 'electron'
import { writeComponentCode, getVibeGraphicPath } from './remotionStudio'
import { sanitizeInterpolateCode, preFixRemotionCode, isTransientError, delay, withTimeout } from './geminiCoder'

export interface GenerateVideoPayload {
  prompt: string
  imageBase64?: string
  mimeType?: string
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
  errorMessage?: string
  apiKey: string
  currentCode?: string
  mode?: 'runtime_error' | 'visual_recovery'
  width?: number
  height?: number
  fps?: number
  durationInFrames?: number
  aspectRatio?: string
}

export interface AIServiceResult {
  success: boolean
  code?: string
  filePath?: string
  error?: string
}

const SYSTEM_PROMPT_GENERATION = `CRITICAL REMOTION CODE COMPILER & SENIOR MOTION DESIGNER:
Output ONLY valid, executable TypeScript TSX code wrapped in a single \`\`\`tsx markdown block.
Never emit conversational intro/outro or external tool calls.

==================================================
1. RIGID TECHNICAL GUARDRAILS (ZERO-CRASH CONTRACT)
==================================================
1. IMPORTS RESTRICTION:
   HANYA diizinkan mengimpor dari 'react' dan 'remotion':
   import React, { useMemo } from 'react';
   import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
   DILARANG KERAS mengimpor library asing (framer-motion, lucide-react, three.js, tailwind, dsb).

2. DIMENSION CONTRACT (ANTI-NAN RULE):
   Dimensi kanvas WAJIB diambil dari hook:
   const { width, height, fps, durationInFrames } = useVideoConfig();
   DILARANG KERAS mendestrukturisasi { width, height } dari parameter props VibeGraphic!

3. AGNOSTIC RESPONSIVE SCALING:
   const minDim = Math.min(width, height);
   const baseScale = minDim / 1080;
   Semua fontSize, strokeWidth, padding, gap, koordinat SVG, dan offset bayangan WAJIB dikalikan dengan baseScale.

4. PURE VECTOR GUARANTEE:
   Semua ilustrasi, ikon, ornamen, dan bentuk grafis WAJIB digambar menggunakan elemen vektor murni (<svg>, <path>, <rect>, <circle>, <polygon>, <g>, <defs>, <linearGradient>).
   ZERO external assets (dilarang JPG, PNG, URL eksternal, atau base64 raster).

5. EXPORT CONTRACT (4 IDENTITAS WAJIB DI AKHIR FILE):
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
   export const VibeGraphic: React.FC<VibeGraphicProps> = ...
   export default VibeGraphic;
   export const DynamicMotion = VibeGraphic;
   export type DynamicMotionProps = VibeGraphicProps;

==================================================
2. ATURAN TATA LETAK 16:9 LANDSCAPE (SPLIT-STAGE MANDATORY)
==================================================
Jika rasio aspek 16:9 / Landscape (width > height):
- DILARANG KERAS menumpuk Hero Object dan Teks dalam satu kolom vertikal di tengah layar!
  (Penyakit layout HP/mobile di layar lebar membuat kanvas hampa di kanan-kiri dan visual tampak amatir).
- WAJIB GUNAKAN SPLIT-STAGE LAYOUT:
  * ZONA KIRI (Information & Action - 45% s.d. 50% area kiri):
    - Teks headline masif (titleText) dengan font-weight bold/black dan drop-shadow tegas.
    - Badge kapsul kontras (badgeText) di atas headline.
    - Subteks informatif (subtitleText) yang mudah dibaca.
    - Tombol CTA atau aksen penawaran visual di bawah subteks.
    - Seluruh elemen tersusun rapi dalam flexbox kolom rata kiri dengan padding proporsional.
  * ZONA KANAN (Hero Stage - 45% s.d. 55% area kanan):
    - Hero Illustration SVG masif (mengisi 45% - 55% area kanan) yang dominan dan berdiri mandiri sebagai focal point utama.
    - Diletakkan di tengah panggung zona kanan dengan ruang gerak animasi yang leluasa.
- KANVAS TIDAK BOLEH HAMPA:
  Sudut kiri dan kanan wajib diisi latar belakang aktif yang relevan dengan tema prompt:
  * Misal: Sunburst rays kartun tebal yang berputar perlahan, perspective 3D grid, garis kecepatan miring (diagonal speed lines), atau konfeti tematik melayang.
- Jika rasio aspek Portrait (9:16) atau Square (1:1):
  Gunakan tata letak vertikal seimbang dengan hierarki visual yang jelas dan tanpa saling bertabrakan (zero overlapping).

==================================================
3. KOREOGRAFI FISIKA MASUK WAJIB (MANDATORY SPRING ENTRANCE)
==================================================
Elemen DILARANG sudah muncul lengkap di Frame 0! Wajib ada keterlambatan staggered nyata:
- FRAME 0 - 25 — HERO OBJECT IMPACT ENTRANCE:
  Hero Object masuk duluan menggunakan spring overshoot / squash-and-stretch:
  const heroDrop = spring({ frame, fps, config: { damping: 11, stiffness: 150 } });
  Gunakan heroDrop pada transform (misal: scale dan translateY overshoot bertenaga).

- FRAME 20 - 50 — STAGGERED TYPOGRAPHY & BADGE ENTRANCE:
  Teks headline dan badge masuk menyusul secara staggered:
  const textSpring = spring({ frame: Math.max(0, frame - 20), fps });
  Gunakan textSpring untuk slide-up halus (translateY dari +40px ke 0) dan fade-in (opacity dari 0 ke 1).
  Beri keterlambatan tambahan untuk subteks dan CTA: spring({ frame: Math.max(0, frame - 28), fps }).

- FRAME 50+ — KINETIC VITALITY & AMBIENT DRIFT (NEVER-FREEZE):
  Animasi kinetik berkelanjutan dan ambient drift aktif hingga frame akhir:
  * Slow Ambient Camera Zoom: interpolate(frame, [0, durationInFrames], [1.0, 1.04]) pada kontainer panggung.
  * Continuous Floating & Micro-Drift: Hero object mengapung halus dengan Math.sin(frame / 16) * (6 * baseScale).
  * Dynamic Active Background: Background terus bergerak (rotasi sunburst rays halus, grid mengalir, atau 6-10 partikel/sparks melayang kinetik).
  * Breathing Glow & Energy Pulse: Osilasi cahaya neon/shadow lembut (0.4 + Math.sin(frame / 20) * 0.2).

==================================================
4. ANTI-LAZY HERO OBJECT RULE (ANTI-STICKER SLOP)
==================================================
DILARANG KERAS membuat "Penyakit Stiker Malas" (Lazy Badge Slop):
- DILARANG HANYA membuat stiker lingkaran/bintang/badge datar bertuliskan teks (seperti lingkaran 'DISKON 50%') lalu menganggapnya sebagai objek utama! Itu murahan dan bukan standar komersial.
- WAJIB MENGGAMBAR HERO ILLUSTRATION SVG MASIF (mengisi 45% - 55% area panggung kanan) yang merepresentasikan esensi prompt user secara visual, kaya detail, dan berdimensi:
  * Kuliner / Makanan / Kafe: Gambar ilustrasi SVG mendalam (misal: donat bertingkat dengan lelehan glaze SVG glossy, bayangan highlights, dan taburan meses berlapis; atau cangkir kopi steaming dengan uap berayun dinamis).
  * E-Commerce / Belanja / Diskon: Gambar objek 3D-feel (misal: kotak hadiah 3D terbuka dengan pita melayang elastis, tas belanja bervolume dengan lipatan dan bayangan dalam, atau brankas digital).
  * SaaS / Fintech / Startup: Gambar kartu kredit hologram mengambang dengan microchip detail & aksen laser, diagram analitik 3D isometric, smartphone mockup murni SVG dengan UI screen hidup.
  * Otomotif / Gaming / Sports: Gambar siluet kendaraan aerodinamis, gauge speedometer/tachometer presisi dengan jarum dinamis, atau sirkuit racing kinetik.
  * Fashion / Seni / Lifestyle: Gambar ornamen geometris editorial berlapis, prisma kristal SVG pembias cahaya, atau komposisi visual artistik kelas Adobe After Effects / Motion Array.

==================================================
5. TETAP ADAPTIF (CHAMELEON FREEDOM)
==================================================
JANGAN KAKU. DILARANG memaksakan satu gaya template untuk semua permintaan!
Tetap bebaskan gaya visual sesuai ide pengguna (Bisa Pop Art Donat, Modern SaaS, Bold Sports, atau Editorial), namun SELURUH gaya wajib mematuhi aturan tata letak 16:9 dan transisi masuk di atas:
- Chunky Pop Art / Neo-Brutalism (Promo/Makanan/Ceria): Stroke kartun tebal 6-12px, warna cerah kontras, hard shadow hitam solid berjarak, membal elastis squash-and-stretch tinggi.
- Clean Modern SaaS (Startup/Fintech/Tech): Tipografi Inter/Helvetica presisi, kartu mengambang berbayangan halus, aksen garis tipis rapi, visual diagram/metrik, warna off-white/navy/emerald profesional.
- Bold Broadcast & Athletic (Olahraga/Otomotif/Turnamen): Sudut miring agresif (slanted cuts), racing lines, tipografi bold condong, aksen telemetri, kontras gelap-terang tegas.
- Editorial & Luxury (Fashion/Seni/High-End): Tipografi masif elegan, layout asimetris berkelas, garis grid arsitektural, palet monokrom dengan aksen emas/neon minimalis.`

const SYSTEM_PROMPT_REFINEMENT = `Kamu adalah editor video Remotion profesional. Perbarui kode TSX yang ada sesuai instruksi user.
PERUBAHAN WAJIB SIGNIFIKAN: Terapkan perubahan visual yang diminta user secara tegas dan langsung terlihat (warna, teks, ukuran, atau elemen). JANGAN hanya mengubah komentar atau spasi. Kembalikan seluruh kode TSX lengkap.
JANGAN merusak struktur komponen. Kembalikan RAW TSX code murni tanpa pembungkus markdown (tanpa \`\`\`tsx). Kode harus langsung dimulai dengan 'import React'. Pertahankan compatibility dengan props VibeGraphicProps.
LARANGAN BRANDING: DILARANG menyisipkan teks watermark, branding engine, atau footer placeholder seperti 'REMOTION KINETIC ENGINE' kecuali diminta spesifik oleh user.

ATURAN RESOLUSI & TATA LETAK DINAMIS:
- Gunakan useVideoConfig() untuk width, height, fps, dan durationInFrames.
- Gunakan tata letak responsif (Flexbox, persentase %, atau kalkulasi turunan useVideoConfig()).

ATURAN UNIVERSAL DYNAMIC TIMELINE & NEVER-FREEZE (SEMUA DURASI 5s, 10s, 15s, 20s):
1. DILARANG MENGGUNAKAN ANGKA FRAME STATIS / HARDCODED:
   - DILARANG menulis rentang frame tetap seperti [0, 60] atau [0, 150] untuk animasi utama.
   - SEMUA perhitungan timeline wajib menggunakan persentase dinamis dari 'durationInFrames' (useVideoConfig()):
     * Intro Reveal: [0, Math.floor(durationInFrames * 0.2)]
     * Main Action & Growth: [Math.floor(durationInFrames * 0.2), Math.floor(durationInFrames * 0.8)]
     * Ending & Settling: [Math.floor(durationInFrames * 0.8), durationInFrames]
2. ATURAN NEVER-FREEZE (CONTINUOUS MICRO-MOTION):
   - Elemen visual TIDAK BOLEH berhenti bergerak total di detik mana pun sepanjang video.
   - Wajib sertakan gerakan berkelanjutan berbasis fungsi matematis 'frame':
     * Floating / Hover: Math.sin(frame / 15) * amplitude.
     * Breathing Glow: 0.4 + Math.sin(frame / 20) * 0.2.
     * Live Ticker / Desimal Bergerak pada data/HUD angka.
     * Slow Camera Zoom: interpolate(frame, [0, durationInFrames], [1, 1.04]).
3. AUTO-EXPAND PROMPT PENDEK: Distribusikan dinamika visual merata sepanjang durasi penuh dan jaga visual tetap bergerak sampai frame terakhir.

CRITICAL RULE FOR INTERPOLATE:
- In Remotion's interpolate(frame, [start, end], [out1, out2]), the inputRange array MUST be strictly monotonically increasing. NEVER output identical numbers like [405, 405] or [0, 0]. Ensure end is always at least start + 1 (e.g. [start, Math.max(start + 1, end)]).
- Seluruh nilai dalam array inputRange WAJIB berurutan naik dari nilai terkecil ke terbesar.
- Selalu samakan panjang elemen antara inputRange dan outputRange.`

const SYSTEM_PROMPT_AUTO_FIX = `Kamu adalah AI Self-Healing & Debugger ahli untuk Remotion video engine.
Tugas utamamu adalah menganalisis dan memperbaiki error runtime, bug sintaks, atau kegagalan tampilan (layar blank / visual hilang) pada komponen TSX Remotion.

LARANGAN BRANDING: DILARANG menyisipkan teks watermark, branding engine, atau footer placeholder seperti 'REMOTION KINETIC ENGINE' kecuali diminta spesifik oleh user.

ATURAN RESOLUSI & TATA LETAK DINAMIS (MANDATORY):
1. JANGAN PERNAH MENGUNCI (HARDCODE) UKURAN KANVAS ke resolusi tertentu.
2. WAJIB menggunakan hook 'useVideoConfig()' dari Remotion:
   const { width, height, fps, durationInFrames } = useVideoConfig()
3. Ukuran font, padding, margin, stroke width, dan jarak elemen WAJIB beradaptasi dinamis terhadap width dan height kanvas aktif. Gunakan skala relatif (misal: Math.min(width, height) / 1080) atau persentase.
4. Gunakan tata letak fleksibel/relatif (Flexbox, persentase %, atau koordinat berbasis useVideoConfig()), BUKAN nilai piksel statis kaku.
5. Pembungkus utama <AbsoluteFill style={{ width: '100%', height: '100%', backgroundColor: ... }}> WAJIB memiliki background solid/jelas yang kontras terhadap seluruh elemen visual di dalamnya.

ATURAN UNIVERSAL DYNAMIC TIMELINE & NEVER-FREEZE (SEMUA DURASI: 5s, 10s, 15s, 20s):
1. DILARANG MENGGUNAKAN ANGKA FRAME STATIS / HARDCODED:
   - DILARANG menulis rentang frame tetap seperti [0, 60] atau [0, 150] untuk animasi utama.
   - SEMUA perhitungan timeline wajib menggunakan persentase dinamis dari 'durationInFrames' (useVideoConfig()):
     * Intro Reveal: [0, Math.floor(durationInFrames * 0.2)]
     * Main Action & Growth: [Math.floor(durationInFrames * 0.2), Math.floor(durationInFrames * 0.8)]
     * Ending: [Math.floor(durationInFrames * 0.8), durationInFrames]
2. ATURAN NEVER-FREEZE: Pastikan animasi TIDAK berhenti/membeku di tengah jalan pada durasi berapa pun. Wajib ada micro-motion berkelanjutan (floating Math.sin(frame / 15), breathing glow, camera zoom konstan 1.0 ke 1.04) agar video hidup hingga frame terakhir.
3. AUTO-EXPAND PROMPT PENDEK: Bagi pertumbuhan data merata sepanjang durasi penuh dan pertahankan denyut visual sampai frame terakhir.

ATURAN PEMULIHAN LAYAR GELAP / BLANK (SILENT FAILURE RECOVERY):
1. OPACITY FRAME 0: Opacity elemen TIDAK BOLEH tertahan di 0 pada Frame 0. Pastikan elemen langsung terlihat atau ber-fade masuk dari minimal 0.95 ke 1. JANGAN biarkan layar kosong/gelap.
2. VIEWPORT BOUNDS: Pastikan seluruh elemen visual, teks, dan ikon berada di dalam batas viewport kanvas aktif (width x height), tidak terlempar ke luar koordinat layar.
3. KONTRAS WARNA: Pastikan warna teks dan komponen visual kontras tajam dengan warna background (jangan teks hitam di latar gelap atau teks putih di latar putih).
4. DIMENSI VALID: Pastikan elemen SVG, box, atau flex container memiliki ukuran width/height valid (bukan 0px atau NaN).

CRITICAL RULE FOR INTERPOLATE:
- In Remotion's interpolate(frame, [start, end], [out1, out2]), the inputRange array MUST be strictly monotonically increasing. NEVER output identical numbers like [405, 405] or [0, 0]. Ensure end is always at least start + 1 (e.g. [start, Math.max(start + 1, end)]).
- Seluruh nilai dalam array inputRange WAJIB berurutan naik dari nilai terkecil ke terbesar (strictly monotonically increasing, contoh: [0, 30, 60, 90]).
- DILARANG KERAS memasukkan angka yang lebih kecil atau sama setelah angka sebelumnya (contoh terlarang: [405, 405], [360, 375, 390, 150]).
- Selalu samakan panjang elemen antara inputRange dan outputRange.

PERBAIKI ERROR SECARA TUNTAS:
1. Analisis masalah runtime error atau kegagalan visual yang dilaporkan.
2. Perbaiki kode agar 100% valid, dapat dikompilasi, dan langsung menampilkan visual yang hidup serta dinamis.
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

  // Pre-fix Remotion code for props, hook, and fallback safety
  cleaned = preFixRemotionCode(cleaned)

  // Sanitize interpolate input and output ranges to prevent Remotion crash
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
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest'
]

/**
 * Call Gemini model with auto-retry (backoff 1s on 503/429/timeout) and multi-model fallback across CANDIDATE_MODELS
 */
async function callGemini(
  apiKey: string,
  systemInstruction: string,
  contents: (string | Part)[]
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey)
  let lastError: Error | null = null

  for (const modelName of CANDIDATE_MODELS) {
    const maxAttempts = 2 // 1 initial attempt + 1 retry on 503/429/timeout
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(
          `[GeminiService] Requesting generation using model: ${modelName} (attempt ${attempt}/${maxAttempts})`
        )
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction
        })

        const response = await withTimeout(
          model.generateContent(contents),
          25000,
          `Batas waktu (25s) terlampaui saat memanggil model ${modelName}`
        )
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

        // If error is 503 / 429 / transient / timeout and retry attempts remain, wait 1000ms delay backoff
        if (attempt < maxAttempts && isTransientError(err)) {
          console.warn(
            `[GeminiService] Google API 503/429/Transient on ${modelName}. Waiting 1000ms before auto-retry...`
          )
          await delay(1000)
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

    let detectedMime = payload.mimeType || 'image/png'
    if (imageBase64 && imageBase64.trim()) {
      let rawData = imageBase64.trim()

      const match = imageBase64.match(/^data:([a-zA-Z0-9+.-]+\/[a-zA-Z0-9+.-]+);base64,(.+)$/)
      if (match) {
        detectedMime = match[1]
        rawData = match[2]
      }

      contents.push({
        inlineData: {
          mimeType: detectedMime,
          data: rawData
        }
      })
    }

    let referenceInstruction = ''
    if (imageBase64 && imageBase64.trim()) {
      const isVideoOrGif =
        detectedMime.startsWith('video/') ||
        detectedMime === 'image/gif'

      if (isVideoOrGif) {
        referenceInstruction = `\n\n[VIDEO/GIF REVERSE-ENGINEERING CLONER DIRECTIVE]:
Pengguna melampirkan media referensi video/animasi (${detectedMime}).
INSTRUKSI EKSPLISIT CLONER:
1. Analisis ritme gerakan, kurva easing, perubahan posisi, rotasi, skala, serta transisi visual antar-frame dari video/GIF referensi ini.
2. Tulis ulang kode TSX Remotion yang mereproduksi gaya dan ketukan animasi tersebut secara presisi.
3. Tetap patuhi batasan performa: maksimal 20 elemen visual dan gunakan useCurrentFrame(), interpolate(), serta spring() dari 'remotion'.`
      } else {
        referenceInstruction = `\n\n[IMAGE REFERENCE DIRECTIVE]:
Pengguna melampirkan gambar referensi (${detectedMime}). Analisis komposisi visual, tata letak grafis, palet warna, dan gaya tipografinya, lalu terjemahkan menjadi animasi Remotion yang dinamis dan selaras.`
      }
    }

    let assetInstruction = ''
    if (assetPath && assetPath.trim()) {
      assetInstruction = `\n\nASET LOKAL TERSEDIA: Pengguna mengunggah aset gambar lokal pada path: staticFile('${assetPath.trim()}').
Gunakan komponen <Img src={staticFile('${assetPath.trim()}')} /> dari 'remotion' untuk menampilkan logo/ikon ini.
Integrasikan aset tersebut ke dalam komposisi visual secara proporsional (misalnya sebagai logo reveal di tengah, badge animasi mengapung, atau elemen pendukung) lengkap dengan animasi spring/fade-in yang serasi.`
    }

    contents.push(
      `USER PROMPT / CONCEPT REQUEST:\n${prompt}${referenceInstruction}${assetInstruction}\n\nIngat: Berikan HANYA kode TSX murni tanpa penjelasan atau markdown backticks.`
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
  const {
    errorMessage,
    apiKey,
    currentCode,
    mode = 'runtime_error',
    width = 1920,
    height = 1080,
    fps = 30,
    durationInFrames = 150,
    aspectRatio = '16:9'
  } = payload

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

    const durationSec = Math.round((durationInFrames / fps) * 10) / 10
    const canvasContext = `\n\nMETADATA KANVAS AKTIF:\n- Dimensi: ${width}x${height} (${aspectRatio})\n- Framerate: ${fps} FPS\n- Durasi: ${durationInFrames} frames (~${durationSec} detik)`

    let problemInstruction = ''
    if (mode === 'visual_recovery' || !errorMessage || !errorMessage.trim()) {
      problemInstruction = `\n\n[MODE: PEMULIHAN LAYAR GELAP / VISUAL RECOVERY]:
Komponen animasi tidak memicu crash teknis, namun tampilan kanvas blank, gelap, atau elemen grafisnya hilang.
PERBAIKAN VISUAL YANG HARUS DILAKUKAN:
1. Pastikan opacity elemen tidak tertahan di angka 0 pada frame 0. Elemen harus langsung terlihat jelas sejak awal animasi.
2. Pastikan semua elemen visual, judul, badge, dan kontainer berada di dalam batas viewport kanvas aktif (${width}x${height}), tidak terlempar ke luar koordinat layar (hindari translasi berlebih).
3. Pastikan warna teks dan komponen visual kontras tajam dengan warna background solid pada <AbsoluteFill>.
4. Gunakan hook useVideoConfig() dari 'remotion' untuk menyesuaikan skala tipografi dan layout Flexbox responsif secara dinamis.`
    } else {
      problemInstruction = `\n\n[MODE: RUNTIME ERROR REPAIR]:
Kode TSX Remotion mengalami runtime exception:
"""
${errorMessage.trim()}
"""
INSTRUKSI PERBAIKAN:
1. Analisis error di atas dan perbaiki penyebab bug secara tuntas.
2. Pastikan semua array inputRange pada interpolate() tersusun berurutan naik dari kecil ke besar (strictly monotonically increasing).
3. Sesuaikan seluruh layout dan font agar dinamis menggunakan useVideoConfig() sesuai dimensi kanvas aktif (${width}x${height} @ ${fps} FPS, ${durationInFrames} frames).`
    }

    const contents: (string | Part)[] = [
      `KODE TSX SAAT INI (VibeGraphic.tsx):\n\`\`\`tsx\n${sourceCode}\n\`\`\`${canvasContext}${problemInstruction}\n\nKembalikan seluruh kode TSX yang 100% valid dan lengkap tanpa markdown penjelasan.`
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

