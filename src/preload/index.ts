import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export interface RenderVideoConfig {
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
}

export interface RenderResult {
  success: boolean
  filePath?: string
  canceled?: boolean
  error?: string
}

export interface GenerateMotionCodeParams {
  prompt: string
  apiKey?: string
  forceFallback?: boolean
}

export interface FixMotionCodeParams {
  prompt: string
  error: string
  previousCode?: string
  apiKey?: string
}

export interface GenerateMotionCodeResult {
  success: boolean
  code?: string
  filePath?: string
  modelUsed?: string
  source?: 'ai' | 'fallback'
  error?: string
  notice?: string
}

export interface ApplyManualCodeResult {
  success: boolean
  code?: string
  filePath?: string
  error?: string
}

// Custom APIs for renderer
const customElectronAPI = {
  renderVideo: (config: RenderVideoConfig): Promise<RenderResult> => {
    return ipcRenderer.invoke('render-video', config)
  },
  selectDirectory: (): Promise<{ canceled: boolean; folderPath?: string }> => {
    return ipcRenderer.invoke('select-directory')
  },
  openPath: (path: string): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('open-export-folder', path)
  },
  openExportFolder: (folderPath?: string): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('open-export-folder', folderPath)
  },
  openFileLocation: (filePath: string): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('open-file-location', filePath)
  },
  applyManualCode: (code: string): Promise<ApplyManualCodeResult> => {
    return ipcRenderer.invoke('apply-manual-code', code)
  },
  getCurrentMotionCode: (): Promise<string> => {
    return ipcRenderer.invoke('get-current-motion-code')
  },
  getSystemPrompt: (): Promise<string> => {
    return ipcRenderer.invoke('get-system-prompt')
  },
  getAppVersion: (): Promise<string> => {
    return ipcRenderer.invoke('get-app-version')
  },
  generateMotionCode: (params: GenerateMotionCodeParams): Promise<GenerateMotionCodeResult> => {
    return ipcRenderer.invoke('generate-motion-code', params)
  },
  fixMotionCode: (params: FixMotionCodeParams): Promise<GenerateMotionCodeResult> => {
    return ipcRenderer.invoke('fix-motion-code', params)
  },
  startRender: (payload: {
    format: 'mp4' | 'mov' | 'prores422' | 'prores4444'
    isTransparent?: boolean
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
    textOffsetX?: number
    textOffsetY?: number
    glowIntensity?: number
    speedMultiplier?: number
  }): Promise<{ success: boolean; outputPath?: string; canceled?: boolean; error?: string }> => {
    return ipcRenderer.invoke('render:start', payload)
  },
  cancelRender: (): Promise<boolean> => {
    return ipcRenderer.invoke('render:cancel')
  },
  onRenderProgress: (callback: (data: { percent: number; statusText: string }) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { percent: number; statusText: string } | number): void => {
      if (typeof data === 'number') {
        callback({ percent: data, statusText: `Rendering frame (${data}%)...` })
      } else {
        callback(data)
      }
    }
    ipcRenderer.on('render:progress', handler)
    ipcRenderer.on('render-progress', handler)
    return (): void => {
      ipcRenderer.removeListener('render:progress', handler)
      ipcRenderer.removeListener('render-progress', handler)
    }
  },
  onStudioError: (callback: (errorMsg: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, err: string): void => {
      callback(err)
    }
    ipcRenderer.on('studio:error', handler)
    return (): void => {
      ipcRenderer.removeListener('studio:error', handler)
    }
  },
  startStudioServer: (port?: number): Promise<{ success: boolean; port: number; url: string; error?: string }> => {
    return ipcRenderer.invoke('remotion:start-server', port)
  },
  stopStudioServer: (): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('remotion:stop-server')
  },
  restartStudioServer: (port?: number): Promise<{ success: boolean; port: number; url: string; error?: string }> => {
    return ipcRenderer.invoke('remotion:restart-server', port)
  },
  writeCode: (code: string): Promise<{ success: boolean; filePath?: string; error?: string }> => {
    return ipcRenderer.invoke('remotion:write-code', code)
  },
  getStudioStatus: (): Promise<{ isRunning: boolean; port: number; url: string; error?: string }> => {
    return ipcRenderer.invoke('remotion:get-status')
  },
  generateVideo: (payload: {
    prompt: string
    imageBase64?: string
    mimeType?: string
    apiKey: string
    assetPath?: string
  }): Promise<{ success: boolean; code?: string; filePath?: string; error?: string }> => {
    return ipcRenderer.invoke('ai:generate-video', payload)
  },
  refineVideo: (payload: {
    instruction: string
    apiKey: string
    currentCode?: string
    assetPath?: string
  }): Promise<{ success: boolean; code?: string; filePath?: string; error?: string }> => {
    return ipcRenderer.invoke('ai:refine-video', payload)
  },
  autoFixVideo: (payload: {
    errorMessage?: string
    apiKey: string
    currentCode?: string
    mode?: 'runtime_error' | 'visual_recovery'
    width?: number
    height?: number
    fps?: number
    durationInFrames?: number
    aspectRatio?: string
  }): Promise<{ success: boolean; code?: string; filePath?: string; error?: string }> => {
    return ipcRenderer.invoke('ai:auto-fix-video', payload)
  },
  readCurrentCode: (): Promise<string> => {
    return ipcRenderer.invoke('ai:read-code')
  },
  saveLocalAsset: (
    file: { name: string; buffer: ArrayBuffer } | string
  ): Promise<{ success: boolean; relativePath?: string; fileName?: string; error?: string }> => {
    return ipcRenderer.invoke('asset:save-local', file)
  },
  removeLocalAsset: (): Promise<boolean> => {
    return ipcRenderer.invoke('asset:remove-local')
  },
  updateVideoConfig: (config: {
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
    textOffsetX?: number
    textOffsetY?: number
    glowIntensity?: number
    speedMultiplier?: number
  }): Promise<{ success: boolean; filePath?: string; error?: string }> => {
    return ipcRenderer.invoke('video:update-config', config)
  },
  selectOutputFolder: (): Promise<{ canceled: boolean; folderPath?: string }> => {
    return ipcRenderer.invoke('dialog:select-output-folder')
  },
  getLicenseStatus: (): Promise<{
    isValid: boolean
    isLicensed?: boolean
    machineId: string
    plan?: string
    licenseKey?: string
    expiryDate?: string | null
    activatedAt?: string
  }> => {
    return ipcRenderer.invoke('license:get-status')
  },
  validateLicense: (
    key: string
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    return ipcRenderer.invoke('license:validate', key)
  },

  // ── Auto-Updater IPC ──────────────────────────────────────────────────────
  startUpdateDownload: (): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('updater:start-download')
  },
  startDownloadUpdate: (): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('start-download-update')
  },
  restartAndInstall: (): void => {
    ipcRenderer.invoke('restart-app-for-update')
  },
  installAndRestart: (): void => {
    ipcRenderer.invoke('restart-app-for-update')
  },
  onUpdateAvailable: (
    callback: (info: { version: string; releaseNotes?: any; [key: string]: any }) => void
  ): (() => void) => {
    const handler = (_e: Electron.IpcRendererEvent, info: any): void =>
      callback(info)
    ipcRenderer.on('update-available', handler)
    return () => {
      ipcRenderer.removeListener('update-available', handler)
    }
  },
  onUpdateProgress: (
    callback: (data: { percent: number }) => void
  ): (() => void) => {
    const handler = (_e: Electron.IpcRendererEvent, data: { percent: number }): void => callback(data)
    ipcRenderer.on('update:progress', handler)
    ipcRenderer.on('download-progress', handler)
    return () => {
      ipcRenderer.removeListener('update:progress', handler)
      ipcRenderer.removeListener('download-progress', handler)
    }
  },
  onUpdateDownloaded: (callback: (info?: { version: string }) => void): (() => void) => {
    const handler = (_e: Electron.IpcRendererEvent, info?: { version: string }): void => callback(info)
    ipcRenderer.on('update-downloaded', handler)
    return () => {
      ipcRenderer.removeListener('update-downloaded', handler)
    }
  },
  onUpdateError: (callback: (err: { message: string }) => void): (() => void) => {
    const handler = (_e: Electron.IpcRendererEvent, err: { message: string }): void => callback(err)
    ipcRenderer.on('update:error', handler)
    return () => ipcRenderer.removeListener('update:error', handler)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronAPI', customElectronAPI)
    contextBridge.exposeInMainWorld('api', customElectronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.electronAPI = customElectronAPI
  // @ts-ignore (define in dts)
  window.api = customElectronAPI
}
