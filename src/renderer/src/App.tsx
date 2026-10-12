import { useUiLanguage, StudioIcon, UiLanguageContext } from './i18n'
import React, { useState, useEffect, useRef } from 'react'
import { generationFailure, generationMessage } from '../../shared/generationFeedback'
import type { GenerationFailure } from '../../shared/generationFeedback'
import './App.css'
import { TemplateCustomAI } from './components/TemplateCustomAI'
import { AutoCoder } from './components/AutoCoder'
import { ParametricControlPanel } from './components/ParametricControlPanel'
import { UpdateReleaseNotes, normalizeUpdateVersion } from './components/UpdateReleaseNotes'

interface RenderNotification {
  type: 'success' | 'error'
  message: string
  filePath?: string
}

export type AspectRatioType = '16:9' | '9:16'
export type ResolutionQualityType = '1080p' | '2k' | '4k'
export type DurationSecondsType = 5 | 10 | 15 | 20
export type FpsType = 24 | 30 | 60

import { buildMasterPrompt } from './constants/prompts'
import { ANIMATION_TYPES, THREE_RUNTIME_READY, isAnimationType } from '../../shared/animationTechnique'
import type { AnimationType } from '../../shared/animationTechnique'
export { MASTER_PROMPT_TEMPLATE } from './constants/prompts'

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

// Clean and strip markdown code fences and extraneous text from AI generated code
export function cleanAndStripMarkdownCode(raw: string): string {
  let cleaned = (raw || '').trim()

  // A. Pembersih Markdown: Hapus pembungkus markdown secara otomatis
  const fenceMatch = cleaned.match(/```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)```/i)
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim()
  } else {
    cleaned = cleaned.replace(/^```(?:tsx|typescript|jsx|javascript)?\s*/i, '')
    cleaned = cleaned.replace(/\s*```+\s*$/i, '')
    cleaned = cleaned.trim()
  }

  // Preserve // @title: metadata if present before import
  const titleIdx = cleaned.indexOf('// @title:')
  const importIdx = cleaned.indexOf('import ')
  if (titleIdx >= 0 && (importIdx === -1 || titleIdx < importIdx)) {
    cleaned = cleaned.slice(titleIdx).trim()
  } else if (importIdx > 0) {
    cleaned = cleaned.slice(importIdx).trim()
  }
  cleaned = cleaned.replace(/```+\s*$/g, '').trim()

  // Auto-Sanitize Unterminated String Constants (v1.0.7 UX enhancement)
  cleaned = sanitizeUnterminatedStrings(cleaned)

  // Auto-Sanitize JSX Backtick Attributes (v1.0.8 Zero-Panic Self-Healing)
  cleaned = sanitizeJsxBacktickAttributes(cleaned)

  // B. Auto-Sanitizer Easing Halusinasi (v1.0.7):
  cleaned = cleaned.replace(/Easing\.backIn\((.*?)\)/g, 'Easing.in(Easing.back($1))')
  cleaned = cleaned.replace(/Easing\.backOut\((.*?)\)/g, 'Easing.out(Easing.back($1))')
  cleaned = cleaned.replace(/Easing\.backInOut\((.*?)\)/g, 'Easing.inOut(Easing.back($1))')

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
  static contextType = UiLanguageContext
  declare context: React.ContextType<typeof UiLanguageContext>
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
    const { t } = this.context
    if (this.state.hasError && this.state.error) {
      return (
        <div className="remotion-error-boundary-box">
          <div className="error-badge">{t("⚠️ TSX RUNTIME EXCEPTION")}</div>
          <p className="error-msg">{this.state.error.message}</p>
          <p className="error-subtext"> {t("Terjadi runtime error pada komponen animasi. Silakan periksa sintaks kode TSX Anda atau klik Reset untuk memuat kembali template standar.")} </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-error-retry"
              onClick={this.handleRetry}
              disabled={this.props.isHealing}
            > {t("🔄 Coba Muat Ulang")} </button>
            {this.props.onUseFallback && (
              <button
                type="button"
                className="btn-error-fallback"
                onClick={this.props.onUseFallback}
                disabled={this.props.isHealing}
              > {t("⚡ Reset Template Standar")} </button>
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
  usesGenerationText?: boolean
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
  titleText?: string
  subtitleText?: string
  badgeText?: string
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
  const { language, setLanguage, t, message } = useUiLanguage()
  const [showLicenseSettings, setShowLicenseSettings] = useState(false)
  // Active Navigation Tab State (4 Tabs Architecture)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'template' | 'autocoder'>('preview')

  // Dynamic App Version from package.json via app.getVersion()
  const [appVersion, setAppVersion] = useState<string>('PRO v1.0.7')

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
  const [paramTitleText, setParamTitleText] = useState<string | undefined>(() => {
    const saved = loadSavedVideoSettings()
    return saved.usesGenerationText ? saved.titleText : (saved.titleText ?? 'MOTION SUITE PRO')
  })
  const [paramSubtitleText, setParamSubtitleText] = useState<string | undefined>(() => {
    const saved = loadSavedVideoSettings()
    return saved.usesGenerationText ? saved.subtitleText : (saved.subtitleText ?? 'AI Creative Motion Graphics Workstation')
  })
  const [paramBadgeText, setParamBadgeText] = useState<string | undefined>(() => {
    const saved = loadSavedVideoSettings()
    return saved.usesGenerationText ? saved.badgeText : (saved.badgeText ?? 'OFFICIAL RELEASE v1.0')
  })
  // Legacy sessions keep their text; only a successful NEW Generate owns new text.
  const [usesGenerationText, setUsesGenerationText] = useState<boolean>(() =>
    loadSavedVideoSettings().usesGenerationText === true
  )
  const [reuseTextOnGenerate, setReuseTextOnGenerate] = useState<boolean>(false)

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
      titleText: saved.usesGenerationText ? saved.titleText : (saved.titleText ?? 'MOTION SUITE PRO'),
      subtitleText: saved.usesGenerationText ? saved.subtitleText : (saved.subtitleText ?? 'AI Creative Motion Graphics Workstation'),
      badgeText: saved.usesGenerationText ? saved.badgeText : (saved.badgeText ?? 'OFFICIAL RELEASE v1.0'),
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
      // Preserve active transparent UI toggle: do not let AI default 'false' silently reset user's transparent mode
      setIsTransparent((current) => (current && !parsed.isTransparent ? current : parsed.isTransparent!))
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
  const [updateReleaseNotes, setUpdateReleaseNotes] = useState<{ version: string; notes: unknown } | null>(null)
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
  const isMacPlatform =
    (window as any).api?.platform === 'darwin' ||
    (window as any).electronAPI?.platform === 'darwin' ||
    (window as any).electron?.process?.platform === 'darwin' ||
    (typeof navigator !== 'undefined' && /macintosh|mac os x/i.test(navigator.userAgent))

  useEffect(() => {
    if (isMacPlatform) return
    const api = (window as any).api || (window as any).electronAPI
    if (!api?.onUpdateAvailable) return

    const unsubAvailable = api.onUpdateAvailable((info: any) => {
      const version = normalizeUpdateVersion(info?.version)
      setUpdateVersion(version)
      setUpdateReleaseNotes({ version, notes: info?.releaseNotes })
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
        setUpdateVersion(normalizeUpdateVersion(info.version))
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
  }, [isMacPlatform])

  const handleStartUpdateDownload = async (): Promise<void> => {
    if (isMacPlatform) return
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
    if (isMacPlatform) return
    const api = (window as any).api || (window as any).electronAPI
    if (api?.restartAndInstall) {
      api.restartAndInstall()
    } else if (api?.installAndRestart) {
      api.installAndRestart()
    } else if ((window as any).electron?.ipcRenderer?.invoke) {
      ;(window as any).electron.ipcRenderer.invoke('restart-app-for-update')
    }
  }

  const GOOGLE_DRIVE_MAC_URL =
    'https://drive.google.com/drive/folders/1hWySL1-pSUiXX6VJbwi1UAREi_Jfo_5e?usp=sharing'

  const handleOpenMacDownload = (): void => {
    const api = (window as any).api || (window as any).electronAPI
    if (api?.openExternal) {
      api.openExternal(GOOGLE_DRIVE_MAC_URL)
    } else if ((window as any).electron?.ipcRenderer?.invoke) {
      ;(window as any).electron.ipcRenderer.invoke('open-external-url', GOOGLE_DRIVE_MAC_URL)
    } else {
      window.open(GOOGLE_DRIVE_MAC_URL, '_blank')
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

  // Refresh iframe preview on code update
  const remountPlayer = (): void => {
    setIframeKey((prev) => prev + 1)
  }

  // Clean Remotion Studio developer menu bars & raw render buttons inside preview iframe(s)
  const injectStudioCleanStyles = React.useCallback(
    (iframeElement?: HTMLIFrameElement | null): void => {
      const candidates: HTMLIFrameElement[] = []
      if (iframeElement) candidates.push(iframeElement)
      if (iframeRef.current && !candidates.includes(iframeRef.current)) candidates.push(iframeRef.current)
      const queried = Array.from(
        document.querySelectorAll<HTMLIFrameElement>('iframe.studio-iframe, iframe.fullscreen-preview-iframe')
      )
      for (const el of queried) {
        if (!candidates.includes(el)) candidates.push(el)
      }

      candidates.forEach((iframe) => {
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

            /* Background transparan untuk iframe agar tembus ke motif papan catur host */
            html,
            body,
            #root,
            [data-testid="player-container"],
            [data-remotion-player],
            .__remotion-player {
              background: transparent !important;
              background-color: transparent !important;
            }
          `
        } catch (err) {
          console.warn('[StudioPreview] Clean theme injection note:', err)
        }
      })
    },
    []
  )

  // Synchronize clean studio styles when code is updated or iframe reloads
  useEffect(() => {
    injectStudioCleanStyles()
    const t = setTimeout(() => {
      injectStudioCleanStyles()
    }, 300)
    return (): void => clearTimeout(t)
  }, [iframeKey, manualCode, injectStudioCleanStyles])

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
    const titleCommentMatch = manualCode.match(/\/\/\s*@title:\s*(.+)/)
    if (titleCommentMatch && titleCommentMatch[1] && titleCommentMatch[1].trim()) {
      return titleCommentMatch[1].trim()
    }
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

  // Hardware License & Feature Gating States
  interface LicenseState {
    isValid: boolean
    isLicensed?: boolean
    machineId: string
    plan?: string
    licenseKey?: string
    expiryDate?: string | null
    expiresAt?: string | null
    isClockDesynced?: boolean
    statusCode?: 'VALID' | 'EXPIRED' | 'CLOCK_DESYNC' | 'UNLICENSED' | 'TAMPERED'
    statusMessage?: string
  }

  const [licenseStatus, setLicenseStatus] = useState<LicenseState>({
    isValid: false,
    machineId: 'Loading...',
    plan: undefined,
    expiryDate: null,
    expiresAt: null,
    licenseKey: ''
  })
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>('')
  const [isLicenseValidating, setIsLicenseValidating] = useState<boolean>(false)
  const [licenseFeedback, setLicenseFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [isLicenseAlertOpen, setIsLicenseAlertOpen] = useState<boolean>(false)
  const [isSyncingTime, setIsSyncingTime] = useState<boolean>(false)
  const [timeSyncFeedback, setTimeSyncFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [isWarningDismissed, setIsWarningDismissed] = useState<boolean>(false)

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

  // Handle Online Internet Time Synchronization (Anti-Clock Rollback)
  const handleSyncTime = async (): Promise<void> => {
    setIsSyncingTime(true)
    setTimeSyncFeedback(null)
    try {
      const api = getElectronAPI()
      if (!api?.syncTime) {
        throw new Error('API syncTime tidak tersedia.')
      }
      const res = await api.syncTime()
      if (res.success) {
        setTimeSyncFeedback({ type: 'success', message: res.message })
        const updated = await api.getLicenseStatus()
        setLicenseStatus(updated)
      } else {
        setTimeSyncFeedback({ type: 'error', message: res.message })
      }
    } catch (err) {
      setTimeSyncFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal melakukan sinkronisasi waktu.'
      })
    } finally {
      setIsSyncingTime(false)
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

  // Dynamic Status Bar Title State (v1.0.7)
  const [statusBarTitle, setStatusBarTitle] = useState<string>('MOTION SUITE PRO')
  const [lastUserPromptConcept, setLastUserPromptConcept] = useState<string>('')

  // Helper untuk mengekstrak nama konsep prompt pengguna
  const extractConceptFromPrompt = (prompt: string): string => {
    if (!prompt || !prompt.trim()) return ''
    const quoteMatch = prompt.match(/["']([^"']+)["']/)
    if (quoteMatch && quoteMatch[1].trim()) {
      return quoteMatch[1].trim()
    }
    const firstLine = prompt.split('\n')[0].trim().replace(/^[-*•\d.]+\s*/, '')
    if (firstLine) {
      return firstLine.length <= 40 ? firstLine : firstLine.slice(0, 37) + '...'
    }
    return prompt.trim().slice(0, 30)
  }

  // 2. DYNAMIC STATUS BAR TITLE (FOOTER UI)
  // Hubungkan teks status bar bawah yang saat ini statis ("Title: MOTION SUITE PRO"):
  // - Parser regex untuk membaca metadata di baris pertama kode: const titleMatch = code.match(/\/\/\s*@title:\s*(.+)/);
  // - Jika ditemukan tag @title, perbarui state judul di status bar bawah dengan teks tersebut.
  // - Jika tidak ditemukan tag @title, gunakan nama konsep prompt terakhir dari pengguna sebagai fallback.
  useEffect(() => {
    const code = manualCode || ''
    const titleMatch = code.match(/\/\/\s*@title:\s*(.+)/)
    if (titleMatch && titleMatch[1] && titleMatch[1].trim()) {
      setStatusBarTitle(titleMatch[1].trim())
    } else {
      const fallbackConcept = lastUserPromptConcept || extractConceptFromPrompt(aiPrompt)
      if (fallbackConcept) {
        setStatusBarTitle(fallbackConcept)
      } else if (detectedTitle && detectedTitle !== 'Dynamic Motion' && detectedTitle !== 'CRITICAL WARNING') {
        setStatusBarTitle(detectedTitle)
      } else {
        setStatusBarTitle('MOTION SUITE PRO')
      }
    }
  }, [manualCode, lastUserPromptConcept, aiPrompt, detectedTitle])

  const currentTitle = React.useMemo(() => {
    const titleMatch = manualCode.match(/\/\/\s*@title:\s*(.+)/)
    if (titleMatch && titleMatch[1] && titleMatch[1].trim()) {
      return titleMatch[1].trim()
    }
    if (detectedTitle && detectedTitle !== 'Dynamic Motion' && detectedTitle !== 'CRITICAL WARNING') {
      return detectedTitle
    }
    if (aiPrompt && aiPrompt.trim()) {
      const concept = extractConceptFromPrompt(aiPrompt)
      if (concept) return concept
    }
    return detectedTitle || 'Motion-Asset'
  }, [manualCode, detectedTitle, aiPrompt])
  const [refImageBase64, setRefImageBase64] = useState<string | null>(null)
  const [refImageName, setRefImageName] = useState<string | null>(null)
  const [refImageMimeType, setRefImageMimeType] = useState<string | null>(null)
  const [isDraggingRef, setIsDraggingRef] = useState<boolean>(false)
  const refFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false)
  const [generationMode, setGenerationMode] = useState<'fast' | 'quality'>('fast')
  const [animationType, setAnimationType] = useState<AnimationType>(() => {
    try {
      const saved = localStorage.getItem('ms_animation_type')
      return isAnimationType(saved) ? saved : 'auto'
    } catch { return 'auto' }
  })
  useEffect(() => {
    try { localStorage.setItem('ms_animation_type', animationType) } catch { /* Storage may be unavailable. */ }
  }, [animationType])
  const [precisionSvgStrokes, setPrecisionSvgStrokes] = useState(false)
  const [reusePaletteOnGenerate, setReusePaletteOnGenerate] = useState(false)
  const [qualityStage, setQualityStage] = useState<'Planning' | 'Building Animation' | 'Validating' | 'Ready' | null>(null)
  const [generationStopping, setGenerationStopping] = useState(false)
  const generateBusyRef = useRef(false)
  const generationCancelledRef = useRef(false)
  const generationRequestRef = useRef<string | null>(null)
  useEffect(() => getElectronAPI()?.onGenerationProgress?.((event) => {
    if (event.requestId === generationRequestRef.current && event.stage !== 'Ready') {
      setQualityStage(event.stage)
      setAiGenStatus({ type: 'info', message: event.event === 'recovering'
        ? 'Memeriksa dan memperbaiki sintaks animasi...'
        : event.event === 'fallback'
        ? 'Mengalami kendala pada layanan AI. Mencoba model cadangan...'
        : event.stage + '...', title: event.model ? event.stage + ' - ' + event.model : undefined })
    }
  }), [])
  const [aiGenStatus, setAiGenStatus] = useState<{
    type: 'success' | 'error' | 'info'
    title?: string
    failure?: GenerationFailure
    diagnostics?: string
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

  // Surface preview errors; AI repair requires the manual Auto-Fix action.
  const handleIncomingStudioError = (rawErr: string): void => {
    const cleanErr = (rawErr || '').trim()
    if (cleanErr) setCapturedError(cleanErr)
  }

  const handleIframeElementLoad = (e: React.SyntheticEvent<HTMLIFrameElement>): void => {
    const el = e.currentTarget
    injectStudioCleanStyles(el)

    // Quick verification passes to ensure clean style is firmly attached in head after initial render
    setTimeout(() => {
      injectStudioCleanStyles(el)
    }, 150)
    setTimeout(() => {
      injectStudioCleanStyles(el)
    }, 500)
    setTimeout(() => {
      injectStudioCleanStyles(el)
    }, 1200)

    // Safely attempt to listen for runtime error events inside iframe if window is accessible
    try {
      const win = el.contentWindow
      if (win) {
        win.addEventListener('error', (event) => {
          if (event && event.message) {
            console.warn('[Studio Iframe Error Event]:', event.message)
            handleIncomingStudioError(String(event.message))
          }
        })
        win.addEventListener('unhandledrejection', (event) => {
          if (event && event.reason) {
            const reasonStr = event.reason?.message || String(event.reason)
            console.warn('[Studio Iframe Unhandled Rejection]:', reasonStr)
            handleIncomingStudioError(reasonStr)
          }
        })
      }
    } catch {
      // Cross-origin access safely protected
    }

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
  }

  // Listen for Remotion Studio stderr / runtime errors via IPC Backend (Zero Cross-Origin Risk)
  useEffect(() => {
    const api = getElectronAPI()
    if (!api?.onStudioError) return
    const unsubscribe = api.onStudioError((err: string) => {
      if (!err || !err.trim()) return
      const cleanErr = err.trim()
      console.warn('[App] Remotion Studio runtime error captured via IPC:', cleanErr)
      handleIncomingStudioError(cleanErr)
    })
    return (): void => {
      unsubscribe()
    }
  }, [])

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
    if (isAiGenerating || generateBusyRef.current || isRendering) return
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

    const quality = generationMode === 'quality'
    const selectedAnimationType = animationType
    const usePrecisionSvgStrokes = quality && precisionSvgStrokes
    const reuseCurrentPalette = reusePaletteOnGenerate
    const existingPalette = { accentColor: paramAccentColor, secondaryColor: paramSecondaryColor, backgroundColor: paramBackgroundColor }
    const requestId = quality ? crypto.randomUUID() : undefined
    const reuseCurrentText = reuseTextOnGenerate
    const existingText = { titleText: paramTitleText, subtitleText: paramSubtitleText, badgeText: paramBadgeText }

    const generationContext = {
      width,
      height,
      fps,
      durationInFrames,
      isTransparent,
      scale: paramScale,
      offsetX: textOffsetX,
      offsetY: textOffsetY,
      speedMultiplier: paramSpeedMultiplier,
      glowIntensity: paramGlowIntensity
    }

    const promptConcept = extractConceptFromPrompt(promptToUse)
    if (promptConcept) {
      setLastUserPromptConcept(promptConcept)
    }

    generateBusyRef.current = true
    generationCancelledRef.current = false
    generationRequestRef.current = requestId ?? null
    setQualityStage(quality ? 'Planning' : null)
    setGenerationStopping(false)
    setIsAiGenerating(true)
    setAiGenStatus({
      type: 'info',
      message: quality ? 'Quality Mode Beta: planning and building with Gemini...' : 'Gemini sedang merancang kode animasi motion graphics...'
    })

    let animationWritten = false
    try {
      const api = getElectronAPI()
      if (!api?.generateVideo) {
        throw new Error('API generateVideo tidak tersedia.')
      }

      const current = manualCode || (await api.readCurrentCode?.())
      if (current && current.trim()) {
        setLastWorkingCode(current)
      }

      if (quality && generationCancelledRef.current) throw new Error('Planning: Stopped. Current animation preserved.')
      const res = await api.generateVideo({
        prompt: promptToUse,
        imageBase64: refImageBase64 || undefined,
        mimeType: refImageMimeType || undefined,
        apiKey: geminiApiKey.trim(),
        generationContext,
        animationType: selectedAnimationType,
        ...(quality ? { mode: 'quality' as const, requestId,
          ...(usePrecisionSvgStrokes ? { precisionSvgStrokes: true } : {}),
          ...(usePrecisionSvgStrokes && reuseCurrentPalette ? { precisionPalette: existingPalette } : {}),
          ...(reuseCurrentText ? { qualityText: existingText } : {}) } : {})
      })

      if (res.success && res.code) {
        animationWritten = true
        // ── 1. Parse default props from generated code & sync Visual Tweaker ──
        const parsed = parseTsxDefaultProps(res.code)
        // Adopt the new code's palette in both modes before preview/export can use
        // historical runtime colors. Explicit palette reuse takes precedence.
        // Missing literal defaults retain current values; never invent/reset colors.
        const nextPalette = {
          accentColor: reuseCurrentPalette ? existingPalette.accentColor : parsed.accentColor ?? existingPalette.accentColor,
          secondaryColor: reuseCurrentPalette ? existingPalette.secondaryColor : parsed.secondaryColor ?? existingPalette.secondaryColor,
          backgroundColor: reuseCurrentPalette ? existingPalette.backgroundColor : parsed.backgroundColor ?? existingPalette.backgroundColor
        }
        const nextText = quality && res.textMode === 'none'
          ? { titleText: '', subtitleText: '', badgeText: '' }
          : reuseCurrentText ? existingText : {
          titleText: parsed.titleText,
          subtitleText: parsed.subtitleText,
          badgeText: parsed.badgeText
        }
        // Own undefined fields replace old config keys; JSON omits them so component
        // defaults/fallbacks can run. Flush before activating the new preview.
        const textConfig = await api.updateVideoConfig({ ...nextText, ...nextPalette })
        if (!textConfig.success) throw new Error('Could not apply the new animation text settings.')
        setParamTitleText(nextText.titleText)
        setParamSubtitleText(nextText.subtitleText)
        setParamBadgeText(nextText.badgeText)
        setParamAccentColor(nextPalette.accentColor)
        setParamSecondaryColor(nextPalette.secondaryColor)
        setParamBackgroundColor(nextPalette.backgroundColor)
        setUsesGenerationText(true)
        setInitialParamSnapshot((prev) => ({ ...prev, ...nextText, ...nextPalette }))
        setManualCode(res.code)
        setHasGeneratedContent(true)
        setIframeKey((prev) => prev + 1)
        setCapturedError('')
        setUndoStack([])
        if (quality) setQualityStage('Ready')
        setAiGenStatus({
          type: 'success',
          message: 'Motion asset berhasil digenerate dan dimuat ke kanvas preview!' +
            (res.models?.building ? ' Berhasil dibuat menggunakan ' + res.models.building + '.' : '') +
            (res.models?.planning ? ' Planning: ' + res.models.planning + '.' : '')
        })
        setTimeout(() => setAiGenStatus(null), 5000)
      } else {
        const failure = res.failure ?? generationFailure('unknown', { stage: quality ? 'Planning' : 'Building Animation' })
        setAiGenStatus({ type: failure.category === 'cancelled' ? 'info' : 'error',
          ...generationMessage(failure), failure, diagnostics: res.diagnostics })
      }
    } catch {
      const failure = generationFailure(quality && generationCancelledRef.current && !animationWritten ? 'cancelled' : 'unknown',
        { stage: animationWritten ? 'Ready' : quality ? 'Planning' : 'Building Animation' })
      console.warn('[App] Generate ended:', failure)
      setAiGenStatus({ type: failure.category === 'cancelled' ? 'info' : 'error', ...generationMessage(failure), failure })
    } finally {
      generationRequestRef.current = null
      generateBusyRef.current = false
      setGenerationStopping(false)
      setIsAiGenerating(false)
    }
  }

  const handleStopQualityGeneration = async (): Promise<void> => {
    const requestId = generationRequestRef.current
    if (!requestId || generationStopping) return
    generationCancelledRef.current = true
    setGenerationStopping(true)
    try {
      const accepted = await getElectronAPI()?.cancelGeneration(requestId)
      if (!accepted) setGenerationStopping(false)
    } catch {
      setGenerationStopping(false)
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

  // Restore the saved session or load the current TSX without changing user content
  useEffect(() => {
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
            handleIncomingStudioError(event.data)
          }
        } else if (typeof event.data === 'object') {
          const msg =
            event.data.message ||
            event.data.error?.message ||
            (event.data.type === 'remotion-error' ? event.data.data : null)
          if (msg && typeof msg === 'string') {
            handleIncomingStudioError(msg)
          }
        }
      } catch {
        // ignore
      }
    }

    const handleWindowError = (event: ErrorEvent): void => {
      if (event.message && !event.message.includes('ResizeObserver')) {
        handleIncomingStudioError(event.message)
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
        usesGenerationText,
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
    usesGenerationText,
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
    if (cleanCode !== manualCode) {
      setManualCode(cleanCode)
    }
    setIsApplyingCode(true)
    setCodeEditorStatus('Memeriksa dan menyimpan kode TSX...')

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
        // Main returns the exact validated candidate; do not write it a second time.
        const appliedCode = (res as { code?: string }).code ?? cleanCode
        setManualCode(appliedCode)
        // Buffer delay to ensure Remotion bundler completes file compile
        await new Promise((r) => setTimeout(r, 300))
        remountPlayer()
        // ── Parse props from applied code and sync Visual Tweaker ──
        const parsedManual = parseTsxDefaultProps(appliedCode)
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
      const prompt = buildMasterPrompt({ width, height, fps, durationInFrames, resolutionLabel: resolutionQuality, animationType })
      await navigator.clipboard.writeText(prompt)
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

  // Helper Sanitizer Nama File Ekspor Video (Windows Safe):
  // - Ambil statusBarTitle (fallback: "motion_project")
  // - Bersihkan karakter khusus yang dilarang Windows (\ / : * ? " < > |)
  // - Ubah spasi menjadi underscore atau strip dan jadikan huruf kecil:
  //   "Live Vital & Heart Rate Monitor" -> "live_vital_and_heart_rate_monitor.mp4"
  const sanitizeExportFileName = (title?: string, extension: string = 'mp4'): string => {
    const base = (title || '').trim() || 'motion_project'
    const ext = extension.replace(/^\./, '')

    let clean = base
      .replace(/\s*&\s*/g, '_and_')
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/[\s\t\n\r-]+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase()

    if (!clean) {
      clean = 'motion_project'
    }

    return `${clean}.${ext}`
  }

  // Handle Video Rendering Export via physical Remotion CLI (MP4 H.264 or MOV ProRes 4444 Alpha)
  const handleExportVideo = async (): Promise<void> => {
    if (!checkLicenseGate()) return
    if (isRendering) return

    setIsRendering(true)
    setRenderProgress(0)
    setRenderStatus('Mempersiapkan pipeline render...')
    setRenderResult(null)

    const ext = exportFormat === 'mp4' ? 'mp4' : 'mov'
    const activeProjectTitle = statusBarTitle || currentTitle || 'motion_project'
    const exportFileName = sanitizeExportFileName(activeProjectTitle, ext)

    try {
      const api = getElectronAPI()
      if (!api?.startRender) {
        throw new Error('API Electron startRender tidak tersedia.')
      }

      const res = await api.startRender({
        format: exportFormat,
        isTransparent: exportFormat === 'mp4' ? false : isTransparent,
        title: activeProjectTitle,
        customFileName: exportFileName,
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
        backgroundColor:
          exportFormat !== 'mp4' && isTransparent ? 'transparent' : paramBackgroundColor,
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

      // Extract crash frame from error message if available, default to 0
      let targetFrame = 0
      const frameMatch =
        (errorMsg || capturedError || '').match(/\bframe[:\s]+(\d+)/i) ||
        (errorMsg || capturedError || '').match(/\bat frame (\d+)/i) ||
        (errorMsg || capturedError || '').match(/\bframe\b[^\d]*(\d+)/i)
      if (frameMatch && frameMatch[1]) {
        const parsed = parseInt(frameMatch[1], 10)
        if (!isNaN(parsed) && parsed >= 0) {
          targetFrame = parsed
        }
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
        // Langkah A: Tulis kode hasil perbaikan AI ke disk melalui pipeline sanitizer
        const cleanCode = cleanAndStripMarkdownCode(res.code)
        setManualCode(cleanCode)
        await api.writeCode(cleanCode)

        // Langkah B: Panggil IPC verify-remotion-render dengan parameter frame crash
        setRollbackToast('🔍 Memverifikasi render engine Remotion...')
        const verifyRes = api.verifyRemotionRender
          ? await api.verifyRemotionRender({ frame: targetFrame, timeoutMs: 8000 })
          : { isValid: true }

        if (verifyRes.isValid) {
          // Langkah C (Jika Valid):
          await new Promise((resolve) => setTimeout(resolve, 300))
          remountPlayer()
          const parsed = parseTsxDefaultProps(cleanCode)
          syncParsedPropsToState(parsed)
          setHasGeneratedContent(true)

          setCapturedError('')
          setAutoFixErrorInput('')
          setIsAutoFixModalOpen(false)

          setRollbackToast('⚡ Auto-Fix Berhasil! Kode terverifikasi aman dan kanvas dimuat ulang.')
          setTimeout(() => setRollbackToast(''), 4500)
          return
        }

        // Langkah D (Jika Masih Gagal Render):
        // Kirimkan 1x perbaikan otomatis lanjutan (auto-refine) ke Gemini dengan menyertakan error stderr verifikasi
        console.warn('[AutoFix] Verifikasi pertama gagal, menjalankan auto-refine:', verifyRes.errorMessage)
        setRollbackToast('🔄 Percobaan 1 belum lolos render. Menjalankan auto-refine dengan error engine...')

        const refineErrMsg = `Percobaan perbaikan pertama masih gagal dirender oleh Remotion pada frame ${targetFrame} dengan error stderr:\n"""\n${verifyRes.errorMessage || 'Unknown render error'}\n"""\nHarap perbaiki kode TSX berikut secara tuntas agar bebas dari error kompilasi/runtime dan dapat dirender sempurna.`

        const refineRes = api.autoFixVideo
          ? await api.autoFixVideo({
              errorMessage: refineErrMsg,
              apiKey: geminiApiKey.trim(),
              currentCode: cleanCode,
              mode: 'runtime_error',
              width,
              height,
              fps,
              durationInFrames,
              aspectRatio
            })
          : await api.refineVideo({
              instruction: refineErrMsg,
              apiKey: geminiApiKey.trim(),
              currentCode: cleanCode
            })

        if (refineRes.success && refineRes.code) {
          const cleanCode2 = cleanAndStripMarkdownCode(refineRes.code)
          setManualCode(cleanCode2)
          await api.writeCode(cleanCode2)

          const verifyRes2 = api.verifyRemotionRender
            ? await api.verifyRemotionRender({ frame: targetFrame, timeoutMs: 8000 })
            : { isValid: true }

          if (verifyRes2.isValid) {
            // Langkah C (Sukses pada auto-refine kedua)
            await new Promise((resolve) => setTimeout(resolve, 300))
            remountPlayer()
            const parsed2 = parseTsxDefaultProps(cleanCode2)
            syncParsedPropsToState(parsed2)
            setHasGeneratedContent(true)

            setCapturedError('')
            setAutoFixErrorInput('')
            setIsAutoFixModalOpen(false)

            setRollbackToast('⚡ Auto-Fix Berhasil! Kode terverifikasi aman dan kanvas dimuat ulang.')
            setTimeout(() => setRollbackToast(''), 4500)
            return
          } else {
            // Jika percobaan kedua tetap gagal render: JANGAN bersihkan error!
            console.error('[AutoFix] Verifikasi kedua tetap gagal render:', verifyRes2.errorMessage)
            setCapturedError(verifyRes2.errorMessage || 'Remotion render crash pada verifikasi lanjutan.')
            setRollbackToast(
              '⚠️ Auto-Fix belum berhasil memperbaiki error ini secara otomatis. Silakan gunakan tombol \'Kembalikan ke Versi Sebelumnya\' atau generate ulang.'
            )
            setTimeout(() => setRollbackToast(''), 7000)
          }
        } else {
          setRollbackToast(
            '⚠️ Auto-Fix belum berhasil memperbaiki error ini secara otomatis. Silakan gunakan tombol \'Kembalikan ke Versi Sebelumnya\' atau generate ulang.'
          )
          setTimeout(() => setRollbackToast(''), 7000)
        }
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

  const animationTypeControl = (
      <div className="animation-type-control">
        <label htmlFor="animation-type">{t("Jenis Animasi")}</label>
        <select id="animation-type" className="specs-select" value={animationType}
          aria-describedby="animation-type-help" disabled={isAiGenerating || isRendering}
          style={{ width: 'auto' }}
          onChange={(event) => { if (isAnimationType(event.target.value)) setAnimationType(event.target.value) }}>
          {ANIMATION_TYPES.map(option => <option key={option.value} value={option.value}
            disabled={option.value === '3d' && !THREE_RUNTIME_READY}>{t(option.label)}</option>)}
        </select>
        <small id="animation-type-help" className="form-sublabel">
          {message(ANIMATION_TYPES.find(option => option.value === animationType)?.help)}
          {!THREE_RUNTIME_READY && <span> {t("Animasi 3D belum tersedia.")}</span>}
        </small>
      </div>
  )

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
          <div className="brand-title"> {t("MOTION SUITE PRO")} <span className="brand-badge">{appVersion.startsWith('PRO') ? appVersion : t("PRO {p0}", {p0: appVersion})}</span>
          </div>
        </div>

        {/* Center Navigation Bar: Studio Preview, Code Inspector */}
        <nav className="header-nav-tabs">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <span className="tab-icon"><StudioIcon /></span>
            <span>{t("Studio Preview")}</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <span className="tab-icon"><StudioIcon /></span>
            <span>{t("Code Inspector")}</span>
          </button>
        </nav>

        <div className="header-meta">
          <label className="language-control"><span>{t('Language')}</span>
            <select aria-label={t('Language')} value={language} onChange={(event) => setLanguage(event.target.value === 'en' ? 'en' : 'id')}>
              <option value="id">Indonesia</option><option value="en">English</option>
            </select>
          </label>
          {!isMacPlatform && updatePhase !== 'idle' && isUpdateDismissed && (
            <button
              type="button"
              className="header-update-badge"
              onClick={() => setIsUpdateDismissed(false)}
              title={t("Buka jendela pembaruan")}
            >
              <span className="update-badge-dot" />
              <span>{updateVersion ? `${t("Update v")}${updateVersion}` : t("update.versionUnknown")}</span>
            </button>
          )}
          <div className="meta-status">
            <span className={`status-dot ${isStudioRunning ? 'online' : 'connecting'}`} />
            <span>{isStudioRunning ? t("Motion Engine Ready") : t("Inisialisasi Engine...")}</span>
          </div>
        </div>
      </header>

      {/* Main Content Viewport: 4-Tab Workspace */}
      {activeTab !== 'preview' && animationTypeControl}
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
                  <span className="full-editor-icon"><StudioIcon /></span>
                  <h2 className="full-editor-title">{t("Code Inspector (TSX Live Editor)")}</h2>
                  <span className="editor-tech-badge">{t("BYOC • Live Engine")}</span>
                </div>
                <p className="full-editor-subtitle"> {t("Editor TSX mandiri untuk menulis atau memodifikasi kode animasi secara leluasa. Kompilasi langsung memperbarui canvas visual secara instan.")} </p>
              </div>

              <div className="full-editor-actions">
                <button
                  type="button"
                  className={`btn-editor-tool ${isPromptCopied ? 'success' : ''}`}
                  onClick={handleCopyMasterPrompt}
                  title={t("Salin Panduan Master Prompt ke clipboard")}
                >
                  {isPromptCopied ? t("✅ Disalin!") : t("🤖 Salin Master Prompt AI")}
                </button>
                <button
                  type="button"
                  className="btn-editor-tool secondary"
                  onClick={handleResetBoilerplate}
                  title={t("Kembalikan ke template awal")}
                > {t("🔄 Reset Template")} </button>
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
                      <span>{t("Mengompilasi...")}</span>
                    </>
                  ) : (
                    <>
                      <span><StudioIcon /></span>
                      <span>{t("Render & Buka Preview")}</span>
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
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text')
                  if (pasted) {
                    const sanitized = cleanAndStripMarkdownCode(pasted)
                    if (sanitized !== pasted) {
                      e.preventDefault()
                      const textarea = e.currentTarget
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      const current = textarea.value
                      const next = current.substring(0, start) + sanitized + current.substring(end)
                      setManualCode(next)
                    }
                  }
                }}
                placeholder={t("Paste kode TSX dari ChatGPT / Claude atau ketik kode animasi di sini...")}
                spellCheck={false}
              />
            </div>

            <div className="full-editor-footer">
              <div className="full-editor-footer-left">
                <span className="specs-summary-badge"><StudioIcon />{width} × {height} ({aspectRatio}{t(") •")} {durationSeconds}{t("s •")} {fps} {t("FPS")} </span>
                {codeEditorStatus && (
                  <span className="editor-footer-status">{message(codeEditorStatus)}</span>
                )}
              </div>
              <button
                type="button"
                className="btn-preview-link"
                onClick={() => setActiveTab('preview')}
              > {t("🎬 Lihat di Live Preview ➔")} </button>
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
              {/* AI Video Concept Prompt & Reference Image */}
              <div className="ai-generator-card">
                <div className="ai-generator-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="ai-sparkle-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </span>
                    <span className="ai-card-title">{t("AI Motion Engine")}</span>
                  </div>
                  <span className="ai-model-badge">{t("Gemini Flash")}</span>
                </div>

                <label className="form-sublabel" htmlFor="animation-brief">{t("Animation brief")}</label>
                <textarea
                  id="animation-brief"
                  className="ai-prompt-input"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={t("Ketik konsep animasi... (misal: 'HUD Countdown futuristik dengan neon cyan, glitch partikel, dan hitung mundur 5 detik')")}
                  rows={3}
                />

                {activeTab === 'preview' && animationTypeControl}

                <div className="form-group">
                  <label className="form-sublabel" htmlFor="generation-mode">{t("Generation mode")}</label>
                  <select
                    id="generation-mode"
                    className="specs-select"
                    value={generationMode}
                    disabled={isAiGenerating || isRendering}
                    onChange={(event) => { setGenerationMode(event.target.value as 'fast' | 'quality'); setQualityStage(null) }}
                  >
                    <option value="fast">{t("Fast")}</option>
                    <option value="quality">{t("Quality Mode (Beta)")}</option>
                  </select>
                  {generationMode === 'quality' && <p className="generation-mode-hint">{t("Quality planning notice")}</p>}
                </div>

                <div className="generation-actions">
                {isAiGenerating && generationMode === 'quality' && (
                  <button type="button" className="btn-cancel-render" onClick={handleStopQualityGeneration} disabled={generationStopping}>
                    {generationStopping ? t("Stopping...") : t("Stop")}
                  </button>
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
                      <span>{generationMode === 'quality' ? t(qualityStage || 'Planning') : t("Gemini sedang merancang animasi...")}</span>
                    </>
                  ) : (
                    <>
                      <span><StudioIcon /></span>
                      <span>{t("Generate Motion Asset")}</span>
                    </>
                  )}
                </button>
                </div>
                {generationMode === 'quality' && qualityStage && (
                  <div className="form-sublabel" role="status" aria-live="polite" aria-label={t(qualityStage)}>
                    {(['Planning', 'Building Animation', 'Validating', 'Ready'] as const).map((stage, index) => (
                      <React.Fragment key={stage}>
                        {index > 0 && ' > '}
                        {qualityStage === stage ? <strong>{t(stage)}</strong> : t(stage)}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* AI Generation Status Box */}
                {aiGenStatus && (
                  <div className={`ai-gen-status-box ${aiGenStatus.type}`}>
                    {aiGenStatus.type === 'info' && isAiGenerating && <span className="ai-status-spinner" />}
                    <div role="status" aria-live="polite">
                      {aiGenStatus.title && <strong>{aiGenStatus.failure ? message(generationMessage(aiGenStatus.failure).title) : message(aiGenStatus.title)}</strong>}
                      <div>{aiGenStatus.failure ? message(generationMessage(aiGenStatus.failure).message) : message(aiGenStatus.message)}</div>
                      {aiGenStatus.failure && <small>{message(aiGenStatus.failure.stage)}</small>}
                      {aiGenStatus.diagnostics && (
                        <details><summary>{t("Diagnostik teknis")}</summary>
                          <pre style={{ whiteSpace: 'pre-wrap' }}>{aiGenStatus.diagnostics}</pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}

                <details className="generation-options">
                  <summary>{t("Additional generation settings")}{refImageBase64 && <span className="reference-attached">{t("Reference attached")}</span>}</summary>
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
                      <img src={refImageBase64} alt={t("Reference")} className="ref-image-thumb" />
                    )}
                    <div className="ref-image-meta">
                      <span className="ref-image-name">{refImageName || t('File Referensi')}</span>
                      <span className="ref-image-badge">
                        {refImageMimeType?.startsWith('video/')
                          ? t("✓ Video Referensi Aktif")
                          : refImageMimeType === 'image/gif'
                            ? t("✓ GIF Referensi Aktif")
                            : t("✓ Referensi Aktif")}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-ref-image"
                      onClick={handleRemoveRefImage}
                      title={t("Hapus referensi")}
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
                    <span style={{ fontSize: '20px' }}><StudioIcon /></span>
                    <div className="ref-dropzone-text">
                      <strong>{t("Drop Gambar, GIF, atau Video Pendek (MP4) Referensi")}</strong> {t("atau klik di sini")} </div>
                    <span className="ref-dropzone-hint">{t("(AI Video-to-Code Cloner mereverse-engineer ritme gerakan &amp; tata visual)")}</span>
                  </div>
                )}

                <div className="form-group generation-preferences">
                  {generationMode === 'quality' && (
                    <div className="form-sublabel"> {t("Additional AI planning, then animation code. More time and API usage; request budget up to 180 seconds.")} </div>
                  )}
                  {generationMode === 'quality' && (
                    <label className="form-sublabel">
                      <input type="checkbox" checked={precisionSvgStrokes}
                        disabled={isAiGenerating || isRendering}
                        onChange={(event) => setPrecisionSvgStrokes(event.target.checked)} />{' '} {t("Precision SVG Strokes (Beta)")} <span style={{ display: 'block' }}>{t("Optional path drawing for suitable icons and outlines. No additional AI stage.")}</span>
                    </label>
                  )}
                    <label className="form-sublabel">
                      <input type="checkbox" checked={reusePaletteOnGenerate}
                        disabled={isAiGenerating || isRendering}
                        onChange={(event) => setReusePaletteOnGenerate(event.target.checked)} />{' '} {t("Gunakan palet saat ini untuk Generate ini")} <span style={{ display: 'block' }}>{t("Jika tidak dicentang, gunakan default warna dari kode baru. Warna yang tidak didefinisikan tetap dipertahankan; warna dapat diedit setelah Generate.")}</span>
                    </label>
                <label className="form-sublabel">
                  <input
                    type="checkbox"
                    checked={reuseTextOnGenerate}
                    onChange={(event) => setReuseTextOnGenerate(event.target.checked)}
                    disabled={isAiGenerating || isRendering}
                  />{' '} {t("Reuse current title, subtitle and badge in the next generation")} </label>

                </div>
                </details>
              </div>
              {/* Hardware License Validation Card */}
              <div className={`license-validation-card ${licenseStatus.isValid ? 'valid' : 'invalid'}`}>
                <div className="license-card-header">
                  <div className="license-header-left">
                    <span className="license-header-icon license-shield-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </span>
                    <span className="license-header-title">{t("Status Lisensi")}</span>
                  </div>
                  <span className={`license-badge ${licenseStatus.isValid ? 'active' : 'inactive'}`}>
                    {licenseStatus.isValid
                      ? licenseStatus.plan === 'lifetime'
                        ? t("Aktif - Lifetime")
                        : t("Aktif - Bulanan (Exp: {p0})", {p0: licenseStatus.expiryDate ? new Date(licenseStatus.expiryDate).toISOString().slice(0, 10) : '-'})
                      : licenseStatus.plan === 'monthly'
                        ? t("Lisensi Expired")
                        : t("Belum Divalidasi")}
                  </span>
                <button type="button" className="license-settings-toggle" aria-expanded={!licenseStatus.isValid || showLicenseSettings} onClick={() => setShowLicenseSettings(value => !value)}>{t('Manage license')}</button>
                </div>


                <div className="license-card-body" hidden={licenseStatus.isValid && !showLicenseSettings}>
                  <div className="license-input-row">
                    <input
                      type="text"
                      className="license-key-input"
                      value={licenseKeyInput}
                      onChange={(e) => setLicenseKeyInput(e.target.value)}
                      placeholder={t("Tempel kunci lisensi digital di sini...")}
                      disabled={isLicenseValidating}
                    />
                    <button
                      type="button"
                      className="btn-validate-license"
                      onClick={handleValidateLicense}
                      disabled={isLicenseValidating}
                    >
                      {isLicenseValidating ? '...' : t("Validasi")}
                    </button>
                  </div>

                  {licenseFeedback && (
                    <div className={`license-feedback-msg ${licenseFeedback.type}`}>
                      {message(licenseFeedback.message)}
                    </div>
                  )}

                  <div className="license-machine-id-row">
                    <span className="machine-id-label">{t("Machine ID:")}</span>
                    <code
                      className="machine-id-value"
                      title={t("Klik untuk menyalin Machine ID")}
                      onClick={() => {
                        navigator.clipboard.writeText(licenseStatus.machineId)
                        setLicenseFeedback({ type: 'success', message: 'Machine ID disalin!' })
                        setTimeout(() => setLicenseFeedback(null), 3000)
                      }}
                    >
                      {licenseStatus.machineId}<StudioIcon /></code>
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
                    <span><StudioIcon /></span>
                    <span className="api-key-title">{t("Gemini API Key")}</span>

                    <span className={`api-key-status-badge ${geminiApiKey ? 'set' : 'unset'}`}>
                      {geminiApiKey ? t("✓ Tersimpan") : t("⚠️ Belum Diatur")}
                    </span>
                  </div>
                  <span className={`accordion-caret ${isApiKeyOpen ? 'open' : ''}`}>▼</span>
                </div>

                {isApiKeyOpen && (
                  <div className="api-key-accordion-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <p className="api-key-desc" style={{ margin: 0 }}> {t("Mendukung Google Gemini API Key resmi dari Google AI Studio (Model: Gemini 3.6 / 3.7 Flash & Multi-Model Fallback).")} </p>
                      <button 
                        type="button"
                        onClick={() => window.electron.ipcRenderer.send('open-external-url', 'https://aistudio.google.com/app/apikey')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer"
                      > {t("🔑 Dapatkan API Key Gratis ↗")} </button>
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
                        placeholder={t("Masukkan API Key (AIza... atau AQ...)")}
                      />
                      <button
                        type="button"
                        className="btn-save-api-key"
                        onClick={handleSaveApiKey}
                      > {t("Simpan")} </button>
                    </div>
                    {apiKeySaveStatus && (
                      <div className="api-key-feedback">{message(apiKeySaveStatus)}</div>
                    )}
                  </div>
                )}
              </div>

            </div>



            {/* Video Specifications: Aspect Ratio, Resolution, Duration & FPS */}
            <div className="specs-section">
              <div className="specs-header-row">
                <span className="form-label">{t("Video Dimensions & Framerate")}</span>
                <span className="specs-summary-badge">
                  {width} × {height} ({aspectRatio}{t(") •")} {durationSeconds}{t("s •")} {fps} {t("FPS")} </span>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="form-group">
                <label className="form-sublabel">{t("Aspect Ratio")}</label>
                <div className="ratio-selector-grid">
                  <button
                    type="button"
                    className={`ratio-btn ${aspectRatio === '16:9' ? 'active' : ''}`}
                    onClick={() => setAspectRatio('16:9')}
                  >
                    <span className="ratio-icon ratio-icon-landscape" />
                    <div className="ratio-info">
                      <span className="ratio-title">{t("Landscape")}</span>
                      <span className="ratio-desc">{t("16:9 (Standard)")}</span>
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
                      <span className="ratio-title">{t("Vertical")}</span>
                      <span className="ratio-desc">{t("9:16 (Reels/Shorts)")}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Resolution Quality Dropdown */}
              <div className="form-group">
                <label className="form-sublabel" htmlFor="resolution-select"> {t("Resolution Quality")} </label>
                <div className="select-wrapper">
                  <select
                    id="resolution-select"
                    className="specs-select"
                    value={resolutionQuality}
                    onChange={(e) => setResolutionQuality(e.target.value as ResolutionQualityType)}
                  >
                    {aspectRatio === '16:9' ? (
                      <>
                        <option value="1080p">{t("1080p Full HD (1920×1080)")}</option>
                        <option value="2k">{t("2K QHD (2560×1440)")}</option>
                        <option value="4k">{t("4K Ultra HD (3840×2160)")}</option>
                      </>
                    ) : (
                      <>
                        <option value="1080p">{t("1080p Full HD (1080×1920)")}</option>
                        <option value="4k">{t("4K Ultra HD (2160×3840)")}</option>
                      </>
                    )}
                  </select>
                  <div className="select-caret">▼</div>
                </div>
              </div>

              {/* Duration & Frame Rate (FPS) Grid */}
              <div className="specs-dropdown-grid">
                <div className="form-group">
                  <label className="form-sublabel" htmlFor="duration-select"> {t("Duration")} </label>
                  <div className="select-wrapper">
                    <select
                      id="duration-select"
                      className="specs-select"
                      value={durationSeconds}
                      onChange={(e) =>
                        setDurationSeconds(Number(e.target.value) as DurationSecondsType)
                      }
                    >
                      <option value={5}>{t("5 Detik (")}{5 * fps}{t("f)")}</option>
                      <option value={10}>{t("10 Detik (")}{10 * fps}{t("f)")}</option>
                      <option value={15}>{t("15 Detik (")}{15 * fps}{t("f)")}</option>
                      <option value={20}>{t("20 Detik (")}{20 * fps}{t("f)")}</option>
                    </select>
                    <div className="select-caret">▼</div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-sublabel" htmlFor="fps-select"> {t("Frame Rate (FPS)")} </label>
                  <div className="select-wrapper">
                    <select
                      id="fps-select"
                      className="specs-select"
                      value={fps}
                      onChange={(e) => setFps(Number(e.target.value))}
                    >
                      <option value={24}>{t("24 FPS (Cinematic)")}</option>
                      <option value={30}>{t("30 FPS (Standard Web)")}</option>
                      <option value={60}>{t("60 FPS (Ultra Smooth)")}</option>
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
                  <h3 className="preview-bar-title">{t("Motion Canvas — Live Preview")}</h3>
                  <span className="preview-spec-chip">
                    {width} × {height} ({resolutionQuality.toUpperCase()}{t(") •")} {fps} {t("FPS")} </span>
                </div>

                <div className="preview-bar-actions">
                  <button
                    type="button"
                    className={`btn-bar-action ${isParamTweakerOpen ? 'active' : ''}`}
                    onClick={() => setIsParamTweakerOpen((prev) => !prev)}
                    title={t("Buka / tutup panel kontrol parameter visual & transformasi (Visual Tweaker)")}
                  > {t("🎛️ Visual Tweaker")} </button>
                  <button
                    type="button"
                    className="btn-bar-action"
                    onClick={handleRefreshStudio}
                    disabled={!isStudioRunning || isStudioStarting}
                    title={t("Muat ulang kanvas preview")}
                  > {t("Sync Canvas")} </button>
                  <button
                    type="button"
                    className="btn-bar-action"
                    onClick={() => setIsFullscreenPreview(true)}
                    title={t("Buka preview video dalam layar penuh")}
                  > {t("Cinema Mode")} </button>
                </div>
              </div>

              {/* Runtime Error Alert Banner if Error Detected */}
              {capturedError && (
                <div className="preview-captured-error-banner">
                  <div className="error-banner-left">
                    <span className="error-banner-icon"><StudioIcon /></span>
                    <div className="error-banner-text">
                      <strong>{t("Runtime Error Terdeteksi:")}</strong> {capturedError}
                    </div>
                  </div>
                  <div className="error-banner-actions">
                    <button
                      type="button"
                      className="btn-banner-autofix"
                      onClick={() => handleExecuteAutoFix(capturedError)}
                      disabled={isAutoFixing}
                      title={t("Analisis dan perbaiki error ini menggunakan AI")}
                    >
                      {isAutoFixing ? t("Memperbaiki...") : t("⚡ Auto-Fix Sekarang")}
                    </button>
                    <button
                      type="button"
                      className="btn-banner-dismiss"
                      onClick={() => setCapturedError('')}
                      title={t("Tutup notifikasi error")}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Studio Iframe / Player Frame */}
              <div
                className={`studio-iframe-frame ${isTransparent ? 'transparent-preview' : ''}`}
                style={{
                  borderColor: isStudioRunning ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isStudioRunning
                    ? '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 30px rgba(0, 242, 254, 0.12)'
                    : '0 20px 50px -15px rgba(0,0,0,0.7)',
                  background: isTransparent
                    ? 'repeating-conic-gradient(#3a3a3a 0% 25%, #222222 0% 50%) 50% / 20px 20px'
                    : undefined
                }}
              >
                {!isStudioRunning || isStudioStarting ? (
                  <div className="canvas-booting-state">
                    <div className="cyber-spinner-ring" />
                    <div className="booting-text-group">
                      <h4 className="booting-title">{t("Menginisialisasi Motion Engine...")}</h4>
                      <p className="booting-subtitle"> {t("Menyiapkan lingkungan render dan komputasi visual di latar belakang")} </p>
                    </div>
                  </div>
                ) : !hasGeneratedContent ? (
                  <div className="canvas-standby-blueprint">
                    <div className="blueprint-grid-overlay" />
                    <div className="blueprint-content">
                      <div className="blueprint-badge">
                        <span className="pulse-dot" />
                        <span>{t("MOTION ENGINE READY")}</span>
                      </div>
                      <div className="blueprint-icon-box">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                      </div>
                      <h3 className="blueprint-title">{t("Motion Canvas Siap")}</h3>
                      <p className="blueprint-desc"> {t("Masukkan instruksi di panel kiri untuk merancang aset motion.")} </p>
                      <div className="blueprint-specs">
                        <span>{width} × {height}</span>
                        <span className="spec-dot">•</span>
                        <span>{aspectRatio}</span>
                        <span className="spec-dot">•</span>
                        <span>{resolutionQuality.toUpperCase()}</span>
                        <span className="spec-dot">•</span>
                        <span>{fps} {t("FPS")}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-blueprint-open-canvas"
                        onClick={() => setHasGeneratedContent(true)}
                        title={t("Buka kanvas preview langsung")}
                      >
                        <span>{t("🎬 Buka Kanvas Langsung")}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`studio-iframe-clip-wrapper ${isTransparent ? 'transparent-preview' : ''}`}
                    style={{
                      background: isTransparent
                        ? 'repeating-conic-gradient(#3a3a3a 0% 25%, #222222 0% 50%) 50% / 20px 20px'
                        : undefined
                    }}
                  >
                    <iframe
                      ref={iframeRef}
                      key={iframeKey}
                      src={`http://localhost:${studioPort}`}
                      title={t("Motion Canvas — Live Preview")}
                      className="studio-iframe"
                      style={{ background: 'transparent' }}
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
                  titleText={paramTitleText ?? ''}
                  onChangeTitleText={setParamTitleText}
                  subtitleText={paramSubtitleText ?? ''}
                  onChangeSubtitleText={setParamSubtitleText}
                  badgeText={paramBadgeText ?? ''}
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
                        ? t("Rendering sedang berjalan...")
                        : t("Buka asisten chat AI untuk merevisi video ini secara realtime")
                    }
                  >
                    <span>{t("Edit Video dengan AI")}</span>
                    <span className="ai-btn-badge">{t("Realtime Chat")}</span>
                  </button>

                  {capturedError ? (
                    <button
                      type="button"
                      className="btn-auto-fix-ai"
                      onClick={handleOpenAutoFixModal}
                      disabled={isRendering || isAutoFixing}
                      title={t("Perbaiki error runtime secara otomatis dengan Gemini AI")}
                    >
                      {isAutoFixing ? (
                        <>
                          <span className="ai-status-spinner" />
                          <span>{t("Memperbaiki Error...")}</span>
                        </>
                      ) : (
                        <>
                          <span>{t("Auto-Fix Error")}</span>
                        </>
                      )}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="btn-rollback-code"
                    onClick={handleRollbackCode}
                    disabled={!lastWorkingCode || isRendering || isAutoFixing}
                    title={
                      lastWorkingCode
                        ? t("Kembalikan file VibeGraphic.tsx ke versi kode terakhir yang aman dan stabil")
                        : t("Belum ada versi kode sebelumnya untuk di-rollback")
                    }
                  >
                    <span>{t("Kembalikan ke Versi Sebelumnya")}</span>
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
                        title={t("Pilih format render video")}
                      >
                        <option value="mp4">{t("MP4 (H.264 - Standar)")}</option>
                        <option value="prores4444"> {t("MOV (Apple ProRes 4444 - Kualitas Terbaik)")} </option>
                      </select>
                      <span className="render-format-caret">▼</span>
                    </div>

                    {/* 2. Dropdown Background: Solid / Transparan */}
                    <div
                      className="render-bg-dropdown-wrap"
                      title={
                        exportFormat === 'mp4'
                          ? t("Format MP4 tidak mendukung Alpha Channel. Ubah ke format MOV (ProRes 4444) untuk mengaktifkan video transparan.")
                          : t("Pilih mode latar belakang: Solid atau Transparan (Alpha Channel)")
                      }
                    >
                      <select
                        className="render-bg-select"
                        value={isTransparent ? 'transparent' : 'solid'}
                        onChange={(e) => {
                          const val = e.target.value === 'transparent'
                          if (exportFormat === 'mp4' && val) return
                          setIsTransparent(val)
                        }}
                        disabled={isRendering}
                        title={
                          exportFormat === 'mp4'
                            ? t("Format MP4 tidak mendukung Alpha Channel. Ubah ke format MOV (ProRes 4444) untuk mengaktifkan video transparan.")
                            : t("Pilih mode latar belakang: Solid atau Transparan (Alpha Channel)")
                        }
                      >
                        <option value="solid">{t("⬛ Solid / Latar Penuh")}</option>
                        <option
                          value="transparent"
                          disabled={exportFormat === 'mp4'}
                          style={
                            exportFormat === 'mp4'
                              ? {
                                  opacity: 0.4,
                                  cursor: 'not-allowed',
                                  pointerEvents: 'none',
                                  color: 'rgba(255, 255, 255, 0.4)'
                                }
                              : undefined
                          }
                        >
                          {exportFormat === 'mp4'
                            ? t("✨ Transparan (Khusus MOV)")
                            : t("✨ Transparan (Alpha Channel)")}
                        </option>
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
                        title={t("Pilih mode render hardware (Auto / GPU Hardware Acceleration / CPU SwiftShader)")}
                      >
                        <option value="auto">{t("⚡ Mode: Auto")}</option>
                        <option value="gpu">{t("🚀 Mode: GPU (Akselerasi)")}</option>
                        <option value="cpu">{t("💻 Mode: CPU (SwiftShader)")}</option>
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
                            ? t("Open export folder: {p0}", { p0: customOutputFolder })
                            : t("Buka Folder Ekspor di File Explorer (Downloads/Motion Studio Exports)")
                        }
                      >
                        <svg className="folder-icon-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        <span
                          className="folder-label-text"
                          title={
                            customOutputFolder
                              ? t("Export folder: {p0}", { p0: customOutputFolder })
                              : t("Folder Ekspor: Downloads/Motion Studio Exports")
                          }
                        >
                          {customOutputFolder
                            ? customOutputFolder.split(/[\\\/]/).filter(Boolean).pop() || t("Custom folder")
                            : t("Folder Ekspor")}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="btn-change-folder shrink-0"
                        onClick={handleSelectOutputFolder}
                        disabled={isRendering}
                        title={t("Ganti folder tujuan ekspor video")}
                      > {t("Ganti")} </button>
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
                            {message(renderStatus) || t("Rendering {p0}%...", {p0: renderProgress})}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-cancel-render"
                          onClick={handleCancelRender}
                          title={t("Batalkan proses rendering")}
                        > {t("✕ Batal")} </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-export-video-primary shrink-0 whitespace-nowrap px-4 py-2"
                        onClick={handleExportVideo}
                        disabled={isAiGenerating || isAiRefining}
                        title={t("Render video fisik beresolusi tinggi")}
                      >
                        <svg className="btn-render-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <span>{t("Ekspor / Render Video")}</span>
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
                          ? t("Render berhasil disimpan!")
                          : t("Render Gagal")}
                      </div>
                      <div className="toast-detail">{message(renderResult.message)}</div>
                    </div>
                  </div>
                  <div className="toast-right">
                    {renderResult.filePath && (
                      <button
                        type="button"
                        className="btn-toast-folder"
                        onClick={() => handleOpenExportFolder(renderResult.filePath)}
                        title={t("Buka folder video di File Explorer")}
                      > {t("📂 Buka Folder")} </button>
                    )}
                    <button
                      type="button"
                      className="btn-toast-dismiss"
                      onClick={() => setRenderResult(null)}
                      title={t("Tutup pemberitahuan")}
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
                    <strong>{t("Title:")}</strong>
                    <span>{statusBarTitle}</span>
                  </div>
                  <div className="meta-item">
                    <strong>{t("Specs:")}</strong>
                    <span style={{ color: '#38bdf8' }}>
                      {aspectRatio} • {resolutionQuality.toUpperCase()} ({width}×{height}{t(") •")} {fps}{' '} {t("FPS")} </span>
                  </div>
                  <div className="meta-item">
                    <strong>{t("Format:")}</strong>
                    <span style={{ color: exportFormat !== 'mp4' ? '#c084fc' : '#38bdf8' }}>
                      {exportFormat === 'prores4444'
                        ? isTransparent
                          ? t("MOV (ProRes 4444 Alpha)")
                          : t("MOV (ProRes 4444 Solid)")
                        : t("MP4 (H.264)")}
                    </span>
                  </div>
                </div>

                <div className="meta-group">
                  <div className="meta-item">
                    <span>{t("Accent:")}</span>
                    <div className="meta-color-pill">
                      <span className="color-dot" style={{ backgroundColor: detectedAccent }} />
                      <span>{detectedAccent}</span>
                    </div>
                  </div>

                  <div className="meta-item">
                    <span>{t("Background:")}</span>
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
                          ? t("Alpha / Transparan")
                          : detectedBg}
                      </span>
                    </div>
                  </div>

                  <div className="meta-item">
                    <span style={{ opacity: 0.7 }}>
                      {durationSeconds}{t(".0s /")} {durationInFrames} {t("frames (")}{fps} {t("FPS)")} </span>
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
                  <h3>{t("AI Motion Director")}</h3>
                  <p>{t("Beri instruksi revisi pada aset motion yang sedang aktif")}</p>
                </div>
              </div>
              <button
                type="button"
                className="ai-chat-close-btn"
                onClick={() => setIsChatModalOpen(false)}
                title={t("Tutup dialog chat")}
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
                      title={copiedChatId === msg.id ? t("Tersalin ke clipboard!") : t("Salin isi pesan")}
                    >
                      {copiedChatId === msg.id ? (
                        <>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          <span>{t("Tersalin!")}</span>
                        </>
                      ) : (
                        <>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                          <span>{t("Salin")}</span>
                        </>
                      )}
                    </button>
                    <div className="chat-bubble-text">{msg.id === 'welcome' ? message(msg.text) : msg.text}</div>
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
                    <span className="loading-text">{t("Gemini sedang merevisi kode VibeGraphic.tsx...")}</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <div className="ai-chat-suggestions">
              <span className="suggestion-label">{t("Saran Cepat:")}</span>
              <button
                type="button"
                className="chip-suggestion"
                onClick={() =>
                  handleSendChatRevision('Percepat tempo animasi menjadi lebih energik dan dinamis (1.5x)')
                }
                disabled={isAiRefining}
              > {t("Percepat Tempo (1.5x)")} </button>
              <button
                type="button"
                className="chip-suggestion"
                onClick={() =>
                  handleSendChatRevision(
                    'Ubah aksen warna menjadi neon purple (#c084fc) dan background lebih pekat'
                  )
                }
                disabled={isAiRefining}
              > {t("Ganti Aksen Warna")} </button>
              <button
                type="button"
                className="chip-suggestion"
                onClick={() =>
                  handleSendChatRevision(
                    'Tambahkan elemen orbit atau partikel bercahaya yang berputar halus mengelilingi pusat'
                  )
                }
                disabled={isAiRefining}
              > {t("Tambah Efek Partikel/Orbit")} </button>
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
                placeholder={t("Ketik instruksi revisi (misal: 'Buat judul berkedip halus dan aksen warna emas')...")}
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
                  <span>{t("Kirim")}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Rollback / Auto-Fix Toast Notification */}
      {rollbackToast && (
        <div className="floating-rollback-toast">
          <span>{message(rollbackToast)}</span>
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
                      ? t("Visual Recovery — Pemulihan Kanvas Blank")
                      : t("Auto-Fix Error AI (Self-Healing)")}
                  </h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                    {autoFixMode === 'visual_recovery'
                      ? t("Pemulihan visual layar gelap, opacity frame 0 & sinkronisasi viewport")
                      : t("Analisis runtime error & perbaiki kode TSX secara otomatis")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="ai-chat-close-btn"
                onClick={() => setIsAutoFixModalOpen(false)}
                title={t("Tutup dialog auto-fix")}
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
                    <strong>{t("Runtime Error Terdeteksi Otomatis:")}</strong>
                  </div>
                  <pre className="detected-error-code">
                    {autoFixErrorInput || capturedError || 'Runtime error terdeteksi pada engine preview.'}
                  </pre>
                  <p className="detected-error-help"> {t("Pesan error di atas ditangkap otomatis dari engine preview. Klik tombol di bawah untuk perbaikan 1-klik dengan AI.")} </p>
                </div>
              ) : (
                /* Mode 2: Visual Recovery / Blank Screen (Silent Failure) */
                <div className="visual-recovery-card">
                  <div className="visual-recovery-header">
                    <span className="recovery-sparkle-icon"><StudioIcon /></span>
                    <strong>{t("Tampilan Kanvas Gelap / Blank Terdeteksi")}</strong>
                  </div>
                  <p className="visual-recovery-desc"> {t("Tidak ada runtime crash teknis pada preview. Mode")} <strong>{t("Visual Recovery")}</strong> {t("akan memeriksa dan memperbaiki penyebab umum layar kosong:")} </p>
                  <ul className="visual-recovery-checklist">
                    <li>{t("✓ Memastikan")} <strong>{t("opacity elemen pada Frame 0")}</strong> {t("minimal 0.95 (tidak tertahan di 0/NaN).")}</li>
                    <li>{t("✓ Mengoreksi koordinat agar semua elemen berada di dalam")} <strong>{t("viewport kanvas aktif")}</strong> ({width} × {height}).</li>
                    <li>{t("✓ Memastikan warna teks & badge")} <strong>{t("kontras tajam")}</strong> {t("dengan background solid pada &lt;AbsoluteFill&gt;.")}</li>
                    <li>{t("✓ Menggunakan")} <code>{t("useVideoConfig()")}</code> {t("untuk tata letak dinamis sesuai resolusi aktif.")}</li>
                  </ul>
                  <div className="visual-recovery-specs-pill">
                    <span><StudioIcon />{width} × {height} ({aspectRatio})</span>
                    <span>•</span>
                    <span>{fps} {t("FPS")}</span>
                    <span>•</span>
                    <span>{durationSeconds} {t("Detik (")}{durationInFrames} {t("frames)")}</span>
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
                    ? t("▼ Sembunyikan Input Manual")
                    : t("▶ Tambah Catatan / Sesuaikan Pesan Manual (Opsional)")}
                </button>
              </div>

              {showManualErrorInput && (
                <div className="manual-input-drawer">
                  <textarea
                    className="auto-fix-textarea"
                    value={autoFixErrorInput}
                    onChange={(e) => setAutoFixErrorInput(e.target.value)}
                    rows={3}
                    placeholder={t("Ketik atau edit catatan error/instruksi tambahan untuk AI di sini...")}
                  />
                  <div className="auto-fix-chips">
                    <span className="chip-label">{t("Pilihan Error Umum (Klik Cepat):")}</span>
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
                      > {t("⚠️ interpolate() inputRange")} </button>
                      <button
                        type="button"
                        className="chip-suggestion"
                        onClick={() => {
                          setAutoFixErrorInput(
                            'outputRange and inputRange must have the same length'
                          )
                          setAutoFixMode('runtime_error')
                        }}
                      > {t("⚠️ Range length mismatch")} </button>
                      <button
                        type="button"
                        className="chip-suggestion"
                        onClick={() => {
                          setAutoFixErrorInput(
                            'Canvas blank / visual elements missing on Frame 0'
                          )
                          setAutoFixMode('visual_recovery')
                        }}
                      > {t("🎨 Blank Screen Frame 0")} </button>
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
                > {t("Batal")} </button>
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
                      <span>{autoFixMode === 'visual_recovery' ? t("Memulihkan Visual...") : t("Memperbaiki Error...")}</span>
                    </>
                  ) : autoFixMode === 'visual_recovery' ? (
                    <>
                      <span><StudioIcon /></span>
                      <span>{t("Perbaiki Tampilan Blank / Reset Visual")}</span>
                    </>
                  ) : (
                    <>
                      <span><StudioIcon /></span>
                      <span>{t("Perbaiki Error Ini (1-Klik AI)")}</span>
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
              <span className="license-modal-icon"><StudioIcon /></span>
              <h3>{t("Akses Ditolak: Fitur Terkunci")}</h3>
              <button
                type="button"
                className="license-modal-close"
                onClick={() => setIsLicenseAlertOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="license-modal-desc"> {t("Akses Ditolak: Fitur ini terkunci. Masukkan nomor lisensi Motion Suite Pro yang valid untuk menggunakan generator AI dan render video.")} </p>
            <div className="license-modal-machine-box">
              <span className="machine-title">{t("Hardware Machine ID Perangkat Anda:")}</span>
              <code
                className="machine-code"
                onClick={() => {
                  navigator.clipboard.writeText(licenseStatus.machineId)
                  setLicenseFeedback({ type: 'success', message: 'Machine ID disalin ke clipboard!' })
                }}
                title={t("Klik untuk menyalin Machine ID")}
              >
                {licenseStatus.machineId}<StudioIcon /></code>
              <small className="machine-help"> {t("Berikan kode Machine ID di atas kepada admin/penjual untuk mendapatkan kunci lisensi Anda.")} </small>
            </div>
            <div className="license-modal-actions">
              <button
                type="button"
                className="btn-license-modal-primary"
                onClick={() => setIsLicenseAlertOpen(false)}
              > {t("Saya Mengerti (Masukkan Lisensi di Panel Kiri)")} </button>
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
              <span style={{ fontSize: '18px' }}><StudioIcon /></span>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}> {t("Layar Penuh Preview —")} {currentTitle || 'Motion Suite Pro Video'}
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
                {aspectRatio} • {resolutionQuality.toUpperCase()} • {fps} {t("FPS")} </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}> {t("Tekan")} <kbd style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0', fontSize: '11px' }}>{t("Esc")}</kbd> {t("untuk keluar")} </span>
              <button
                type="button"
                className="btn-close-fullscreen"
                onClick={() => setIsFullscreenPreview(false)}
                title={t("Keluar dari Layar Penuh (Esc)")}
              > {t("✕ Keluar Layar Penuh")} </button>
            </div>
          </div>

          {/* Fullscreen Video Frame Container */}
          <div
            className={`fullscreen-preview-body ${isTransparent ? 'transparent-preview' : ''}`}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '14px',
              overflow: 'hidden',
              borderRadius: '12px',
              background: isTransparent
                ? 'repeating-conic-gradient(#3a3a3a 0% 25%, #222222 0% 50%) 50% / 20px 20px'
                : '#000000',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(16, 185, 129, 0.15)'
            }}
          >
            <div
              className={`studio-iframe-clip-wrapper ${isTransparent ? 'transparent-preview' : ''}`}
              style={{
                background: isTransparent
                  ? 'repeating-conic-gradient(#3a3a3a 0% 25%, #222222 0% 50%) 50% / 20px 20px'
                  : undefined
              }}
            >
              <iframe
                key={`fullscreen-${iframeKey}`}
                src={`http://localhost:${studioPort}`}
                title={t("Studio Preview — Live Canvas")}
                className="fullscreen-preview-iframe"
                onLoad={handleIframeElementLoad}
                style={{
                  width: '100%',
                  height: 'calc(100% + 46px)',
                  marginTop: '-46px',
                  border: 'none',
                  background: 'transparent'
                }}
                allow="fullscreen; autoplay; clipboard-read; clipboard-write"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Auto-Update Pop-Up Modal (OBS Studio Style) ────────────────── */}
      {!isMacPlatform && updatePhase !== 'idle' && !isUpdateDismissed && (
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
                  <h3 id="update-modal-title" className="update-modal-title">{updatePhase === 'downloading' ? t("update.downloadingTitle") : updatePhase === 'downloaded' ? t("Pembaruan Siap Dipasang!") : t("Pembaruan Tersedia")}</h3>
                  <p className="update-modal-version-tag"> {t("Motion Suite Pro")} <strong>{updateVersion ? `v${updateVersion}` : t("update.versionUnknown")}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="update-modal-close-btn"
                onClick={() => setIsUpdateDismissed(true)}
                title={t("Tutup (Nanti Saja)")}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="update-modal-body">
              <p className="update-modal-description">{t("update.availableDescription", { p0: updateVersion ? `v${updateVersion}` : t("update.versionUnknown") })}</p>

              <UpdateReleaseNotes version={updateVersion} notes={updateReleaseNotes?.version === updateVersion ? updateReleaseNotes.notes : undefined} />

              {/* Catatan Keamanan Resmi macOS (Khusus macOS) */}
              {isMacPlatform && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#34d399' }}>
                    <span><StudioIcon /></span>
                    <span>{t("Pemberitahuan Resmi macOS:")}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#d1fae5', lineHeight: '1.55' }}> {t("Pembaruan versi 1.0.7 disediakan melalui Google Drive resmi Motion Suite Pro untuk instalasi manual yang aman dan stabil. File installer (.dmg) 100% bersih dan terverifikasi oleh pengembang.")} </p>
                </div>
              )}

              {/* Real-time Progress Bar (Windows / Default) */}
              {!isMacPlatform && updatePhase === 'downloading' && (
                <div className="update-modal-progress-wrap">
                  <div className="update-progress-info">
                    <span className="update-progress-label">
                      {updatePercent >= 100
                        ? t("Memverifikasi paket instalasi...")
                        : t("Mengunduh pembaruan di latar belakang...")}
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

              {/* Download Completed Notification (Windows / Default) */}
              {!isMacPlatform && updatePhase === 'downloaded' && (
                <div className="update-modal-downloaded-banner">
                  <span style={{ fontSize: '18px' }}><StudioIcon /></span>
                  <div className="downloaded-text">
                    <strong>{t("Pembaruan Siap Dipasang!")}</strong>
                    <span>{t("update.downloadedDescription", { p0: updateVersion ? `v${updateVersion}` : t("update.versionUnknown") })}</span>
                  </div>
                </div>
              )}

              {/* Error Banner if any */}
              {updateErrorMsg && (
                <div className="update-modal-error-banner">
                  <span><StudioIcon /></span>
                  <span>{updateErrorMsg}</span>
                </div>
              )}
            </div>

            {/* Modal Actions / Footer */}
            <div className="update-modal-footer">
              {isMacPlatform ? (
                <>
                  <button
                    type="button"
                    className="update-modal-btn secondary"
                    onClick={() => setIsUpdateDismissed(true)}
                  > {t("Nanti Saja")} </button>
                  <button
                    type="button"
                    className="update-modal-btn primary"
                    onClick={handleOpenMacDownload}
                    style={{
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      borderColor: '#10b981'
                    }}
                  >
                    <span><StudioIcon /></span>
                    <span>{t("Unduh via Google Drive Resmi")}</span>
                  </button>
                </>
              ) : (
                <>
                  {updatePhase === 'available' && (
                    <>
                      <button
                        type="button"
                        className="update-modal-btn secondary"
                        onClick={() => setIsUpdateDismissed(true)}
                      > {t("Nanti Saja")} </button>
                      <button
                        type="button"
                        className="update-modal-btn primary"
                        onClick={handleStartUpdateDownload}
                      >
                        <span><StudioIcon /></span>
                        <span>{t("Update Sekarang")}</span>
                      </button>
                    </>
                  )}

                  {updatePhase === 'downloading' && (
                    <>
                      <button
                        type="button"
                        className="update-modal-btn secondary"
                        onClick={() => setIsUpdateDismissed(true)}
                      > {t("Sembunyikan (Unduh di Latar)")} </button>
                      {updateErrorMsg ? (
                        <button
                          type="button"
                          className="update-modal-btn primary retry"
                          onClick={handleStartUpdateDownload}
                        >
                          <span><StudioIcon /></span>
                          <span>{t("Coba Lagi")}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="update-modal-btn primary disabled"
                          disabled
                        >
                          <span>{t("Mengunduh (")}{updatePercent}%)...</span>
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
                      > {t("Nanti Saja")} </button>
                      <button
                        type="button"
                        className="update-modal-btn primary install"
                        onClick={handleRestartAndInstall}
                      >
                        <span><StudioIcon /></span>
                        <span>{t("Pasang &amp; Restart")}</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Critical License Overlay (EXPIRED or CLOCK_DESYNC) ── */}
      {!isWarningDismissed &&
        !licenseStatus.isValid &&
        (licenseStatus.isClockDesynced ||
          licenseStatus.statusCode === 'CLOCK_DESYNC' ||
          licenseStatus.statusCode === 'EXPIRED') && (
          <div
            className="critical-license-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100005,
              backgroundColor: 'rgba(5, 7, 15, 0.92)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              animation: 'fadeIn 0.25s ease-out'
            }}
            onClick={() => setIsWarningDismissed(true)}
          >
            <div
              className="critical-license-card"
              style={{
                width: '100%',
                maxWidth: '540px',
                background: '#111827',
                border:
                  licenseStatus.isClockDesynced || licenseStatus.statusCode === 'CLOCK_DESYNC'
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
                color: '#f3f4f6',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsWarningDismissed(true)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
                title={t("Tutup")}
              >
                ✕
              </button>

              {/* CLOCK_DESYNC VIEW */}
              {(licenseStatus.isClockDesynced || licenseStatus.statusCode === 'CLOCK_DESYNC') && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '32px' }}><StudioIcon /></span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fbbf24' }}> {t("Manipulasi Jam Sistem Terdeteksi")} </h3>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{t("Anti-Clock Rollback Guard Active")}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.6', marginBottom: '16px' }}>
                    {message(licenseStatus.statusMessage ||
                      'Sistem mendeteksi bahwa tanggal/jam lokal perangkat Anda dimundurkan dari waktu rekaman sebelumnya. Untuk melindungi integritas lisensi, fitur render dan generator AI dikunci sementara.')}
                  </p>

                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      marginBottom: '18px',
                      fontSize: '12px',
                      color: '#fef3c7',
                      lineHeight: '1.5'
                    }}
                  ><StudioIcon /><strong>{t("Solusi Mudah:")}</strong> {t("Klik tombol di bawah untuk menyinkronkan waktu dengan server internet (Google/Cloudflare). Jam sistem Anda akan terverifikasi dan akses fitur akan terbuka kembali seketika.")} </div>

                  {timeSyncFeedback && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        marginBottom: '14px',
                        fontSize: '12px',
                        background:
                          timeSyncFeedback.type === 'success'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        border:
                          timeSyncFeedback.type === 'success'
                            ? '1px solid #22c55e'
                            : '1px solid #ef4444',
                        color: timeSyncFeedback.type === 'success' ? '#4ade80' : '#f87171'
                      }}
                    >
                      {message(timeSyncFeedback.message)}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleSyncTime}
                      disabled={isSyncingTime}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '12px 18px',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: isSyncingTime ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {isSyncingTime ? (
                        <>
                          <span className="ai-status-spinner" />
                          <span>{t("Menyinkronkan Waktu Internet...")}</span>
                        </>
                      ) : (
                        <>
                          <span><StudioIcon /></span>
                          <span>{t("Sinkronkan Waktu via Internet (1-Klik)")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* EXPIRED VIEW */}
              {!licenseStatus.isClockDesynced && licenseStatus.statusCode === 'EXPIRED' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '32px' }}><StudioIcon /></span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f87171' }}> {t("Masa Berlaku Lisensi Telah Berakhir")} </h3>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{t("Subscription Expired")}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.6', marginBottom: '16px' }}>
                    {message(licenseStatus.statusMessage ||
                      'Masa aktif lisensi Anda telah habis. Masukkan Kunci Lisensi baru atau perpanjang lisensi Anda untuk melanjutkan ekspor video dan fitur generator AI.')}
                  </p>

                  <div
                    style={{
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '16px',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ color: '#9ca3af', marginBottom: '4px' }}>{t("Hardware Machine ID Perangkat Anda:")}</div>
                    <code
                      style={{
                        display: 'inline-block',
                        background: '#1e293b',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        color: '#38bdf8',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(licenseStatus.machineId)
                        setLicenseFeedback({ type: 'success', message: 'Machine ID disalin!' })
                      }}
                      title={t("Klik untuk menyalin")}
                    >
                      {licenseStatus.machineId}<StudioIcon /></code>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#e5e7eb',
                        marginBottom: '6px'
                      }}
                    > {t("Masukkan Kunci Lisensi Baru:")} </label>
                    <input
                      type="text"
                      placeholder={t("Tempel kunci lisensi baru di sini...")}
                      value={licenseKeyInput}
                      onChange={(e) => setLicenseKeyInput(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '12px',
                        color: '#f9fafb',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {licenseFeedback && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        marginBottom: '14px',
                        fontSize: '12px',
                        background:
                          licenseFeedback.type === 'success'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        border:
                          licenseFeedback.type === 'success'
                            ? '1px solid #22c55e'
                            : '1px solid #ef4444',
                        color: licenseFeedback.type === 'success' ? '#4ade80' : '#f87171'
                      }}
                    >
                      {message(licenseFeedback.message)}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleValidateLicense}
                      disabled={isLicenseValidating || !licenseKeyInput.trim()}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '12px 18px',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: isLicenseValidating || !licenseKeyInput.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {isLicenseValidating ? (
                        <>
                          <span className="ai-status-spinner" />
                          <span>{t("Memvalidasi Lisensi...")}</span>
                        </>
                      ) : (
                        <>
                          <span><StudioIcon /></span>
                          <span>{t("Aktifkan Lisensi Baru")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  )
}

export default App
