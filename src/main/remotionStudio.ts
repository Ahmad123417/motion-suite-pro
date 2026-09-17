import { spawn, ChildProcess, execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import fsPromises from 'fs/promises'
import { resolve, join } from 'path'
import http from 'http'
import { app, ipcMain, BrowserWindow } from 'electron'
import { sanitizeInterpolateCode } from './geminiCoder'

let studioProcess: ChildProcess | null = null
let currentPort = 10871
let isServerReady = false
let isStarting = false // Debounce guard to prevent multiple concurrent spawns

export interface StudioStatus {
  isRunning: boolean
  port: number
  url: string
  error?: string
}

/**
 * Resolve the remotion_env folder across dev and packaged environments
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
    const bundledNode = join(process.resourcesPath, 'bin', 'node.exe')
    if (existsSync(bundledNode)) return bundledNode
  }

  const devBundledNode = resolve(process.cwd(), 'resources/bin/node.exe')
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

export const getVibeGraphicPath = (): string => {
  const envDir = getRemotionEnvDir()
  const srcDir = join(envDir, 'src')
  if (!existsSync(srcDir)) {
    mkdirSync(srcDir, { recursive: true })
  }
  return join(srcDir, 'VibeGraphic.tsx')
}

/**
 * Check if the Studio HTTP server is responding on the given port
 */
const probeServer = (port: number): Promise<boolean> => {
  return new Promise((resolveResult) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port,
        path: '/',
        timeout: 1000
      },
      (res) => {
        resolveResult(res.statusCode === 200)
      }
    )

    req.on('error', () => {
      resolveResult(false)
    })

    req.on('timeout', () => {
      req.destroy()
      resolveResult(false)
    })
  })
}

/**
 * Start the Remotion Studio child process on the specified port
 */
export async function startRemotionStudio(
  port = 10871
): Promise<{ success: boolean; port: number; url: string; error?: string }> {
  // Debounce guard: cegah multiple spawn dari klik berulang
  if (isStarting) {
    console.log('[RemotionStudio] Start already in progress, ignoring duplicate call.')
    return {
      success: false,
      port,
      url: `http://localhost:${port}`,
      error: 'Server sedang dalam proses booting.'
    }
  }

  currentPort = port

  // 1. If already responding, return active immediately
  const alreadyResponding = await probeServer(port)
  if (alreadyResponding) {
    isServerReady = true
    return {
      success: true,
      port,
      url: `http://localhost:${port}`
    }
  }

  isStarting = true

  try {
    // 2. Kill any stale process reference and clean port 10871 on Windows
    if (studioProcess) {
      await stopRemotionStudio()
    }

    if (process.platform === 'win32') {
      try {
        execSync(
          'cmd /c "for /f \\"tokens=5\\" %a in (\'netstat -aon ^| findstr :10871\') do taskkill /f /pid %a" 2>nul',
          { stdio: 'ignore' }
        )
        console.log('[RemotionStudio] Pre-start port 10871 clean check completed.')
      } catch {
        // Abaikan jika port sudah bersih
      }
      // Toleransi delay 600ms setelah pembersihan port zombie
      await new Promise((r) => setTimeout(r, 600))
    }

    const remotionEnvPath = getRemotionEnvDir()
    const publicDir = join(remotionEnvPath, 'public')
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true })
    }

    const nodeBin = getNodeBinaryPath()
    const cliScript = getRemotionCliScript()

    console.log(`[RemotionStudio] Starting studio in ${remotionEnvPath} on port ${port}...`)
    console.log(`[RemotionStudio] Node Binary: ${nodeBin}`)
    console.log(`[RemotionStudio] CLI Script: ${cliScript}`)

    let spawnCmd = nodeBin
    let spawnArgs: string[] = []
    let useShell = false

    if (existsSync(cliScript)) {
      spawnCmd = nodeBin
      spawnArgs = [cliScript, 'preview', 'src/index.ts', `--port=${port}`, '--public-dir=public']
      useShell = false
    } else {
      spawnCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
      spawnArgs = ['remotion', 'preview', 'src/index.ts', `--port=${port}`, '--public-dir=public']
      useShell = process.platform === 'win32'
    }

    const extraNodePaths = [
      join(remotionEnvPath, 'node_modules'),
      join(process.resourcesPath || '', 'app.asar.unpacked', 'node_modules'),
      join(process.cwd(), 'node_modules')
    ]
      .filter(Boolean)
      .join(';')

    studioProcess = spawn(spawnCmd, spawnArgs, {
      cwd: remotionEnvPath,
      shell: useShell,
      stdio: 'pipe',
      windowsHide: true,
      env: {
        ...process.env,
        NODE_PATH: extraNodePaths,
        PORT: String(port),
        BROWSER: 'none' // Prevent opening default system web browser
      }
    })

    studioProcess.stdout?.on('data', (d) => {
      const out = d.toString()
      console.log(`[Remotion Studio]: ${out.trim()}`)
      if (out.includes('Server ready') || out.includes('localhost:') || out.includes(`:${port}`)) {
        isServerReady = true
      }
    })

    studioProcess.stderr?.on('data', (d) => {
      const errStr = d.toString()
      console.error(`[Remotion Studio Error]: ${errStr.trim()}`)
      const win = BrowserWindow.getAllWindows()[0]
      win?.webContents.send('studio:error', errStr)
    })

    studioProcess.on('close', (code) => {
      console.log(`[Remotion Studio] Exited with code: ${code}`)
      isServerReady = false
      studioProcess = null
      const win = BrowserWindow.getAllWindows()[0]
      win?.webContents.send('studio:status', { active: false, exitCode: code })
    })

    studioProcess.on('error', (err) => {
      console.error('[Remotion Studio] Spawn error:', err)
      isServerReady = false
      studioProcess = null
      const win = BrowserWindow.getAllWindows()[0]
      win?.webContents.send('studio:error', err.message)
    })

    // 3. Poll until server is ready (max 25 seconds)
    const startTime = Date.now()
    const timeoutMs = 25000

    while (Date.now() - startTime < timeoutMs) {
      if (isServerReady) {
        break
      }
      const responding = await probeServer(port)
      if (responding) {
        isServerReady = true
        break
      }
      await new Promise((r) => setTimeout(r, 400))
    }

    if (isServerReady) {
      return {
        success: true,
        port,
        url: `http://localhost:${port}`
      }
    }

    return {
      success: false,
      port,
      url: `http://localhost:${port}`,
      error: 'Remotion Studio melebihi batas waktu startup (25s).'
    }
  } catch (err) {
    console.error('[RemotionStudio] Failed to start:', err)
    return {
      success: false,
      port,
      url: `http://localhost:${port}`,
      error: err instanceof Error ? err.message : String(err)
    }
  } finally {
    isStarting = false
  }
}

/**
 * Stop Remotion Studio and kill all child processes
 */
export async function stopRemotionStudio(): Promise<{ success: boolean }> {
  if (!studioProcess && !isServerReady) {
    return { success: true }
  }

  try {
    if (studioProcess?.pid) {
      if (process.platform === 'win32') {
        // Kill whole process tree on Windows
        try {
          execSync(`taskkill /pid ${studioProcess.pid} /T /F`, { stdio: 'ignore' })
        } catch {
          // ignore if already exited
        }
      } else {
        studioProcess.kill('SIGTERM')
      }
    }
  } catch (err) {
    console.warn('[RemotionStudio] Error stopping process:', err)
  } finally {
    studioProcess = null
    isServerReady = false
  }

  return { success: true }
}

/**
 * Clean up studio zombie processes synchronously on app quit
 */
export function cleanupStudioOnQuit(): void {
  try {
    if (process.platform === 'win32') {
      try {
        execSync(
          'cmd /c "for /f \\"tokens=5\\" %a in (\'netstat -aon ^| findstr :10871\') do taskkill /f /pid %a" 2>nul',
          { stdio: 'ignore' }
        )
      } catch (_) {}
      if (studioProcess?.pid) {
        try {
          execSync(`taskkill /pid ${studioProcess.pid} /f /t`, { stdio: 'ignore' })
        } catch (_) {}
      }
    } else if (studioProcess) {
      studioProcess.kill('SIGKILL')
    }
  } catch (_) {
  } finally {
    studioProcess = null
    isServerReady = false
  }
}

/**
 * Write component TSX string directly to remotion_env/src/VibeGraphic.tsx
 */
export async function writeComponentCode(
  newCode: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const targetPath = getVibeGraphicPath()

    let code = newCode.trim()
    // Strip markdown code fences if present
    code = code.replace(/^```(?:tsx|typescript|jsx|javascript)?\s*/i, '').replace(/\s*```$/i, '').trim()

    const importIndex = code.indexOf('import ')
    if (importIndex > 0) {
      code = code.slice(importIndex).trim()
    }

    // Sanitize interpolate input ranges to prevent Remotion crash (e.g. [405, 405] -> [405, 406])
    code = sanitizeInterpolateCode(code)

    // Also write to DynamicMotion.tsx to keep both synchronized
    try {
      const devDynamicPath = resolve(process.cwd(), 'src/renderer/src/remotion/DynamicMotion.tsx')
      if (existsSync(devDynamicPath)) {
        await fsPromises.writeFile(devDynamicPath, code, 'utf-8')
      }
    } catch {
      // non-critical
    }

    await fsPromises.writeFile(targetPath, code, 'utf-8')
    console.log(`[RemotionStudio] Successfully wrote code to ${targetPath}`)
    return { success: true, filePath: targetPath }
  } catch (err) {
    console.error('[RemotionStudio] writeComponentCode failed:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}

/**
 * Get current server status
 */
export async function getStudioServerStatus(): Promise<StudioStatus> {
  const responding = await probeServer(currentPort)
  const isRunning = responding || (studioProcess !== null && isServerReady)
  return {
    isRunning,
    port: currentPort,
    url: `http://localhost:${currentPort}`
  }
}

/**
 * Restart Remotion Studio server cleanly
 */
export async function restartRemotionStudio(
  port = 10871
): Promise<{ success: boolean; port: number; url: string; error?: string }> {
  console.log(`[RemotionStudio] Restarting Studio Server on port ${port}...`)
  // Reset isStarting jika tertinggal dari sesi sebelumnya
  isStarting = false
  await stopRemotionStudio()
  await new Promise((r) => setTimeout(r, 600))
  return await startRemotionStudio(port)
}

/**
 * Register IPC Handlers and app lifecycle hooks
 */
export function registerRemotionStudioIPC(): void {
  ipcMain.handle('remotion:start-server', async (_, port?: number) => {
    return await startRemotionStudio(port || 10871)
  })

  ipcMain.handle('remotion:stop-server', async () => {
    return await stopRemotionStudio()
  })

  ipcMain.handle('remotion:restart-server', async (_, port?: number) => {
    return await restartRemotionStudio(port || 10871)
  })

  ipcMain.handle('remotion:write-code', async (_, code: string) => {
    return await writeComponentCode(code)
  })

  ipcMain.handle('remotion:get-status', async () => {
    return await getStudioServerStatus()
  })

  // Clean lifecycle shutdown on Electron exit
  app.on('before-quit', () => {
    stopRemotionStudio()
  })

  process.on('exit', () => {
    stopRemotionStudio()
  })
}
