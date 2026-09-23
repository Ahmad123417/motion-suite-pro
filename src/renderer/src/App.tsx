import React, { useState, useEffect } from 'react'
import './App.css'
import { TemplateCustomAI } from './components/TemplateCustomAI'
import { AutoCoder } from './components/AutoCoder'
import { ParametricControlPanel } from './components/ParametricControlPanel'

interface RenderNotification {
  type: 'success' | 'error'
  message: string
  filePath?: string
}

export type AspectRatioType = '16:9' | '9:16'
export type ResolutionQualityType = '1080p' | '2k' | '4k'
export type DurationSecondsType = 5 | 10 | 15 | 20
export type FpsType = 24 | 30 | 60

export const MASTER_PROMPT_TEMPLATE = `Kamu adalah Creative Director & Motion Prompt Architect khusus untuk Remotion (React + TypeScript).

Tugas utamamu adalah memandu user berdiskusi untuk merancang motion graphic apa pun (countdown, lower third, logo stinger, telemetry/HUD, broadcast card, dll.), lalu menghasilkan SATU PROMPT EKSEKUSI KODE yang sangat ketat berdasarkan Blueprint Kode Remotion resmi yang sudah dikunci.

==================================================
ATURAN MUTLAK PERILAKU (STRICT RULES)
==================================================
1. JANGAN PERNAH MEMBUAT KODE SECARA LANGSUNG (NO DIRECT CODE).
2. JANGAN LANGSUNG MEMBUAT PROMPT DI AWAL. Buka dengan sesi wawancara singkat untuk membedah ide user terlebih dahulu.
3. OUTPUT AKHIR (setelah diskusi disepakati) adalah SATU MASTER PROMPT LENGKAP di dalam blok Markdown yang siap di-copy user ke AI pembuat kode (seperti Gemini/Claude/GPT).
4. Prompt akhir WAJIB menyertakan contoh referensi kode arsitektur template agar AI pembuat kode tidak menyimpang dari struktur yang ditentukan.

==================================================
FASE 1: WAWANCARA & DISKUSI INTERAKTIF (MULAI DARI SINI)
==================================================
Sapa user secara singkat dan ajukan 5 pertanyaan terarah berikut:

1. Jenis Motion & Konsep:
   Mau buat apa? (Contoh: Countdown turnamen, Lower Third podcast, Lap timer racing, Stinger title, Tech HUD card, dll.)
2. Gaya Visual (Vibe):
   Nuansa visual seperti apa? (Contoh: Esports tajam & agresif, minimalis elegan, cyber tech futuristik, sports broadcast, dll.)
3. Hierarki Teks & Konten:
   - Teks atas / badge / kategori (badgeText): ...
   - Judul utama / konten utama (titleText): ...
   - Sub-judul / teks sekunder (subtitleText): ...
   - Teks akhir / penutup (jika ada): ...
4. Signature Ornamen & Aksen:
   Elemen visual apa yang membingkai atau bergerak? (Contoh: Panah chevron SVG, framing brackets, speed lines, corner cuts, glow, dll.)
5. Skema Warna & Durasi:
   - Warna aksen utama, sekunder, dan background.
   - Durasi video (Default: 15 detik / 450 frames, 30 FPS, 4K).

Tunggu jawaban user. Jika jawaban user masih terlalu umum, berikan 1–2 rekomendasi kreatif.

==================================================
FASE 2: KONFIRMASI RANCANGAN
==================================================
Setelah user memberikan detail, sajikan rangkuman konsep visual singkat beserta pembagian timeline per detiknya. Tanyakan:
"Apakah alur visual dan spesifikasi ini sudah sesuai, atau ada bagian yang ingin disesuaikan sebelum prompt eksekusi kodenya dibuat?"

==================================================
FASE 3: GENERASI MASTER PROMPT EKSEKUSI KODE
==================================================
Setelah user setuju, buatlah SATU PROMPT EKSEKUSI KODE LENGKAP di dalam blok markdown (\`\`\`markdown ... \`\`\`) dengan struktur berikut:

1. IDENTITAS & BRIEF LENGKAP:
   - Judul Video & Component Alias.
   - On-screen label, teks utama, teks final.
   - Durasi, FPS, resolusi (3840 × 2160), alpha channel / transparent background.
   - Breakdown timeline per frame dari Frame 0 hingga akhir.

2. ATURAN WAJIB STRUKTUR KODE:
   - Universal Dynamic Timeline (Semua Durasi: 5s, 10s, 15s, 20s): DILARANG MENGGUNAKAN ANGKA FRAME STATIS / HARDCODED (seperti [0, 60] atau [0, 150]). SEMUA fase timeline WAJIB dihitung dari persentase 'durationInFrames' (useVideoConfig()): Intro [0, Math.floor(durationInFrames * 0.2)], Main Action [Math.floor(durationInFrames * 0.2), Math.floor(durationInFrames * 0.8)], Ending [Math.floor(durationInFrames * 0.8), durationInFrames].
   - Never-Freeze Engine (Micro-Motion Berkelanjutan): Elemen visual TIDAK BOLEH berhenti bergerak total di detik mana pun. Wajib ada gerakan matematis berkelanjutan (floating Math.sin(frame / 15), breathing glow, camera zoom 1.0 -> 1.04).
   - Frame 0 Visibility: Artwork awal SUDAH TERLIHAT (opacity 0.88–0.95 -> 1.0, dilarang blank/hitam).
   - Scaling Dinamis: Wajib \`baseScale = Math.min(width, height) / 1080\` pada semua font, margin, padding, SVG dimensions, dan coordinate offsets.
   - Readability: Teks wajib memiliki text-shadow / outline kontras tinggi agar terbaca di footage terang maupun gelap.
   - Anti-overlap: Elemen samping/ornamen membuka ruang jika teks membesar atau berganti.
   - Standar Parameter Visual: Komponen wajib menerapkan props scale, textOffsetX, textOffsetY, dan glowIntensity ke style wrapper utama atau elemen terkait secara proporsional.

3. BLUEPRINT KODE ACUAN (WAJIB DISEDIAKAN DI DALAM PROMPT):
   AI pembuat kode WAJIB mengikuti struktur file, arsitektur props, helper math, dan pola export persis seperti referensi berikut:

\`\`\`tsx
import React from 'react'
import { useCurrentFrame, interpolate, useVideoConfig, Img } from 'remotion'

export interface VibeGraphicProps {
  // Teks
  titleText?: string    // Judul Utama
  subtitleText?: string // Sub-judul / Informasi Sekunder
  badgeText?: string    // Label Atas / Kategori
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
}

export const VibeGraphic: React.FC<VibeGraphicProps> = ({
  titleText = 'LABEL TEXT',
  subtitleText = 'SUBTITLE / SECONDARY INFO',
  badgeText = 'BADGE',
  accentColor = '#00f2fe',
  secondaryColor = '#ff0055',
  backgroundColor = '#060913',
  isTransparent = true,
  scale = 1,
  textOffsetX = 0,
  textOffsetY = 0,
  glowIntensity = 15,
  speedMultiplier = 1
}) => {
  const rawFrame = useCurrentFrame()
  const frame = rawFrame * speedMultiplier
  const { width, height, durationInFrames = 150 } = useVideoConfig()
  const minDim = Math.min(width, height)
  const baseScale = minDim / 1080

  // Universal Dynamic Timeline (All Durations 5s, 10s, 15s, 20s)
  const introEnd = Math.floor(durationInFrames * 0.2)
  const actionEnd = Math.floor(durationInFrames * 0.8)

  // Anti-Freeze Continuous Micro-Motions (Frame 0 to End)
  const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.04], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const floatY = Math.sin(frame / 15) * (6 * baseScale)
  const breathingGlow = 0.4 + Math.sin(frame / 20) * 0.2

  // Frame 0 Safe
  const introOpacity = interpolate(frame, [0, 15], [0.88, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const introScale = interpolate(frame, [0, 15], [0.96, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: isTransparent ? 'transparent' : backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Orbitron, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: introOpacity,
          transform: \`scale(\${introScale * scale}) translate(\${textOffsetX}px, \${textOffsetY}px)\`,
          filter: \`drop-shadow(0 0 \${glowIntensity * baseScale}px \${accentColor}44)\`
        }}
      >
        {/* Konten teks, SVG ornamen, dan grafis dinamis diletakkan di sini */}
      </div>
    </div>
  )
}

export const [ComponentAlias] = VibeGraphic
export default VibeGraphic
export const DynamicMotion = VibeGraphic
export type DynamicMotionProps = VibeGraphicProps
\`\`\``

// ──────────────────────────────────────────────────────────────────────────────
// TSX Default Props Parser — extracts default prop values from component
// destructuring parameters. Handles single quotes, double quotes, and template
export interface ParsedTsxProps {
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
}

function parseTsxDefaultProps(code: string): ParsedTsxProps {
  const result: ParsedTsxProps = {}

  // 1. String props
  const stringTargets = [
    'titleText',
    'subtitleText',
    'badgeText',
    'accentColor',
    'secondaryColor',
    'backgroundColor'
  ] as const

  const singleQ = `'((?:[^'\\\\]|\\\\.)*)'`
  const doubleQ = `"((?:[^"\\\\]|\\\\.)*)"`
  const templateL = `\`((?:[^\`\\\\]|\\\\.)*)\``

  for (const prop of stringTargets) {
    const regex = new RegExp(
      `${prop}\\s*=\\s*(?:${singleQ}|${doubleQ}|${templateL})`,
      'im'
    )
    const match = code.match(regex)
    if (match) {
      const rawValue = (match[1] ?? match[2] ?? match[3] ?? '').trim()
      result[prop] = rawValue
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
    }
  }

  // 2. Boolean props
  const boolMatch = code.match(/isTransparent\s*=\s*(true|false)/i)
  if (boolMatch) {
    result.isTransparent = boolMatch[1].toLowerCase() === 'true'
  }

  // 3. Numerical props (scale, offsets, glow, speed)
  const numberTargets = [
    'scale',
    'offsetX',
    'offsetY',
    'textOffsetX',
    'textOffsetY',
    'glowIntensity',
    'speedMultiplier'
  ] as const

  for (const prop of numberTargets) {
    const regex = new RegExp(`${prop}\\s*=\\s*(-?\\d+(?:\\.\\d+)?)`, 'im')
    const match = code.match(regex)
    if (match && match[1]) {
      const numVal = parseFloat(match[1])
      if (!isNaN(numVal)) {
        result[prop] = numVal
      }
    }
  }

  return result
}

// Compute canvas resolution based on Aspect Ratio and Quality
const getDimensions = (
  ratio: AspectRatioType,
  quality: ResolutionQualityType
): { width: number; height: number } => {
  if (ratio === '16:9') {
    switch (quality) {
      case '4k':
        return { width: 3840, height: 2160 }
      case '2k':
        return { width: 2560, height: 1440 }
      case '1080p':
      default:
        return { width: 1920, height: 1080 }
    }
  } else {
    // 9:16 Vertical
    switch (quality) {
      case '4k':
        return { width: 2160, height: 3840 }
      case '2k':
      case '1080p':
      default:
        return { width: 1080, height: 1920 }
    }
  }
}

// Timeout Guard to prevent Electron renderer from hanging or becoming unresponsive
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(errorMessage))
    }, timeoutMs)
  })

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer)
      return res
    }),
    timeoutPromise
  ])
}

// Clean and strip markdown code fences and extraneous text from AI generated code
export function cleanAndStripMarkdownCode(raw: string): string {
  let cleaned = (raw || '').trim()
  const fenceMatch = cleaned.match(/```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)```/i)
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim()
  } else {
    cleaned = cleaned.replace(/^```(?:tsx|typescript|jsx|javascript)?\s*/i, '')
    cleaned = cleaned.replace(/\s*```+\s*$/i, '')
    cleaned = cleaned.trim()
  }
  const importIdx = cleaned.indexOf('import ')
  if (importIdx > 0) {
    cleaned = cleaned.slice(importIdx).trim()
  }
  cleaned = cleaned.replace(/```+\s*$/g, '').trim()
  return cleaned
}

// Remotion Error Boundary to catch runtime exceptions in pasted TSX code
interface ErrorBoundaryProps {
  children: React.ReactNode
  onManualFix?: (error: Error) => void
  onUseFallback?: () => void
  isHealing?: boolean
  resetKey?: string | number
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class RemotionErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[RemotionErrorBoundary] Runtime error caught in Player:', error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="remotion-error-boundary-box">
          <div className="error-badge">⚠️ TSX RUNTIME EXCEPTION</div>
          <p className="error-msg">{this.state.error.message}</p>
          <p className="error-subtext">
            Terjadi runtime error pada komponen animasi. Silakan periksa sintaks kode TSX Anda atau
            klik Reset untuk memuat kembali template standar.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-error-retry"
              onClick={this.handleRetry}
              disabled={this.props.isHealing}
            >
              🔄 Coba Muat Ulang
            </button>
            {this.props.onUseFallback && (
              <button
                type="button"
                className="btn-error-fallback"
                onClick={this.props.onUseFallback}
                disabled={this.props.isHealing}
              >
                ⚡ Reset Template Standar
              </button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Helper to access electronAPI safely in dev / web preview
function getElectronAPI(): typeof window.electronAPI | undefined {
  return window.electronAPI ?? (window as unknown as { api?: typeof window.electronAPI }).api
}

// Persistent Storage Configuration for Video Settings & Export Directory
interface SavedVideoSettings {
  aspectRatio?: AspectRatioType
  resolutionQuality?: ResolutionQualityType
  durationSeconds?: DurationSecondsType
  fps?: number
  exportFormat?: 'mp4' | 'prores4444'
  isTransparent?: boolean
  customOutputFolder?: string
  titleText?: string
  subtitleText?: string
  badgeText?: string
  accentColor?: string
  secondaryColor?: string
  backgroundColor?: string
  scale?: number
  textOffsetX?: number
  textOffsetY?: number
  glowIntensity?: number
  speedMultiplier?: number
}

export interface ParametricValues {
  titleText: string
  subtitleText: string
  badgeText: string
  accentColor: string
  secondaryColor: string
  backgroundColor: string
  isTransparent: boolean
  scale: number
  textOffsetX: number
  textOffsetY: number
  glowIntensity: number
  speedMultiplier: number
}

const STORAGE_KEY_VIDEO_SETTINGS = 'ms_video_settings'
const STORAGE_KEY_EXPORT_FOLDER = 'ms_export_folder'
const STORAGE_KEY_GEMINI_API_KEY = 'gemini_api_key'
const STORAGE_KEY_RESOLUTION = 'ms_resolution_quality'
const STORAGE_KEY_FORMAT = 'ms_export_format'
const STORAGE_KEY_ASPECT_RATIO = 'ms_aspect_ratio'

const loadSavedVideoSettings = (): Partial<SavedVideoSettings> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VIDEO_SETTINGS)
    if (raw) {
      const upper = raw.toUpperCase()
      // Automatic purge of legacy countdown or VERSUS templates
      if (
        upper.includes('VERSUS') ||
        upper.includes('COUNTDOWN') ||
        upper.includes('CHAMPIONSHIP')
      ) {
        console.warn('[App] Legacy template cache detected in localStorage, purging and resetting to Motion Suite Pro branding...')
        localStorage.removeItem(STORAGE_KEY_VIDEO_SETTINGS)
        return {}
      }
      return JSON.parse(raw)
    }
  } catch (e) {
    console.warn('[App] Failed to parse saved video settings from localStorage:', e)
  }
  return {}
}

// Native Web Audio API 2-Tone Success Chime ("ting-ting!")
const playRenderFinishedChime = (): void => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const playTone = (freq: number, startDelay: number, duration: number): void => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      const startTime = ctx.currentTime + startDelay
      osc.frequency.setValueAtTime(freq, startTime)

      // Smooth attack and pleasant exponential decay
      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.exponentialRampToValueAtTime(0.24, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    // Tone 1: C6 (1046.50 Hz)
    playTone(1046.5, 0, 0.3)
    // Tone 2: G6 (1567.98 Hz)
    playTone(1567.98, 0.15, 0.45)
  } catch (err) {
    console.warn('[Audio] Failed to play render success chime:', err)
  }
}

export function App(): React.JSX.Element {
  // Active Navigation Tab State (4 Tabs Architecture)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'template' | 'autocoder'>('preview')

  // Dynamic App Version from package.json via app.getVersion()
  const [appVersion, setAppVersion] = useState<string>('PRO v1.0.4')

  useEffect(() => {
    let isMounted = true
    const fetchAppVersion = async (): Promise<void> => {
      try {
        const api = getElectronAPI()
        const ver = await (
          api?.getAppVersion?.() ||
          (window as any).electron?.ipcRenderer?.invoke('get-app-version')
        )
        if (ver && isMounted) {
          const cleanVer = ver.startsWith('v') ? ver : `v${ver}`
          setAppVersion(`PRO ${cleanVer}`)
        }
      } catch (err) {
        console.warn('[App] Gagal memuat versi aplikasi:', err)
      }
    }
    fetchAppVersion()
    return () => {
      isMounted = false
    }
  }, [])

  // Video Dimension, Framerate & Duration States (restored from localStorage with dedicated keys)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(() => {
    const direct = localStorage.getItem(STORAGE_KEY_ASPECT_RATIO) as AspectRatioType | null
    if (direct === '9:16' || direct === '16:9') return direct
    const saved = loadSavedVideoSettings()
    return saved.aspectRatio === '9:16' ? '9:16' : '16:9'
  })
  const [resolutionQuality, setResolutionQuality] = useState<ResolutionQualityType>(() => {
    const direct = localStorage.getItem(STORAGE_KEY_RESOLUTION) as ResolutionQualityType | null
    if (direct === '1080p' || direct === '2k' || direct === '4k') return direct
    const saved = loadSavedVideoSettings()
    return saved.resolutionQuality || '1080p'
  })
  const [durationSeconds, setDurationSeconds] = useState<DurationSecondsType>(() => {
    const saved = loadSavedVideoSettings()
    return saved.durationSeconds || 5
  })
  const [fps, setFps] = useState<number>(() => {
    const saved = loadSavedVideoSettings()
    return typeof saved.fps === 'number' ? saved.fps : 30
  })

  // Local Video Rendering & Transparency States (restored from localStorage with dedicated keys)
  const [exportFormat, setExportFormat] = useState<'mp4' | 'prores4444'>(() => {
    const direct = localStorage.getItem(STORAGE_KEY_FORMAT) as ('mp4' | 'prores4444') | null
    if (direct === 'mp4' || direct === 'prores4444') return direct
    const saved = loadSavedVideoSettings()
    return saved.exportFormat === 'prores4444' ? 'prores4444' : 'mp4'
  })
  const [isTransparent, setIsTransparent] = useState<boolean>(() => {
    const saved = loadSavedVideoSettings()
    return saved.exportFormat === 'prores4444' ? Boolean(saved.isTransparent) : false
  })

  const { width, height } = getDimensions(aspectRatio, resolutionQuality)
  const durationInFrames = durationSeconds * fps

  // Parametric Control Panel States (Quick Parameter Tweaker & Visual Inspector)
  const [paramTitleText, setParamTitleText] = useState<string>(() => {
    const saved = loadSavedVideoSettings()
    return saved.titleText || 'MOTION SUITE PRO'
  })
  const [paramSubtitleText, setParamSubtitleText] = useState<string>(() => {
    const saved = loadSavedVideoSettings()
    return saved.subtitleText || 'AI Creative Motion Graphics Workstation'
  })
  const [paramBadgeText, setParamBadgeText] = useState<string>(() => {
    const saved = loadSavedVideoSettings()
    return saved.badgeText || 'OFFICIAL RELEASE v1.0'
  })
  const [paramAccentColor, setParamAccentColor] = useState<string>(() => {
    const saved = loadSavedVideoSettings()
    return saved.accentColor || '#00f2fe'
  })
  const [paramSecondaryColor, setParamSecondaryColor] = useState<string>(() => {
    const saved = loadSavedVideoSettings()
    return saved.secondaryColor || '#7928ca'
  })
  const [paramBackgroundColor, setParamBackgroundColor] = useState<string>(() => {
    const saved = loadSavedVideoSettings()
    return saved.backgroundColor || '#0a0d14'
  })
  const [paramScale, setParamScale] = useState<number>(() => {
    const saved = loadSavedVideoSettings()
    return typeof saved.scale === 'number' ? saved.scale : 1
  })
  const [textOffsetX, setTextOffsetX] = useState<number>(() => {
    const saved = loadSavedVideoSettings()
    return typeof saved.textOffsetX === 'number' ? saved.textOffsetX : 0
  })
  const [textOffsetY, setTextOffsetY] = useState<number>(() => {
    const saved = loadSavedVideoSettings()
    return typeof saved.textOffsetY === 'number' ? saved.textOffsetY : 0
  })
  const [paramGlowIntensity, setParamGlowIntensity] = useState<number>(() => {
    const saved = loadSavedVideoSettings()
    return typeof saved.glowIntensity === 'number' ? saved.glowIntensity : 15
  })
  const [paramSpeedMultiplier, setParamSpeedMultiplier] = useState<number>(() => {
    const saved = loadSavedVideoSettings()
    return typeof saved.speedMultiplier === 'number' ? saved.speedMultiplier : 1
  })
  const [isParamTweakerOpen, setIsParamTweakerOpen] = useState<boolean>(false)

  // Snapshot Nilai Asli (Initial State) for Revert functionality
  const [initialParamSnapshot, setInitialParamSnapshot] = useState<ParametricValues>(() => {
    const saved = loadSavedVideoSettings()
    return {
      titleText: saved.titleText || 'MOTION SUITE PRO',
      subtitleText: saved.subtitleText || 'AI Creative Motion Graphics Workstation',
      badgeText: saved.badgeText || 'OFFICIAL RELEASE v1.0',
      accentColor: saved.accentColor || '#00f2fe',
      secondaryColor: saved.secondaryColor || '#7928ca',
      backgroundColor: saved.backgroundColor || '#0a0d14',
      isTransparent: Boolean(saved.exportFormat === 'prores4444' && saved.isTransparent),
      scale: typeof saved.scale === 'number' ? saved.scale : 1,
      textOffsetX: typeof saved.textOffsetX === 'number' ? saved.textOffsetX : 0,
      textOffsetY: typeof saved.textOffsetY === 'number' ? saved.textOffsetY : 0,
      glowIntensity: typeof saved.glowIntensity === 'number' ? saved.glowIntensity : 15,
      speedMultiplier: typeof saved.speedMultiplier === 'number' ? saved.speedMultiplier : 1
    }
  })

  // Undo History Stack (Max 20 steps)
  const [undoStack, setUndoStack] = useState<ParametricValues[]>([])

  const getCurrentParametricValues = (): ParametricValues => ({
    titleText: paramTitleText,
    subtitleText: paramSubtitleText,
    badgeText: paramBadgeText,
    accentColor: paramAccentColor,
    secondaryColor: paramSecondaryColor,
    backgroundColor: paramBackgroundColor,
    isTransparent,
    scale: paramScale,
    textOffsetX,
    textOffsetY,
    glowIntensity: paramGlowIntensity,
    speedMultiplier: paramSpeedMultiplier
  })

  const handleSnapshotBeforeChange = (): void => {
    const current = getCurrentParametricValues()
    setUndoStack((prev) => {
      const last = prev[prev.length - 1]
      if (last && JSON.stringify(last) === JSON.stringify(current)) return prev
      const next = [...prev, current]
      return next.length > 20 ? next.slice(next.length - 20) : next
    })
  }

  // Immediate IPC flush & batch setter for Revert and Undo
  const applyParametricValues = (values: ParametricValues, immediateFlush = true): void => {
    setParamTitleText(values.titleText)
    setParamSubtitleText(values.subtitleText)
    setParamBadgeText(values.badgeText)
    setParamAccentColor(values.accentColor)
    setParamSecondaryColor(values.secondaryColor)
    setParamBackgroundColor(values.backgroundColor)
    setIsTransparent(values.isTransparent)
    if (values.isTransparent && exportFormat === 'mp4') {
      setExportFormat('prores4444')
    }
    setParamScale(values.scale)
    setTextOffsetX(values.textOffsetX)
    setTextOffsetY(values.textOffsetY)
    setParamGlowIntensity(values.glowIntensity)
    setParamSpeedMultiplier(values.speedMultiplier)

    if (immediateFlush) {
      const api = getElectronAPI()
      if (api?.updateVideoConfig) {
        api
          .updateVideoConfig({
            width,
            height,
            fps,
            durationInFrames,
            titleText: values.titleText,
            subtitleText: values.subtitleText,
            badgeText: values.badgeText,
            accentColor: values.accentColor,
            secondaryColor: values.secondaryColor,
            backgroundColor: values.backgroundColor,
            isTransparent: values.isTransparent,
            scale: values.scale,
            offsetX: values.textOffsetX,
            offsetY: values.textOffsetY,
            textOffsetX: values.textOffsetX,
            textOffsetY: values.textOffsetY,
            glowIntensity: values.glowIntensity,
            speedMultiplier: values.speedMultiplier
          })
          .catch((err) => console.warn('[App] Immediate updateVideoConfig error:', err))
      }
    }
  }

  // Batch sync parsed TSX props to visual tweaker states & initial snapshot
  const syncParsedPropsToState = (parsed: ParsedTsxProps): void => {
    if (parsed.titleText !== undefined) setParamTitleText(parsed.titleText)
    if (parsed.subtitleText !== undefined) setParamSubtitleText(parsed.subtitleText)
    if (parsed.badgeText !== undefined) setParamBadgeText(parsed.badgeText)
    if (parsed.accentColor !== undefined) setParamAccentColor(parsed.accentColor)
    if (parsed.secondaryColor !== undefined) setParamSecondaryColor(parsed.secondaryColor)
    if (parsed.backgroundColor !== undefined) setParamBackgroundColor(parsed.backgroundColor)
    if (parsed.isTransparent !== undefined) {
      setIsTransparent(parsed.isTransparent)
      if (parsed.isTransparent && exportFormat === 'mp4') {
        setExportFormat('prores4444')
      }
    }
    if (parsed.scale !== undefined) setParamScale(parsed.scale)
    const effectiveOffsetX = parsed.offsetX ?? parsed.textOffsetX
    if (effectiveOffsetX !== undefined) setTextOffsetX(effectiveOffsetX)
    const effectiveOffsetY = parsed.offsetY ?? parsed.textOffsetY
    if (effectiveOffsetY !== undefined) setTextOffsetY(effectiveOffsetY)
    if (parsed.glowIntensity !== undefined) setParamGlowIntensity(parsed.glowIntensity)
    if (parsed.speedMultiplier !== undefined) setParamSpeedMultiplier(parsed.speedMultiplier)

    setInitialParamSnapshot((prev) => ({
      titleText: parsed.titleText ?? prev.titleText,
      subtitleText: parsed.subtitleText ?? prev.subtitleText,
      badgeText: parsed.badgeText ?? prev.badgeText,
      accentColor: parsed.accentColor ?? prev.accentColor,
      secondaryColor: parsed.secondaryColor ?? prev.secondaryColor,
      backgroundColor: parsed.backgroundColor ?? prev.backgroundColor,
      isTransparent: parsed.isTransparent ?? prev.isTransparent,
      scale: parsed.scale ?? prev.scale,
      textOffsetX: effectiveOffsetX ?? prev.textOffsetX,
      textOffsetY: effectiveOffsetY ?? prev.textOffsetY,
      glowIntensity: parsed.glowIntensity ?? prev.glowIntensity,
      speedMultiplier: parsed.speedMultiplier ?? prev.speedMultiplier
    }))
  }

  const handleUndo = (): void => {
    if (undoStack.length === 0) return
    const prevSnapshot = undoStack[undoStack.length - 1]
    setUndoStack((prev) => prev.slice(0, prev.length - 1))
    applyParametricValues(prevSnapshot, true)
    setCodeEditorStatus('Perubahan terakhir dibatalkan (Undo ↶)')
    setTimeout(() => {
      setCodeEditorStatus((c) => (c.startsWith('Perubahan terakhir dibatalkan') ? '' : c))
    }, 2500)
  }

  const handleRevert = (): void => {
    if (!initialParamSnapshot) return
    const current = getCurrentParametricValues()
    setUndoStack((prev) => {
      const next = [...prev, current]
      return next.length > 20 ? next.slice(next.length - 20) : next
    })
    applyParametricValues(initialParamSnapshot, true)
    setCodeEditorStatus('Parameter berhasil dikembalikan ke nilai awal (↺ Revert)')
    setTimeout(() => {
      setCodeEditorStatus((c) => (c.startsWith('Parameter berhasil') ? '' : c))
    }, 3000)
  }

  // Live Code Editor & Motion Lifecycle States (restored from localStorage if available)
  const STORAGE_KEY_LAST_ACTIVE_CODE = 'motion_suite_last_active_code'
  const [manualCode, setManualCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAST_ACTIVE_CODE)
      if (saved && saved.trim()) return saved
    } catch {
      // ignore
    }
    return ''
  })
  const [isApplyingCode, setIsApplyingCode] = useState<boolean>(false)
  const [codeEditorStatus, setCodeEditorStatus] = useState<string>('')

  // Auto-Save active animation code to localStorage on state changes
  useEffect(() => {
    if (manualCode && manualCode.trim()) {
      try {
        localStorage.setItem(STORAGE_KEY_LAST_ACTIVE_CODE, manualCode)
      } catch (err) {
        console.warn('[App] Gagal auto-save kode ke localStorage:', err)
      }
    }
  }, [manualCode])

  // Self-Healing, Auto-Fix & Safe Rollback History States
  const [lastWorkingCode, setLastWorkingCode] = useState<string>('')
  const [capturedError, setCapturedError] = useState<string>('')
  const [isAutoFixing, setIsAutoFixing] = useState<boolean>(false)
  const [isAutoFixModalOpen, setIsAutoFixModalOpen] = useState<boolean>(false)
  const [autoFixErrorInput, setAutoFixErrorInput] = useState<string>('')
  const [autoFixMode, setAutoFixMode] = useState<'runtime_error' | 'visual_recovery'>('runtime_error')
  const [showManualErrorInput, setShowManualErrorInput] = useState<boolean>(false)
  const [rollbackToast, setRollbackToast] = useState<string>('')

  // ── Auto-Updater States (OBS Studio Style Modal) ──────────────────────────
  type UpdatePhase = 'idle' | 'available' | 'downloading' | 'downloaded'
  const [updatePhase, setUpdatePhase] = useState<UpdatePhase>('idle')
  const [updateVersion, setUpdateVersion] = useState<string>('')
  const [updateReleaseNotes, setUpdateReleaseNotes] = useState<string>('')
  const [updatePercent, setUpdatePercent] = useState<number>(0)
  const [updateErrorMsg, setUpdateErrorMsg] = useState<string>('')
  const [isUpdateDismissed, setIsUpdateDismissed] = useState<boolean>(false)

  // Synchronize video configuration with remotion_env/src/video_config.json (debounced 120ms for smooth slider performance)
  useEffect(() => {
    const timer = setTimeout(() => {
      const api = getElectronAPI()
      if (api?.updateVideoConfig) {
        api
          .updateVideoConfig({
            width,
            height,
            fps,
            durationInFrames,
            titleText: paramTitleText,
            subtitleText: paramSubtitleText,
            badgeText: paramBadgeText,
            accentColor: paramAccentColor,
            secondaryColor: paramSecondaryColor,
            backgroundColor: paramBackgroundColor,
            isTransparent,
            scale: paramScale,
            offsetX: textOffsetX,
            offsetY: textOffsetY,
            textOffsetX,
            textOffsetY,
            glowIntensity: paramGlowIntensity,
            speedMultiplier: paramSpeedMultiplier
          })
          .catch((err) => {
            console.warn('[App] updateVideoConfig error:', err)
          })
      }
    }, 120)

    return () => clearTimeout(timer)
  }, [
    width,
    height,
    fps,
    durationInFrames,
    paramTitleText,
    paramSubtitleText,
    paramBadgeText,
    paramAccentColor,
    paramSecondaryColor,
    paramBackgroundColor,
    isTransparent,
    paramScale,
    textOffsetX,
    textOffsetY,
    paramGlowIntensity,
    paramSpeedMultiplier
  ])

  const handleResetTransform = (): void => {
    handleSnapshotBeforeChange()
    setTextOffsetX(0)
    setTextOffsetY(0)
    setParamScale(1)
    const api = getElectronAPI()
    if (api?.updateVideoConfig) {
      api.updateVideoConfig({ textOffsetX: 0, textOffsetY: 0, offsetX: 0, offsetY: 0, scale: 1 }).catch(() => {})
    }
  }


  // ── Auto-Updater: Subscribe to IPC events from main process ───────────────
  useEffect(() => {
    const api = (window as any).api || (window as any).electronAPI
    if (!api?.onUpdateAvailable) return

    const unsubAvailable = api.onUpdateAvailable((info: any) => {
      if (info?.version) {
        setUpdateVersion(info.version)
      }
      let notes = ''
      if (Array.isArray(info?.releaseNotes)) {
        notes = info.releaseNotes
          .map((n: any) => (typeof n === 'string' ? n : n?.note || ''))
          .filter(Boolean)
          .join('\n')
      } else if (typeof info?.releaseNotes === 'string') {
        notes = info.releaseNotes
      }
      setUpdateReleaseNotes(notes || 'Pembaruan stabilitas dan peningkatan performa sistem.')
      setUpdatePhase('available')
      setUpdateErrorMsg('')
      setIsUpdateDismissed(false)
    })
    const unsubProgress = api.onUpdateProgress?.((data: { percent: number }) => {
      setUpdatePercent(data.percent)
      setUpdatePhase('downloading')
      setUpdateErrorMsg('')
    })
    const unsubDownloaded = api.onUpdateDownloaded?.((info?: { version: string }) => {
      if (info?.version) {
        setUpdateVersion(info.version)
      }
      setUpdatePhase('downloaded')
      setUpdatePercent(100)
      setUpdateErrorMsg('')
    })
    const unsubError = api.onUpdateError?.((err: { message: string }) => {
      console.warn('[AutoUpdater] Error event received:', err)
      setUpdateErrorMsg(err?.message || 'Terjadi kesalahan saat mengunduh pembaruan.')
    })

    return () => {
      unsubAvailable?.()
      unsubProgress?.()
      unsubDownloaded?.()
      unsubError?.()
    }
  }, [])

  const handleStartUpdateDownload = async (): Promise<void> => {
    const api = (window as any).api || (window as any).electronAPI
    setUpdatePhase('downloading')
    setUpdatePercent(0)
    setUpdateErrorMsg('')
    try {
      if (api?.startDownloadUpdate) {
        const res = await api.startDownloadUpdate()
        if (!res?.success && res?.error) {
          setUpdateErrorMsg(res.error)
        }
      } else if (api?.startUpdateDownload) {
        const res = await api.startUpdateDownload()
        if (!res?.success && res?.error) {
          setUpdateErrorMsg(res.error)
        }
      } else if ((window as any).electron?.ipcRenderer?.invoke) {
        const res = await (window as any).electron.ipcRenderer.invoke('start-download-update')
        if (!res?.success && res?.error) {
          setUpdateErrorMsg(res.error)
        }
      }
    } catch (err: any) {
      setUpdateErrorMsg(err?.message || 'Gagal memulai unduhan pembaruan.')
    }
  }

  const handleRestartAndInstall = (): void => {
    const api = (window as any).api || (window as any).electronAPI
    if (api?.restartAndInstall) {
      api.restartAndInstall()
    } else if (api?.installAndRestart) {
      api.installAndRestart()
    } else if ((window as any).electron?.ipcRenderer?.invoke) {
      ;(window as any).electron.ipcRenderer.invoke('restart-app-for-update')
    }
  }

  // Remotion Studio Server & Preview States (Port 10871)
  const [isStudioRunning, setIsStudioRunning] = useState<boolean>(false)
  const [isStudioStarting, setIsStudioStarting] = useState<boolean>(true)
  const [hasGeneratedContent, setHasGeneratedContent] = useState<boolean>(false)
  const [studioPort] = useState<number>(10871)
  const [iframeKey, setIframeKey] = useState<number>(0)
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false)
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null)

  // Clean Remotion Studio developer menu bars & raw render buttons inside the preview iframe
  const injectStudioCleanStyles = React.useCallback((iframeElement?: HTMLIFrameElement | null): void => {
    const iframe = iframeElement || iframeRef.current
    if (!iframe) return
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (!doc || !doc.head) return

      let styleTag = doc.getElementById('motion-studio-clean-theme') as HTMLStyleElement | null
      if (!styleTag) {
        styleTag = doc.createElement('style')
        styleTag.id = 'motion-studio-clean-theme'
        doc.head.appendChild(styleTag)
      }

      styleTag.textContent = `
        /* Hide Remotion Studio raw developer header and menu bar */
        header,
        nav,
        [role="banner"],
        [data-testid="top-bar"],
        [data-testid="menu-bar"],
        [data-testid="header"],
        [data-testid="breadcrumbs"],
        div[role="menubar"],
        div[class*="TopBar"],
        div[class*="MenuBar"],
        div[class*="HeaderBar"],
        div[class*="top-bar"],
        div[class*="menu-bar"],
        div[class*="Breadcrumbs"],
        div[class*="breadcrumbs"] {
          display: none !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          overflow: hidden !important;
        }

        /* Hide Remotion Studio top developer menu and internal render button */
        [data-testid="render-button"],
        [data-testid="render-button-container"],
        button[data-testid="render-button"],
        button[title*="Render"],
        button[aria-label*="Render"],
        button[title*="render"],
        button[aria-label*="render"],
        div[class*="RenderButton"],
        div[data-testid="render-modal-opener"],
        a[href*="/render"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        html, body {
          overflow: hidden !important;
          background-color: #000000 !important;
        }
      `
    } catch (err) {
      console.warn('[StudioPreview] Clean theme injection note:', err)
    }
  }, [])

  const handleIframeElementLoad = (e: React.SyntheticEvent<HTMLIFrameElement>): void => {
    const el = e.currentTarget
    injectStudioCleanStyles(el)

    // Safely attempt to listen for runtime error events inside iframe if window is accessible
    try {
      const win = el.contentWindow
      if (win) {
        win.addEventListener('error', (event) => {
          if (event && event.message) {
            console.warn('[Studio Iframe Error Event]:', event.message)
            setCapturedError(String(event.message))
          }
        })
        win.addEventListener('unhandledrejection', (event) => {
          if (event && event.reason) {
            const reasonStr = event.reason?.message || String(event.reason)
            console.warn('[Studio Iframe Unhandled Rejection]:', reasonStr)
            setCapturedError(reasonStr)
          }
        })
      }
    } catch {
      // Cross-origin access safely protected
    }

    let count = 0
    const timer = setInterval(() => {
      count++
      injectStudioCleanStyles(el)
      try {
        const doc = el.contentDocument || el.contentWindow?.document
        if (doc) {
          const playBtn = doc.querySelector<HTMLButtonElement>(
            'button[aria-label="Play"], button[title="Play"], button[data-testid="play-pause-button"]'
          )
          if (playBtn) {
            playBtn.click()
          }
        }
      } catch {
        // cross-origin protection safely suppressed
      }
      if (count >= 20) clearInterval(timer)
    }, 300)
  }

  // Listen for Remotion Studio stderr / runtime errors via IPC Backend (Zero Cross-Origin Risk)
  useEffect(() => {
    const api = getElectronAPI()
    if (!api?.onStudioError) return
    const unsubscribe = api.onStudioError((err: string) => {
      if (!err || !err.trim()) return
      const cleanErr = err.trim()
      console.warn('[App] Remotion Studio runtime error captured via IPC:', cleanErr)
      setCapturedError(cleanErr)
    })
    return (): void => {
      unsubscribe()
    }
  }, [])

  // Silent auto-start Motion Engine background child process on mount
  useEffect(() => {
    let isMounted = true
    const bootEngine = async (): Promise<void> => {
      try {
        const api = getElectronAPI()
        if (api?.startStudioServer) {
          const res = await api.startStudioServer(studioPort)
          if (isMounted && res.success) {
            setIsStudioRunning(true)
            setIframeKey((k) => k + 1)
          }
        }
      } catch (err) {
        console.warn('[App] Silent boot error:', err)
      } finally {
        if (isMounted) {
          setIsStudioStarting(false)
        }
      }
    }
    bootEngine()
    return () => {
      isMounted = false
    }
  }, [studioPort])

  // Continuously ensure clean styles are injected while Studio server is active
  useEffect(() => {
    if (isStudioRunning) {
      let count = 0
      const timer = setInterval(() => {
        count++
        injectStudioCleanStyles()
        if (count >= 15) clearInterval(timer)
      }, 400)
      return (): void => clearInterval(timer)
    }
    return undefined
  }, [isStudioRunning, iframeKey, injectStudioCleanStyles])

  // Listen for Escape key to exit Fullscreen Preview mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isFullscreenPreview) {
        setIsFullscreenPreview(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return (): void => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreenPreview])

  const handleRefreshStudio = (): void => {
    // ── Auto-sync Visual Tweaker from current active code ──
    if (manualCode.trim()) {
      const parsed = parseTsxDefaultProps(manualCode)
      syncParsedPropsToState(parsed)
    }
    setIframeKey((k) => k + 1)
    setCodeEditorStatus('Kanvas Motion Engine dimuat ulang.')
  }

  // Intelligent Health-Check Polling: HTTP GET to 127.0.0.1:10871, requiring HTTP 200 with 3x retry tolerance
  // Toleransi booting: jika isStudioStarting aktif, tidak akan pernah set status ke Offline.
  // Hanya set Offline jika sudah 12 detik berturut-turut gagal DAN server tidak sedang booting.
  useEffect(() => {
    let isMounted = true
    let consecutiveFailures = 0
    let offlineTimestamp: number | null = null
    const OFFLINE_GRACE_MS = 12000 // 12 detik toleransi sebelum deklarasi Offline

    const checkServer = async (): Promise<void> => {
      try {
        let isOnline = false
        try {
          const res = await fetch(`http://127.0.0.1:${studioPort}`, {
            method: 'GET',
            cache: 'no-store',
            signal: AbortSignal.timeout(1500)
          })
          isOnline = res.status === 200
        } catch {
          isOnline = false
        }

        if (!isMounted) return

        if (isOnline) {
          consecutiveFailures = 0
          offlineTimestamp = null
          setIsStudioRunning(true)
        } else {
          consecutiveFailures++

          // Jangan pernah set Offline saat server sedang booting (isStudioStarting = true)
          // Gunakan setter function untuk membaca nilai state terbaru tanpa dependency
          setIsStudioStarting((currentStarting) => {
            if (!currentStarting) {
              // Server tidak sedang booting: terapkan logika offline grace period
              if (offlineTimestamp === null) {
                offlineTimestamp = Date.now()
              }
              const elapsed = Date.now() - offlineTimestamp
              if (elapsed >= OFFLINE_GRACE_MS && consecutiveFailures >= 3) {
                setIsStudioRunning(false)
              }
            } else {
              // Server sedang booting — reset timer agar tidak dihitung sebagai offline
              offlineTimestamp = null
              consecutiveFailures = 0
            }
            return currentStarting // tidak ubah nilai, hanya membaca
          })
        }
      } catch {
        if (!isMounted) return
        consecutiveFailures++
      }
    }

    checkServer()
    const timer = setInterval(checkServer, 1000)
    return (): void => {
      isMounted = false
      clearInterval(timer)
    }
  }, [studioPort])


  // Dynamically detect title and theme styling from TSX code for metadata & export naming
  const detectedTitle = React.useMemo(() => {
    const match = manualCode.match(/titleText\s*=\s*['"`]([^'"`]+)['"`]/)
    return match ? match[1] : 'Dynamic Motion'
  }, [manualCode])

  const detectedAccent = React.useMemo(() => {
    const match = manualCode.match(
      /accentColor\s*=\s*['"`](#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|[a-zA-Z]+)['"`]/
    )
    return match ? match[1] : '#00f2fe'
  }, [manualCode])

  const detectedBg = React.useMemo(() => {
    const match = manualCode.match(
      /backgroundColor\s*=\s*['"`](#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|[a-zA-Z]+)['"`]/
    )
    return match ? match[1] : '#080c18'
  }, [manualCode])

  // Refresh iframe preview on code update
  const remountPlayer = (): void => {
    setIframeKey((prev) => prev + 1)
  }

  // Hardware License & Feature Gating States
  interface LicenseState {
    isValid: boolean
    isLicensed?: boolean
    machineId: string
    plan?: string
    licenseKey?: string
    expiryDate?: string | null
  }

  const [licenseStatus, setLicenseStatus] = useState<LicenseState>({
    isValid: false,
    machineId: 'Loading...',
    plan: undefined,
    expiryDate: null,
    licenseKey: ''
  })
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>('')
  const [isLicenseValidating, setIsLicenseValidating] = useState<boolean>(false)
  const [licenseFeedback, setLicenseFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [isLicenseAlertOpen, setIsLicenseAlertOpen] = useState<boolean>(false)

  // Fetch license status on startup
  useEffect(() => {
    const fetchLicense = async (): Promise<void> => {
      try {
        const api = getElectronAPI()
        if (api?.getLicenseStatus) {
          const res = await api.getLicenseStatus()
          setLicenseStatus(res)
          if (res.licenseKey) {
            setLicenseKeyInput(res.licenseKey)
          }
        }
      } catch (err) {
        console.error('[App] fetchLicense error:', err)
      }
    }
    fetchLicense()
  }, [])

  // Listen to IPC event for render completion chime sound ("ting-ting!")
  useEffect(() => {
    const handleFinishedSound = (): void => {
      playRenderFinishedChime()
    }

    if (window.electron?.ipcRenderer?.on) {
      window.electron.ipcRenderer.on('render-finished-sound', handleFinishedSound)
    }

    return () => {
      if (window.electron?.ipcRenderer?.removeListener) {
        window.electron.ipcRenderer.removeListener('render-finished-sound', handleFinishedSound)
      }
    }
  }, [])

  // Handle License Validation
  const handleValidateLicense = async (): Promise<void> => {
    const key = licenseKeyInput.trim()
    if (!key) {
      setLicenseFeedback({ type: 'error', message: 'Masukkan nomor lisensi terlebih dahulu.' })
      return
    }

    setIsLicenseValidating(true)
    setLicenseFeedback(null)

    try {
      const api = getElectronAPI()
      if (!api?.validateLicense) {
        throw new Error('API validateLicense tidak tersedia.')
      }

      const res = await api.validateLicense(key)
      if (res.success) {
        setLicenseFeedback({ type: 'success', message: res.message })
        const updated = await api.getLicenseStatus()
        setLicenseStatus(updated)
        setIsLicenseAlertOpen(false)
      } else {
        setLicenseFeedback({
          type: 'error',
          message: res.message || 'Nomor lisensi tidak valid.'
        })
      }
    } catch (err) {
      setLicenseFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal memvalidasi lisensi.'
      })
    } finally {
      setIsLicenseValidating(false)
    }
  }

  // Feature Gate Check Helper: returns true if licensed, opens blocking alert if not
  const checkLicenseGate = (): boolean => {
    if (!licenseStatus.isValid) {
      setIsLicenseAlertOpen(true)
      return false
    }
    return true
  }

  // Gemini API Key state
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || ''
  })
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(!localStorage.getItem('gemini_api_key'))
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || ''
  })
  const [apiKeySaveStatus, setApiKeySaveStatus] = useState<string>('')

  // AI Video Concept Prompt & Reference Image states
  const [aiPrompt, setAiPrompt] = useState<string>('')

  const currentTitle = React.useMemo(() => {
    if (detectedTitle && detectedTitle !== 'Dynamic Motion' && detectedTitle !== 'CRITICAL WARNING') {
      return detectedTitle
    }
    if (aiPrompt && aiPrompt.trim()) {
      const quoteMatch = aiPrompt.match(/["']([^"']+)["']/)
      if (quoteMatch && quoteMatch[1].trim()) {
        return quoteMatch[1].trim()
      }
      const firstLine = aiPrompt.split('\n')[0].trim().replace(/^[-*•\d.]+\s*/, '')
      if (firstLine && firstLine.length <= 40) {
        return firstLine
      }
    }
    return detectedTitle || 'Motion-Asset'
  }, [detectedTitle, aiPrompt])
  const [refImageBase64, setRefImageBase64] = useState<string | null>(null)
  const [refImageName, setRefImageName] = useState<string | null>(null)
  const [refImageMimeType, setRefImageMimeType] = useState<string | null>(null)
  const [isDraggingRef, setIsDraggingRef] = useState<boolean>(false)
  const refFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false)
  const [aiGenStatus, setAiGenStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // Floating AI Chat Modal states
  interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    text: string
    timestamp: string
    status?: 'loading' | 'success' | 'error'
  }
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false)
  const [copiedChatId, setCopiedChatId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Halo! Saya asisten editor Motion Suite Pro. Tuliskan instruksi revisi yang ingin diterapkan ke video ini (contoh: "Percepat tempo animasi", "Ubah aksen warna jadi neon purple", atau "Tambahkan efek orbit berputar").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [chatInput, setChatInput] = useState<string>('')
  const [isAiRefining, setIsAiRefining] = useState<boolean>(false)
  const chatBottomRef = React.useRef<HTMLDivElement | null>(null)

  const handleCopyChatMessage = async (id: string, text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedChatId(id)
      setTimeout(() => {
        setCopiedChatId((curr) => (curr === id ? null : curr))
      }, 2000)
    } catch (err) {
      console.error('[Chat] Gagal menyalin pesan:', err)
    }
  }

  const handleSaveApiKey = (): void => {
    const trimmed = apiKeyInput.trim()
    if (!trimmed || trimmed.length < 10) {
      setApiKeySaveStatus('⚠️ API Key tidak valid. Masukkan minimal 10 karakter.')
      setTimeout(() => setApiKeySaveStatus(''), 3000)
      return
    }
    setGeminiApiKey(trimmed)
    localStorage.setItem('gemini_api_key', trimmed)
    setApiKeySaveStatus('✓ API Key berhasil disimpan!')
    setTimeout(() => setApiKeySaveStatus(''), 3000)
    setIsApiKeyOpen(false)
  }

  const processRefImageFile = (file: File): void => {
    const isSupported =
      file.type.startsWith('image/') ||
      file.type.startsWith('video/') ||
      /\.(mp4|webm|gif|png|jpe?g|webp|svg)$/i.test(file.name)

    if (!isSupported) {
      setAiGenStatus({
        type: 'error',
        message: 'Format tidak didukung. Harap gunakan Gambar (PNG, JPG, WebP, SVG), GIF, atau Video Pendek (MP4, WebM).'
      })
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      setAiGenStatus({
        type: 'error',
        message: 'Ukuran file referensi terlalu besar (maksimal 25MB untuk reverse-engineering AI).'
      })
      return
    }

    let detectedMime = file.type
    if (!detectedMime) {
      if (/\.mp4$/i.test(file.name)) detectedMime = 'video/mp4'
      else if (/\.webm$/i.test(file.name)) detectedMime = 'video/webm'
      else if (/\.gif$/i.test(file.name)) detectedMime = 'image/gif'
      else if (/\.png$/i.test(file.name)) detectedMime = 'image/png'
      else if (/\.jpe?g$/i.test(file.name)) detectedMime = 'image/jpeg'
      else if (/\.webp$/i.test(file.name)) detectedMime = 'image/webp'
      else if (/\.svg$/i.test(file.name)) detectedMime = 'image/svg+xml'
      else detectedMime = 'application/octet-stream'
    }

    const reader = new FileReader()
    reader.onload = () => {
      setRefImageBase64(reader.result as string)
      setRefImageName(file.name)
      setRefImageMimeType(detectedMime)
      setAiGenStatus(null)
    }
    reader.onerror = () => {
      setAiGenStatus({ type: 'error', message: 'Gagal membaca file referensi.' })
    }
    reader.readAsDataURL(file)
  }

  const handleRefImageFileInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      processRefImageFile(file)
    }
  }

  const handleRefImageDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsDraggingRef(true)
  }

  const handleRefImageDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsDraggingRef(false)
  }

  const handleRefImageDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsDraggingRef(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processRefImageFile(file)
    }
  }

  const handleRemoveRefImage = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setRefImageBase64(null)
    setRefImageName(null)
    setRefImageMimeType(null)
  }

  const handleGenerateVideoWithAI = async (overridePrompt?: string): Promise<void> => {
    if (!checkLicenseGate()) return
    const promptToUse = (overridePrompt || aiPrompt).trim()
    if (isAiGenerating) return
    if (!geminiApiKey.trim()) {
      setIsApiKeyOpen(true)
      setAiGenStatus({
        type: 'error',
        message: 'Silakan masukkan Gemini API Key terlebih dahulu pada menu di atas.'
      })
      return
    }
    if (!promptToUse) {
      setAiGenStatus({
        type: 'error',
        message: 'Silakan tulis konsep / prompt video yang diinginkan.'
      })
      return
    }

    setIsAiGenerating(true)
    setAiGenStatus({
      type: 'info',
      message: 'Gemini sedang merancang kode animasi motion graphics...'
    })

    try {
      const api = getElectronAPI()
      if (!api?.generateVideo) {
        throw new Error('API generateVideo tidak tersedia.')
      }

      const current = manualCode || (await api.readCurrentCode?.())
      if (current && current.trim()) {
        setLastWorkingCode(current)
      }

      const res = await api.generateVideo({
        prompt: promptToUse,
        imageBase64: refImageBase64 || undefined,
        mimeType: refImageMimeType || undefined,
        apiKey: geminiApiKey.trim()
      })

      if (res.success && res.code) {
        // ── 1. Parse default props from generated code & sync Visual Tweaker ──
        const parsed = parseTsxDefaultProps(res.code)
        syncParsedPropsToState(parsed)
        setManualCode(res.code)
        setHasGeneratedContent(true)
        setIframeKey((prev) => prev + 1)
        setCapturedError('')
        setUndoStack([])
        setAiGenStatus({
          type: 'success',
          message: 'Motion asset berhasil digenerate dan dimuat ke kanvas preview!'
        })
        setTimeout(() => setAiGenStatus(null), 5000)
      } else {
        setAiGenStatus({
          type: 'error',
          message: res.error || 'Gagal menghasilkan video dengan Gemini.'
        })
      }
    } catch (err) {
      console.error('[App] Generate AI error:', err)
      setAiGenStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
      })
    } finally {
      setIsAiGenerating(false)
    }
  }

  const handleSendChatRevision = async (instructionText?: string): Promise<void> => {
    if (!checkLicenseGate()) return
    const textToSend = (instructionText || chatInput).trim()
    if (!textToSend || isAiRefining) return

    if (!geminiApiKey.trim()) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'assistant',
          text: '⚠️ Gemini API Key belum diatur. Silakan isi di panel kiri sebelum merevisi.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'error'
        }
      ])
      return
    }

    const previousCode = manualCode
    if (previousCode && previousCode.trim()) {
      setLastWorkingCode(previousCode)
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: textToSend,
      timestamp: timeStr
    }

    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setIsAiRefining(true)

    try {
      const api = getElectronAPI()
      if (!api?.refineVideo) {
        throw new Error('API refineVideo tidak tersedia.')
      }

      const res = await api.refineVideo({
        instruction: textToSend,
        apiKey: geminiApiKey.trim(),
        currentCode: manualCode.trim() || undefined
      })

      if (res.success && res.code) {
        // ── Parse props from revised code and sync Visual Tweaker ──
        const parsed = parseTsxDefaultProps(res.code)
        syncParsedPropsToState(parsed)
        // 1. Langsung sinkronkan state editor lokal
        setManualCode(res.code)
        setHasGeneratedContent(true)
        // 2. Force refresh iframe preview seketika
        setIframeKey((prev) => prev + 1)
        setCapturedError('')
        setChatMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'assistant',
            text: `✅ Revisi berhasil diterapkan ke VibeGraphic.tsx! Kanvas memuat ulang otomatis.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'success'
          }
        ])
      } else {
        // Pulihkan ke kode sebelumnya
        setManualCode(previousCode)
        setChatMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'assistant',
            text: `⚠️ Kode gagal dimuat oleh engine preview. Mengembalikan ke versi sebelumnya.${res.error ? `\nDetail: ${res.error}` : ''}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'error'
          }
        ])
      }
    } catch (err) {
      console.error('[App] Refine AI error:', err)
      setManualCode(previousCode)
      setChatMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          text: `⚠️ Kode gagal dimuat oleh engine preview. Mengembalikan ke versi sebelumnya. (${err instanceof Error ? err.message : 'Kesalahan jaringan / API'})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'error'
        }
      ])
    } finally {
      setIsAiRefining(false)
    }
  }

  // Auto-scroll chat history when messages change or loading
  useEffect(() => {
    if (isChatModalOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isAiRefining, isChatModalOpen])

  // Sync latest VibeGraphic code when chat modal is opened ONLY if editor is empty
  useEffect(() => {
    if (isChatModalOpen) {
      const api = getElectronAPI()
      if (api?.readCurrentCode) {
        api
          .readCurrentCode()
          .then((code) => {
            if (code) {
              setManualCode((prev) => (prev && prev.trim() ? prev : code))
            }
          })
          .catch(() => {})
      }
    }
  }, [isChatModalOpen])

  // Load initial TSX code from disk on startup with automatic legacy cache purge
  useEffect(() => {
    // 1. Auto-purge any stale localStorage entries containing "VERSUS" or "TOURNAMENT COUNTDOWN"
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const val = localStorage.getItem(key) || ''
          if (
            val.toUpperCase().includes('VERSUS') ||
            val.toUpperCase().includes('TOURNAMENT COUNTDOWN')
          ) {
            console.log(`[Sanitizer] Removing stale legacy cache key: ${key}`)
            localStorage.removeItem(key)
          }
        }
      }
    } catch (e) {
      console.warn('[Sanitizer] Cache cleanup warning:', e)
    }

    const loadInitialCode = async (): Promise<void> => {
      try {
        const api = getElectronAPI()

        // ── Auto-Restore active animation code session from localStorage (ignore default template) ──
        const savedSessionCode = localStorage.getItem(STORAGE_KEY_LAST_ACTIVE_CODE)
        if (savedSessionCode && savedSessionCode.trim()) {
          console.log('[App] Restoring active animation code session from localStorage...')
          setManualCode(savedSessionCode)
          setLastWorkingCode(savedSessionCode)
          if (api?.applyManualCode) {
            try {
              await api.applyManualCode(savedSessionCode)
            } catch {}
          }
          if (api?.writeCode) {
            try {
              await api.writeCode(savedSessionCode)
            } catch {}
          }
          const parsed = parseTsxDefaultProps(savedSessionCode)
          syncParsedPropsToState(parsed)
          setHasGeneratedContent(true)
          remountPlayer()
          return
        }

        if (api?.readCurrentCode) {
          const initial = await api.readCurrentCode()
          if (initial) {
            // Check if legacy VERSUS code is present on disk and overwrite if so
            if (
              initial.toUpperCase().includes('VERSUS') ||
              initial.toUpperCase().includes('COUNTDOWN')
            ) {
              console.warn('[App] Legacy template detected on disk, overwriting with Motion Suite Pro branding...')
              if (api?.getCurrentMotionCode) {
                const fresh = await api.getCurrentMotionCode()
                setManualCode(fresh)
                setLastWorkingCode(fresh)
                if (api?.applyManualCode) {
                  await api.applyManualCode(fresh)
                }
                const parsedFresh = parseTsxDefaultProps(fresh)
                syncParsedPropsToState(parsedFresh)
                return
              }
            }
            setManualCode((prev) => (prev && prev.trim() ? prev : initial))
            setLastWorkingCode(initial)
            const parsedInitial = parseTsxDefaultProps(initial)
            syncParsedPropsToState(parsedInitial)
            return
          }
        }
        if (api?.getCurrentMotionCode) {
          const initial = await api.getCurrentMotionCode()
          if (initial) {
            setManualCode((prev) => (prev && prev.trim() ? prev : initial))
            setLastWorkingCode(initial)
            const parsedInitial = parseTsxDefaultProps(initial)
            syncParsedPropsToState(parsedInitial)
          }
        }
      } catch (err) {
        console.warn('[App] Gagal memuat kode awal:', err)
      }
    }
    loadInitialCode()
  }, [])

  // Listen for runtime errors from iframe or window (e.g. interpolate inputRange errors)
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent): void => {
      try {
        if (!event.data) return
        if (typeof event.data === 'string') {
          if (
            event.data.includes('error') ||
            event.data.includes('inputRange') ||
            event.data.includes('Exception')
          ) {
            setCapturedError(event.data)
          }
        } else if (typeof event.data === 'object') {
          const msg =
            event.data.message ||
            event.data.error?.message ||
            (event.data.type === 'remotion-error' ? event.data.data : null)
          if (msg && typeof msg === 'string') {
            setCapturedError(msg)
          }
        }
      } catch {
        // ignore
      }
    }

    const handleWindowError = (event: ErrorEvent): void => {
      if (event.message && !event.message.includes('ResizeObserver')) {
        setCapturedError(event.message)
      }
    }

    window.addEventListener('message', handleWindowMessage)
    window.addEventListener('error', handleWindowError)
    return () => {
      window.removeEventListener('message', handleWindowMessage)
      window.removeEventListener('error', handleWindowError)
    }
  }, [])

  // Local Video Rendering States (restored from localStorage)
  const [renderMode, setRenderMode] = useState<'auto' | 'gpu' | 'cpu'>('auto')
  const [customOutputFolder, setCustomOutputFolder] = useState<string>(() => {
    const saved = loadSavedVideoSettings()
    return (
      localStorage.getItem(STORAGE_KEY_EXPORT_FOLDER) ||
      saved.customOutputFolder ||
      ''
    )
  })
  const [isRendering, setIsRendering] = useState<boolean>(false)
  const [renderProgress, setRenderProgress] = useState<number>(0)
  const [renderStatus, setRenderStatus] = useState<string>('')
  const [renderResult, setRenderResult] = useState<RenderNotification | null>(null)

  // Persist video configuration & directory to localStorage whenever changed
  useEffect(() => {
    try {
      const settings: SavedVideoSettings = {
        aspectRatio,
        resolutionQuality,
        durationSeconds,
        fps,
        exportFormat,
        isTransparent: exportFormat === 'mp4' ? false : isTransparent,
        customOutputFolder,
        titleText: paramTitleText,
        subtitleText: paramSubtitleText,
        badgeText: paramBadgeText,
        accentColor: paramAccentColor,
        secondaryColor: paramSecondaryColor,
        backgroundColor: paramBackgroundColor,
        scale: paramScale,
        textOffsetX,
        textOffsetY,
        glowIntensity: paramGlowIntensity,
        speedMultiplier: paramSpeedMultiplier
      }
      localStorage.setItem(STORAGE_KEY_VIDEO_SETTINGS, JSON.stringify(settings))
      localStorage.setItem(STORAGE_KEY_RESOLUTION, resolutionQuality)
      localStorage.setItem(STORAGE_KEY_FORMAT, exportFormat)
      localStorage.setItem(STORAGE_KEY_ASPECT_RATIO, aspectRatio)
      if (customOutputFolder) {
        localStorage.setItem(STORAGE_KEY_EXPORT_FOLDER, customOutputFolder)
      }
    } catch (e) {
      console.warn('[App] Failed to save video settings to localStorage:', e)
    }
  }, [
    aspectRatio,
    resolutionQuality,
    durationSeconds,
    fps,
    exportFormat,
    isTransparent,
    customOutputFolder,
    paramTitleText,
    paramSubtitleText,
    paramBadgeText,
    paramAccentColor,
    paramSecondaryColor,
    paramBackgroundColor,
    paramScale,
    textOffsetX,
    textOffsetY,
    paramGlowIntensity,
    paramSpeedMultiplier
  ])

  // Subscribe to render progress event from Main Process
  useEffect(() => {
    const api = getElectronAPI()
    if (!api?.onRenderProgress) {
      return
    }

    const unsubscribe = api.onRenderProgress(
      (data: { percent: number; statusText: string } | number) => {
        if (typeof data === 'number') {
          setRenderProgress(data)
          setRenderStatus(`Rendering frame (${data}%)...`)
        } else {
          setRenderProgress(data.percent)
          setRenderStatus(data.statusText)
        }
      }
    )

    return (): void => {
      unsubscribe()
    }
  }, [])

  // Handle Custom Output Folder Selection via Native Dialog
  const handleSelectOutputFolder = async (): Promise<void> => {
    try {
      const api = getElectronAPI()
      if (!api?.selectOutputFolder) return
      const res = await api.selectOutputFolder()
      if (!res.canceled && res.folderPath) {
        setCustomOutputFolder(res.folderPath)
        setCodeEditorStatus(`📁 Folder penyimpanan diubah: ${res.folderPath}`)
        setTimeout(() => {
          setCodeEditorStatus((c) => (c.startsWith('📁 Folder') ? '' : c))
        }, 4000)
      }
    } catch (err) {
      console.error('[App] selectOutputFolder error:', err)
    }
  }

  // Open Export Folder directly in native Windows File Explorer
  const handleOpenExportFolder = async (folderOrPath?: string): Promise<void> => {
    try {
      const api = getElectronAPI()
      if (api?.openExportFolder) {
        await api.openExportFolder(folderOrPath || customOutputFolder || undefined)
      } else if (api?.openPath) {
        await api.openPath(folderOrPath || customOutputFolder || '')
      }
    } catch (err) {
      console.error('[App] Failed to open export folder:', err)
    }
  }

  // Handle Apply Manual Code (Live Editor -> writeCode -> VibeGraphic.tsx -> Remotion Studio hot-reload)
  const handleApplyManualCode = async (): Promise<void> => {
    if (isApplyingCode) return

    const trimmed = manualCode.trim()
    if (!trimmed) {
      setCodeEditorStatus('Silakan masukkan atau tempelkan kode TSX terlebih dahulu.')
      return
    }

    const cleanCode = cleanAndStripMarkdownCode(trimmed)
    setIsApplyingCode(true)
    setCodeEditorStatus('Menulis kode ke VibeGraphic.tsx...')

    try {
      const api = getElectronAPI()
      if (!api?.writeCode) {
        throw new Error('API Electron writeCode tidak tersedia.')
      }

      const res = await withTimeout(
        api.writeCode(cleanCode),
        15000,
        'Gagal menyimpan kode: Proses penulisan file melebihi batas waktu.'
      )

      if (res.success) {
        if (api.applyManualCode) {
          try {
            await api.applyManualCode(cleanCode)
          } catch {
            // ignore
          }
        }
        // Buffer delay to ensure Remotion bundler completes file compile
        await new Promise((r) => setTimeout(r, 300))
        remountPlayer()
        // ── Parse props from applied code and sync Visual Tweaker ──
        const parsedManual = parseTsxDefaultProps(cleanCode)
        syncParsedPropsToState(parsedManual)
        setHasGeneratedContent(true)
        setCodeEditorStatus('Kode berhasil disimpan! Kanvas melakukan hot-reload otomatis.')
        setTimeout(() => {
          setCodeEditorStatus((current) =>
            current.includes('berhasil') ? '' : current
          )
        }, 4500)
      } else {
        setCodeEditorStatus(res.error || 'Sintaks TSX tidak valid atau gagal menyimpan file.')
      }
    } catch (err) {
      console.error('[App] writeCode error:', err)
      setCodeEditorStatus(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan kode TSX'
      )
    } finally {
      setIsApplyingCode(false)
    }
  }

  // Reset Live Editor to clean boilerplate template
  const handleResetBoilerplate = async (): Promise<void> => {
    const defaultSnap: ParametricValues = {
      titleText: 'MOTION SUITE PRO',
      subtitleText: 'AI Creative Motion Graphics Workstation',
      badgeText: 'OFFICIAL RELEASE v1.0',
      accentColor: '#00f2fe',
      secondaryColor: '#7928ca',
      backgroundColor: '#0a0d14',
      isTransparent: false,
      scale: 1,
      textOffsetX: 0,
      textOffsetY: 0,
      glowIntensity: 15,
      speedMultiplier: 1
    }
    setInitialParamSnapshot(defaultSnap)
    setUndoStack([])
    applyParametricValues(defaultSnap, true)

    try {
      const api = getElectronAPI()
      if (api?.getCurrentMotionCode) {
        const starter = await api.getCurrentMotionCode()
        if (starter) {
          setManualCode(starter)
          setCodeEditorStatus(
            'Template standar dimuat. Tekan "Render Motion" untuk menerapkan ke player.'
          )
          return
        }
      }
    } catch {
      // fallback
    }
    setCodeEditorStatus(
      'Template standar dimuat. Tekan "Render Motion" untuk menerapkan ke player.'
    )
  }

  const [isPromptCopied, setIsPromptCopied] = useState<boolean>(false)

  // Master Prompt AI: Copies comprehensive Remotion prompt guidelines for ChatGPT / Claude
  const handleCopyMasterPrompt = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(MASTER_PROMPT_TEMPLATE)
      setIsPromptCopied(true)
      setCodeEditorStatus('Master Prompt AI berhasil disalin ke clipboard!')
      setTimeout(() => {
        setIsPromptCopied(false)
      }, 2500)
      setTimeout(() => {
        setCodeEditorStatus((c) => (c.startsWith('Master Prompt') ? '' : c))
      }, 4000)
    } catch (err) {
      console.error('[App] Copy master prompt failed:', err)
      setCodeEditorStatus('Gagal menyalin Master Prompt ke clipboard.')
    }
  }

  // Handle Video Rendering Export via physical Remotion CLI (MP4 H.264 or MOV ProRes 4444 Alpha)
  const handleExportVideo = async (): Promise<void> => {
    if (!checkLicenseGate()) return
    if (isRendering) return

    setIsRendering(true)
    setRenderProgress(0)
    setRenderStatus('Mempersiapkan pipeline render...')
    setRenderResult(null)

    try {
      const api = getElectronAPI()
      if (!api?.startRender) {
        throw new Error('API Electron startRender tidak tersedia.')
      }

      const res = await api.startRender({
        format: exportFormat,
        isTransparent: exportFormat === 'mp4' ? false : isTransparent,
        title: paramTitleText || currentTitle || 'Motion-Asset',
        resolutionLabel: resolutionQuality,
        renderMode,
        customOutputFolder: customOutputFolder || undefined,
        durationInFrames,
        fps,
        titleText: paramTitleText,
        subtitleText: paramSubtitleText,
        badgeText: paramBadgeText,
        accentColor: paramAccentColor,
        secondaryColor: paramSecondaryColor,
        backgroundColor: paramBackgroundColor,
        scale: paramScale,
        offsetX: textOffsetX,
        offsetY: textOffsetY,
        textOffsetX,
        textOffsetY,
        glowIntensity: paramGlowIntensity,
        speedMultiplier: paramSpeedMultiplier
      })

      if (res.canceled) {
        setRenderStatus('')
        setRenderProgress(0)
      } else if (res.success && res.outputPath) {
        if (manualCode) {
          setLastWorkingCode(manualCode)
        }
        setCapturedError('')
        const formatLabel =
          exportFormat === 'prores4444'
            ? isTransparent
              ? 'MOV ProRes 4444 (Alpha Transparan)'
              : 'MOV ProRes 4444 (Solid / Latar Penuh)'
            : 'MP4 (H.264 - Standar)'

        setRenderResult({
          type: 'success',
          message: `Render berhasil disimpan! [${formatLabel}]`,
          filePath: res.outputPath
        })
        setRenderStatus('Render selesai 100%')
      } else {
        const errMsg = res.error || 'Gagal merender video'
        setRenderResult({
          type: 'error',
          message: errMsg
        })
        setCapturedError(errMsg)
        setRenderStatus('Export gagal.')
      }
    } catch (err) {
      console.error('[App] startRender error:', err)
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat rendering'
      setRenderResult({
        type: 'error',
        message: errMsg
      })
      setCapturedError(errMsg)
      setRenderStatus('Terjadi kesalahan.')
    } finally {
      setIsRendering(false)
    }
  }

  const handleCancelRender = async (): Promise<void> => {
    try {
      const api = getElectronAPI()
      if (api?.cancelRender) {
        await api.cancelRender()
      }
      setIsRendering(false)
      setRenderProgress(0)
      setRenderStatus('Render dibatalkan oleh pengguna.')
      setRenderResult(null)
    } catch (err) {
      console.error('[App] cancelRender error:', err)
    }
  }

  // Rollback to last known working/stable code
  const handleRollbackCode = async (): Promise<void> => {
    if (!lastWorkingCode) return

    try {
      const api = getElectronAPI()
      if (!api?.writeCode) throw new Error('API writeCode tidak tersedia.')

      const currentBefore = manualCode || (await api.readCurrentCode?.())
      const cleanCode = cleanAndStripMarkdownCode(lastWorkingCode)

      const res = await api.writeCode(cleanCode)
      if (res.success) {
        setManualCode(cleanCode)
        // Delay to allow bundler hot-reload
        await new Promise((r) => setTimeout(r, 300))
        remountPlayer()
        setCapturedError('')
        setRollbackToast('✅ File VibeGraphic.tsx berhasil dipulihkan ke versi stabil sebelumnya!')
        if (currentBefore && currentBefore !== cleanCode) {
          setLastWorkingCode(currentBefore)
        }
        setTimeout(() => setRollbackToast(''), 4500)
      } else {
        setRollbackToast(`❌ Gagal memulihkan: ${res.error}`)
        setTimeout(() => setRollbackToast(''), 5000)
      }
    } catch (err) {
      console.error('[App] Rollback error:', err)
      setRollbackToast(err instanceof Error ? err.message : 'Gagal memulihkan kode.')
      setTimeout(() => setRollbackToast(''), 5000)
    }
  }

  // Open Auto-Fix Modal with prefilled runtime error or visual recovery mode
  const handleOpenAutoFixModal = (): void => {
    const hasError = Boolean((capturedError || '').trim())
    setAutoFixMode(hasError ? 'runtime_error' : 'visual_recovery')
    setAutoFixErrorInput(capturedError || '')
    setShowManualErrorInput(false)
    setIsAutoFixModalOpen(true)
  }

  // Execute Auto-Fix with Gemini AI (Anti-Race Condition & Dynamic Resolution Aware)
  const handleExecuteAutoFix = async (customErrMsg?: string): Promise<void> => {
    if (!checkLicenseGate()) return
    const errorMsg = (
      customErrMsg !== undefined ? customErrMsg : (autoFixErrorInput || capturedError || '')
    ).trim()

    const activeMode: 'runtime_error' | 'visual_recovery' = (errorMsg.length > 0)
      ? 'runtime_error'
      : autoFixMode

    if (!geminiApiKey || !geminiApiKey.trim()) {
      setIsApiKeyOpen(true)
      setRollbackToast('⚠️ Masukkan Gemini API Key terlebih dahulu untuk menjalankan Auto-Fix.')
      setTimeout(() => setRollbackToast(''), 4500)
      return
    }

    setIsAutoFixing(true)
    try {
      const api = getElectronAPI()
      if (!api) throw new Error('API Electron tidak tersedia.')

      const current = manualCode || (await api.readCurrentCode?.())
      if (current && current.trim()) {
        setLastWorkingCode(current)
        setUndoStack((prev) => [...prev.slice(-19), getCurrentParametricValues()])
      }

      const res = api.autoFixVideo
        ? await api.autoFixVideo({
            errorMessage: errorMsg,
            apiKey: geminiApiKey.trim(),
            currentCode: current,
            mode: activeMode,
            width,
            height,
            fps,
            durationInFrames,
            aspectRatio
          })
        : await api.refineVideo({
            instruction:
              activeMode === 'visual_recovery'
                ? `Komponen VibeGraphic.tsx mengalami kegagalan tampilan (layar blank/elemen hilang tanpa crash). Pulihkan kode agar memiliki opacity minimal 0.95 pada frame 0, semua elemen berada di dalam viewport ${width}x${height}, kontras tajam dengan background solid, dan adaptif menggunakan useVideoConfig(). Kembalikan seluruh kode TSX lengkap.`
                : `Kode TSX Remotion berikut mengalami error runtime: '${errorMsg}'. Analisis dan perbaiki kodenya sekarang. Pastikan semua array inputRange pada interpolate() tersusun berurutan dari kecil ke besar. Kembalikan seluruh kode TSX yang valid tanpa markdown penjelasan.`,
            apiKey: geminiApiKey.trim(),
            currentCode: current
          })

      if (res.success && res.code) {
        const cleanCode = cleanAndStripMarkdownCode(res.code)
        setManualCode(cleanCode)

        // Asynchronous write to disk
        await api.writeCode(cleanCode)

        // 300ms buffer delay to avoid race condition with Remotion bundler file watcher
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Force-remount preview player programmatically
        remountPlayer()

        // Sync parsed props to Visual Tweaker
        const parsed = parseTsxDefaultProps(cleanCode)
        syncParsedPropsToState(parsed)
        setHasGeneratedContent(true)

        setCapturedError('')
        setAutoFixErrorInput('')
        setIsAutoFixModalOpen(false)

        const successToast =
          activeMode === 'visual_recovery'
            ? '✨ Pemulihan Visual Berhasil! Tampilan kanvas telah dipulihkan dan preview dimuat ulang.'
            : '⚡ Auto-Fix Berhasil! Bug berhasil diperbaiki dan preview dimuat ulang.'
        setRollbackToast(successToast)
        setTimeout(() => setRollbackToast(''), 4500)
      } else {
        setRollbackToast(`❌ Auto-Fix Gagal: ${res.error || 'Tidak dapat memperbaiki kode'}`)
        setTimeout(() => setRollbackToast(''), 5000)
      }
    } catch (err) {
      console.error('[App] Auto-Fix error:', err)
      setRollbackToast(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menjalankan Auto-Fix.'
      )
      setTimeout(() => setRollbackToast(''), 5000)
    } finally {
      setIsAutoFixing(false)
    }
  }

  return (
    <div className="motion-app h-screen max-h-screen overflow-hidden flex flex-col">
      {/* App Top Navigation Bar */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="brand-title">
            MOTION SUITE PRO
            <span className="brand-badge">{appVersion.startsWith('PRO') ? appVersion : `PRO ${appVersion}`}</span>
          </div>
        </div>

        {/* Center Navigation Bar: Studio Preview, Code Inspector */}
        <nav className="header-nav-tabs">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <span className="tab-icon">🎬</span>
            <span>Studio Preview</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <span className="tab-icon">💻</span>
            <span>Code Inspector</span>
          </button>
        </nav>

        <div className="header-meta">
          {updatePhase !== 'idle' && isUpdateDismissed && (
            <button
              type="button"
              className="header-update-badge"
              onClick={() => setIsUpdateDismissed(false)}
              title="Buka jendela pembaruan"
            >
              <span className="update-badge-dot" />
              <span>Update v{updateVersion || '1.0.4'}</span>
            </button>
          )}
          <div className="meta-status">
            <span className={`status-dot ${isStudioRunning ? 'online' : 'connecting'}`} />
            <span>{isStudioRunning ? 'Motion Engine Ready' : 'Inisialisasi Engine...'}</span>
          </div>
        </div>
      </header>

      {/* Main Content Viewport: 4-Tab Workspace */}
      <div className="main-content-viewport flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* TAB 1: TSX Live Editor Full Layout */}
        <div
          className="tab-content-pane editor-tab-pane"
          style={{ display: activeTab === 'editor' ? 'flex' : 'none' }}
        >
          <div className="full-editor-container">
            <div className="full-editor-toolbar">
              <div className="full-editor-title-group">
                <div className="editor-title-row">
                  <span className="full-editor-icon">💻</span>
                  <h2 className="full-editor-title">Code Inspector (TSX Live Editor)</h2>
                  <span className="editor-tech-badge">BYOC • Live Engine</span>
                </div>
                <p className="full-editor-subtitle">
                  Editor TSX mandiri untuk menulis atau memodifikasi kode animasi secara leluasa. Kompilasi langsung memperbarui canvas visual secara instan.
                </p>
              </div>

              <div className="full-editor-actions">
                <button
                  type="button"
                  className={`btn-editor-tool ${isPromptCopied ? 'success' : ''}`}
                  onClick={handleCopyMasterPrompt}
                  title="Salin Panduan Master Prompt ke clipboard"
                >
                  {isPromptCopied ? '✅ Disalin!' : '🤖 Salin Master Prompt AI'}
                </button>
                <button
                  type="button"
                  className="btn-editor-tool secondary"
                  onClick={handleResetBoilerplate}
                  title="Kembalikan ke template awal"
                >
                  🔄 Reset Template
                </button>
                <button
                  type="button"
                  className="btn-render-motion full-editor-apply-btn"
                  onClick={async () => {
                    await handleApplyManualCode()
                    setActiveTab('preview')
                  }}
                  disabled={isApplyingCode || !manualCode.trim() || isRendering}
                >
                  {isApplyingCode ? (
                    <>
                      <span className="ai-status-spinner" />
                      <span>Mengompilasi...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Render & Buka Preview</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="full-editor-body">
              <textarea
                className="full-code-textarea"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Paste kode TSX dari ChatGPT / Claude atau ketik kode animasi di sini..."
                spellCheck={false}
              />
            </div>

            <div className="full-editor-footer">
              <div className="full-editor-footer-left">
                <span className="specs-summary-badge">
                  📐 {width} × {height} ({aspectRatio}) • {durationSeconds}s • {fps} FPS
                </span>
                {codeEditorStatus && (
                  <span className="editor-footer-status">{codeEditorStatus}</span>
                )}
              </div>
              <button
                type="button"
                className="btn-preview-link"
                onClick={() => setActiveTab('preview')}
              >
                🎬 Lihat di Live Preview ➔
              </button>
            </div>
          </div>
        </div>

        {/* TAB 2: Live Preview Studio (ALWAYS MOUNTED to preserve Port 10871 server & avoid reloads) */}
        <div
          className="tab-content-pane preview-tab-pane"
          style={{ display: activeTab === 'preview' ? 'flex' : 'none' }}
        >
          <main className="app-layout flex-1 min-h-0 overflow-hidden">
          {/* Kolom Kiri: TSX Live Editor & Pengaturan Video */}
          <section className="left-column overflow-y-auto max-h-full pr-1.5 custom-scrollbar">
            {/* AI Video Creator & API Settings Section */}
            <div className="ai-creator-section">
              {/* Hardware License Validation Card */}
              <div className={`license-validation-card ${licenseStatus.isValid ? 'valid' : 'invalid'}`}>
                <div className="license-card-header">
                  <div className="license-header-left">
                    <span className="license-header-icon license-shield-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </span>
                    <span className="license-header-title">Status Lisensi</span>
                  </div>
                  <span className={`license-badge ${licenseStatus.isValid ? 'active' : 'inactive'}`}>
                    {licenseStatus.isValid
                      ? licenseStatus.plan === 'lifetime'
                        ? 'Aktif - Lifetime'
                        : `Aktif - Bulanan (Exp: ${licenseStatus.expiryDate ? new Date(licenseStatus.expiryDate).toISOString().slice(0, 10) : '-'})`
                      : licenseStatus.plan === 'monthly'
                        ? 'Lisensi Expired'
                        : 'Belum Divalidasi'}
                  </span>
                </div>

                <div className="license-card-body">
                  <div className="license-input-row">
                    <input
                      type="text"
                      className="license-key-input"
                      value={licenseKeyInput}
                      onChange={(e) => setLicenseKeyInput(e.target.value)}
                      placeholder="Tempel kunci lisensi digital di sini..."
                      disabled={isLicenseValidating}
                    />
                    <button
                      type="button"
                      className="btn-validate-license"
                      onClick={handleValidateLicense}
                      disabled={isLicenseValidating}
                    >
                      {isLicenseValidating ? '...' : 'Validasi'}
                    </button>
                  </div>

                  {licenseFeedback && (
                    <div className={`license-feedback-msg ${licenseFeedback.type}`}>
                      {licenseFeedback.message}
                    </div>
                  )}

                  <div className="license-machine-id-row">
                    <span className="machine-id-label">Machine ID:</span>
                    <code
                      className="machine-id-value"
                      title="Klik untuk menyalin Machine ID"
                      onClick={() => {
                        navigator.clipboard.writeText(licenseStatus.machineId)
                        setLicenseFeedback({ type: 'success', message: 'Machine ID disalin!' })
                        setTimeout(() => setLicenseFeedback(null), 3000)
                      }}
                    >
                      {licenseStatus.machineId} 📋
                    </code>
                  </div>
                </div>
              </div>

              {/* Gemini API Key Settings Accordion */}
              <div className="api-key-accordion">
                <div
                  className="api-key-accordion-header"
                  onClick={() => setIsApiKeyOpen(!isApiKeyOpen)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setIsApiKeyOpen(!isApiKeyOpen)
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>🔑</span>
                    <span className="api-key-title">Gemini API Key</span>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.electron.ipcRenderer.send('open-external-url', 'https://aistudio.google.com/app/apikey')
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer"
                    >
                      🔑 Dapatkan API Key Gratis ↗
                    </button>
                    <span className={`api-key-status-badge ${geminiApiKey ? 'set' : 'unset'}`}>
                      {geminiApiKey ? '✓ Tersimpan' : '⚠️ Belum Diatur'}
                    </span>
                  </div>
                  <span className={`accordion-caret ${isApiKeyOpen ? 'open' : ''}`}>▼</span>
                </div>

                {isApiKeyOpen && (
                  <div className="api-key-accordion-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <p className="api-key-desc" style={{ margin: 0 }}>
                        Mendukung Google Gemini API Key resmi dari Google AI Studio (Model: Gemini 3.6 / 3.7 Flash & Multi-Model Fallback).
                      </p>
                      <button 
                        type="button"
                        onClick={() => window.electron.ipcRenderer.send('open-external-url', 'https://aistudio.google.com/app/apikey')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer"
                      >
                        🔑 Dapatkan API Key Gratis ↗
                      </button>
                    </div>
                    <div className="api-key-input-row">
                      <input
                        type="password"
                        className="api-key-input"
                        value={apiKeyInput}
                        onChange={(e) => {
                          const val = e.target.value
                          setApiKeyInput(val)
                          const trimmed = val.trim()
                          if (trimmed) {
                            setGeminiApiKey(trimmed)
                            localStorage.setItem(STORAGE_KEY_GEMINI_API_KEY, trimmed)
                          }
                        }}
                        placeholder="Masukkan API Key (AIza... atau AQ...)"
                      />
                      <button
                        type="button"
                        className="btn-save-api-key"
                        onClick={handleSaveApiKey}
                      >
                        Simpan
                      </button>
                    </div>
                    {apiKeySaveStatus && (
                      <div className="api-key-feedback">{apiKeySaveStatus}</div>
                    )}
                  </div>
                )}
              </div>

              {/* AI Video Concept Prompt & Reference Image */}
              <div className="ai-generator-card">
                <div className="ai-generator-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="ai-sparkle-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </span>
                    <span className="ai-card-title">AI Motion Engine</span>
                  </div>
                  <span className="ai-model-badge">Gemini Flash</span>
                </div>

                <textarea
                  className="ai-prompt-input"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ketik konsep animasi... (misal: 'HUD Countdown futuristik dengan neon cyan, glitch partikel, dan hitung mundur 5 detik')"
                  rows={3}
                />

                {/* Reference Media Dropzone (Video-to-Code Cloner: Image, GIF, Video MP4) */}
                <input
                  ref={refFileInputRef}
                  type="file"
                  accept="image/*,video/mp4,video/webm,image/gif"
                  style={{ display: 'none' }}
                  onChange={handleRefImageFileInputChange}
                />

                {refImageBase64 ? (
                  <div className="ref-image-preview-card">
                    {refImageMimeType?.startsWith('video/') ? (
                      <video
                        src={refImageBase64}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="ref-image-thumb"
                      />
                    ) : (
                      <img src={refImageBase64} alt="Reference" className="ref-image-thumb" />
                    )}
                    <div className="ref-image-meta">
                      <span className="ref-image-name">{refImageName || 'File Referensi'}</span>
                      <span className="ref-image-badge">
                        {refImageMimeType?.startsWith('video/')
                          ? '✓ Video Referensi Aktif'
                          : refImageMimeType === 'image/gif'
                            ? '✓ GIF Referensi Aktif'
                            : '✓ Referensi Aktif'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-ref-image"
                      onClick={handleRemoveRefImage}
                      title="Hapus referensi"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className={`ref-image-dropzone ${isDraggingRef ? 'dragging' : ''}`}
                    onClick={() => refFileInputRef.current?.click()}
                    onDragOver={handleRefImageDragOver}
                    onDragLeave={handleRefImageDragLeave}
                    onDrop={handleRefImageDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') refFileInputRef.current?.click()
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>🎬</span>
                    <div className="ref-dropzone-text">
                      <strong>Drop Gambar, GIF, atau Video Pendek (MP4) Referensi</strong> atau klik di sini
                    </div>
                    <span className="ref-dropzone-hint">(AI Video-to-Code Cloner mereverse-engineer ritme gerakan &amp; tata visual)</span>
                  </div>
                )}

                {/* AI Generation Status Box */}
                {aiGenStatus && (
                  <div className={`ai-gen-status-box ${aiGenStatus.type}`}>
                    {aiGenStatus.type === 'info' && <span className="ai-status-spinner" />}
                    <span>{aiGenStatus.message}</span>
                  </div>
                )}

                {/* Generate Video Button */}
                <button
                  type="button"
                  className="btn-generate-ai"
                  onClick={() => handleGenerateVideoWithAI()}
                  disabled={isAiGenerating || isRendering}
                >
                  {isAiGenerating ? (
                    <>
                      <span className="ai-status-spinner" />
                      <span>Gemini sedang merancang animasi...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Generate Motion Asset</span>
                    </>
                  )}
                </button>
              </div>
            </div>



            {/* Video Specifications: Aspect Ratio, Resolution, Duration & FPS */}
            <div className="specs-section">
              <div className="specs-header-row">
                <span className="form-label">Video Dimensions & Framerate</span>
                <span className="specs-summary-badge">
                  {width} × {height} ({aspectRatio}) • {durationSeconds}s • {fps} FPS
                </span>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="form-group">
                <label className="form-sublabel">Aspect Ratio</label>
                <div className="ratio-selector-grid">
                  <button
                    type="button"
                    className={`ratio-btn ${aspectRatio === '16:9' ? 'active' : ''}`}
                    onClick={() => setAspectRatio('16:9')}
                  >
                    <span className="ratio-icon ratio-icon-landscape" />
                    <div className="ratio-info">
                      <span className="ratio-title">Landscape</span>
                      <span className="ratio-desc">16:9 (Standard)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`ratio-btn ${aspectRatio === '9:16' ? 'active' : ''}`}
                    onClick={() => {
                      setAspectRatio('9:16')
                      if (resolutionQuality === '2k') {
                        setResolutionQuality('1080p')
                      }
                    }}
                  >
                    <span className="ratio-icon ratio-icon-vertical" />
                    <div className="ratio-info">
                      <span className="ratio-title">Vertical</span>
                      <span className="ratio-desc">9:16 (Reels/Shorts)</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Resolution Quality Dropdown */}
              <div className="form-group">
                <label className="form-sublabel" htmlFor="resolution-select">
                  Resolution Quality
                </label>
                <div className="select-wrapper">
                  <select
                    id="resolution-select"
                    className="specs-select"
                    value={resolutionQuality}
                    onChange={(e) => setResolutionQuality(e.target.value as ResolutionQualityType)}
                  >
                    {aspectRatio === '16:9' ? (
                      <>
                        <option value="1080p">1080p Full HD (1920×1080)</option>
                        <option value="2k">2K QHD (2560×1440)</option>
                        <option value="4k">4K Ultra HD (3840×2160)</option>
                      </>
                    ) : (
                      <>
                        <option value="1080p">1080p Full HD (1080×1920)</option>
                        <option value="4k">4K Ultra HD (2160×3840)</option>
                      </>
                    )}
                  </select>
                  <div className="select-caret">▼</div>
                </div>
              </div>

              {/* Duration & Frame Rate (FPS) Grid */}
              <div className="specs-dropdown-grid">
                <div className="form-group">
                  <label className="form-sublabel" htmlFor="duration-select">
                    Duration
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="duration-select"
                      className="specs-select"
                      value={durationSeconds}
                      onChange={(e) =>
                        setDurationSeconds(Number(e.target.value) as DurationSecondsType)
                      }
                    >
                      <option value={5}>5 Detik ({5 * fps}f)</option>
                      <option value={10}>10 Detik ({10 * fps}f)</option>
                      <option value={15}>15 Detik ({15 * fps}f)</option>
                      <option value={20}>20 Detik ({20 * fps}f)</option>
                    </select>
                    <div className="select-caret">▼</div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-sublabel" htmlFor="fps-select">
                    Frame Rate (FPS)
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="fps-select"
                      className="specs-select"
                      value={fps}
                      onChange={(e) => setFps(Number(e.target.value))}
                    >
                      <option value={24}>24 FPS (Cinematic)</option>
                      <option value={30}>30 FPS (Standard Web)</option>
                      <option value={60}>60 FPS (Ultra Smooth)</option>
                    </select>
                    <div className="select-caret">▼</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Kolom Kanan: Remotion Studio Preview */}
          <section className="right-column flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="preview-container flex-1 min-h-0">
              {/* Streamlined Preview Header Bar */}
              <div className="streamlined-preview-bar">
                <div className="preview-bar-left">
                  <h3 className="preview-bar-title">Motion Canvas — Live Preview</h3>
                  <span className="preview-spec-chip">
                    {width} × {height} ({resolutionQuality.toUpperCase()}) • {fps} FPS
                  </span>
                </div>

                <div className="preview-bar-actions">
                  <button
                    type="button"
                    className={`btn-bar-action ${isParamTweakerOpen ? 'active' : ''}`}
                    onClick={() => setIsParamTweakerOpen((prev) => !prev)}
                    title="Buka / tutup panel kontrol parameter visual & transformasi (Visual Tweaker)"
                  >
                    🎛️ Visual Tweaker
                  </button>
                  <button
                    type="button"
                    className="btn-bar-action"
                    onClick={handleRefreshStudio}
                    disabled={!isStudioRunning || isStudioStarting}
                    title="Muat ulang kanvas preview"
                  >
                    Sync Canvas
                  </button>
                  <button
                    type="button"
                    className="btn-bar-action"
                    onClick={() => setIsFullscreenPreview(true)}
                    title="Buka preview video dalam layar penuh"
                  >
                    Cinema Mode
                  </button>
                </div>
              </div>

              {/* Runtime Error Alert Banner if Error Detected */}
              {capturedError && (
                <div className="preview-captured-error-banner">
                  <div className="error-banner-left">
                    <span className="error-banner-icon">⚠️</span>
                    <div className="error-banner-text">
                      <strong>Runtime Error Terdeteksi:</strong> {capturedError}
                    </div>
                  </div>
                  <div className="error-banner-actions">
                    <button
                      type="button"
                      className="btn-banner-autofix"
                      onClick={() => handleExecuteAutoFix(capturedError)}
                      disabled={isAutoFixing}
                      title="Analisis dan perbaiki error ini menggunakan AI"
                    >
                      {isAutoFixing ? 'Memperbaiki...' : '⚡ Auto-Fix Sekarang'}
                    </button>
                    <button
                      type="button"
                      className="btn-banner-dismiss"
                      onClick={() => setCapturedError('')}
                      title="Tutup notifikasi error"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Studio Iframe / Player Frame */}
              <div
                className="studio-iframe-frame"
                style={{
                  borderColor: isStudioRunning ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isStudioRunning
                    ? '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 30px rgba(0, 242, 254, 0.12)'
                    : '0 20px 50px -15px rgba(0,0,0,0.7)'
                }}
              >
                {!isStudioRunning || isStudioStarting ? (
                  <div className="canvas-booting-state">
                    <div className="cyber-spinner-ring" />
                    <div className="booting-text-group">
                      <h4 className="booting-title">Menginisialisasi Motion Engine...</h4>
                      <p className="booting-subtitle">
                        Menyiapkan lingkungan render dan komputasi visual di latar belakang
                      </p>
                    </div>
                  </div>
                ) : !hasGeneratedContent ? (
                  <div className="canvas-standby-blueprint">
                    <div className="blueprint-grid-overlay" />
                    <div className="blueprint-content">
                      <div className="blueprint-badge">
                        <span className="pulse-dot" />
                        <span>MOTION ENGINE READY</span>
                      </div>
                      <div className="blueprint-icon-box">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                      </div>
                      <h3 className="blueprint-title">Motion Canvas Siap</h3>
                      <p className="blueprint-desc">
                        Masukkan instruksi di panel kiri untuk merancang aset motion.
                      </p>
                      <div className="blueprint-specs">
                        <span>{width} × {height}</span>
                        <span className="spec-dot">•</span>
                        <span>{aspectRatio}</span>
                        <span className="spec-dot">•</span>
                        <span>{resolutionQuality.toUpperCase()}</span>
                        <span className="spec-dot">•</span>
                        <span>{fps} FPS</span>
                      </div>
                      <button
                        type="button"
                        className="btn-blueprint-open-canvas"
                        onClick={() => setHasGeneratedContent(true)}
                        title="Buka kanvas preview langsung"
                      >
                        <span>🎬 Buka Kanvas Langsung</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="studio-iframe-clip-wrapper">
                    <iframe
                      ref={iframeRef}
                      key={iframeKey}
                      src={`http://localhost:${studioPort}`}
                      title="Motion Canvas — Live Preview"
                      className="studio-iframe"
                      onLoad={handleIframeElementLoad}
                      allow="fullscreen; autoplay; clipboard-read; clipboard-write"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Collapsible Right Drawer (Parametric Visual Tweaker) */}
                <ParametricControlPanel
                  isOpen={isParamTweakerOpen}
                  onClose={() => setIsParamTweakerOpen(false)}
                  onUndo={handleUndo}
                  canUndo={undoStack.length > 0}
                  onRevert={handleRevert}
                  onSnapshotBeforeChange={handleSnapshotBeforeChange}
                  titleText={paramTitleText}
                  onChangeTitleText={setParamTitleText}
                  subtitleText={paramSubtitleText}
                  onChangeSubtitleText={setParamSubtitleText}
                  badgeText={paramBadgeText}
                  onChangeBadgeText={setParamBadgeText}
                  accentColor={paramAccentColor}
                  onChangeAccentColor={setParamAccentColor}
                  secondaryColor={paramSecondaryColor}
                  onChangeSecondaryColor={setParamSecondaryColor}
                  backgroundColor={paramBackgroundColor}
                  onChangeBackgroundColor={setParamBackgroundColor}
                  isTransparent={isTransparent}
                  onChangeIsTransparent={(val) => {
                    setIsTransparent(val)
                    if (val && exportFormat === 'mp4') {
                      setExportFormat('prores4444')
                    }
                  }}
                  scale={paramScale}
                  onChangeScale={setParamScale}
                  textOffsetX={textOffsetX}
                  onChangeTextOffsetX={setTextOffsetX}
                  textOffsetY={textOffsetY}
                  onChangeTextOffsetY={setTextOffsetY}
                  onResetTransform={handleResetTransform}
                  glowIntensity={paramGlowIntensity}
                  onChangeGlowIntensity={setParamGlowIntensity}
                  speedMultiplier={paramSpeedMultiplier}
                  onChangeSpeedMultiplier={setParamSpeedMultiplier}
                  disabled={isRendering}
                />
              </div>

              {/* Preview Controls Container: 2 Separate Structured Rows */}
              <div className="preview-controls-container shrink-0 z-10">
                {/* BARIS 1: Action Buttons Bar (Edit Video dengan AI, Auto-Fix, Rollback) */}
                <div className="preview-actions-row">
                  <button
                    type="button"
                    className="btn-edit-video-ai"
                    onClick={() => setIsChatModalOpen(true)}
                    disabled={isRendering}
                    title={
                      isRendering
                        ? 'Rendering sedang berjalan...'
                        : 'Buka asisten chat AI untuk merevisi video ini secara realtime'
                    }
                  >
                    <span>Edit Video dengan AI</span>
                    <span className="ai-btn-badge">Realtime Chat</span>
                  </button>

                  <button
                    type="button"
                    className="btn-auto-fix-ai"
                    onClick={handleOpenAutoFixModal}
                    disabled={isRendering || isAutoFixing}
                    title="Perbaiki error runtime secara otomatis dengan Gemini AI"
                  >
                    {isAutoFixing ? (
                      <>
                        <span className="ai-status-spinner" />
                        <span>Memperbaiki Error...</span>
                      </>
                    ) : (
                      <>
                        <span>Auto-Fix Error</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn-rollback-code"
                    onClick={handleRollbackCode}
                    disabled={!lastWorkingCode || isRendering || isAutoFixing}
                    title={
                      lastWorkingCode
                        ? 'Kembalikan file VibeGraphic.tsx ke versi kode terakhir yang aman dan stabil'
                        : 'Belum ada versi kode sebelumnya untuk di-rollback'
                    }
                  >
                    <span>Kembalikan ke Versi Sebelumnya</span>
                  </button>
                </div>

                {/* BARIS 2: Render & Export Toolbar */}
                <div className="render-export-row">
                  <div className="render-export-left-controls">
                    {/* 1. Dropdown Format: MP4 / ProRes 4444 */}
                    <div className="render-format-dropdown-wrap">
                      <select
                        className="render-format-select"
                        value={exportFormat}
                        onChange={(e) => {
                          const newFormat = e.target.value as 'mp4' | 'prores4444'
                          setExportFormat(newFormat)
                          if (newFormat === 'mp4') {
                            setIsTransparent(false)
                          }
                        }}
                        disabled={isRendering}
                        title="Pilih format render video"
                      >
                        <option value="mp4">MP4 (H.264 - Standar)</option>
                        <option value="prores4444">
                          MOV (Apple ProRes 4444 - Kualitas Terbaik)
                        </option>
                      </select>
                      <span className="render-format-caret">▼</span>
                    </div>

                    {/* 2. Dropdown Background: Solid / Transparan */}
                    <div
                      className="render-bg-dropdown-wrap"
                      title={
                        exportFormat === 'mp4'
                          ? 'Format MP4 hanya mendukung latar solid'
                          : 'Pilih mode latar belakang: Solid atau Transparan (Alpha Channel)'
                      }
                    >
                      <select
                        className="render-bg-select"
                        value={exportFormat === 'mp4' ? 'solid' : isTransparent ? 'transparent' : 'solid'}
                        onChange={(e) => setIsTransparent(e.target.value === 'transparent')}
                        disabled={isRendering || exportFormat === 'mp4'}
                        title={
                          exportFormat === 'mp4'
                            ? 'Format MP4 hanya mendukung latar solid'
                            : 'Pilih mode latar belakang: Solid atau Transparan (Alpha Channel)'
                        }
                      >
                        <option value="solid">⬛ Solid / Latar Penuh</option>
                        <option value="transparent">✨ Transparan (Alpha Channel)</option>
                      </select>
                      <span className="render-bg-caret">▼</span>
                    </div>

                    {/* 3. Dropdown Mode: Auto */}
                    <div className="render-mode-dropdown-wrap">
                      <select
                        className="render-mode-select"
                        value={renderMode}
                        onChange={(e) => setRenderMode(e.target.value as 'auto' | 'gpu' | 'cpu')}
                        disabled={isRendering}
                        title="Pilih mode render hardware (Auto / GPU Hardware Acceleration / CPU SwiftShader)"
                      >
                        <option value="auto">⚡ Mode: Auto</option>
                        <option value="gpu">🚀 Mode: GPU (Akselerasi)</option>
                        <option value="cpu">💻 Mode: CPU (SwiftShader)</option>
                      </select>
                      <span className="render-mode-caret">▼</span>
                    </div>

                    {/* 4 & 5. Folder Export & Tombol Ganti */}
                    <div className="render-folder-group">
                      <button
                        type="button"
                        className={`btn-select-output-folder ${customOutputFolder ? 'custom-active' : ''}`}
                        onClick={() => handleOpenExportFolder(customOutputFolder)}
                        disabled={isRendering}
                        title={
                          customOutputFolder
                            ? `Buka Folder Ekspor di File Explorer: ${customOutputFolder}`
                            : 'Buka Folder Ekspor di File Explorer (Downloads/Motion Studio Exports)'
                        }
                      >
                        <svg className="folder-icon-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        <span
                          className="folder-label-text"
                          title={
                            customOutputFolder
                              ? `Folder Ekspor: ${customOutputFolder}`
                              : 'Folder Ekspor: Downloads/Motion Studio Exports'
                          }
                        >
                          {customOutputFolder
                            ? customOutputFolder.split(/[\\\/]/).filter(Boolean).pop() || 'Folder Custom'
                            : 'Folder Ekspor'}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="btn-change-folder shrink-0"
                        onClick={handleSelectOutputFolder}
                        disabled={isRendering}
                        title="Ganti folder tujuan ekspor video"
                      >
                        Ganti
                      </button>
                    </div>
                  </div>

                  {/* 6. Tombol Hijau Ekspor / Render Video atau Active Progress Bar */}
                  <div className="render-export-action">
                    {isRendering ? (
                      <div className="render-progress-active-box">
                        <div className="render-progress-track">
                          <div
                            className="render-progress-bar"
                            style={{ width: `${Math.max(4, renderProgress)}%` }}
                          />
                          <span className="render-progress-text">
                            {renderStatus || `Rendering ${renderProgress}%...`}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-cancel-render"
                          onClick={handleCancelRender}
                          title="Batalkan proses rendering"
                        >
                          ✕ Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-export-video-primary shrink-0 whitespace-nowrap px-4 py-2"
                        onClick={handleExportVideo}
                        disabled={isAiGenerating || isAiRefining}
                        title="Render video fisik beresolusi tinggi"
                      >
                        <svg className="btn-render-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <span>Ekspor / Render Video</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Render Toast Notification Card */}
              {renderResult && (
                <div className={`render-toast-card ${renderResult.type}`}>
                  <div className="toast-left">
                    <span className="toast-icon">
                      {renderResult.type === 'success' ? '✅' : '❌'}
                    </span>
                    <div className="toast-info">
                      <div className="toast-title">
                        {renderResult.type === 'success'
                          ? 'Render berhasil disimpan!'
                          : 'Render Gagal'}
                      </div>
                      <div className="toast-detail">{renderResult.message}</div>
                    </div>
                  </div>
                  <div className="toast-right">
                    {renderResult.filePath && (
                      <button
                        type="button"
                        className="btn-toast-folder"
                        onClick={() => handleOpenExportFolder(renderResult.filePath)}
                        title="Buka folder video di File Explorer"
                      >
                        📂 Buka Folder
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-toast-dismiss"
                      onClick={() => setRenderResult(null)}
                      title="Tutup pemberitahuan"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Preview Status Footer */}
              <div className="preview-footer">
                <div className="meta-group">
                  <div className="meta-item">
                    <strong>Title:</strong>
                    <span>{paramTitleText || detectedTitle || 'Custom Motion'}</span>
                  </div>
                  <div className="meta-item">
                    <strong>Specs:</strong>
                    <span style={{ color: '#38bdf8' }}>
                      {aspectRatio} • {resolutionQuality.toUpperCase()} ({width}×{height}) • {fps}{' '}
                      FPS
                    </span>
                  </div>
                  <div className="meta-item">
                    <strong>Format:</strong>
                    <span style={{ color: exportFormat !== 'mp4' ? '#c084fc' : '#38bdf8' }}>
                      {exportFormat === 'prores4444'
                        ? isTransparent
                          ? 'MOV (ProRes 4444 Alpha)'
                          : 'MOV (ProRes 4444 Solid)'
                        : 'MP4 (H.264)'}
                    </span>
                  </div>
                </div>

                <div className="meta-group">
                  <div className="meta-item">
                    <span>Accent:</span>
                    <div className="meta-color-pill">
                      <span className="color-dot" style={{ backgroundColor: detectedAccent }} />
                      <span>{detectedAccent}</span>
                    </div>
                  </div>

                  <div className="meta-item">
                    <span>Background:</span>
                    <div className="meta-color-pill">
                      <span
                        className="color-dot"
                        style={{
                          backgroundColor:
                            exportFormat === 'prores4444' && isTransparent
                              ? 'transparent'
                              : detectedBg,
                          border:
                            exportFormat === 'prores4444' && isTransparent
                              ? '1px dashed #c084fc'
                              : 'none'
                        }}
                      />
                      <span>
                        {exportFormat === 'prores4444' && isTransparent
                          ? 'Alpha / Transparan'
                          : detectedBg}
                      </span>
                    </div>
                  </div>

                  <div className="meta-item">
                    <span style={{ opacity: 0.7 }}>
                      {durationSeconds}.0s / {durationInFrames} frames ({fps} FPS)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          </main>
        </div>

        {/* TAB 3: Template Custom AI (Hidden in v1.0 Core Mode) */}
        {activeTab === 'template' && (
          <div className="tab-content-pane template-tab-pane" style={{ display: 'flex' }}>
            <TemplateCustomAI
              apiKey={geminiApiKey}
              onApplyAndGenerate={async (promptText: string) => {
                setAiPrompt(promptText)
                setActiveTab('preview')
                await handleGenerateVideoWithAI(promptText)
              }}
              isGenerating={isAiGenerating}
            />
          </div>
        )}

        {/* TAB 4: Auto Coder (Batch Pipeline - Hidden in v1.0 Core Mode) */}
        {activeTab === 'autocoder' && (
          <div className="tab-content-pane autocoder-tab-pane" style={{ display: 'flex' }}>
            <AutoCoder apiKey={geminiApiKey} />
          </div>
        )}
      </div>

      {/* Floating AI Chat Modal: Realtime Video Refinement */}
      {isChatModalOpen && (
        <div className="ai-chat-modal-overlay" onClick={() => setIsChatModalOpen(false)}>
          <div className="ai-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-chat-modal-header">
              <div className="ai-chat-modal-title">
                <div className="ai-modal-avatar-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><path d="M9 14v1"/><path d="M15 14v1"/><path d="M3 21a7 7 0 0 0 18 0"/></svg>
                </div>
                <div>
                  <h3>AI Motion Director</h3>
                  <p>Beri instruksi revisi pada aset motion yang sedang aktif</p>
                </div>
              </div>
              <button
                type="button"
                className="ai-chat-close-btn"
                onClick={() => setIsChatModalOpen(false)}
                title="Tutup dialog chat"
              >
                ✕
              </button>
            </div>

            <div className="ai-chat-messages">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`chat-message-row ${msg.role}`}>
                  <div className={`chat-avatar ${msg.role === 'assistant' ? 'chat-avatar-ai' : 'chat-avatar-user'}`}>
                    {msg.role === 'assistant' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )}
                  </div>
                  <div className={`chat-bubble ${msg.role} ${msg.status || ''}`}>
                    <button
                      type="button"
                      className={`chat-copy-btn ${copiedChatId === msg.id ? 'copied' : ''}`}
                      onClick={() => handleCopyChatMessage(msg.id, msg.text)}
                      title={copiedChatId === msg.id ? 'Tersalin ke clipboard!' : 'Salin isi pesan'}
                    >
                      {copiedChatId === msg.id ? (
                        <>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                    <div className="chat-bubble-text">{msg.text}</div>
                    <div className="chat-bubble-time">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
              {isAiRefining && (
                <div className="chat-message-row assistant">
                  <div className="chat-avatar chat-avatar-ai">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </div>
                  <div className="chat-bubble assistant loading">
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="loading-text">Gemini sedang merevisi kode VibeGraphic.tsx...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <div className="ai-chat-suggestions">
              <span className="suggestion-label">Saran Cepat:</span>
              <button
                type="button"
                className="chip-suggestion"
                onClick={() =>
                  handleSendChatRevision('Percepat tempo animasi menjadi lebih energik dan dinamis (1.5x)')
                }
                disabled={isAiRefining}
              >
                Percepat Tempo (1.5x)
              </button>
              <button
                type="button"
                className="chip-suggestion"
                onClick={() =>
                  handleSendChatRevision(
                    'Ubah aksen warna menjadi neon purple (#c084fc) dan background lebih pekat'
                  )
                }
                disabled={isAiRefining}
              >
                Ganti Aksen Warna
              </button>
              <button
                type="button"
                className="chip-suggestion"
                onClick={() =>
                  handleSendChatRevision(
                    'Tambahkan elemen orbit atau partikel bercahaya yang berputar halus mengelilingi pusat'
                  )
                }
                disabled={isAiRefining}
              >
                Tambah Efek Partikel/Orbit
              </button>
            </div>

            <form
              className="ai-chat-input-form"
              onSubmit={(e) => {
                e.preventDefault()
                handleSendChatRevision()
              }}
            >
              <input
                type="text"
                className="ai-chat-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ketik instruksi revisi (misal: 'Buat judul berkedip halus dan aksen warna emas')..."
                disabled={isAiRefining}
              />
              <button
                type="submit"
                className="btn-send-chat"
                disabled={isAiRefining || !chatInput.trim()}
              >
                {isAiRefining ? (
                  <span className="ai-status-spinner" />
                ) : (
                  <span>Kirim</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Rollback / Auto-Fix Toast Notification */}
      {rollbackToast && (
        <div className="floating-rollback-toast">
          <span>{rollbackToast}</span>
        </div>
      )}

      {/* Auto-Fix Error AI Modal */}
      {isAutoFixModalOpen && (
        <div className="ai-chat-modal-overlay" onClick={() => setIsAutoFixModalOpen(false)}>
          <div className="auto-fix-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-chat-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className={`ai-modal-avatar-badge ${autoFixMode === 'visual_recovery' ? 'cyan' : 'amber'}`}>
                  {autoFixMode === 'visual_recovery' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', color: autoFixMode === 'visual_recovery' ? '#38bdf8' : '#fef08a', fontWeight: 800 }}>
                    {autoFixMode === 'visual_recovery'
                      ? 'Visual Recovery — Pemulihan Kanvas Blank'
                      : 'Auto-Fix Error AI (Self-Healing)'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                    {autoFixMode === 'visual_recovery'
                      ? 'Pemulihan visual layar gelap, opacity frame 0 & sinkronisasi viewport'
                      : 'Analisis runtime error & perbaiki kode TSX secara otomatis'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="ai-chat-close-btn"
                onClick={() => setIsAutoFixModalOpen(false)}
                title="Tutup dialog auto-fix"
              >
                ✕
              </button>
            </div>

            <div className="auto-fix-modal-body">
              {autoFixMode === 'runtime_error' ? (
                /* Mode 1: Runtime Error Detected (Zero Manual Copy-Paste) */
                <div className="detected-error-box">
                  <div className="detected-error-header">
                    <span className="error-pulse-dot" />
                    <strong>Runtime Error Terdeteksi Otomatis:</strong>
                  </div>
                  <pre className="detected-error-code">
                    {autoFixErrorInput || capturedError || 'Runtime error terdeteksi pada engine preview.'}
                  </pre>
                  <p className="detected-error-help">
                    Pesan error di atas ditangkap otomatis dari engine preview. Klik tombol di bawah untuk perbaikan 1-klik dengan AI.
                  </p>
                </div>
              ) : (
                /* Mode 2: Visual Recovery / Blank Screen (Silent Failure) */
                <div className="visual-recovery-card">
                  <div className="visual-recovery-header">
                    <span className="recovery-sparkle-icon">✨</span>
                    <strong>Tampilan Kanvas Gelap / Blank Terdeteksi</strong>
                  </div>
                  <p className="visual-recovery-desc">
                    Tidak ada runtime crash teknis pada preview. Mode <strong>Visual Recovery</strong> akan memeriksa dan memperbaiki penyebab umum layar kosong:
                  </p>
                  <ul className="visual-recovery-checklist">
                    <li>✓ Memastikan <strong>opacity elemen pada Frame 0</strong> minimal 0.95 (tidak tertahan di 0/NaN).</li>
                    <li>✓ Mengoreksi koordinat agar semua elemen berada di dalam <strong>viewport kanvas aktif</strong> ({width} × {height}).</li>
                    <li>✓ Memastikan warna teks & badge <strong>kontras tajam</strong> dengan background solid pada &lt;AbsoluteFill&gt;.</li>
                    <li>✓ Menggunakan <code>useVideoConfig()</code> untuk tata letak dinamis sesuai resolusi aktif.</li>
                  </ul>
                  <div className="visual-recovery-specs-pill">
                    <span>📐 {width} × {height} ({aspectRatio})</span>
                    <span>•</span>
                    <span>{fps} FPS</span>
                    <span>•</span>
                    <span>{durationSeconds} Detik ({durationInFrames} frames)</span>
                  </div>
                </div>
              )}

              {/* Collapsible Manual Input / Notes (Optional) */}
              <div className="manual-note-toggle-row">
                <button
                  type="button"
                  className="btn-toggle-manual-input"
                  onClick={() => setShowManualErrorInput((prev) => !prev)}
                >
                  {showManualErrorInput
                    ? '▼ Sembunyikan Input Manual'
                    : '▶ Tambah Catatan / Sesuaikan Pesan Manual (Opsional)'}
                </button>
              </div>

              {showManualErrorInput && (
                <div className="manual-input-drawer">
                  <textarea
                    className="auto-fix-textarea"
                    value={autoFixErrorInput}
                    onChange={(e) => setAutoFixErrorInput(e.target.value)}
                    rows={3}
                    placeholder="Ketik atau edit catatan error/instruksi tambahan untuk AI di sini..."
                  />
                  <div className="auto-fix-chips">
                    <span className="chip-label">Pilihan Error Umum (Klik Cepat):</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="chip-suggestion"
                        onClick={() => {
                          setAutoFixErrorInput(
                            'inputRange must be strictly monotonically increasing: values must be in ascending order'
                          )
                          setAutoFixMode('runtime_error')
                        }}
                      >
                        ⚠️ interpolate() inputRange
                      </button>
                      <button
                        type="button"
                        className="chip-suggestion"
                        onClick={() => {
                          setAutoFixErrorInput(
                            'outputRange and inputRange must have the same length'
                          )
                          setAutoFixMode('runtime_error')
                        }}
                      >
                        ⚠️ Range length mismatch
                      </button>
                      <button
                        type="button"
                        className="chip-suggestion"
                        onClick={() => {
                          setAutoFixErrorInput(
                            'Canvas blank / visual elements missing on Frame 0'
                          )
                          setAutoFixMode('visual_recovery')
                        }}
                      >
                        🎨 Blank Screen Frame 0
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="auto-fix-actions">
                <button
                  type="button"
                  className="btn-cancel-autofix"
                  onClick={() => setIsAutoFixModalOpen(false)}
                  disabled={isAutoFixing}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className={`btn-execute-autofix ${autoFixMode === 'visual_recovery' ? 'visual-recovery-btn' : ''}`}
                  onClick={() =>
                    handleExecuteAutoFix(
                      autoFixErrorInput ||
                        (autoFixMode === 'runtime_error' ? capturedError : '')
                    )
                  }
                  disabled={isAutoFixing}
                >
                  {isAutoFixing ? (
                    <>
                      <span className="ai-status-spinner" />
                      <span>{autoFixMode === 'visual_recovery' ? 'Memulihkan Visual...' : 'Memperbaiki Error...'}</span>
                    </>
                  ) : autoFixMode === 'visual_recovery' ? (
                    <>
                      <span>✨</span>
                      <span>Perbaiki Tampilan Blank / Reset Visual</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Perbaiki Error Ini (1-Klik AI)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* License Access Denied Alert Modal */}
      {isLicenseAlertOpen && (
        <div className="license-modal-overlay" onClick={() => setIsLicenseAlertOpen(false)}>
          <div className="license-modal" onClick={(e) => e.stopPropagation()}>
            <div className="license-modal-header">
              <span className="license-modal-icon">🔒</span>
              <h3>Akses Ditolak: Fitur Terkunci</h3>
              <button
                type="button"
                className="license-modal-close"
                onClick={() => setIsLicenseAlertOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="license-modal-desc">
              Akses Ditolak: Fitur ini terkunci. Masukkan nomor lisensi Motion Suite Pro yang valid untuk menggunakan generator AI dan render video.
            </p>
            <div className="license-modal-machine-box">
              <span className="machine-title">Hardware Machine ID Perangkat Anda:</span>
              <code
                className="machine-code"
                onClick={() => {
                  navigator.clipboard.writeText(licenseStatus.machineId)
                  setLicenseFeedback({ type: 'success', message: 'Machine ID disalin ke clipboard!' })
                }}
                title="Klik untuk menyalin Machine ID"
              >
                {licenseStatus.machineId} 📋
              </code>
              <small className="machine-help">
                Berikan kode Machine ID di atas kepada admin/penjual untuk mendapatkan kunci lisensi Anda.
              </small>
            </div>
            <div className="license-modal-actions">
              <button
                type="button"
                className="btn-license-modal-primary"
                onClick={() => setIsLicenseAlertOpen(false)}
              >
                Saya Mengerti (Masukkan Lisensi di Panel Kiri)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Video Preview Overlay */}
      {isFullscreenPreview && (
        <div
          className="fullscreen-preview-overlay fixed inset-0 z-50 bg-black/95 flex flex-col p-4"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(5, 7, 15, 0.97)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Fullscreen Header Bar */}
          <div
            className="fullscreen-preview-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px 12px 4px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>🎬</span>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>
                Layar Penuh Preview — {currentTitle || 'Motion Suite Pro Video'}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981'
                }}
              >
                {aspectRatio} • {resolutionQuality.toUpperCase()} • {fps} FPS
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Tekan <kbd style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0', fontSize: '11px' }}>Esc</kbd> untuk keluar
              </span>
              <button
                type="button"
                className="btn-close-fullscreen"
                onClick={() => setIsFullscreenPreview(false)}
                title="Keluar dari Layar Penuh (Esc)"
              >
                ✕ Keluar Layar Penuh
              </button>
            </div>
          </div>

          {/* Fullscreen Video Frame Container */}
          <div
            className="fullscreen-preview-body"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '14px',
              overflow: 'hidden',
              borderRadius: '12px',
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(16, 185, 129, 0.15)'
            }}
          >
            <div className="studio-iframe-clip-wrapper">
              <iframe
                key={`fullscreen-${iframeKey}`}
                src={`http://localhost:${studioPort}`}
                title="Studio Preview — Live Canvas"
                className="fullscreen-preview-iframe"
                onLoad={handleIframeElementLoad}
                style={{
                  width: '100%',
                  height: 'calc(100% + 46px)',
                  marginTop: '-46px',
                  border: 'none'
                }}
                allow="fullscreen; autoplay; clipboard-read; clipboard-write"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Auto-Update Pop-Up Modal (OBS Studio Style) ────────────────── */}
      {updatePhase !== 'idle' && !isUpdateDismissed && (
        <div
          className="update-modal-backdrop"
          onClick={() => setIsUpdateDismissed(true)}
        >
          <div
            className="update-modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-modal-title"
          >
            {/* Modal Header */}
            <div className="update-modal-header">
              <div className="update-modal-title-group">
                <div className="update-modal-icon-badge">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <div className="update-modal-header-text">
                  <h3 id="update-modal-title" className="update-modal-title">
                    Pembaruan Tersedia
                  </h3>
                  <p className="update-modal-version-tag">
                    Motion Suite Pro <strong>v{updateVersion || '1.0.4'}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="update-modal-close-btn"
                onClick={() => setIsUpdateDismissed(true)}
                title="Tutup (Nanti Saja)"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="update-modal-body">
              <p className="update-modal-description">
                Versi baru Motion Suite Pro telah tersedia untuk dipasang. Pembaruan ini mencakup optimasi performa rendering, perbaikan stabilitas engine, dan pembaruan fitur.
              </p>

              {/* Release Notes Area */}
              <div className="update-modal-notes-section">
                <div className="update-modal-notes-label">
                  <span>Catatan Rilis (Release Notes):</span>
                  <span className="update-modal-tag">v{updateVersion || '1.0.4'}</span>
                </div>
                <div className="update-release-notes-box">
                  {updateReleaseNotes}
                </div>
              </div>

              {/* Real-time Progress Bar */}
              {updatePhase === 'downloading' && (
                <div className="update-modal-progress-wrap">
                  <div className="update-progress-info">
                    <span className="update-progress-label">
                      {updatePercent >= 100
                        ? 'Memverifikasi paket instalasi...'
                        : 'Mengunduh pembaruan di latar belakang...'}
                    </span>
                    <span className="update-progress-number">{updatePercent}%</span>
                  </div>
                  <div className="update-modal-progress-track">
                    <div
                      className="update-modal-progress-fill"
                      style={{ width: `${Math.max(3, updatePercent)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Download Completed Notification */}
              {updatePhase === 'downloaded' && (
                <div className="update-modal-downloaded-banner">
                  <span style={{ fontSize: '18px' }}>🎉</span>
                  <div className="downloaded-text">
                    <strong>Pembaruan Siap Dipasang!</strong>
                    <span>
                      Paket instalasi v{updateVersion || '1.0.4'} telah selesai diunduh dan diverifikasi. Klik tombol di bawah untuk memasang dan me-restart aplikasi.
                    </span>
                  </div>
                </div>
              )}

              {/* Error Banner if any */}
              {updateErrorMsg && (
                <div className="update-modal-error-banner">
                  <span>⚠️</span>
                  <span>{updateErrorMsg}</span>
                </div>
              )}
            </div>

            {/* Modal Actions / Footer */}
            <div className="update-modal-footer">
              {updatePhase === 'available' && (
                <>
                  <button
                    type="button"
                    className="update-modal-btn secondary"
                    onClick={() => setIsUpdateDismissed(true)}
                  >
                    Nanti Saja
                  </button>
                  <button
                    type="button"
                    className="update-modal-btn primary"
                    onClick={handleStartUpdateDownload}
                  >
                    <span>⚡</span>
                    <span>Perbarui Sekarang</span>
                  </button>
                </>
              )}

              {updatePhase === 'downloading' && (
                <>
                  <button
                    type="button"
                    className="update-modal-btn secondary"
                    onClick={() => setIsUpdateDismissed(true)}
                  >
                    Sembunyikan (Unduh di Latar)
                  </button>
                  {updateErrorMsg ? (
                    <button
                      type="button"
                      className="update-modal-btn primary retry"
                      onClick={handleStartUpdateDownload}
                    >
                      <span>🔄</span>
                      <span>Coba Lagi</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="update-modal-btn primary disabled"
                      disabled
                    >
                      <span>Mengunduh ({updatePercent}%)...</span>
                    </button>
                  )}
                </>
              )}

              {updatePhase === 'downloaded' && (
                <>
                  <button
                    type="button"
                    className="update-modal-btn secondary"
                    onClick={() => setIsUpdateDismissed(true)}
                  >
                    Nanti Saja
                  </button>
                  <button
                    type="button"
                    className="update-modal-btn primary install"
                    onClick={handleRestartAndInstall}
                  >
                    <span>🚀</span>
                    <span>Restart &amp; Pasang Sekarang</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
