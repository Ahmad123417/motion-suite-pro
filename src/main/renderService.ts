import { spawn, ChildProcess, execSync } from 'child_process'
import { dialog, BrowserWindow, ipcMain, app, Notification } from 'electron'
import { resolve, join, delimiter } from 'path'
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync } from 'fs'
import { getLicenseStatus } from './licenseService'

export interface StartRenderPayload {
  format: 'mp4' | 'mov' | 'prores422' | 'prores4444'
  isTransparent?: boolean
  proresProfile?: 'standard' | '4444'
  title?: string
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
 * Cancel ongoing Remotion render process
 */
export async function cancelRender(): Promise<boolean> {
  if (!activeRenderProcess) {
    return false
  }

  console.log('[RenderService] Canceling active render process...')
  isRenderCanceled = true

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

  // Sanitize title for clean Windows filename (slug without timestamps or resolution suffix)
  const sanitizedTitle = (payload.title || 'motion_video')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'motion_video'

  const outputFileName = `${sanitizedTitle}.${extension}`
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
      ...(payload.backgroundColor !== undefined ? { backgroundColor: payload.backgroundColor } : {}),
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

  const cleanUpPropsFile = (): void => {
    try {
      if (existsSync(propsFilePath)) {
        unlinkSync(propsFilePath)
      }
    } catch {
      // ignore cleanup errors
    }
  }

  // Hardware acceleration / render mode flags
  const glFlags: string[] = []
  if (payload.renderMode === 'gpu') {
    glFlags.push('--gl=angle')
  } else if (payload.renderMode === 'cpu') {
    glFlags.push('--gl=swiftshader')
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
        cleanUpPropsFile()

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
              title: 'Motion Suite Pro — Render Selesai! 🎉',
              body: 'Video Anda telah selesai diekspor dan siap digunakan.'
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
        cleanUpPropsFile()
        console.error('[RenderService] Spawn error:', err)
        resolveResult({
          success: false,
          error: err instanceof Error ? err.message : String(err)
        })
      })
    } catch (err) {
      activeRenderProcess = null
      cleanUpPropsFile()
      console.error('[RenderService] Error starting render:', err)
      resolveResult({
        success: false,
        error: err instanceof Error ? err.message : String(err)
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

  // Cleanup on app quit
  app.on('before-quit', () => {
    cancelRender()
  })
}
