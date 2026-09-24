import { execSync } from 'child_process'
import { app, shell, BrowserWindow, ipcMain, dialog, session, Notification } from 'electron'
import { join, resolve, dirname, extname } from 'path'
import { existsSync, statSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import {
  generateMotionCode,
  applyManualCode,
  getCurrentMotionCode,
  REMOTION_CODER_SYSTEM_PROMPT
} from './geminiCoder'
import { registerRemotionStudioIPC, cleanupStudioOnQuit, startRemotionStudio } from './remotionStudio'
import { registerGeminiIPC } from './geminiService'
import { registerRenderIPC, getRemotionEnvDir } from './renderService'
import { registerAssetIPC } from './assetService'
import { registerLicenseIPC, getLicenseStatus } from './licenseService'

// ─── Auto-Updater Configuration ───────────────────────────────────────────────
autoUpdater.autoDownload = false         // Jangan unduh otomatis; tunggu konfirmasi pengguna
autoUpdater.autoInstallOnAppQuit = false // Kontrol instalasi eksplisit via IPC
autoUpdater.logger = null                // Silent — jangan spam console

function setupAutoUpdater(win: BrowserWindow): void {
  // Event: Update terdeteksi
  autoUpdater.on('update-available', (info) => {
    if (!win.isDestroyed()) {
      win.webContents.send('update-available', info)
    }
  })

  // Progress unduhan
  autoUpdater.on('download-progress', (progress) => {
    if (!win.isDestroyed()) {
      const percent = Math.round(progress.percent)
      win.webContents.send('update:progress', { percent })
      win.webContents.send('download-progress', { percent })
    }
  })

  // Event: Update selesai diunduh & siap diinstal
  autoUpdater.on('update-downloaded', (info) => {
    if (!win.isDestroyed()) {
      win.webContents.send('update-downloaded', { version: info.version })
    }
  })

  // Silent fail — jangan ganggu user jika offline / tidak ada update
  autoUpdater.on('error', (err) => {
    console.warn('[AutoUpdater] Silent error:', err?.message ?? err)
    if (!win.isDestroyed()) {
      win.webContents.send('update:error', { message: err?.message ?? String(err) })
    }
  })

  // IPC: Mulai unduh manual jika diperlukan
  try {
    ipcMain.removeHandler('updater:start-download')
  } catch (_) {}
  ipcMain.handle('updater:start-download', async () => {
    try {
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (err) {
      console.warn('[AutoUpdater] downloadUpdate failed:', err)
      return { success: false, error: String(err) }
    }
  })

  try {
    ipcMain.removeHandler('start-download-update')
  } catch (_) {}
  ipcMain.handle('start-download-update', async () => {
    try {
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (err) {
      console.warn('[AutoUpdater] downloadUpdate failed:', err)
      return { success: false, error: String(err) }
    }
  })

  // IPC Handler: User memilih install & restart sekarang
  try {
    ipcMain.removeHandler('restart-app-for-update')
  } catch (_) {}
  ipcMain.handle('restart-app-for-update', () => {
    autoUpdater.quitAndInstall()
  })

  try {
    ipcMain.removeHandler('updater:install-restart')
  } catch (_) {}
  ipcMain.handle('updater:install-restart', () => {
    autoUpdater.quitAndInstall()
  })

  // Pengecekan otomatis beberapa detik setelah aplikasi siap (hanya dalam packaged build)
  setTimeout(() => {
    if (app.isPackaged) {
      autoUpdater.checkForUpdates().catch((e) => {
        console.warn('[AutoUpdater] checkForUpdates failed silently:', e?.message)
      })
    } else {
      console.log('[AutoUpdater] Skipped update check in development mode (app.isPackaged = false)')
    }
  }, 4000)
}

// Force discrete high-performance GPU (NVIDIA) and avoid software rasterizer CPU bottleneck
app.commandLine.appendSwitch('force_high_performance_gpu')
app.commandLine.appendSwitch('disable-software-rasterizer')
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')
app.commandLine.appendSwitch('no-sandbox')
app.commandLine.appendSwitch('disable-http-cache')
app.commandLine.appendSwitch('disable-web-security')
app.commandLine.appendSwitch('allow-running-insecure-content')
app.commandLine.appendSwitch('disable-features', 'IsolateOrigins,site-per-process')

// Prevent multiple Electron instances competing for disk cache
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

app.on('second-instance', () => {
  const windows = BrowserWindow.getAllWindows()
  if (windows.length > 0) {
    const mainWindow = windows[0]
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

let cachedBundleLocation: string | null = null
let cachedBundleTimestamp = 0

const getRemotionRootPath = (): string => {
  const candidates = [
    resolve(app.getAppPath(), 'src/renderer/src/remotion/Root.tsx'),
    resolve(__dirname, '../../src/renderer/src/remotion/Root.tsx'),
    resolve(process.cwd(), 'src/renderer/src/remotion/Root.tsx')
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }
  return candidates[0]
}

const getOrBundleRemotion = async (onProgress: (progress: number) => void): Promise<string> => {
  const entryPoint = getRemotionRootPath()
  let isCacheValid = false

  if (cachedBundleLocation && existsSync(cachedBundleLocation)) {
    try {
      const templatePath = resolve(entryPoint, '../MotionTemplate.tsx')
      const dynamicMotionPath = resolve(entryPoint, '../DynamicMotion.tsx')
      const rootMtime = existsSync(entryPoint) ? statSync(entryPoint).mtimeMs : 0
      const templateMtime = existsSync(templatePath) ? statSync(templatePath).mtimeMs : 0
      const dynamicMtime = existsSync(dynamicMotionPath) ? statSync(dynamicMotionPath).mtimeMs : 0
      const latestSourceMtime = Math.max(rootMtime, templateMtime, dynamicMtime)

      if (latestSourceMtime <= cachedBundleTimestamp) {
        isCacheValid = true
      }
    } catch {
      isCacheValid = false
    }
  }

  if (isCacheValid && cachedBundleLocation) {
    onProgress(100)
    return cachedBundleLocation
  }

  const bundleLocation = await bundle({
    entryPoint,
    onProgress: (p) => {
      onProgress(Math.round(p))
    }
  })

  cachedBundleLocation = bundleLocation
  cachedBundleTimestamp = Date.now()
  return bundleLocation
}

function createWindow(): void {
  const appIconPath = app.isPackaged && existsSync(join(process.resourcesPath, 'icon.png'))
    ? join(process.resourcesPath, 'icon.png')
    : join(__dirname, '../../resources/icon.png')

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'Motion Suite Pro',
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 650,
    show: false,
    autoHideMenuBar: true,
    icon: appIconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  })

  // Prevent automatic window title override by DOM
  mainWindow.on('page-title-updated', (e) => e.preventDefault())

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Automatically inject clean CSS directly into Remotion Studio preview frame
  mainWindow.webContents.on('did-frame-finish-load', async (_, isMainFrame, frameProcessId, frameRoutingId) => {
    if (isMainFrame) return
    try {
      const frame = mainWindow.webContents.mainFrame.frames.find(
        (f) => f.processId === frameProcessId && f.routingId === frameRoutingId
      )
      if (frame && (frame.url.includes('10871') || frame.url.includes('localhost'))) {
        await frame.executeJavaScript(`
          (() => {
            try {
              let style = document.getElementById('motion-studio-frame-clean');
              if (!style) {
                style = document.createElement('style');
                style.id = 'motion-studio-frame-clean';
                (document.head || document.documentElement).appendChild(style);
              }
              style.textContent = \`
                header, nav, [role="banner"], [data-testid="top-bar"], [data-testid="menu-bar"],
                [data-testid="header"], [data-testid="breadcrumbs"], div[role="menubar"],
                div[class*="TopBar"], div[class*="MenuBar"], div[class*="HeaderBar"],
                div[class*="top-bar"], div[class*="menu-bar"], div[class*="Breadcrumbs"],
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
                [data-testid="render-button"], [data-testid="render-button-container"],
                button[data-testid="render-button"], button[title*="Render"],
                button[aria-label*="Render"], button[title*="render"],
                button[aria-label*="render"], div[class*="RenderButton"],
                div[data-testid="render-modal-opener"], a[href*="/render"] {
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
              \`;
            } catch (_) {}
          })()
        `)
      }
    } catch {
      // non-critical
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Clean up any stale port 10871 zombie process from prior runs
  if (process.platform === 'win32') {
    try {
      execSync('cmd /c "for /f \\"tokens=5\\" %a in (\'netstat -aon ^| findstr :10871\') do taskkill /f /pid %a" 2>nul', {
        stdio: 'ignore'
      })
    } catch (_) {}
  } else {
    try {
      execSync('lsof -ti :10871 | xargs kill -9 2>/dev/null || true', { shell: '/bin/sh', stdio: 'ignore' })
    } catch (_) {}
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.motionsuitepro.app')

  // Focus existing window when second instance attempts to start
  app.on('second-instance', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length > 0) {
      if (allWindows[0].isMinimized()) allWindows[0].restore()
      allWindows[0].focus()
    }
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Safe IPC handler to open external URLs in default browser
  ipcMain.on('open-external-url', (_, url) => {
    try {
      if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
        shell.openExternal(url)
      } else {
        console.warn('[IPC] Blocked potentially unsafe external url:', url)
      }
    } catch (err) {
      console.error('[IPC] Failed to open external URL:', err)
    }
  })

  ipcMain.handle('open-external-url', async (_, url) => {
    try {
      if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
        await shell.openExternal(url)
        return { success: true }
      }
      return { success: false, error: 'Invalid or unsafe URL' }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Register Remotion Studio background server IPC handlers
  registerRemotionStudioIPC()

  // Register Gemini AI video generation & refinement IPC handlers
  registerGeminiIPC()

  // Register physical Remotion CLI render service IPC handlers
  registerRenderIPC()

  // Register local asset overlay IPC handlers
  registerAssetIPC()

  // Register license check & validation IPC handlers
  registerLicenseIPC()

  // Intercept requests for Remotion Studio port 10871 to ensure Origin header is always present
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['http://localhost:10871/*', 'ws://localhost:10871/*', 'http://127.0.0.1:10871/*', 'ws://127.0.0.1:10871/*'] },
    (details, callback) => {
      details.requestHeaders['Origin'] = 'http://localhost:10871'
      callback({ cancel: false, requestHeaders: details.requestHeaders })
    }
  )

  // Remotion Local Video Rendering (Export MP4)
  ipcMain.handle(
    'render-video',
    async (
      event,
      {
        titleText,
        accentColor,
        backgroundColor,
        format = 'mp4',
        isTransparent = false,
        width,
        height,
        durationInFrames,
        fps = 30,
        customFileName,
        outputFolder,
        skipDialog = false,
        customAssetUrl
      }: {
        titleText: string
        accentColor: string
        backgroundColor: string
        format?: 'mp4' | 'mov'
        isTransparent?: boolean
        width?: number
        height?: number
        durationInFrames?: number
        fps?: number
        customFileName?: string
        outputFolder?: string
        skipDialog?: boolean
        customAssetUrl?: string
      }
    ) => {
      // Security License Check Guard (Zero-Regression additive protection)
      const license = getLicenseStatus()
      if (!license.isValid || license.isClockDesynced || license.statusCode === 'EXPIRED' || license.statusCode === 'CLOCK_DESYNC') {
        const errorMsg = license.statusMessage || 'Akses Render Ditolak: Lisensi tidak valid atau jam sistem tidak sinkron.'
        console.warn('[RenderVideo] License guard blocked render:', errorMsg)
        return {
          success: false,
          error: errorMsg
        }
      }

      const parentWindow = BrowserWindow.fromWebContents(event.sender)
      const isMov = format === 'mov'
      const extension = isMov ? 'mov' : 'mp4'

      let resolvedFilePath: string

      if (skipDialog || outputFolder) {
        const targetFolder = outputFolder || app.getPath('downloads')
        if (!existsSync(targetFolder)) {
          mkdirSync(targetFolder, { recursive: true })
        }

        const baseName = customFileName
          ? customFileName.replace(/\.[^/.]+$/, '')
          : (titleText || 'motion_video')
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, '_')
              .replace(/_+/g, '_')
              .replace(/^_|_$/g, '') || 'motion_video'

        let candidateName = `${baseName}.${extension}`
        let fullPath = join(targetFolder, candidateName)
        let counter = 1

        // Prevent file collision if file with same name already exists
        while (existsSync(fullPath)) {
          candidateName = `${baseName}_${counter}.${extension}`
          fullPath = join(targetFolder, candidateName)
          counter++
        }

        resolvedFilePath = fullPath
      } else {
        const cleanTitle = (titleText || 'motion_video')
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '') || 'motion_video'

        const defaultFilename = customFileName || `${cleanTitle}.${extension}`

        const saveOptions = {
          title: isMov ? 'Export Remotion Video (Apple ProRes MOV)' : 'Export Remotion Video (MP4)',
          defaultPath: join(app.getPath('downloads'), defaultFilename),
          filters: isMov
            ? [{ name: 'QuickTime Movie', extensions: ['mov'] }]
            : [{ name: 'MP4 Video', extensions: ['mp4'] }]
        }

        const { canceled, filePath } = parentWindow
          ? await dialog.showSaveDialog(parentWindow, saveOptions)
          : await dialog.showSaveDialog(saveOptions)

        if (canceled || !filePath) {
          return { success: false, canceled: true }
        }

        resolvedFilePath = filePath
      }

      try {
        event.sender.send('render-progress', 0)

        // Step 1: Bundle Remotion project (allocating 0% - 25% overall progress)
        const bundleLocation = await getOrBundleRemotion((bundlePercent) => {
          event.sender.send('render-progress', Math.round((bundlePercent / 100) * 25))
        })

        const parsedFps = Number(fps) || 30

        const inputProps = {
          titleText,
          accentColor,
          backgroundColor,
          isTransparent: Boolean(isTransparent),
          width: width ? Number(width) : undefined,
          height: height ? Number(height) : undefined,
          durationInFrames: durationInFrames ? Number(durationInFrames) : undefined,
          fps: parsedFps,
          customAssetUrl: customAssetUrl || undefined
        }

        // Step 2: Select composition (prefer DynamicMotion, fallback to MotionTemplate)
        let composition
        try {
          composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'DynamicMotion',
            inputProps: {
              ...inputProps,
              width,
              height,
              durationInFrames,
              fps: parsedFps
            }
          })
        } catch {
          composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'MotionTemplate',
            inputProps: {
              ...inputProps,
              width,
              height,
              durationInFrames,
              fps: parsedFps
            }
          })
        }

        // Apply dynamic canvas resolution and duration to composition
        const finalComposition = {
          ...composition,
          width: Number(width) || composition.width,
          height: Number(height) || composition.height,
          durationInFrames: Number(durationInFrames) || composition.durationInFrames,
          fps: Number(fps) || composition.fps
        }

        const isProResAlpha = isMov && Boolean(isTransparent)
        const pixelFormat = isProResAlpha ? 'yuva444p10le' : undefined
        // Lock imageFormat directly to pixelFormat / ProRes Alpha:
        // Remotion strictly rejects anything other than PNG for yuva444p10le
        const imageFormat = (pixelFormat === 'yuva444p10le' || isProResAlpha) ? 'png' : 'jpeg'

        // Step 3: Render Media to local video file (allocating 25% - 100% overall progress)
        await renderMedia({
          composition: finalComposition,
          serveUrl: bundleLocation,
          outputLocation: resolvedFilePath,
          inputProps: {
            ...inputProps,
            width: finalComposition.width,
            height: finalComposition.height,
            durationInFrames: finalComposition.durationInFrames,
            fps: finalComposition.fps
          },
          onProgress: ({ progress }) => {
            const overallProgress = Math.min(100, Math.round(25 + progress * 75))
            event.sender.send('render-progress', overallProgress)
          },
          imageFormat,
          ...(isMov
            ? {
                codec: 'prores',
                proResProfile: '4444',
                ...(pixelFormat
                  ? {
                      pixelFormat
                    }
                  : {})
              }
            : {
                codec: 'h264'
              })
        })

        event.sender.send('render-progress', 100)
        if (Notification.isSupported()) {
          new Notification({
            title: 'Motion Suite Pro — Render Selesai! 🎉',
            body: 'Video Anda telah selesai diekspor dan siap digunakan.'
          }).show()
        }
        event.sender.send('render-finished-sound')

        return {
          success: true,
          filePath: resolvedFilePath
        }
      } catch (error) {
        console.error('Error rendering video:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown rendering error'
        }
      }
    }
  )

  // Select directory dialog for batch export
  ipcMain.handle('select-directory', async (event) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender)
    const result = parentWindow
      ? await dialog.showOpenDialog(parentWindow, {
          title: 'Pilih Folder Tujuan Batch Export',
          properties: ['openDirectory', 'createDirectory']
        })
      : await dialog.showOpenDialog({
          title: 'Pilih Folder Tujuan Batch Export',
          properties: ['openDirectory', 'createDirectory']
        })

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { canceled: true }
    }
    const selectedPath = result.filePaths[0].replace(/[/\\]+$/, '')
    const finalPath = selectedPath.endsWith('Motion Studio Exports')
      ? selectedPath
      : join(selectedPath, 'Motion Studio Exports')
    if (!existsSync(finalPath)) {
      mkdirSync(finalPath, { recursive: true })
    }
    return { canceled: false, folderPath: finalPath }
  })

  // Open directory or reveal file in native Windows File Explorer
  const handleOpenExportFolder = async (_event: unknown, targetPath?: string) => {
    try {
      let target = targetPath
      if (!target) {
        target = join(app.getPath('downloads'), 'Motion Studio Exports')
      }

      if (existsSync(target)) {
        if (statSync(target).isFile()) {
          shell.showItemInFolder(target)
          return { success: true }
        }
        await shell.openPath(target)
        return { success: true }
      }

      // If target does not exist, check if it was a file path with an extension
      const ext = extname(target)
      const dir = ext ? dirname(target) : target
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      await shell.openPath(dir)
      return { success: true }
    } catch (err) {
      console.warn('[IPC] Error opening folder/file:', err)
      const fallback = join(app.getPath('downloads'), 'Motion Studio Exports')
      if (!existsSync(fallback)) mkdirSync(fallback, { recursive: true })
      await shell.openPath(fallback)
      return { success: false, error: String(err) }
    }
  }

  ipcMain.handle('open-export-folder', handleOpenExportFolder)
  ipcMain.handle('shell:open-folder', handleOpenExportFolder)
  ipcMain.handle('shell:open-path', handleOpenExportFolder)
  ipcMain.handle('open-path', handleOpenExportFolder)

  // Return current application version from package.json
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // Show file in directory / file manager
  ipcMain.handle('open-file-location', async (_event, filePath: string) => {
    if (filePath && existsSync(filePath)) {
      shell.showItemInFolder(filePath)
      return { success: true }
    }
    return { success: false, error: 'File path not found' }
  })

  // Bring-Your-Own-Code: Apply manual TSX code directly to disk
  ipcMain.handle('apply-manual-code', async (_event, code: string) => {
    return await applyManualCode(code)
  })

  // Get current DynamicMotion.tsx code for live editor
  ipcMain.handle('get-current-motion-code', async () => {
    return await getCurrentMotionCode()
  })

  // Get AI Setup System Prompt for clipboard copy
  ipcMain.handle('get-system-prompt', async () => {
    return REMOTION_CODER_SYSTEM_PROMPT.trim()
  })

  // Backward-compatible fallback handlers
  ipcMain.handle('generate-motion-code', async (_event, params) => {
    return await generateMotionCode(params)
  })

  ipcMain.handle('fix-motion-code', async (_event, params) => {
    return await generateMotionCode({
      ...params,
      isFix: true,
      errorMessage: params.error
    })
  })

  // Dynamic Video Config synchronization with remotion_env/src/video_config.json
  ipcMain.handle(
    'video:update-config',
    async (
      _event,
      config: {
        width?: number
        height?: number
        fps?: number
        durationInFrames?: number
        assetPath?: string | null
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
    ) => {
      try {
        const envDir = getRemotionEnvDir()
        const srcDir = join(envDir, 'src')
        if (!existsSync(srcDir)) {
          mkdirSync(srcDir, { recursive: true })
        }
        const configPath = join(srcDir, 'video_config.json')
        let mergedConfig: Record<string, any> = {}
        if (existsSync(configPath)) {
          try {
            mergedConfig = JSON.parse(readFileSync(configPath, 'utf-8'))
          } catch (_) {}
        }
        mergedConfig = { ...mergedConfig, ...config }

        // Mirror offsetX <-> textOffsetX and offsetY <-> textOffsetY for bidirectional compatibility
        if (config.offsetX !== undefined && config.textOffsetX === undefined) {
          mergedConfig.textOffsetX = config.offsetX
        } else if (config.textOffsetX !== undefined && config.offsetX === undefined) {
          mergedConfig.offsetX = config.textOffsetX
        }
        if (config.offsetY !== undefined && config.textOffsetY === undefined) {
          mergedConfig.textOffsetY = config.offsetY
        } else if (config.textOffsetY !== undefined && config.offsetY === undefined) {
          mergedConfig.offsetY = config.textOffsetY
        }

        const serialized = JSON.stringify(mergedConfig, null, 2)
        writeFileSync(configPath, serialized, 'utf-8')

        // Also mirror to remotion_env/video_config.json for root-level fallback
        try {
          const rootConfigPath = join(envDir, 'video_config.json')
          writeFileSync(rootConfigPath, serialized, 'utf-8')
        } catch (_) {}

        console.log('[Main] video_config.json updated:', mergedConfig)
        return { success: true, filePath: configPath }
      } catch (err) {
        console.error('[Main] Failed to update video_config.json:', err)
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
    }
  )

  // Dialog to select custom video output directory
  ipcMain.handle('dialog:select-output-folder', async (event) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender)
    const result = parentWindow
      ? await dialog.showOpenDialog(parentWindow, {
          title: 'Pilih Folder Penyimpanan Video',
          properties: ['openDirectory', 'createDirectory']
        })
      : await dialog.showOpenDialog({
          title: 'Pilih Folder Penyimpanan Video',
          properties: ['openDirectory', 'createDirectory']
        })

    if (result.canceled || !result.filePaths.length) {
      return { canceled: true }
    }
    const selectedPath = result.filePaths[0].replace(/[/\\]+$/, '')
    const finalPath = selectedPath.endsWith('Motion Studio Exports')
      ? selectedPath
      : join(selectedPath, 'Motion Studio Exports')
    if (!existsSync(finalPath)) {
      mkdirSync(finalPath, { recursive: true })
    }
    return { canceled: false, folderPath: finalPath }
  })

  createWindow()

  // Silent auto-start Motion Engine background child process
  startRemotionStudio(10871).catch((err) => {
    console.warn('[Main] Silent engine boot note:', err)
  })

  // Initialize auto-updater after window is created
  const mainWin = BrowserWindow.getAllWindows()[0]
  if (mainWin) {
    setupAutoUpdater(mainWin)
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  cleanupStudioOnQuit()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  cleanupStudioOnQuit()
})

app.on('will-quit', () => {
  cleanupStudioOnQuit()
})
