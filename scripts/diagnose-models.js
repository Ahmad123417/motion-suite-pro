/* eslint-disable @typescript-eslint/explicit-function-return-type */
/**
 * Diagnostic Script: Discover available Gemini models for the provided API Key.
 * Usage:
 *   node scripts/diagnose-models.js [YOUR_API_KEY]
 *   Or set GEMINI_API_KEY environment variable.
 */

const rawKey = process.argv[2] || process.env.GEMINI_API_KEY || ''
const apiKey = rawKey
  .trim()
  .replace(/^["']|["']$/g, '')
  .trim()

if (!apiKey) {
  console.error('❌ Error: Harap berikan API Key sebagai argumen CLI.')
  console.log('Contoh: node scripts/diagnose-models.js AIzaSy...')
  process.exit(1)
}

console.log(`🔍 Mendeteksi model yang tersedia untuk API Key (panjang: ${apiKey.length})...\n`)

async function diagnose() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    const text = await res.text()

    if (!res.ok) {
      console.error(`❌ Google API Mengembalikan Status HTTP ${res.status}:`)
      console.error(text)
      try {
        const parsed = JSON.parse(text)
        if (parsed?.error?.message) {
          console.error(`\nPesan Error: ${parsed.error.message}`)
        }
      } catch {
        // ignore
      }
      return
    }

    const data = JSON.parse(text)
    const models = data.models || []

    console.log(`✅ Total model terdaftar: ${models.length}`)
    console.log('------------------------------------------------------------')

    // Filter models supporting generateContent
    const contentModels = models.filter(
      (m) =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes('generateContent')
    )

    console.log(`📌 Model yang mendukung 'generateContent': ${contentModels.length}\n`)

    const flashModels = []
    const otherModels = []

    for (const m of contentModels) {
      const isFlash = m.name.toLowerCase().includes('flash')
      const entry = {
        name: m.name,
        displayName: m.displayName || '',
        version: m.version || '',
        inputTokenLimit: m.inputTokenLimit || 0
      }
      if (isFlash) {
        flashModels.push(entry)
      } else {
        otherModels.push(entry)
      }
    }

    console.log('⚡ FLASH MODELS (Direkomendasikan untuk kecepatan & kuota):')
    if (flashModels.length === 0) {
      console.log('   (Tidak ada model berlabel flash ditemukan)')
    } else {
      flashModels.forEach((m, idx) => {
        console.log(`   ${idx + 1}. ${m.name} (${m.displayName})`)
      })
    }

    console.log('\n📦 MODEL LAINNYA (Fallback):')
    otherModels.forEach((m, idx) => {
      console.log(`   ${idx + 1}. ${m.name} (${m.displayName})`)
    })

    // Best model determination
    let selectedModel = null
    const v36Flash = flashModels.find(
      (m) =>
        m.name.includes('gemini-3.6-flash') && !m.name.includes('image') && !m.name.includes('tts')
    )
    const v37Flash = flashModels.find(
      (m) =>
        m.name.includes('gemini-3.7-flash') && !m.name.includes('image') && !m.name.includes('tts')
    )
    const flashLatest = flashModels.find((m) => m.name.includes('gemini-flash-latest'))

    if (v36Flash) {
      selectedModel = v36Flash.name
    } else if (v37Flash) {
      selectedModel = v37Flash.name
    } else if (flashLatest) {
      selectedModel = flashLatest.name
    } else if (flashModels.length > 0) {
      selectedModel = flashModels[0].name
    } else if (contentModels.length > 0) {
      selectedModel = contentModels[0].name
    }

    const sanitizedModel = selectedModel ? selectedModel.replace(/^models\//, '') : 'None'

    console.log('\n🎯 REKOMENDASI MODEL OTOMATIS:')
    console.log(`   Model terpilih: \x1b[32m${sanitizedModel}\x1b[0m (raw: ${selectedModel})`)
    console.log('------------------------------------------------------------')
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat memanggil endpoint Google:', err)
  }
}

diagnose()
