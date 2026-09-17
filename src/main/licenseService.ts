import { createHash, createVerify } from 'crypto'
import { app, ipcMain } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import os from 'os'
import { PUBLIC_KEY } from './publicKey'

export interface LicensePayload {
  machineId: string
  plan: 'monthly' | 'lifetime'
  expiryDate: string | null
  issuedAt: string
}

export interface LicenseData {
  licenseKey: string
  machineId: string
  plan: 'monthly' | 'lifetime'
  expiryDate: string | null
  isValid: boolean
  activatedAt?: string
  b64Payload?: string
  b64Signature?: string
}

export interface LicenseStatusResult {
  isValid: boolean
  isLicensed: boolean
  machineId: string
  plan?: string
  licenseKey?: string
  expiryDate?: string | null
  activatedAt?: string
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
 * Read and verify license status from disk (tamper-resistant)
 */
export function getLicenseStatus(): LicenseStatusResult {
  const currentMachineId = getHardwareMachineId()
  const licensePath = getLicenseFilePath()

  if (!existsSync(licensePath)) {
    return {
      isValid: false,
      isLicensed: false,
      machineId: currentMachineId,
      plan: undefined,
      expiryDate: null,
      licenseKey: ''
    }
  }

  try {
    const raw = readFileSync(licensePath, 'utf-8')
    const data: LicenseData = JSON.parse(raw)

    // Verify stored digital signature to prevent manual disk tampering with license.json
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
          licenseKey: ''
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
          licenseKey: ''
        }
      }

      if (
        parsedPayload.machineId.toUpperCase() !== currentMachineId.toUpperCase() ||
        parsedPayload.plan !== data.plan ||
        parsedPayload.expiryDate !== data.expiryDate
      ) {
        console.warn('[LicenseService] Isi license.json tidak cocok dengan payload kriptografi!')
        return {
          isValid: false,
          isLicensed: false,
          machineId: currentMachineId,
          plan: undefined,
          expiryDate: null,
          licenseKey: ''
        }
      }
    } else {
      // Unsigned or legacy license file
      return {
        isValid: false,
        isLicensed: false,
        machineId: currentMachineId,
        plan: undefined,
        expiryDate: null,
        licenseKey: ''
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
        licenseKey: data.licenseKey
      }
    }

    // If monthly plan, verify expiryDate against current time
    if (data.plan === 'monthly' && data.expiryDate) {
      const now = Date.now()
      const expiry = new Date(data.expiryDate).getTime()
      if (isNaN(expiry) || now > expiry) {
        return {
          isValid: false,
          isLicensed: false,
          machineId: currentMachineId,
          plan: 'monthly',
          expiryDate: data.expiryDate,
          licenseKey: data.licenseKey,
          activatedAt: data.activatedAt
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
      licenseKey: data.licenseKey,
      activatedAt: data.activatedAt
    }
  } catch (err) {
    console.warn('[LicenseService] Failed to read license.json:', err)
    return {
      isValid: false,
      isLicensed: false,
      machineId: currentMachineId,
      plan: undefined,
      expiryDate: null,
      licenseKey: ''
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

  const parts = cleanedKey.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      success: false,
      message: 'Format kunci lisensi tidak valid. Pastikan Anda menyalin seluruh teks kunci lisensi digital.'
    }
  }

  const [b64Payload, b64Signature] = parts

  // 1. Verify RSA-SHA256 digital signature
  const isSignatureValid = verifyLicenseSignature(b64Payload, b64Signature)
  if (!isSignatureValid) {
    return {
      success: false,
      message: 'Kunci lisensi digital tidak valid / palsu. Verifikasi tanda tangan kriptografi RSA-SHA256 gagal.'
    }
  }

  // 2. Decode payload
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

  // 3. Validate Machine ID match
  if (!payload.machineId || payload.machineId.toUpperCase() !== currentMachineId.toUpperCase()) {
    return {
      success: false,
      message: `Lisensi ini terikat untuk perangkat lain (ID: ${payload.machineId}). Machine ID perangkat ini adalah: ${currentMachineId}`
    }
  }

  // 4. Validate Plan & Expiration
  if (payload.plan !== 'lifetime' && payload.plan !== 'monthly') {
    return {
      success: false,
      message: 'Paket lisensi tidak dikenali.'
    }
  }

  if (payload.plan === 'monthly') {
    if (!payload.expiryDate) {
      return {
        success: false,
        message: 'Lisensi bulanan tidak memiliki tanggal kadaluarsa yang valid.'
      }
    }
    const expiryTime = new Date(payload.expiryDate).getTime()
    if (isNaN(expiryTime) || Date.now() > expiryTime) {
      return {
        success: false,
        message: `Lisensi bulanan ini telah kadaluarsa pada ${new Date(payload.expiryDate).toLocaleDateString('id-ID')}.`
      }
    }
  }

  const newLicense: LicenseData = {
    licenseKey: cleanedKey,
    machineId: currentMachineId,
    plan: payload.plan,
    expiryDate: payload.expiryDate,
    isValid: true,
    activatedAt: new Date().toISOString(),
    b64Payload,
    b64Signature
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

  return {
    success: true,
    message:
      payload.plan === 'lifetime'
        ? 'Aktivasi Berhasil! Lisensi Lifetime Access aktif selamanya.'
        : `Aktivasi Berhasil! Lisensi Bulanan aktif hingga ${new Date(payload.expiryDate!).toLocaleDateString('id-ID')}.`,
    data: newLicense
  }
}

/**
 * Register IPC handlers for licensing
 */
export function registerLicenseIPC(): void {
  ipcMain.handle('license:get-status', async () => {
    return getLicenseStatus()
  })

  ipcMain.handle('license:validate', async (_event, payload: string | { licenseKey: string }) => {
    const key = typeof payload === 'string' ? payload : payload?.licenseKey
    return await validateLicense(key)
  })
}
