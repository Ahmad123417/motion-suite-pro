import { existsSync, mkdirSync, writeFileSync, unlinkSync, readdirSync, readFileSync } from 'fs'
import { join, extname } from 'path'
import { ipcMain } from 'electron'
import { getRemotionEnvDir } from './renderService'

export interface SaveAssetResult {
  success: boolean
  relativePath?: string
  fileName?: string
  error?: string
}

export type AssetPayload =
  | { name: string; buffer: ArrayBuffer | Buffer }
  | string

/**
 * Get or create the public/assets directory within remotion_env
 */
export function getPublicAssetsDir(): string {
  const envDir = getRemotionEnvDir()
  const publicAssetsDir = join(envDir, 'public', 'assets')
  if (!existsSync(publicAssetsDir)) {
    mkdirSync(publicAssetsDir, { recursive: true })
  }
  return publicAssetsDir
}

/**
 * Update assetPath in remotion_env/src/video_config.json
 */
export function updateVideoConfigAsset(assetPath: string | null): void {
  try {
    const envDir = getRemotionEnvDir()
    const configPath = join(envDir, 'src', 'video_config.json')
    let currentConfig: Record<string, any> = {
      width: 1920,
      height: 1080,
      fps: 30,
      durationInFrames: 150
    }

    if (existsSync(configPath)) {
      try {
        const raw = readFileSync(configPath, 'utf-8')
        currentConfig = JSON.parse(raw)
      } catch (readErr) {
        console.warn('[AssetService] Could not parse existing video_config.json, creating new:', readErr)
      }
    } else {
      const srcDir = join(envDir, 'src')
      if (!existsSync(srcDir)) {
        mkdirSync(srcDir, { recursive: true })
      }
    }

    currentConfig.assetPath = assetPath
    writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf-8')
    console.log('[AssetService] Updated video_config.json with assetPath:', assetPath)
  } catch (err) {
    console.error('[AssetService] Failed to update video_config.json assetPath:', err)
  }
}

/**
 * Remove any existing overlay-logo.* files from remotion_env/public/assets
 */
export function clearExistingOverlayFiles(): void {
  try {
    const assetsDir = getPublicAssetsDir()
    if (!existsSync(assetsDir)) return

    const files = readdirSync(assetsDir)
    for (const file of files) {
      if (file.toLowerCase().startsWith('overlay-logo')) {
        try {
          unlinkSync(join(assetsDir, file))
          console.log('[AssetService] Removed old overlay asset:', file)
        } catch (unlinkErr) {
          console.warn('[AssetService] Error removing file:', file, unlinkErr)
        }
      }
    }
  } catch (err) {
    console.error('[AssetService] Error clearing existing overlay files:', err)
  }
}

/**
 * Save an uploaded local asset to remotion_env/public/assets/overlay-logo.[ext]
 */
export async function saveLocalAsset(payload: AssetPayload): Promise<SaveAssetResult> {
  try {
    const assetsDir = getPublicAssetsDir()
    let ext = '.png'
    let fileBuffer: Buffer

    if (typeof payload === 'string') {
      if (payload.startsWith('data:')) {
        // Base64 Data URL format: data:image/png;base64,...
        const match = payload.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/)
        if (!match) {
          return { success: false, error: 'Format data URL tidak valid.' }
        }
        const mime = match[1].toLowerCase()
        const base64Data = match[2]
        if (mime.includes('svg')) {
          ext = '.svg'
        } else if (mime.includes('webp')) {
          ext = '.webp'
        } else if (mime.includes('jpeg') || mime.includes('jpg')) {
          ext = '.jpg'
        } else {
          ext = '.png'
        }
        fileBuffer = Buffer.from(base64Data, 'base64')
      } else if (existsSync(payload)) {
        // Absolute file path
        ext = extname(payload).toLowerCase() || '.png'
        fileBuffer = readFileSync(payload)
      } else {
        return { success: false, error: 'String payload bukan data URL valid atau file path tidak ditemukan.' }
      }
    } else if (payload && payload.name && payload.buffer) {
      ext = extname(payload.name).toLowerCase() || '.png'
      fileBuffer = Buffer.isBuffer(payload.buffer) ? payload.buffer : Buffer.from(payload.buffer)
    } else {
      return { success: false, error: 'Payload aset tidak valid.' }
    }

    // Normalize extension
    if (ext === '.jpeg') ext = '.jpg'

    // Clean up old overlay files to prevent collisions
    clearExistingOverlayFiles()

    const targetFileName = `overlay-logo${ext}`
    const targetFilePath = join(assetsDir, targetFileName)
    writeFileSync(targetFilePath, fileBuffer)
    console.log('[AssetService] Saved asset to:', targetFilePath)

    const relativePath = `assets/${targetFileName}`
    // Synchronize video_config.json
    updateVideoConfigAsset(relativePath)

    return {
      success: true,
      relativePath,
      fileName: targetFileName
    }
  } catch (err) {
    console.error('[AssetService] Error saving local asset:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}

/**
 * Remove local asset from remotion_env/public/assets
 */
export async function removeLocalAsset(): Promise<boolean> {
  try {
    clearExistingOverlayFiles()
    updateVideoConfigAsset(null)
    return true
  } catch (err) {
    console.error('[AssetService] Error removing local asset:', err)
    return false
  }
}

/**
 * Register IPC handlers for local asset management
 */
export function registerAssetIPC(): void {
  ipcMain.handle('asset:save-local', async (_event, payload: AssetPayload) => {
    return await saveLocalAsset(payload)
  })

  ipcMain.handle('asset:remove-local', async () => {
    return await removeLocalAsset()
  })
}
