import { createHash, createVerify } from 'crypto'
import { app, ipcMain } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import os from 'os'
import { PUBLIC_KEY } from './publicKey'
import { checkClockDesync, syncInternetTime } from './timeSyncService'

export const LEGACY_LIFETIME_WHITELIST: string[] = [
  'E4EA24567D9CA65D', // Current Developer Machine
  '9F8A2B1C4D3E5F6A', // Official Tester / Pipeline Keygen Machine 1
  'A1B2C3D4E5F6A7B8', // Official Tester Machine 2
  '78293571F50AE776'  // Official Tester Machine 3
]

export const LEGACY_MONTHLY_MAP: Record<string, string> = {
  'EA6C4E597E4E00F9': '2026-10-18T23:59:59.000Z'
}

export interface LicensePayload {
  machineId: string
  plan: string
  expiryDate?: string | null
  expiresAt?: string | null
  issuedAt: string
}

export interface LicenseData {
  licenseKey: string
  machineId: string
  plan: string
  expiryDate?: string | null
  expiresAt?: string | null
  isValid: boolean
  activatedAt?: string
  b64Payload?: string
  b64Signature?: string
  isLegacy?: boolean
}

export interface LicenseStatusResult {
  isValid: boolean
  isLicensed: boolean
  machineId: string
  plan?: string
  licenseKey?: string
  expiryDate?: string | null
  expiresAt?: string | null
  activatedAt?: string
  isClockDesynced?: boolean
  statusCode?: 'VALID' | 'EXPIRED' | 'CLOCK_DESYNC' | 'UNLICENSED' | 'TAMPERED'
  statusMessage?: string
}

let cachedMachineId: string | null = null

/**
 * Generate a unique 16-character hardware machine identifier based on system specs
 */
export function getHardwareMachineId(): string {
  if (cachedMachineId) return cachedMachineId

  try {
    const raw = os.hostname() + os.userInfo().username + (os.cpus()[0]?.model || 'generic')
    cachedMachineId = createHash('sha256').update(raw).digest('hex').slice(0, 16).toUpperCase()
    return cachedMachineId
  } catch (err) {
    console.warn('[LicenseService] Could not create machineId:', err)
    cachedMachineId = 'MS-DEFAULT-PCID'
    return cachedMachineId
  }
}

/**
 * Path to license.json in user AppData
 */
export function getLicenseFilePath(): string {
  return join(app.getPath('userData'), 'license.json')
}

/**
 * Verify RSA-SHA256 signature against base64 payload
 */
export function verifyLicenseSignature(b64Payload: string, b64Signature: string): boolean {
  try {
    const verifier = createVerify('SHA256')
    verifier.update(b64Payload)
    verifier.end()
    return verifier.verify(PUBLIC_KEY, b64Signature, 'base64')
  } catch (err) {
    console.error('[LicenseService] Signature verification error:', err)
    return false
  }
}

/**
 * Verify RSA-SHA256 raw signature against a string (e.g. machineId for legacy keys)
 */
export function verifyRawSignature(data: string, b64Signature: string): boolean {
  try {
    const verifier = createVerify('SHA256')
    verifier.update(data)
    verifier.end()
    return verifier.verify(PUBLIC_KEY, b64Signature, 'base64')
  } catch (err) {
    console.error('[LicenseService] Raw signature verification error:', err)
    return false
  }
}

/**
 * Read and verify license status from disk (tamper-resistant)
 */
export function getLicenseStatus(): LicenseStatusResult {
  const currentMachineId = getHardwareMachineId()
  const licensePath = getLicenseFilePath()

  // 1. Clock Anti-Rollback Check
  const clockStatus = checkClockDesync(currentMachineId)
  if (clockStatus.isClockDesynced) {
    return {
      isValid: false,
      isLicensed: false,
      machineId: currentMachineId,
      isClockDesynced: true,
      statusCode: 'CLOCK_DESYNC',
      statusMessage:
        clockStatus.message ||
        'Terdeteksi pemunduran jam sistem lokal (Clock Rollback). Sinkronkan jam Anda dengan internet untuk membuka kembali akses.'
    }
  }

  if (!existsSync(licensePath)) {
    return {
      isValid: false,
      isLicensed: false,
      machineId: currentMachineId,
      plan: undefined,
      expiryDate: null,
      expiresAt: null,
      licenseKey: '',
      isClockDesynced: false,
      statusCode: 'UNLICENSED',
      statusMessage: 'Aplikasi belum diaktivasi.'
    }
  }

  try {
    const raw = readFileSync(licensePath, 'utf-8')
    const data: LicenseData = JSON.parse(raw)

    // Check Legacy License Format
    if (data.isLegacy) {
      const isLegacySigValid = verifyRawSignature(currentMachineId, data.licenseKey)
      if (!isLegacySigValid) {
        return {
          isValid: false,
          isLicensed: false,
          machineId: currentMachineId,
          plan: undefined,
          expiryDate: null,
          expiresAt: null,
          licenseKey: '',
          isClockDesynced: false,
          statusCode: 'TAMPERED',
          statusMessage: 'Tanda tangan kunci legacy tidak valid.'
        }
      }

      if (LEGACY_LIFETIME_WHITELIST.includes(currentMachineId)) {
        return {
          isValid: true,
          isLicensed: true,
          machineId: currentMachineId,
          plan: 'lifetime',
          expiryDate: null,
          expiresAt: null,
          licenseKey: data.licenseKey,
          activatedAt: data.activatedAt,
          isClockDesynced: false,
          statusCode: 'VALID',
          statusMessage: 'Lisensi Lifetime Legacy Aktif Permanen.'
        }
      } else if (LEGACY_MONTHLY_MAP[currentMachineId]) {
        const exp = LEGACY_MONTHLY_MAP[currentMachineId]
        const expiryTime = new Date(exp).getTime()
        if (Date.now() > expiryTime) {
          return {
            isValid: false,
            isLicensed: false,
            machineId: currentMachineId,
            plan: 'monthly',
            expiryDate: exp,
            expiresAt: exp,
            licenseKey: data.licenseKey,
            activatedAt: data.activatedAt,
            isClockDesynced: false,
            statusCode: 'EXPIRED',
            statusMessage: `Lisensi Bulanan Legacy telah kadaluarsa pada ${new Date(expiryTime).toLocaleDateString('id-ID')}.`
          }
        }
        return {
          isValid: true,
          isLicensed: true,
          machineId: currentMachineId,
          plan: 'monthly',
          expiryDate: exp,
          expiresAt: exp,
          licenseKey: data.licenseKey,
          activatedAt: data.activatedAt,
          isClockDesynced: false,
          statusCode: 'VALID',
          statusMessage: 'Lisensi Bulanan Legacy Aktif.'
        }
      } else {
        return {
          isValid: false,
          isLicensed: false,
          machineId: currentMachineId,
          plan: undefined,
          expiryDate: null,
          expiresAt: null,
          licenseKey: '',
          isClockDesynced: false,
          statusCode: 'UNLICENSED',
          statusMessage: 'Perangkat tidak terdaftar dalam whitelist legacy resmi.'
        }
      }
    }

    // Verify stored digital signature for standard (new) format
    if (data.b64Payload && data.b64Signature) {
      const isSignatureValid = verifyLicenseSignature(data.b64Payload, data.b64Signature)
      if (!isSignatureValid) {
        console.warn('[LicenseService] Modifikasi terdeteksi pada license.json! Tanda tangan tidak valid.')
        return {
          isValid: false,
          isLicensed: false,
          machineId: currentMachineId,
          plan: undefined,
          expiryDate: null,
          expiresAt: null,
          licenseKey: '',
          isClockDesynced: false,
          statusCode: 'TAMPERED',
          statusMessage: 'Tanda tangan digital pada file lisensi tidak valid.'
        }
      }

      // Re-parse payload to ensure values weren't altered
      let parsedPayload: LicensePayload
      try {
        parsedPayload = JSON.parse(Buffer.from(data.b64Payload, 'base64').toString('utf-8'))
      } catch {
        return {
          isValid: false,
          isLicensed: false,
          machineId: currentMachineId,
          plan: undefined,
          expiryDate: null,
          expiresAt: null,
          licenseKey: '',
          isClockDesynced: false,
          statusCode: 'TAMPERED',
          statusMessage: 'Payload lisensi rusak.'
        }
      }

      const payloadExpiry = parsedPayload.expiresAt || parsedPayload.expiryDate || null
      const dataExpiry = data.expiresAt || data.expiryDate || null

      if (
        parsedPayload.machineId.toUpperCase() !== currentMachineId.toUpperCase() ||
        parsedPayload.plan !== data.plan ||
        payloadExpiry !== dataExpiry
      ) {
        console.warn('[LicenseService] Isi license.json tidak cocok dengan payload kriptografi!')
        return {
          isValid: false,
          isLicensed: false,
          machineId: currentMachineId,
          plan: undefined,
          expiryDate: null,
          expiresAt: null,
          licenseKey: '',
          isClockDesynced: false,
          statusCode: 'TAMPERED',
          statusMessage: 'Ketidakcocokan integritas data lisensi.'
        }
      }
    } else {
      // Unsigned license file
      return {
        isValid: false,
        isLicensed: false,
        machineId: currentMachineId,
        plan: undefined,
        expiryDate: null,
        expiresAt: null,
        licenseKey: '',
        isClockDesynced: false,
        statusCode: 'TAMPERED',
        statusMessage: 'Format file lisensi tidak memiliki tanda tangan digital.'
      }
    }

    // Verify machineId matches current machine (prevents license sharing across PCs)
    if (data.machineId.toUpperCase() !== currentMachineId.toUpperCase()) {
      return {
        isValid: false,
        isLicensed: false,
        machineId: currentMachineId,
        plan: data.plan,
        expiryDate: data.expiryDate,
        expiresAt: data.expiresAt || data.expiryDate,
        licenseKey: data.licenseKey,
        isClockDesynced: false,
        statusCode: 'UNLICENSED',
        statusMessage: 'Kunci lisensi ini terikat untuk perangkat keras lain.'
      }
    }

    // Expiry check (handles expiresAt and legacy expiryDate)
    const effectiveExpiry = data.expiresAt || data.expiryDate
    if (effectiveExpiry) {
      const now = Date.now()
      const expiry = new Date(effectiveExpiry).getTime()
      if (isNaN(expiry) || now > expiry) {
        return {
          isValid: false,
          isLicensed: false,
          machineId: currentMachineId,
          plan: data.plan,
          expiryDate: data.expiryDate,
          expiresAt: effectiveExpiry,
          licenseKey: data.licenseKey,
          activatedAt: data.activatedAt,
          isClockDesynced: false,
          statusCode: 'EXPIRED',
          statusMessage: `Masa aktif lisensi Anda telah berakhir pada ${new Date(expiry).toLocaleDateString('id-ID')}. Perpanjang lisensi Anda untuk melanjutkan.`
        }
      }
    }

    const isValid = Boolean(data.isValid)
    return {
      isValid,
      isLicensed: isValid,
      machineId: currentMachineId,
      plan: data.plan,
      expiryDate: data.expiryDate,
      expiresAt: effectiveExpiry || null,
      licenseKey: data.licenseKey,
      activatedAt: data.activatedAt,
      isClockDesynced: false,
      statusCode: isValid ? 'VALID' : 'UNLICENSED',
      statusMessage: isValid ? 'Lisensi Resmi Aktif.' : 'Lisensi tidak aktif.'
    }
  } catch (err) {
    console.warn('[LicenseService] Failed to read license.json:', err)
    return {
      isValid: false,
      isLicensed: false,
      machineId: currentMachineId,
      plan: undefined,
      expiryDate: null,
      expiresAt: null,
      licenseKey: '',
      isClockDesynced: false,
      statusCode: 'UNLICENSED',
      statusMessage: 'Gagal memuat status lisensi.'
    }
  }
}

/**
 * Validate and save an RSA-signed license key to license.json
 */
export async function validateLicense(key: string): Promise<{
  success: boolean
  message: string
  data?: LicenseData
}> {
  const cleanedKey = (key || '').trim().replace(/\r?\n|\r/g, '')
  const currentMachineId = getHardwareMachineId()

  if (!cleanedKey) {
    return {
      success: false,
      message: 'Kunci lisensi tidak boleh kosong.'
    }
  }

  // 1. Check Clock Desync first before validation
  const clockStatus = checkClockDesync(currentMachineId)
  if (clockStatus.isClockDesynced) {
    return {
      success: false,
      message: 'Gagal aktivasi: Jam sistem terdeteksi dimundurkan. Sinkronkan waktu internet terlebih dahulu.'
    }
  }

  // 2. Format Detection: New Format with dot vs Legacy Format without dot
  const hasDot = cleanedKey.includes('.')

  if (!hasDot) {
    // Legacy Key Format without dot: Verify signature against machineId
    const isLegacySigValid = verifyRawSignature(currentMachineId, cleanedKey)
    if (!isLegacySigValid) {
      return {
        success: false,
        message: 'Kunci lisensi legacy tidak valid atau tanda tangan digital salah.'
      }
    }

    if (LEGACY_LIFETIME_WHITELIST.includes(currentMachineId)) {
      const legacyLicense: LicenseData = {
        licenseKey: cleanedKey,
        machineId: currentMachineId,
        plan: 'lifetime',
        expiryDate: null,
        expiresAt: null,
        isValid: true,
        activatedAt: new Date().toISOString(),
        isLegacy: true
      }

      try {
        writeFileSync(getLicenseFilePath(), JSON.stringify(legacyLicense, null, 2), 'utf-8')
      } catch (err) {
        return { success: false, message: 'Gagal menyimpan lisensi legacy ke sistem lokal.' }
      }

      return {
        success: true,
        message: 'Aktivasi Berhasil! Lisensi Lifetime Legacy resmi aktif permanen.',
        data: legacyLicense
      }
    } else if (LEGACY_MONTHLY_MAP[currentMachineId]) {
      const fixedExpiry = LEGACY_MONTHLY_MAP[currentMachineId]
      const expiryTime = new Date(fixedExpiry).getTime()
      if (Date.now() > expiryTime) {
        return {
          success: false,
          message: `Lisensi Bulanan Legacy telah berakhir pada ${new Date(fixedExpiry).toLocaleDateString('id-ID')}.`
        }
      }

      const legacyLicense: LicenseData = {
        licenseKey: cleanedKey,
        machineId: currentMachineId,
        plan: 'monthly',
        expiryDate: fixedExpiry,
        expiresAt: fixedExpiry,
        isValid: true,
        activatedAt: new Date().toISOString(),
        isLegacy: true
      }

      try {
        writeFileSync(getLicenseFilePath(), JSON.stringify(legacyLicense, null, 2), 'utf-8')
      } catch (err) {
        return { success: false, message: 'Gagal menyimpan lisensi legacy ke sistem lokal.' }
      }

      return {
        success: true,
        message: `Aktivasi Berhasil! Lisensi Bulanan Legacy aktif hingga ${new Date(fixedExpiry).toLocaleDateString('id-ID')}.`,
        data: legacyLicense
      }
    } else {
      return {
        success: false,
        message: 'Perangkat ini tidak terdaftar dalam whitelist pengguna lama resmi.'
      }
    }
  }

  // 3. New Format: ${payloadBase64}.${signatureBase64}
  const parts = cleanedKey.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      success: false,
      message: 'Format kunci lisensi tidak valid. Pastikan Anda menyalin seluruh teks kunci lisensi digital.'
    }
  }

  const [b64Payload, b64Signature] = parts

  // Verify RSA-SHA256 digital signature
  const isSignatureValid = verifyLicenseSignature(b64Payload, b64Signature)
  if (!isSignatureValid) {
    return {
      success: false,
      message: 'Kunci lisensi digital tidak valid / palsu. Verifikasi tanda tangan kriptografi RSA-SHA256 gagal.'
    }
  }

  // Decode payload
  let payload: LicensePayload
  try {
    const jsonStr = Buffer.from(b64Payload, 'base64').toString('utf-8')
    payload = JSON.parse(jsonStr)
  } catch {
    return {
      success: false,
      message: 'Format data payload di dalam lisensi rusak.'
    }
  }

  // Validate Machine ID match
  if (!payload.machineId || payload.machineId.toUpperCase() !== currentMachineId.toUpperCase()) {
    return {
      success: false,
      message: `Lisensi ini terikat untuk perangkat lain (ID: ${payload.machineId}). Machine ID perangkat ini adalah: ${currentMachineId}`
    }
  }

  // Check expiration if present (handles expiresAt or legacy expiryDate)
  const effectiveExpiry = payload.expiresAt || payload.expiryDate || null
  if (effectiveExpiry) {
    const expiryTime = new Date(effectiveExpiry).getTime()
    if (isNaN(expiryTime) || Date.now() > expiryTime) {
      return {
        success: false,
        message: `Kunci lisensi ini telah kadaluarsa pada ${new Date(effectiveExpiry).toLocaleDateString('id-ID')}.`
      }
    }
  }

  const newLicense: LicenseData = {
    licenseKey: cleanedKey,
    machineId: currentMachineId,
    plan: payload.plan || 'lifetime',
    expiryDate: effectiveExpiry,
    expiresAt: effectiveExpiry,
    isValid: true,
    activatedAt: new Date().toISOString(),
    b64Payload,
    b64Signature,
    isLegacy: false
  }

  try {
    const licensePath = getLicenseFilePath()
    writeFileSync(licensePath, JSON.stringify(newLicense, null, 2), 'utf-8')
    console.log('[LicenseService] License successfully verified and saved to:', licensePath)
  } catch (err) {
    console.error('[LicenseService] Error saving license file:', err)
    return {
      success: false,
      message: 'Gagal menyimpan file lisensi ke sistem lokal.'
    }
  }

  const isLifetime = !effectiveExpiry || payload.plan === 'lifetime'
  return {
    success: true,
    message: isLifetime
      ? 'Aktivasi Berhasil! Lisensi Lifetime Access aktif selamanya.'
      : `Aktivasi Berhasil! Lisensi aktif hingga ${new Date(effectiveExpiry).toLocaleDateString('id-ID')}.`,
    data: newLicense
  }
}

/**
 * Register IPC handlers for licensing and time sync
 */
export function registerLicenseIPC(): void {
  ipcMain.handle('license:get-status', async () => {
    return getLicenseStatus()
  })

  ipcMain.handle('license:validate', async (_event, payload: string | { licenseKey: string }) => {
    const key = typeof payload === 'string' ? payload : payload?.licenseKey
    return await validateLicense(key)
  })

  ipcMain.handle('license:sync-time', async () => {
    const machineId = getHardwareMachineId()
    return await syncInternetTime(machineId)
  })
}
