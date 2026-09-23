import { ElectronAPI } from '@electron-toolkit/preload'

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
  customAssetUrl?: string
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

export interface CustomElectronAPI {
  renderVideo: (config: RenderVideoConfig) => Promise<RenderResult>
  selectDirectory: () => Promise<{ canceled: boolean; folderPath?: string }>
  openPath: (path: string) => Promise<{ success: boolean; error?: string }>
  openExportFolder: (folderPath?: string) => Promise<{ success: boolean; error?: string }>
  openFileLocation: (filePath: string) => Promise<{ success: boolean; error?: string }>
  applyManualCode: (code: string) => Promise<ApplyManualCodeResult>
  getCurrentMotionCode: () => Promise<string>
  getSystemPrompt: () => Promise<string>
  getAppVersion: () => Promise<string>
  generateMotionCode: (params: GenerateMotionCodeParams) => Promise<GenerateMotionCodeResult>
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
    offsetX?: number
    offsetY?: number
    textOffsetX?: number
    textOffsetY?: number
    glowIntensity?: number
    speedMultiplier?: number
  }) => Promise<{ success: boolean; outputPath?: string; canceled?: boolean; error?: string }>
  cancelRender: () => Promise<boolean>
  onRenderProgress: (callback: (data: { percent: number; statusText: string }) => void) => () => void
  onStudioError: (callback: (errorMsg: string) => void) => () => void
  startStudioServer: (port?: number) => Promise<{ success: boolean; port: number; url: string; error?: string }>
  stopStudioServer: () => Promise<{ success: boolean }>
  restartStudioServer: (port?: number) => Promise<{ success: boolean; port: number; url: string; error?: string }>
  writeCode: (code: string) => Promise<{ success: boolean; filePath?: string; error?: string }>
  getStudioStatus: () => Promise<{ isRunning: boolean; port: number; url: string; error?: string }>
  generateVideo: (payload: {
    prompt: string
    imageBase64?: string
    mimeType?: string
    apiKey: string
    assetPath?: string
  }) => Promise<{ success: boolean; code?: string; filePath?: string; error?: string }>
  refineVideo: (payload: {
    instruction: string
    apiKey: string
    currentCode?: string
    assetPath?: string
  }) => Promise<{ success: boolean; code?: string; filePath?: string; error?: string }>
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
  }) => Promise<{ success: boolean; code?: string; filePath?: string; error?: string }>
  readCurrentCode: () => Promise<string>
  saveLocalAsset: (
    file: { name: string; buffer: ArrayBuffer } | string
  ) => Promise<{ success: boolean; relativePath?: string; fileName?: string; error?: string }>
  removeLocalAsset: () => Promise<boolean>
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
    offsetX?: number
    offsetY?: number
    textOffsetX?: number
    textOffsetY?: number
    glowIntensity?: number
    speedMultiplier?: number
  }) => Promise<{ success: boolean; filePath?: string; error?: string }>
  selectOutputFolder: () => Promise<{ canceled: boolean; folderPath?: string }>
  getLicenseStatus: () => Promise<{
    isValid: boolean
    isLicensed?: boolean
    machineId: string
    plan?: string
    licenseKey?: string
    expiryDate?: string | null
    activatedAt?: string
  }>
  validateLicense: (
    key: string
  ) => Promise<{ success: boolean; message: string; data?: any }>
  restartAndInstall: () => void
  installAndRestart?: () => void
  startUpdateDownload?: () => Promise<{ success: boolean; error?: string }>
  startDownloadUpdate?: () => Promise<{ success: boolean; error?: string }>
  onUpdateAvailable: (callback: (info: { version: string; releaseNotes?: any; [key: string]: any }) => void) => () => void
  onUpdateDownloaded: (callback: (info?: { version: string }) => void) => () => void
  onUpdateProgress?: (callback: (data: { percent: number }) => void) => () => void
  onUpdateError?: (callback: (err: { message: string }) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: CustomElectronAPI
    api: CustomElectronAPI
  }
}
