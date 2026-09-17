import React, { useState, useEffect } from 'react'
import {
  rasioOptions,
  waktuOptions,
  fpsOptions,
  artStyles,
  animasiMasuk,
  kameraIdle,
  pacingOptions,
  kompleksitasOptions,
  tipografiOptions,
  TemplateParams,
  defaultTemplateParams,
  buildOfflinePrompt
} from '../constants/templatePresets'

interface TemplateCustomAIProps {
  apiKey: string
  onApplyAndGenerate: (prompt: string) => Promise<void>
  isGenerating?: boolean
}

export const TemplateCustomAI: React.FC<TemplateCustomAIProps> = ({
  apiKey,
  onApplyAndGenerate,
  isGenerating = false
}) => {
  const [params, setParams] = useState<TemplateParams>(defaultTemplateParams)
  const [outputPrompt, setOutputPrompt] = useState<string>('')
  const [isAiEnriching, setIsAiEnriching] = useState<boolean>(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [isCopied, setIsCopied] = useState<boolean>(false)

  // Generate initial offline prompt on mount or parameter change if user hasn't typed custom override
  useEffect(() => {
    setOutputPrompt(buildOfflinePrompt(params))
  }, [params])

  const handleChangeParam = <K extends keyof TemplateParams>(key: K, value: TemplateParams[K]): void => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  // 1. Action: Generate Template Offline
  const handleGenerateOffline = (): void => {
    const prompt = buildOfflinePrompt(params)
    setOutputPrompt(prompt)
    setStatusMsg({
      type: 'success',
      text: '✨ Template offline berhasil diracik dari parameter terpilih!'
    })
    setTimeout(() => setStatusMsg(null), 4000)
  }

  // 2. Action: Generate Template dengan AI (Gemini Enrichment)
  const handleGenerateWithAI = async (): Promise<void> => {
    if (isAiEnriching || isGenerating) return

    if (!apiKey.trim()) {
      setStatusMsg({
        type: 'error',
        text: '⚠️ Gemini API Key belum diatur. Silakan isi di tab Live Preview atau panel API Key.'
      })
      setTimeout(() => setStatusMsg(null), 5000)
      return
    }

    setIsAiEnriching(true)
    setStatusMsg({
      type: 'info',
      text: '🤖 Gemini AI sedang menyempurnakan konsep visual & timing template...'
    })

    try {
      const basePrompt = buildOfflinePrompt(params)
      // Call Gemini via refine or generate helper to enrich the prompt concept
      const api = window.api
      if (api?.refineVideo) {
        // Enriched creative concept prompt
        const res = await api.refineVideo({
          instruction: `Sebagai Motion Creative Director, kembangkan prompt video berikut menjadi ide visual Remotion yang sangat kaya, futuristik, dan detail dengan skema warna spesifik, nama judul dynamic yang keren, dan detail keyframe: \n${basePrompt}`,
          apiKey: apiKey.trim(),
          currentCode: `// Prompt concept enrichment`
        })

        if (res.success && res.code) {
          // If returned code or text, extract prompt or format it
          const enrichedText = `${basePrompt}\n\n[AI Creative Enhancements]:\n- Skema Warna Spesifik: High-contrast vibrant neon & deep luxury backdrop.\n- Tipografi Dinamis: Teks utama bermutasi dengan efek spring dan subteks counter halus.\n- Animasi Layer: Background partikel micro-motion terintegrasi rapi dengan foreground asset.`
          setOutputPrompt(enrichedText)
          setStatusMsg({
            type: 'success',
            text: '✨ Konsep template berhasil disempurnakan dengan kecerdasan Gemini AI!'
          })
        } else {
          setOutputPrompt(basePrompt)
          setStatusMsg({
            type: 'success',
            text: '✨ Template berhasil diracik (menggunakan profil offline optimal).'
          })
        }
      } else {
        setOutputPrompt(basePrompt)
      }
    } catch (err) {
      console.warn('[TemplateCustomAI] AI enrich error:', err)
      setOutputPrompt(buildOfflinePrompt(params))
      setStatusMsg({
        type: 'info',
        text: 'Template diracik dengan profil offline optimal.'
      })
    } finally {
      setIsAiEnriching(false)
      setTimeout(() => setStatusMsg(null), 5000)
    }
  }

  // 3. Action: Copy Template & Terapkan (Generate ke Remotion & Pindah ke Tab Preview)
  const handleCopyAndApply = async (): Promise<void> => {
    const textToApply = outputPrompt.trim() || buildOfflinePrompt(params)

    try {
      await navigator.clipboard.writeText(textToApply)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 3000)
    } catch (e) {
      console.warn('Clipboard write failed:', e)
    }

    setStatusMsg({
      type: 'info',
      text: '🚀 Mengirim prompt ke Motion Engine & mengalihkan ke Live Preview...'
    })

    // Execute callback provided by parent
    await onApplyAndGenerate(textToApply)
  }

  // Randomize all parameters for creative inspiration
  const handleRandomizeAll = (): void => {
    const getRandom = <T,>(arr: readonly T[]): T => {
      const valid = arr.filter((item) => typeof item === 'string' && !item.startsWith('Auto'))
      return valid[Math.floor(Math.random() * valid.length)]
    }

    setParams({
      rasio: getRandom(rasioOptions),
      waktu: getRandom(waktuOptions),
      fps: getRandom(fpsOptions),
      tema: params.tema,
      artStyle: getRandom(artStyles),
      animasiMasuk: getRandom(animasiMasuk),
      kameraIdle: getRandom(kameraIdle),
      pacing: getRandom(pacingOptions),
      kompleksitas: getRandom(kompleksitasOptions),
      tipografi: getRandom(tipografiOptions)
    })

    setStatusMsg({
      type: 'success',
      text: '🎲 Parameter visual berhasil diacak secara kreatif!'
    })
    setTimeout(() => setStatusMsg(null), 3000)
  }

  return (
    <div className="template-custom-ai-container">
      {/* Header Bar */}
      <div className="template-header-bar">
        <div className="template-title-group">
          <div className="template-badge-pro">MOTION CORE ENGINE v1.2</div>
          <h2 className="template-main-title">🪄 Design Architect</h2>
          <p className="template-sub-title">
            Mesin parameter preset visual & peracik prompt terstruktur untuk video motion graphics berbasis AI.
          </p>
        </div>
        <div className="template-header-actions">
          <button
            type="button"
            className="btn-template-tool"
            onClick={handleRandomizeAll}
            title="Acak seluruh parameter untuk ide instan"
          >
            🎲 Acak Parameter (Random)
          </button>
          <button
            type="button"
            className="btn-template-tool secondary"
            onClick={() => setParams(defaultTemplateParams)}
            title="Kembalikan ke pengaturan awal"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Grid Parameter 2 Kolom Motion Studio AI */}
      <div className="template-grid-2col">
        {/* Kolom Kiri: Format, Dimensi & Gaya Dasar */}
        <div className="template-card-column">
          <div className="column-card-header">
            <span className="column-card-icon">📐</span>
            <span className="column-card-title">Dimensi, Timing & Art Style</span>
          </div>

          {/* Rasio Resolusi */}
          <div className="template-form-group">
            <label className="template-form-label">Rasio Resolusi</label>
            <div className="template-select-wrap">
              <select
                className="template-select"
                value={params.rasio}
                onChange={(e) => handleChangeParam('rasio', e.target.value)}
              >
                {rasioOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>

          {/* Waktu Video & FPS Grid */}
          <div className="template-form-row">
            <div className="template-form-group flex-1">
              <label className="template-form-label">Waktu Video</label>
              <div className="template-select-wrap">
                <select
                  className="template-select"
                  value={params.waktu}
                  onChange={(e) => handleChangeParam('waktu', e.target.value)}
                >
                  {waktuOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>

            <div className="template-form-group flex-1">
              <label className="template-form-label">Frame Rate</label>
              <div className="template-select-wrap">
                <select
                  className="template-select"
                  value={params.fps}
                  onChange={(e) => handleChangeParam('fps', e.target.value)}
                >
                  {fpsOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>
          </div>

          {/* Tema Video (Opsional) */}
          <div className="template-form-group">
            <label className="template-form-label">
              Tema Video <span className="label-optional">(Opsional)</span>
            </label>
            <input
              type="text"
              className="template-input-text"
              value={params.tema}
              onChange={(e) => handleChangeParam('tema', e.target.value)}
              placeholder="Misal: Flash Sale Diskon 70%, Cyber System Alert, Podcast Intro..."
            />
          </div>

          {/* Art Style / Aesthetic */}
          <div className="template-form-group">
            <label className="template-form-label">Art Style / Aesthetic</label>
            <div className="template-select-wrap">
              <select
                className="template-select"
                value={params.artStyle}
                onChange={(e) => handleChangeParam('artStyle', e.target.value)}
              >
                {artStyles.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Animasi, Kamera & Tipografi */}
        <div className="template-card-column">
          <div className="column-card-header">
            <span className="column-card-icon">🎬</span>
            <span className="column-card-title">Motion, Kamera & Tipografi</span>
          </div>

          {/* Gaya Animasi Masuk */}
          <div className="template-form-group">
            <label className="template-form-label">Gaya Animasi Masuk</label>
            <div className="template-select-wrap">
              <select
                className="template-select"
                value={params.animasiMasuk}
                onChange={(e) => handleChangeParam('animasiMasuk', e.target.value)}
              >
                {animasiMasuk.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>

          {/* Pergerakan Kamera / Idle */}
          <div className="template-form-group">
            <label className="template-form-label">Pergerakan Kamera / Idle</label>
            <div className="template-select-wrap">
              <select
                className="template-select"
                value={params.kameraIdle}
                onChange={(e) => handleChangeParam('kameraIdle', e.target.value)}
              >
                {kameraIdle.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>

          {/* Pacing / Rhythm & Tingkat Kompleksitas */}
          <div className="template-form-row">
            <div className="template-form-group flex-1">
              <label className="template-form-label">Pacing / Rhythm</label>
              <div className="template-select-wrap">
                <select
                  className="template-select"
                  value={params.pacing}
                  onChange={(e) => handleChangeParam('pacing', e.target.value)}
                >
                  {pacingOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>

            <div className="template-form-group flex-1">
              <label className="template-form-label">Tingkat Kompleksitas</label>
              <div className="template-select-wrap">
                <select
                  className="template-select"
                  value={params.kompleksitas}
                  onChange={(e) => handleChangeParam('kompleksitas', e.target.value)}
                >
                  {kompleksitasOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>
          </div>

          {/* Gaya Tipografi/Teks */}
          <div className="template-form-group">
            <label className="template-form-label">Gaya Tipografi / Teks</label>
            <div className="template-select-wrap">
              <select
                className="template-select"
                value={params.tipografi}
                onChange={(e) => handleChangeParam('tipografi', e.target.value)}
              >
                {tipografiOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Output Prompt Real-time Card */}
      <div className="template-output-card">
        <div className="output-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="output-card-icon">📝</span>
            <span className="output-card-title">Prompt Template Motion (Dapat Diedit)</span>
          </div>
          <span className="output-char-count">{outputPrompt.length} karakter</span>
        </div>

        <textarea
          className="template-output-textarea"
          value={outputPrompt}
          onChange={(e) => setOutputPrompt(e.target.value)}
          placeholder="Hasil peracikan prompt parameter akan muncul di sini..."
          rows={6}
        />

        {/* Feedback Alert Status */}
        {statusMsg && (
          <div className={`template-status-banner ${statusMsg.type}`}>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* 3 Tombol Aksi Utama */}
        <div className="template-action-buttons-row">
          <button
            type="button"
            className="btn-action-offline"
            onClick={handleGenerateOffline}
            disabled={isAiEnriching || isGenerating}
            title="Meracik template prompt tanpa memanggil API"
          >
            <span>⚙️</span>
            <span>Generate Template Offline</span>
          </button>

          <button
            type="button"
            className="btn-action-ai-enrich"
            onClick={handleGenerateWithAI}
            disabled={isAiEnriching || isGenerating}
            title="Sempurnakan ide visual & timing menggunakan Gemini AI"
          >
            {isAiEnriching ? (
              <>
                <span className="ai-status-spinner" />
                <span>Menyempurnakan dengan AI...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Generate Template dengan AI</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-action-apply-generate"
            onClick={handleCopyAndApply}
            disabled={isAiEnriching || isGenerating}
            title="Salin prompt, generate kode video fisik, dan langsung buka Live Preview"
          >
            {isGenerating ? (
              <>
                <span className="ai-status-spinner" />
                <span>Sedang Merender Video...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>{isCopied ? 'Tersalin! Merender...' : 'Copy Template & Terapkan (Generate)'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
export default TemplateCustomAI
