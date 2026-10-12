export type GenerationStage = 'Planning' | 'Building Animation' | 'Validating' | 'Ready'
export type GenerationCategory = 'service' | 'rate_limit' | 'deadline' | 'connection' |
  'credentials' | 'invalid_code' | 'invalid_blueprint' | 'unknown' | 'cancelled'

export interface GenerationFailure {
  category: GenerationCategory
  stage: GenerationStage
  model?: string
  httpStatus?: number
  origin: 'upstream' | 'application' | 'connection' | 'unknown' | 'user'
  retryable: boolean
  fallbackAttempted: boolean
  outcome: 'failed' | 'cancelled'
  deadlineScope?: 'attempt' | 'stage' | 'overall' | 'local'
  reason?: 'model-unavailable' | 'invalid-request' | 'pending-request'
  limitKind?: 'rate' | 'quota' | 'unspecified'
}

export interface GenerationProgress {
  requestId: string
  stage: GenerationStage
  event?: 'attempt' | 'fallback' | 'succeeded' | 'recovering'
  model?: string
}

export interface GenerationOutcome {
  failure?: GenerationFailure
  diagnostics?: string
  models?: { planning?: string; building?: string }
  recovery?: {
    method: 'local' | 'ai'
    outcome: 'succeeded' | 'failed' | 'skipped'
    reason?: 'insufficient-budget' | 'unsafe-source' | 'changed-content' | 'invalid-repair'
    originalDiagnostic: { code: number; line?: number; column?: number }
  }
}

type FailureContext = Pick<GenerationFailure, 'stage'> & Partial<Pick<GenerationFailure,
  'model' | 'httpStatus' | 'fallbackAttempted' | 'deadlineScope' | 'reason' | 'limitKind'>>

export function generationFailure(category: GenerationCategory, context: FailureContext): GenerationFailure {
  return {
    ...context, category,
    origin: category === 'cancelled' ? 'user' : category === 'deadline' ||
      category === 'invalid_code' || category === 'invalid_blueprint' ? 'application' :
      category === 'connection' ? 'connection' : context.httpStatus ? 'upstream' : 'unknown',
    retryable: ['service', 'deadline', 'connection'].includes(category) ||
      (category === 'rate_limit' && context.limitKind !== 'quota'),
    fallbackAttempted: context.fallbackAttempted ?? false,
    outcome: category === 'cancelled' ? 'cancelled' : 'failed'
  }
}

export class GenerationError extends Error {
  constructor(readonly failure: GenerationFailure, readonly diagnostics?: string) {
    super(failure.category)
  }
}

// Accept structured evidence first. Never pass raw SDK messages, details or request data to IPC/logs.
export function classifyGenerationError(error: unknown, context: FailureContext): GenerationFailure {
  if (error instanceof GenerationError) return error.failure
  const object = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const info = object(error)
  const rawStatus = info.status ?? object(info.response).status
  const status = typeof rawStatus === 'number' && Number.isInteger(rawStatus) &&
    rawStatus >= 100 && rawStatus <= 599 ? rawStatus : undefined
  const details = Array.isArray(info.errorDetails) ? info.errorDetails.slice(0, 16) : []
  const reasons = details.map(object).filter(detail =>
    detail['@type'] === 'type.googleapis.com/google.rpc.ErrorInfo').map(detail => detail.reason)
  const metadata = { ...context, ...(status ? { httpStatus: status } : {}) }
  if (status === 401 || status === 403 || reasons.some(reason =>
    ['API_KEY_INVALID', 'API_KEY_EXPIRED', 'API_KEY_SERVICE_BLOCKED', 'IAM_PERMISSION_DENIED'].includes(String(reason)))) {
    return generationFailure('credentials', metadata)
  }
  if (status && [500, 502, 503, 504].includes(status)) return generationFailure('service', metadata)
  if (status === 429) return generationFailure('rate_limit', { ...metadata,
    limitKind: reasons.includes('QUOTA_EXCEEDED') ? 'quota' :
      reasons.includes('RATE_LIMIT_EXCEEDED') ? 'rate' : 'unspecified' })
  if (status) return generationFailure('unknown', { ...metadata,
    ...(status === 404 ? { reason: 'model-unavailable' as const } :
      status === 400 ? { reason: 'invalid-request' as const } : {}) })
  const connectionCodes = ['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'ENETUNREACH',
    'EHOSTUNREACH', 'ETIMEDOUT', 'CERT_HAS_EXPIRED', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    'DEPTH_ZERO_SELF_SIGNED_CERT', 'ERR_TLS_CERT_ALTNAME_INVALID', 'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET']
  let cause = info
  for (let depth = 0; depth < 4; depth++) {
    if (connectionCodes.includes(String(cause.code))) return generationFailure('connection', metadata)
    cause = object(cause.cause)
  }
  // SDK 0.24.1 discards fetch.cause. Recognize only its exact wrapper and standard fetch failures.
  const wrappedFetchFailure = typeof info.message === 'string' &&
    /^\[GoogleGenerativeAI Error\]: Error fetching from https:\/\/generativelanguage\.googleapis\.com\/[A-Za-z0-9_./-]+:generateContent: (?:fetch failed|Failed to fetch|NetworkError when attempting to fetch resource\.)$/.test(info.message)
  if (wrappedFetchFailure || (error instanceof TypeError &&
    ['fetch failed', 'Failed to fetch'].includes(error.message))) return generationFailure('connection', metadata)
  if (error instanceof Error && error.constructor.name === 'GoogleGenerativeAIRequestInputError') {
    return generationFailure('unknown', { ...metadata, reason: 'invalid-request' })
  }
  return generationFailure('unknown', metadata)
}

// Use only structured provider delays, never arbitrary exception-message text.
// SDK 0.24.1 retains google.rpc.RetryInfo but drops HTTP response headers.
export function generationRetryDelayMs(error: unknown, now = Date.now()): number | undefined {
  const object = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const info = object(error)
  const delays: number[] = []
  const details = Array.isArray(info.errorDetails) ? info.errorDetails.slice(0, 16) : []
  for (const detail of details.map(object)) {
    if (detail['@type'] !== 'type.googleapis.com/google.rpc.RetryInfo') continue
    const duration = detail.retryDelay
    if (typeof duration === 'string' && /^\d{1,10}(?:\.\d{1,9})?s$/.test(duration)) {
      delays.push(Math.ceil(Number(duration.slice(0, -1)) * 1000))
    }
  }
  // Honor Retry-After when a transport actually supplies it (seconds or HTTP date).
  const headers = info.headers ?? object(info.response).headers
  let header: unknown
  try {
    const values = object(headers)
    header = typeof values.get === 'function'
      ? (values.get as (name: string) => unknown).call(headers, 'retry-after')
      : values['retry-after'] ?? values['Retry-After']
  } catch { /* Missing/unreadable headers are not evidence of a retry delay. */ }
  if (typeof header === 'string' && header.length <= 128) {
    const value = header.trim()
    if (/^\d{1,10}$/.test(value)) delays.push(Number(value) * 1000)
    else if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(value)) {
      delays.push(Math.max(0, Date.parse(value) - now))
    }
  }
  const valid = delays.filter(value => Number.isFinite(value) && value >= 0)
  return valid.length ? Math.max(...valid) : undefined
}

const MESSAGES: Record<GenerationCategory, { title: string; message: string }> = {
  service: {
    title: 'Layanan AI Sedang Mengalami Gangguan',
    message: 'Layanan Google Gemini sedang mengalami gangguan sementara sehingga permintaan belum berhasil diproses. Ini bukan kesalahan kode animasi Anda. Silakan coba kembali beberapa saat lagi. Pekerjaan sebelumnya tetap aman.'
  },
  rate_limit: {
    title: 'Permintaan AI Sedang Dibatasi',
    message: 'Layanan Google Gemini sedang membatasi permintaan atau kuota API yang digunakan telah tercapai. Silakan periksa kuota API Anda atau coba kembali nanti.'
  },
  deadline: {
    title: 'Waktu Pemrosesan AI Habis',
    message: 'Proses AI belum selesai dalam batas waktu yang tersedia. Hal ini tidak selalu berarti server Google sedang bermasalah. Silakan coba kembali beberapa saat lagi. Animasi sebelumnya tidak diubah.'
  },
  connection: {
    title: 'Koneksi ke Layanan AI Gagal',
    message: 'Motion Suite Pro tidak dapat terhubung ke layanan Google Gemini. Periksa koneksi internet Anda dan coba kembali.'
  },
  credentials: {
    title: 'Konfigurasi API Memerlukan Perhatian',
    message: 'Permintaan AI tidak dapat diotorisasi. Periksa API Key, izin akses model, dan pengaturan Google AI Studio Anda.'
  },
  invalid_code: {
    title: 'Kode Animasi Belum Valid',
    message: 'Kode animasi yang dihasilkan AI belum lolos pemeriksaan teknis. Animasi sebelumnya tetap aman dan tidak ditimpa.'
  },
  invalid_blueprint: {
    title: 'Perencanaan Animasi Belum Berhasil',
    message: 'AI belum menghasilkan rancangan animasi yang memenuhi pemeriksaan struktur. Tidak ada animasi baru yang diterapkan.'
  },
  unknown: {
    title: 'Proses AI Belum Berhasil',
    message: 'Terjadi kendala saat memproses permintaan animasi. Penyebabnya belum dapat dipastikan. Silakan coba kembali atau periksa informasi diagnostik.'
  },
  cancelled: { title: 'Proses AI Dibatalkan', message: 'Permintaan dihentikan. Animasi sebelumnya tidak diubah.' }
}

export function generationMessage(failure: GenerationFailure): { title: string; message: string } {
  if (failure.category === 'deadline' && failure.deadlineScope === 'local') return {
    title: 'Waktu Validasi Animasi Habis',
    message: 'Pemeriksaan lokal kode animasi belum selesai dalam batas waktu yang tersedia. Animasi sebelumnya tidak diubah.'
  }
  const message = { ...MESSAGES[failure.category] }
  if (failure.limitKind === 'quota') message.message = 'Kuota API Google Gemini telah tercapai. Silakan periksa kuota API Anda di Google AI Studio.'
  if (failure.limitKind === 'rate') message.message = 'Layanan Google Gemini sedang membatasi laju permintaan. Silakan coba kembali nanti.'
  return message
}
