import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import https from 'https'

const CLOCK_SALT = 'MOTION_CLOCK_GUARD_SALT_2026_SECURE'
const TOLERANCE_MS = 180000 // 3 minutes backward tolerance

export interface ClockSyncData {
  lastRecordedTime: number
  updatedAt: string
}

export interface ClockStatus {
  isClockDesynced: boolean
  lastRecordedTime: number
  currentTime: number
  message?: string
}

/**
 * Path to clock_sync.dat inside Electron's userData folder
 */
export function getClockSyncFilePath(): string {
  return join(app.getPath('userData'), 'clock_sync.dat')
}

/**
 * Derive a 32-byte AES-256 key from machineId and secret salt
 */
function deriveKey(machineId: string): Buffer {
  return createHash('sha256').update(machineId + CLOCK_SALT).digest()
}

/**
 * Save encrypted timestamp to disk using AES-256-CBC
 */
export function recordLocalTime(machineId: string, timestamp: number = Date.now()): void {
  try {
    const key = deriveKey(machineId)
    const iv = randomBytes(16)
    const cipher = createCipheriv('aes-256-cbc', key, iv)

    const payload: ClockSyncData = {
      lastRecordedTime: timestamp,
      updatedAt: new Date(timestamp).toISOString()
    }

    const payloadBuf = Buffer.from(JSON.stringify(payload), 'utf-8')
    const encrypted = Buffer.concat([cipher.update(payloadBuf), cipher.final()])
    const fileContent = Buffer.concat([iv, encrypted])

    writeFileSync(getClockSyncFilePath(), fileContent)
  } catch (err) {
    console.error('[TimeSyncService] Failed to record encrypted local time:', err)
  }
}

/**
 * Read and decrypt timestamp from clock_sync.dat
 */
export function readRecordedTime(machineId: string): ClockSyncData | null {
  const filePath = getClockSyncFilePath()
  if (!existsSync(filePath)) {
    return null
  }

  try {
    const fileContent = readFileSync(filePath)
    if (fileContent.length <= 16) {
      return null
    }

    const iv = fileContent.subarray(0, 16)
    const encryptedData = fileContent.subarray(16)

    const key = deriveKey(machineId)
    const decipher = createDecipheriv('aes-256-cbc', key, iv)
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])

    const parsed: ClockSyncData = JSON.parse(decrypted.toString('utf-8'))
    return parsed
  } catch (err) {
    console.warn('[TimeSyncService] Could not decrypt or parse clock_sync.dat:', err)
    return null
  }
}

/**
 * Check if the system clock has been rolled backwards beyond tolerance
 */
export function checkClockDesync(machineId: string): ClockStatus {
  const now = Date.now()
  const recorded = readRecordedTime(machineId)

  // First-Run Guard: If clock_sync.dat does not exist yet (fresh install), initialize with current time
  if (!recorded) {
    recordLocalTime(machineId, now)
    return {
      isClockDesynced: false,
      lastRecordedTime: now,
      currentTime: now
    }
  }

  const { lastRecordedTime } = recorded

  // If clock moved backwards by more than 3 minutes (180,000 ms)
  if (now < lastRecordedTime - TOLERANCE_MS) {
    const diffMinutes = Math.round((lastRecordedTime - now) / 60000)
    return {
      isClockDesynced: true,
      lastRecordedTime,
      currentTime: now,
      message: `Jam sistem terdeteksi dimundurkan sekitar ${diffMinutes} menit. Harap sinkronkan jam Anda dengan internet.`
    }
  }

  // Clock is advancing normally or within acceptable tolerance; advance timestamp if forward
  if (now > lastRecordedTime) {
    recordLocalTime(machineId, now)
  }

  return {
    isClockDesynced: false,
    lastRecordedTime: Math.max(now, lastRecordedTime),
    currentTime: now
  }
}

/**
 * Fetch online date via HTTP HEAD from a public time endpoint with 3000ms timeout
 */
function fetchHttpHeadDate(url: string, timeoutMs: number = 3000): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const req = https.request(
        url,
        {
          method: 'HEAD',
          timeout: timeoutMs,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MotionSuitePro/1.0.5'
          }
        },
        (res) => {
          const dateHeader = res.headers['date']
          if (dateHeader) {
            const parsed = new Date(dateHeader).getTime()
            if (!isNaN(parsed) && parsed > 0) {
              resolve(parsed)
              return
            }
          }
          resolve(null)
        }
      )

      req.on('timeout', () => {
        req.destroy()
        resolve(null)
      })

      req.on('error', () => {
        resolve(null)
      })

      req.end()
    } catch {
      resolve(null)
    }
  })
}

/**
 * Perform online time synchronization against Google or Cloudflare
 * Restores clock state if network time is valid and forwards local recorded stamp.
 */
export async function syncInternetTime(
  machineId: string
): Promise<{ success: boolean; message: string; networkTime?: number }> {
  // Try https://www.google.com first, then fallback to https://1.1.1.1
  let networkTime = await fetchHttpHeadDate('https://www.google.com', 3000)
  if (!networkTime) {
    networkTime = await fetchHttpHeadDate('https://1.1.1.1', 3000)
  }

  if (!networkTime) {
    return {
      success: false,
      message: 'Gagal terhubung ke server waktu (Google/Cloudflare). Periksa koneksi internet Anda.'
    }
  }

  const recorded = readRecordedTime(machineId)
  const lastRecordedTime = recorded ? recorded.lastRecordedTime : 0

  // If network time is valid and >= last recorded time minus tolerance
  if (networkTime >= lastRecordedTime - TOLERANCE_MS) {
    // Synchronized successfully! Update local timestamp to network time
    recordLocalTime(machineId, networkTime)
    return {
      success: true,
      message: 'Sinkronisasi waktu via internet berhasil. Akses fitur dipulihkan.',
      networkTime
    }
  } else {
    return {
      success: false,
      message: 'Waktu server internet masih lebih lampau dari stempel waktu tersimpan terakhir.',
      networkTime
    }
  }
}
