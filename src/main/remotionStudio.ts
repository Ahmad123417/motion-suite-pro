import { spawn, ChildProcess } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import fsPromises from 'fs/promises'
import { resolve, join, delimiter } from 'path'
import http from 'http'
import net from 'net'
import { app, ipcMain, BrowserWindow } from 'electron'
import {
  sanitizeInterpolateCode,
  preFixRemotionCode,
  sanitizeUnterminatedStrings,
  sanitizeJsxBacktickAttributes,
  cleanGeneratedCode
} from './geminiCoder'

let studioProcess: ChildProcess | null = null
let currentPort = 10871
let isServerReady = false
let isStarting = false // Debounce guard to prevent multiple concurrent spawns

const hasRunningStudioProcess = (): boolean =>
  studioProcess !== null &&
  studioProcess.exitCode === null &&
  studioProcess.signalCode === null &&
  !studioProcess.killed

// Check availability without terminating or adopting another application's listener.
const checkPortAvailable = (port: number): Promise<void> =>
  new Promise((resolveResult, reject) => {
    const server = net.createServer()
    server.unref()
    server.once('error', (err: NodeJS.ErrnoException) => {
      reject(new Error(err.code === 'EADDRINUSE'
        ? `Port ${port} is already in use. Close the conflicting application and try again.`
        : `Cannot check port ${port}: ${err.message}`))
    })
    server.listen({ port, exclusive: true }, () => {
      server.close((err) => err ? reject(err) : resolveResult())
    })
  })

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

  isStarting = true

  try {
    if (hasRunningStudioProcess() && currentPort === port && isServerReady) {
      return { success: true, port, url: `http://localhost:${port}` }
    }
    if (studioProcess) await stopRemotionStudio()
    currentPort = port
    await checkPortAvailable(port)

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
      .join(delimiter)

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
      const rawErr = d.toString()
      const cleanErr = rawErr.replace(/\x1b\[[0-9;]*m/g, '').trim()
      console.error(`[Remotion Studio Error]: ${cleanErr}`)
      const win = BrowserWindow.getAllWindows()[0]
      if (
        cleanErr &&
        (cleanErr.includes('Error:') ||
          cleanErr.includes('Exception') ||
          cleanErr.includes('Failed to compile') ||
          cleanErr.includes('inputRange') ||
          cleanErr.includes('TypeError') ||
          cleanErr.includes('RangeError') ||
          cleanErr.includes('ReferenceError') ||
          cleanErr.includes('SyntaxError'))
      ) {
        win?.webContents.send('studio:error', cleanErr)
      }
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
 * Stop the Remotion Studio child process owned by this application
 */
export async function stopRemotionStudio(): Promise<{ success: boolean }> {
  if (!studioProcess && !isServerReady) {
    return { success: true }
  }

  try {
    if (hasRunningStudioProcess()) {
      studioProcess?.kill('SIGTERM')
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
 * Clean up the owned Studio child process synchronously on app quit
 */
export function cleanupStudioOnQuit(): void {
  try {
    if (hasRunningStudioProcess()) {
      studioProcess?.kill(process.platform === 'win32' ? 'SIGTERM' : 'SIGKILL')
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
  newCode: string,
  beforeWrite?: () => void,
  alreadyValidated = false
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  let checkingWrite = false
  try {
    const targetPath = getVibeGraphicPath()

    // Quality Generate validates this exact candidate. Do not run heuristic sanitizers
    // again after validation: they can change template assignments into invalid TSX.
    if (alreadyValidated) {
      checkingWrite = true
      beforeWrite?.()
      checkingWrite = false
      await fsPromises.writeFile(targetPath, newCode, 'utf-8')
      return { success: true, filePath: targetPath }
    }

    let code = newCode.trim()
    // Robust regex strip for markdown code fences (e.g. ```tsx ... ```)
    const fenceMatch = code.match(/```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)```/i)
    if (fenceMatch && fenceMatch[1]) {
      code = fenceMatch[1].trim()
    } else {
      code = code.replace(/^```(?:tsx|typescript|jsx|javascript)?\s*/i, '')
      code = code.replace(/\s*```+\s*$/i, '')
      code = code.trim()
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

    // Auto-Sanitizer Easing Halusinasi (v1.0.7):
    code = code.replace(/Easing\.backIn\((.*?)\)/g, 'Easing.in(Easing.back($1))')
    code = code.replace(/Easing\.backOut\((.*?)\)/g, 'Easing.out(Easing.back($1))')
    code = code.replace(/Easing\.backInOut\((.*?)\)/g, 'Easing.inOut(Easing.back($1))')

    // Pre-fix Remotion code for props, hook, and fallback safety
    code = preFixRemotionCode(code)

    // Sanitize interpolate input and output ranges to prevent Remotion crash
    code = sanitizeInterpolateCode(code)

    // The optional Generate guard may reject before touching the active animation.
    checkingWrite = true
    beforeWrite?.()
    checkingWrite = false
    await fsPromises.writeFile(targetPath, code, 'utf-8')
    console.log(`[RemotionStudio] Successfully wrote code to ${targetPath}`)
    return { success: true, filePath: targetPath }
  } catch (err) {
    if (checkingWrite) throw err
    console.error('[RemotionStudio] writeComponentCode failed:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}

/** Validate the final sanitized external candidate before either Apply endpoint writes. */
export async function writeExternalComponentCode(
  rawCode: string
): Promise<{ success: boolean; code?: string; filePath?: string; error?: string }> {
  try {
    const code = cleanGeneratedCode(rawCode)
    // Load lazily: Gemini orchestration and the existing writer already reference each other.
    const { validateExternalCode } = await import('./geminiService')
    const validation = validateExternalCode(code)
    if (!validation.valid) return { success: false, error: validation.error }
    const result = await writeComponentCode(code, undefined, true)
    return result.success ? { ...result, code } : result
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal memeriksa kode TSX. File fisik tidak diubah.' }
  }
}

/**
 * Get current server status
 */
export async function getStudioServerStatus(): Promise<StudioStatus> {
  const isRunning = hasRunningStudioProcess() && (isServerReady || await probeServer(currentPort))
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
    return await writeExternalComponentCode(code)
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
