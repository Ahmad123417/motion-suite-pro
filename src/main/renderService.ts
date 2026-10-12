import { uiText } from './uiLanguage'
import { spawn, ChildProcess, execSync } from 'child_process'
import { dialog, BrowserWindow, ipcMain, app, Notification } from 'electron'
import { resolve, join, delimiter } from 'path'
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync } from 'fs'
import { getLicenseStatus } from './licenseService'
import { usesThreeSource } from '../shared/animationTechnique'

export interface StartRenderPayload {
  format: 'mp4' | 'mov' | 'prores422' | 'prores4444'
  isTransparent?: boolean
  proresProfile?: 'standard' | '4444'
  title?: string
  customFileName?: string
  resolutionLabel?: string
  renderMode?: 'auto' | 'gpu' | 'cpu'
  customOutputFolder?: string
  durationInFrames?: number
  fps?: number
  titleText?: string
  subtitleText?: string
  badgeText?: string
  accentColor?: string
  secondaryColor?: string
  backgroundColor?: string
  scale?: number
  offsetX?: number
  offsetY?: number
  textOffsetX?: number
  textOffsetY?: number
  glowIntensity?: number
  speedMultiplier?: number
}

export interface RenderServiceResult {
  success: boolean
  outputPath?: string
  canceled?: boolean
  error?: string
}

export interface RenderProgressData {
  percent: number
  statusText: string
}

let activeRenderProcess: ChildProcess | null = null
let isRenderCanceled = false
let activeVibeGraphicBackup: { path: string; content: string } | null = null

/**
 * Get remotion_env working directory path across dev and packaged environments
 */
export const getRemotionEnvDir = (): string => {
  if (app.isPackaged) {
    const packagedPath = join(process.resourcesPath, 'remotion_env')
    if (existsSync(packagedPath)) return packagedPath
  }

  const candidates = [
    resolve(process.cwd(), 'remotion_env'),
    resolve(app.getAppPath(), 'remotion_env'),
    resolve(__dirname, '../../remotion_env'),
    resolve(process.cwd(), '../remotion_env')
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  const defaultPath = resolve(process.cwd(), 'remotion_env')
  if (!existsSync(defaultPath)) {
    mkdirSync(defaultPath, { recursive: true })
  }
  return defaultPath
}

/**
 * Resolve the portable Node binary (bundled or system fallback)
 */
export const getNodeBinaryPath = (): string => {
  if (app.isPackaged) {
    const binaryName = process.platform === 'win32' ? 'node.exe' : 'node'
    const bundledNode = join(process.resourcesPath, 'bin', binaryName)
    if (existsSync(bundledNode)) return bundledNode
  }

  const binaryName = process.platform === 'win32' ? 'node.exe' : 'node'
  const devBundledNode = resolve(process.cwd(), 'resources/bin', binaryName)
  if (existsSync(devBundledNode)) return devBundledNode

  return 'node'
}

/**
 * Resolve direct Remotion CLI script path
 */
export const getRemotionCliScript = (): string => {
  const envDir = getRemotionEnvDir()
  const localCli = join(envDir, 'node_modules', '@remotion', 'cli', 'remotion-cli.js')
  if (existsSync(localCli)) return localCli

  // In packaged app, check app.asar.unpacked
  if (app.isPackaged) {
    const unpackedCli = join(
      process.resourcesPath,
      'app.asar.unpacked',
      'node_modules',
      '@remotion',
      'cli',
      'remotion-cli.js'
    )
    if (existsSync(unpackedCli)) return unpackedCli
  }

  // Development fallback to root node_modules
  const rootCli = resolve(process.cwd(), 'node_modules/@remotion/cli/remotion-cli.js')
  if (existsSync(rootCli)) return rootCli

  return localCli
}

/**
 * Default export folder: %USERPROFILE%\Downloads\Motion Studio Exports
 */
export const getDefaultExportDir = (): string => {
  const exportDir = join(app.getPath('downloads'), 'Motion Studio Exports')
  if (!existsSync(exportDir)) {
    mkdirSync(exportDir, { recursive: true })
  }
  return exportDir
}

/**
 * Auto-hide the first full-screen background layer (e.g. style with inset: 0 and background/gradient)
 * by injecting display: 'none' into its style attribute for transparent video export.
 */
export function hidePureBackgroundDiv(code: string): string {
  let result = code
  const allDivRegex = /<div\b([\s\S]*?)>/gi
  let match: RegExpExecArray | null

  while ((match = allDivRegex.exec(result)) !== null) {
    const fullDivTag = match[0]
    const tagContent = match[1]

    const styleMatch = tagContent.match(/style=\{\{([\s\S]*?)\}\}/)
    if (!styleMatch) continue

    const styleContent = styleMatch[1]

    const hasInsetZero = /\binset\s*:\s*(?:0|'0(?:px)?'|"0(?:px)?")/i.test(styleContent)
    const hasPositionAbsolute = /\bposition\s*:\s*['"]absolute['"]/i.test(styleContent)
    const hasTopLeftFull =
      /\btop\s*:\s*(?:0|'0(?:px)?'|"0(?:px)?")/i.test(styleContent) &&
      /\bleft\s*:\s*(?:0|'0(?:px)?'|"0(?:px)?")/i.test(styleContent) &&
      (/\bwidth\s*:\s*['"]100%['"]/i.test(styleContent) || /\bright\s*:\s*(?:0|'0(?:px)?'|"0(?:px)?")/i.test(styleContent))

    const isFullScreenCoverage = hasInsetZero || (hasPositionAbsolute && hasTopLeftFull)
    const hasBackground =
      /(?<!\w)background\s*:/i.test(styleContent) || /backgroundColor\s*:/i.test(styleContent)
    const alreadyHidden = /display\s*:\s*['"]none['"]/i.test(styleContent)

    if (isFullScreenCoverage && hasBackground && !alreadyHidden) {
      const updatedStyle = `style={{ display: 'none', ${styleContent} }}`
      const newDivTag = fullDivTag.replace(styleMatch[0], updatedStyle)
      const matchIndex = match.index
      result = result.slice(0, matchIndex) + newDivTag + result.slice(matchIndex + fullDivTag.length)
      break
    }
  }

  return result
}

/**
 * Auto-strip background color on the outermost <AbsoluteFill ...> for transparent export
 * and hide pure background <div> layers (e.g. inset: 0 with background/backgroundColor)
 */
export function stripOutermostAbsoluteFillBackground(code: string): string {
  let result = code
  const fillTag = '<AbsoluteFill'
  const startIndex = result.indexOf(fillTag)
  if (startIndex === -1) {
    result = stripOutermostDivBackground(result)
  } else {
    let braceDepth = 0
    let parenDepth = 0
    let inString: string | null = null
    let endIndex = -1

    for (let i = startIndex + fillTag.length; i < result.length; i++) {
      const char = result[i]
      const prevChar = i > 0 ? result[i - 1] : ''

      if (inString) {
        if (char === inString && prevChar !== '\\') {
          inString = null
        }
        continue
      }

      if (char === '"' || char === "'" || char === '`') {
        inString = char
        continue
      }

      if (char === '{') {
        braceDepth++
      } else if (char === '}') {
        braceDepth--
      } else if (char === '(') {
        parenDepth++
      } else if (char === ')') {
        parenDepth--
      } else if (char === '>' && braceDepth === 0 && parenDepth === 0) {
        endIndex = i
        break
      }
    }

    if (endIndex !== -1) {
      const openingTag = result.slice(startIndex, endIndex + 1)
      let newTag = openingTag

      if (/style=\{\{/.test(openingTag)) {
        let replacedAny = false
        if (/backgroundColor\s*:\s*/.test(newTag)) {
          newTag = newTag.replace(
            /backgroundColor\s*:\s*(?:'[^']*'|"[^"]*"|`[^`]*`|[^,}\n]+)/,
            "backgroundColor: 'transparent'"
          )
          replacedAny = true
        }
        if (/(?<!\w)background\s*:\s*/.test(newTag)) {
          newTag = newTag.replace(
            /(?<!\w)background\s*:\s*(?:'[^']*'|"[^"]*"|`[^`]*`|[^,}\n]+)/,
            "background: 'transparent'"
          )
          replacedAny = true
        }
        if (!replacedAny) {
          newTag = newTag.replace(/style=\{\{/, "style={{\n        backgroundColor: 'transparent',")
        }
      } else if (/style=\{/.test(openingTag)) {
        newTag = openingTag.replace(/style=\{([a-zA-Z0-9_$.]+)\}/, "style={{ backgroundColor: 'transparent', ...$1 }}")
      } else {
        newTag = openingTag.replace(/<AbsoluteFill/, "<AbsoluteFill style={{ backgroundColor: 'transparent' }}")
      }

      result = result.slice(0, startIndex) + newTag + result.slice(endIndex + 1)
    }
  }

  // Also hide any pure full-screen background <div> layer
  return hidePureBackgroundDiv(result)
}

function stripOutermostDivBackground(code: string): string {
  const returnMatch = code.match(/return\s*\(\s*(<div\b[^>]*>)/)
  if (!returnMatch || !returnMatch[1]) {
    return hidePureBackgroundDiv(code)
  }
  const oldDiv = returnMatch[1]
  let newDiv = oldDiv
  if (/style=\{\{/.test(oldDiv)) {
    let replacedAny = false
    if (/backgroundColor\s*:\s*/.test(newDiv)) {
      newDiv = newDiv.replace(
        /backgroundColor\s*:\s*(?:'[^']*'|"[^"]*"|`[^`]*`|[^,}\n]+)/,
        "backgroundColor: 'transparent'"
      )
      replacedAny = true
    }
    if (/(?<!\w)background\s*:\s*/.test(newDiv)) {
      newDiv = newDiv.replace(
        /(?<!\w)background\s*:\s*(?:'[^']*'|"[^"]*"|`[^`]*`|[^,}\n]+)/,
        "background: 'transparent'"
      )
      replacedAny = true
    }
    if (!replacedAny) {
      newDiv = newDiv.replace(/style=\{\{/, "style={{ backgroundColor: 'transparent', ")
    }
  } else {
    newDiv = oldDiv.replace(/<div/, "<div style={{ backgroundColor: 'transparent' }}")
  }
  const stripped = code.replace(oldDiv, newDiv)
  return hidePureBackgroundDiv(stripped)
}

/**
 * Cancel ongoing Remotion render process
 */
export async function cancelRender(): Promise<boolean> {
  if (!activeRenderProcess) {
    return false
  }

  console.log('[RenderService] Canceling active render process...')
  isRenderCanceled = true

  // Restore VibeGraphic.tsx if it was backed up for transparent export
  if (activeVibeGraphicBackup && existsSync(activeVibeGraphicBackup.path)) {
    try {
      writeFileSync(activeVibeGraphicBackup.path, activeVibeGraphicBackup.content, 'utf-8')
      console.log('[RenderService] Restored original VibeGraphic.tsx on cancelRender')
    } catch (restoreErr) {
      console.warn('[RenderService] Error restoring VibeGraphic.tsx on cancel:', restoreErr)
    }
    activeVibeGraphicBackup = null
  }

  try {
    if (activeRenderProcess.pid) {
      if (process.platform === 'win32') {
        try {
          execSync(`taskkill /pid ${activeRenderProcess.pid} /T /F`, { stdio: 'ignore' })
        } catch {
          // ignore if already exited
        }
      } else {
        activeRenderProcess.kill('SIGTERM')
      }
    }
  } catch (err) {
    console.warn('[RenderService] Error while killing render process:', err)
  } finally {
    activeRenderProcess = null
  }

  return true
}

/**
 * Start Remotion CLI Render
 */
export async function startRender(
  payload: StartRenderPayload,
  webContents?: Electron.WebContents
): Promise<RenderServiceResult> {
  // Security License Check Guard (Zero-Regression additive protection)
  const license = getLicenseStatus()
  if (!license.isValid || license.isClockDesynced || license.statusCode === 'EXPIRED' || license.statusCode === 'CLOCK_DESYNC') {
    const errorMsg = license.statusMessage || 'Akses Render Ditolak: Lisensi tidak valid atau jam sistem tidak sinkron.'
    console.warn('[RenderService] Render blocked by license guard:', errorMsg)
    return {
      success: false,
      error: errorMsg
    }
  }

  // If a render is already running, cancel it first
  if (activeRenderProcess) {
    await cancelRender()
  }

  isRenderCanceled = false

  const window = webContents ? BrowserWindow.fromWebContents(webContents) : BrowserWindow.getFocusedWindow()
  const isMov = payload.format === 'mov' || payload.format === 'prores4444' || (payload.format as string) === 'prores422'
  const isTransparent = isMov ? Boolean(payload.isTransparent) : false
  const extension = isMov ? 'mov' : 'mp4'

  // Windows-safe filename sanitizer:
  // - Ambil statusBarTitle / payload.customFileName / payload.title (fallback: "motion_project")
  // - Bersihkan karakter khusus yang dilarang Windows (\ / : * ? " < > |)
  // - Ubah spasi menjadi underscore atau strip dan jadikan huruf kecil: "Live Vital & Heart Rate Monitor" -> "live_vital_and_heart_rate_monitor.mp4"
  const rawTitle = payload.customFileName
    ? payload.customFileName.replace(/\.(mp4|mov)$/i, '')
    : (payload.title || 'motion_project')

  let sanitizedTitle = rawTitle
    .replace(/\s*&\s*/g, '_and_')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/[\s\t\n\r-]+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase()

  if (!sanitizedTitle) {
    sanitizedTitle = 'motion_project'
  }

  const outputFileName = payload.customFileName && payload.customFileName.toLowerCase().endsWith(`.${extension}`)
    ? payload.customFileName
    : `${sanitizedTitle}.${extension}`
  const targetDir = (payload.customOutputFolder && existsSync(payload.customOutputFolder))
    ? payload.customOutputFolder
    : getDefaultExportDir()

  const saveOptions: Electron.SaveDialogOptions = {
    title: isMov
      ? isTransparent
        ? 'Export QuickTime ProRes 4444 Video (Alpha Transparan)'
        : 'Export QuickTime ProRes 4444 Video (Solid / Latar Penuh)'
      : 'Export MP4 Video (H.264)',
    defaultPath: join(targetDir, outputFileName),
    filters: isMov
      ? [{ name: 'QuickTime ProRes Video', extensions: ['mov'] }]
      : [{ name: 'MP4 Video', extensions: ['mp4'] }]
  }

  const { canceled, filePath } = window
    ? await dialog.showSaveDialog(window, saveOptions)
    : await dialog.showSaveDialog(saveOptions)

  if (canceled || !filePath) {
    return { success: false, canceled: true }
  }

  const resolvedOutputPath = filePath
  const remotionEnvDir = getRemotionEnvDir()
  const propsFilePath = join(remotionEnvDir, 'render_props.json')
  const vibeGraphicPath = join(remotionEnvDir, 'src', 'VibeGraphic.tsx')

  // Auto-strip background on outermost <AbsoluteFill ...> if exporting transparent MOV ProRes 4444
  if (isTransparent && existsSync(vibeGraphicPath)) {
    try {
      const currentCode = readFileSync(vibeGraphicPath, 'utf-8')
      const strippedCode = stripOutermostAbsoluteFillBackground(currentCode)
      if (strippedCode !== currentCode) {
        activeVibeGraphicBackup = { path: vibeGraphicPath, content: currentCode }
        writeFileSync(vibeGraphicPath, strippedCode, 'utf-8')
        console.log('[RenderService] Auto-stripped outermost background on VibeGraphic.tsx for transparent export')
      }
    } catch (stripErr) {
      console.warn('[RenderService] Failed to auto-strip background on VibeGraphic.tsx:', stripErr)
    }
  }

  // Write temporary render_props.json to avoid Windows shell quote stripping
  let finalDurationInFrames = 150
  let finalFps = 30

  try {
    let baseProps: Record<string, any> = {}
    const configPath = join(remotionEnvDir, 'src', 'video_config.json')
    if (existsSync(configPath)) {
      try {
        baseProps = JSON.parse(readFileSync(configPath, 'utf-8'))
      } catch (_) {}
    }

    finalDurationInFrames = Math.max(
      1,
      Number(payload.durationInFrames) || Number(baseProps.durationInFrames) || 150
    )
    finalFps = Math.max(
      1,
      Number(payload.fps) || Number(baseProps.fps) || 30
    )

    const renderProps: Record<string, any> = {
      ...baseProps,
      durationInFrames: finalDurationInFrames,
      fps: finalFps,
      isTransparent,
      ...(payload.titleText !== undefined ? { titleText: payload.titleText } : {}),
      ...(payload.subtitleText !== undefined ? { subtitleText: payload.subtitleText } : {}),
      ...(payload.badgeText !== undefined ? { badgeText: payload.badgeText } : {}),
      ...(payload.accentColor !== undefined ? { accentColor: payload.accentColor } : {}),
      ...(payload.secondaryColor !== undefined ? { secondaryColor: payload.secondaryColor } : {}),
      backgroundColor: isTransparent
        ? 'transparent'
        : (payload.backgroundColor || baseProps.backgroundColor || '#0a0d14'),
      ...(payload.scale !== undefined ? { scale: payload.scale } : {}),
      ...(payload.offsetX !== undefined
        ? { offsetX: payload.offsetX, textOffsetX: payload.offsetX }
        : payload.textOffsetX !== undefined
        ? { textOffsetX: payload.textOffsetX, offsetX: payload.textOffsetX }
        : {}),
      ...(payload.offsetY !== undefined
        ? { offsetY: payload.offsetY, textOffsetY: payload.offsetY }
        : payload.textOffsetY !== undefined
        ? { textOffsetY: payload.textOffsetY, offsetY: payload.textOffsetY }
        : {}),
      ...(payload.glowIntensity !== undefined ? { glowIntensity: payload.glowIntensity } : {}),
      ...(payload.speedMultiplier !== undefined ? { speedMultiplier: payload.speedMultiplier } : {})
    }
    writeFileSync(propsFilePath, JSON.stringify(renderProps), 'utf-8')
  } catch (err) {
    console.error('[RenderService] Error writing render_props.json:', err)
  }

  const cleanUpRenderFiles = (): void => {
    try {
      if (existsSync(propsFilePath)) {
        unlinkSync(propsFilePath)
      }
    } catch {
      // ignore cleanup errors
    }

    if (activeVibeGraphicBackup && existsSync(activeVibeGraphicBackup.path)) {
      try {
        writeFileSync(activeVibeGraphicBackup.path, activeVibeGraphicBackup.content, 'utf-8')
        console.log('[RenderService] Restored original VibeGraphic.tsx background after render')
      } catch (restoreErr) {
        console.warn('[RenderService] Failed to restore original VibeGraphic.tsx:', restoreErr)
      }
      activeVibeGraphicBackup = null
    }
  }

  // Hardware acceleration / render mode flags
  const glFlags: string[] = []
  const isThreeComposition = existsSync(vibeGraphicPath) && usesThreeSource(readFileSync(vibeGraphicPath, 'utf-8'))
  if (payload.renderMode === 'gpu' || (payload.renderMode !== 'cpu' && isThreeComposition)) {
    glFlags.push('--gl=angle')
  } else if (payload.renderMode === 'cpu') {
    glFlags.push(isThreeComposition ? '--gl=swangle' : '--gl=swiftshader')
  }

  // ProRes codec & pixel / image format flags configuration
  const isProResAlpha = isMov && (isTransparent || payload.format === 'prores4444' && payload.isTransparent !== false)
  const pixelFormat = isProResAlpha ? 'yuva444p10le' : undefined
  // Lock imageFormat directly to pixelFormat / ProRes Alpha:
  // Remotion strictly rejects anything other than PNG for yuva444p10le
  const imageFormat = (pixelFormat === 'yuva444p10le' || isProResAlpha) ? 'png' : 'jpeg'

  const codecFlags: string[] = []
  if (isMov) {
    codecFlags.push('--codec=prores', '--prores-profile=4444')
    if (pixelFormat === 'yuva444p10le' || isProResAlpha) {
      codecFlags.push('--pixel-format=yuva444p10le')
    }
    codecFlags.push(`--image-format=${imageFormat}`)
  } else {
    codecFlags.push('--codec=h264', `--image-format=${imageFormat}`)
  }

  // Discrete arguments array to prevent space truncation in paths like 'Motion Studio'
  // Dynamic frame range: --frames=0-${finalDurationInFrames - 1} ensures full export without hardcoded limits
  const remotionSubArgs = [
    'render',
    'src/index.ts',
    'VibeGraphic',
    `--output=${resolvedOutputPath}`,
    `--props=${propsFilePath}`,
    `--frames=0-${finalDurationInFrames - 1}`,
    ...codecFlags,
    ...glFlags
  ]

  const nodeBin = getNodeBinaryPath()
  const cliScript = getRemotionCliScript()

  let cmd = nodeBin
  let args: string[] = []
  const useShell = false

  if (existsSync(cliScript)) {
    cmd = nodeBin
    args = [cliScript, ...remotionSubArgs]
  } else {
    cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    args = ['remotion', ...remotionSubArgs]
  }

  const extraNodePaths = [
    join(remotionEnvDir, 'node_modules'),
    join(process.resourcesPath || '', 'app.asar.unpacked', 'node_modules'),
    join(process.cwd(), 'node_modules')
  ].filter(Boolean).join(delimiter)

  console.log(`[RenderService] Spawning (shell=${useShell}): "${cmd}" with ${args.length} args in ${remotionEnvDir}`)

  // Initial progress update
  if (webContents && !webContents.isDestroyed()) {
    webContents.send('render:progress', {
      percent: 0,
      statusText: 'Menyiapkan render engine...'
    })
  }

  return new Promise((resolveResult) => {
    try {
      const child = spawn(cmd, args, {
        cwd: remotionEnvDir,
        shell: useShell,
        stdio: 'pipe',
        windowsHide: true,
        env: {
          ...process.env,
          NODE_PATH: extraNodePaths
        }
      })

      activeRenderProcess = child
      let errorOutput = ''

      const parseOutput = (rawChunk: Buffer | string): void => {
        const text = rawChunk.toString().replace(/\x1b\[[0-9;]*m/g, '')

        // Check for "Bundling X%"
        const bundleMatch = text.match(/Bundling\s+(\d+)%/i)
        if (bundleMatch) {
          const bundlePct = parseInt(bundleMatch[1], 10)
          const overallPct = Math.round(bundlePct * 0.15)
          if (webContents && !webContents.isDestroyed()) {
            webContents.send('render:progress', {
              percent: overallPct,
              statusText: `Menyiapkan bundle (${bundlePct}%)...`
            })
          }
          return
        }

        // Check for "Rendered X/Y" or "Rendering frame X of Y"
        const frameMatch =
          text.match(/(?:Rendered|Rendering)\s+(?:frame\s+)?(\d+)(?:\s+of|\/)(\d+)/i)
        if (frameMatch) {
          const current = parseInt(frameMatch[1], 10)
          const total = parseInt(frameMatch[2], 10)
          const framePct = total > 0 ? Math.round((current / total) * 100) : 0
          const overallPct = Math.min(92, Math.round(15 + (current / Math.max(1, total)) * 77))

          if (webContents && !webContents.isDestroyed()) {
            webContents.send('render:progress', {
              percent: overallPct,
              statusText: `Rendering ${framePct}% - Frame ${current}/${total}`
            })
          }
          return
        }

        // Check for "Encoded X/Y"
        const encodeMatch = text.match(/Encoded\s+(\d+)\/(\d+)/i)
        if (encodeMatch) {
          const current = parseInt(encodeMatch[1], 10)
          const total = parseInt(encodeMatch[2], 10)
          const encPct = total > 0 ? Math.round((current / total) * 100) : 0
          const overallPct = Math.min(99, Math.round(92 + (current / Math.max(1, total)) * 7))

          if (webContents && !webContents.isDestroyed()) {
            webContents.send('render:progress', {
              percent: overallPct,
              statusText: `Encoding video (${encPct}%)...`
            })
          }
          return
        }

        // Check for general percentage fallback
        const generalPctMatch = text.match(/(\d+)%/i)
        if (generalPctMatch) {
          const pct = parseInt(generalPctMatch[1], 10)
          if (webContents && !webContents.isDestroyed()) {
            webContents.send('render:progress', {
              percent: pct,
              statusText: `Rendering ${pct}%...`
            })
          }
        }
      }

      child.stdout?.on('data', (data) => {
        parseOutput(data)
      })

      child.stderr?.on('data', (data) => {
        const str = data.toString()
        errorOutput += str
        parseOutput(str)
      })

      child.on('exit', (code, signal) => {
        activeRenderProcess = null
        cleanUpRenderFiles()

        if (isRenderCanceled) {
          console.log('[RenderService] Render canceled by user.')
          if (webContents && !webContents.isDestroyed()) {
            webContents.send('render:progress', {
              percent: 0,
              statusText: 'Render dibatalkan'
            })
          }
          resolveResult({ success: false, canceled: true })
          return
        }

        if (code === 0) {
          console.log(`[RenderService] Render completed: ${resolvedOutputPath}`)
          if (Notification.isSupported()) {
            new Notification({
              title: uiText("Motion Suite Pro — Render Selesai! 🎉"),
              body: uiText("Video Anda telah selesai diekspor dan siap digunakan.")
            }).show()
          }

          if (webContents && !webContents.isDestroyed()) {
            webContents.send('render:progress', {
              percent: 100,
              statusText: 'Render selesai 100%'
            })
            webContents.send('render:done', {
              success: true,
              outputPath: resolvedOutputPath
            })
            webContents.send('render-finished-sound')
          }

          resolveResult({ success: true, outputPath: resolvedOutputPath })
        } else {
          console.error(`[RenderService] Render failed with code ${code}, signal ${signal}`)
          const errMsg = errorOutput.trim() || `Render process gagal dengan exit code ${code}`
          resolveResult({ success: false, error: errMsg })
        }
      })

      child.on('error', (err) => {
        activeRenderProcess = null
        cleanUpRenderFiles()
        console.error('[RenderService] Spawn error:', err)
        resolveResult({
          success: false,
          error: err instanceof Error ? err.message : String(err)
        })
      })
    } catch (err) {
      activeRenderProcess = null
      cleanUpRenderFiles()
      console.error('[RenderService] Error starting render:', err)
      resolveResult({
        success: false,
        error: err instanceof Error ? err.message : String(err)
      })
    }
  })
}

export interface VerifyRenderPayload {
  frame?: number
  timeoutMs?: number
}

export interface VerifyRenderResult {
  isValid: boolean
  errorMessage?: string
}

/**
 * Headless test render of 1 frame using built-in Remotion CLI to verify code integrity
 */
export async function verifyRemotionRender(
  payload: VerifyRenderPayload = {}
): Promise<VerifyRenderResult> {
  const { frame = 0, timeoutMs = 8000 } = payload
  const remotionEnvDir = getRemotionEnvDir()
  const nodeBin = getNodeBinaryPath()
  const cliScript = getRemotionCliScript()

  const tempFileName = `verify_render_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.png`
  const tempDir = app?.getPath ? app.getPath('temp') : (process.env.TEMP || process.env.TMP || '/tmp')
  const tempOutputPath = join(tempDir, tempFileName)

  const remotionSubArgs = [
    'still',
    'src/index.ts',
    'VibeGraphic',
    `--frame=${frame}`,
    `--output=${tempOutputPath}`,
    '--image-format=png'
  ]

  let cmd = nodeBin
  let args: string[] = []
  let useShell = false

  if (existsSync(cliScript)) {
    cmd = nodeBin
    args = [cliScript, ...remotionSubArgs]
  } else {
    cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    args = ['remotion', ...remotionSubArgs]
    useShell = process.platform === 'win32'
  }

  const extraNodePaths = [
    join(remotionEnvDir, 'node_modules'),
    join(process.resourcesPath || '', 'app.asar.unpacked', 'node_modules'),
    join(process.cwd(), 'node_modules')
  ]
    .filter(Boolean)
    .join(delimiter)

  return new Promise<VerifyRenderResult>((resolveResult) => {
    let child: ChildProcess | null = null
    let stdoutBuffer = ''
    let stderrBuffer = ''
    let isSettled = false

    const cleanupTempFile = (): void => {
      try {
        if (existsSync(tempOutputPath)) {
          unlinkSync(tempOutputPath)
        }
      } catch (_) {}
    }

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true
        if (child?.pid) {
          try {
            if (process.platform === 'win32') {
              execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' })
            } else {
              child.kill('SIGKILL')
            }
          } catch (_) {}
        }
        cleanupTempFile()
        resolveResult({
          isValid: false,
          errorMessage: `Verifikasi render Remotion melebihi batas waktu (${timeoutMs}ms).`
        })
      }
    }, timeoutMs)

    try {
      child = spawn(cmd, args, {
        cwd: remotionEnvDir,
        shell: useShell,
        stdio: 'pipe',
        windowsHide: true,
        env: {
          ...process.env,
          NODE_PATH: extraNodePaths
        }
      })

      child.stdout?.on('data', (data) => {
        stdoutBuffer += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderrBuffer += data.toString()
      })

      child.on('close', (code) => {
        clearTimeout(timer)
        if (isSettled) return
        isSettled = true
        cleanupTempFile()

        if (code === 0) {
          resolveResult({ isValid: true })
        } else {
          const rawErr = (stderrBuffer || stdoutBuffer).replace(/\x1b\[[0-9;]*m/g, '').trim()
          resolveResult({
            isValid: false,
            errorMessage: rawErr || `Proses verifikasi gagal dengan return code ${code}`
          })
        }
      })

      child.on('error', (err) => {
        clearTimeout(timer)
        if (isSettled) return
        isSettled = true
        cleanupTempFile()
        resolveResult({
          isValid: false,
          errorMessage: err instanceof Error ? err.message : String(err)
        })
      })
    } catch (err) {
      clearTimeout(timer)
      cleanupTempFile()
      resolveResult({
        isValid: false,
        errorMessage: err instanceof Error ? err.message : String(err)
      })
    }
  })
}

/**
 * Register Render IPC handlers in Main Process
 */
export function registerRenderIPC(): void {
  ipcMain.handle('render:start', async (event, payload: StartRenderPayload) => {
    return await startRender(payload, event.sender)
  })

  ipcMain.handle('render:cancel', async () => {
    return await cancelRender()
  })

  ipcMain.handle('verify-remotion-render', async (_, payload: VerifyRenderPayload = {}) => {
    return await verifyRemotionRender(payload)
  })

  // Cleanup on app quit
  app.on('before-quit', () => {
    cancelRender()
  })
}
