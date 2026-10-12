import { useUiLanguage, StudioIcon } from '../i18n'
import React, { useState, useRef } from 'react'

export interface BatchSlot {
  id: string
  title: string
  prompt: string
  refImageBase64?: string
  status: 'pending' | 'generating' | 'rendering' | 'completed' | 'error'
  outputPath?: string
  error?: string
}

interface AutoCoderProps {
  apiKey: string
  onBatchProgress?: (completed: number, total: number) => void
  uploadedAssetPath?: string | null
}

export const AutoCoder: React.FC<AutoCoderProps> = ({ apiKey, uploadedAssetPath }) => {
  const { t, message } = useUiLanguage()
  const [slotCount, setSlotCount] = useState<number>(3)
  const [baseInstruction, setBaseInstruction] = useState<string>(
    'Buat variasi video motion graphic promo dinamis dengan tipografi kinetic, aksen neon cyberpunk, dan transisi spring.'
  )
  const [batchFormat, setBatchFormat] = useState<'mp4' | 'mov'>('mp4')
  const [batchRefImages, setBatchRefImages] = useState<{ id: string; name: string; base64: string }[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cancelRequestedRef = useRef<boolean>(false)

  // Default slots initial state
  const [slots, setSlots] = useState<BatchSlot[]>([
    {
      id: 'slot-1',
      title: 'Slot 1: Flash Sale Cyber',
      prompt: 'Video promo Flash Sale 50% dengan tema cyberpunk neon, glitch text, dan partikel cyan.',
      status: 'pending'
    },
    {
      id: 'slot-2',
      title: 'Slot 2: Minimalist Glass Card',
      prompt: 'Animasi logo reveal dengan efek frosted glassmorphism dan tipografi modern.',
      status: 'pending'
    },
    {
      id: 'slot-3',
      title: 'Slot 3: Tech Metric Counter',
      prompt: 'Infografis dinamis menampilkan counter angka statistik pertumbuhan bisnis dan grafik garis.',
      status: 'pending'
    }
  ])

  // Add new slot
  const handleAddSlot = (): void => {
    const newIndex = slots.length + 1
    const newSlot: BatchSlot = {
      id: `slot-${Date.now()}`,
      title: `Slot ${newIndex}: Motion Graphic Baru`,
      prompt: baseInstruction || `Variasi animasi Remotion slot ke-${newIndex}`,
      status: 'pending'
    }
    setSlots((prev) => [...prev, newSlot])
  }

  // Remove single slot
  const handleRemoveSlot = (id: string): void => {
    if (isProcessing) return
    setSlots((prev) => prev.filter((s) => s.id !== id))
  }

  // Reset all slots
  const handleResetSlots = (): void => {
    if (isProcessing) return
    setSlots([])
    setStatusMessage('Antrean tugas telah dibersihkan.')
    setTimeout(() => setStatusMessage(''), 3000)
  }

  // Generate slots from count input
  const handleGenerateSlotsFromCount = (): void => {
    const count = Math.max(1, Math.min(10, slotCount))
    const generated: BatchSlot[] = []

    const themes = [
      'Flash Sale & Special Offer',
      'Minimalist Tech Reveal',
      'Cyberpunk Countdown HUD',
      'Dynamic Metric & Chart',
      'Kinetic Typography Burst',
      'Luxury Brand Showcase',
      'Neon Glitch Warning',
      'Geometric Bauhaus Flow',
      'Vaporwave Retro Sunset',
      'Holographic Card Flip'
    ]

    for (let i = 0; i < count; i++) {
      const theme = themes[i % themes.length]
      const refImg = batchRefImages[i % batchRefImages.length]?.base64
      generated.push({
        id: `slot-${Date.now()}-${i + 1}`,
        title: `Slot ${i + 1}: ${theme}`,
        prompt: `${baseInstruction}\nFokus tema khusus slot ${i + 1}: ${theme}.`,
        refImageBase64: refImg,
        status: 'pending'
      })
    }

    setSlots(generated)
    setStatusMessage(`${count} slot otomatis berhasil dibuat berdasarkan pengaturan batch!`)
    setTimeout(() => setStatusMessage(''), 4000)
  }

  // Multi-image file upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (): void => {
        if (typeof reader.result === 'string') {
          setBatchRefImages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              name: file.name,
              base64: reader.result as string
            }
          ])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveBatchImage = (id: string): void => {
    setBatchRefImages((prev) => prev.filter((img) => img.id !== id))
  }

  // Sequential execution runner
  const handleStartBatchProcessing = async (): Promise<void> => {
    if (isProcessing) return

    if (!apiKey.trim()) {
      setStatusMessage('⚠️ Harap masukkan Google Gemini API Key terlebih dahulu di panel API Key.')
      return
    }

    if (slots.length === 0) {
      setStatusMessage('⚠️ Antrean kosong. Silakan tambahkan atau buat slot terlebih dahulu.')
      return
    }

    cancelRequestedRef.current = false
    setIsProcessing(true)
    setStatusMessage(`Memulai proses batch untuk ${slots.length} video...`)

    const api = window.api
    if (!api?.generateVideo || !api?.startRender) {
      setStatusMessage('⚠️ API Electron tidak tersedia untuk eksekusi batch.')
      setIsProcessing(false)
      return
    }

    for (let i = 0; i < slots.length; i++) {
      if (cancelRequestedRef.current) {
        setStatusMessage('Proses batch dihentikan oleh pengguna.')
        break
      }

      const currentSlot = slots[i]
      setActiveSlotId(currentSlot.id)

      // 1. Mark status as generating
      setSlots((prev) =>
        prev.map((s) => (s.id === currentSlot.id ? { ...s, status: 'generating' } : s))
      )
      setStatusMessage(`[${i + 1}/${slots.length}] Meng-generate kode TSX untuk: ${currentSlot.title}...`)

      try {
        // Step A: Call Gemini AI Video Generator
        const genRes = await api.generateVideo({
          prompt: currentSlot.prompt,
          imageBase64: currentSlot.refImageBase64,
          apiKey: apiKey.trim(),
          assetPath: uploadedAssetPath || undefined
        })

        if (!genRes.success) {
          throw new Error(genRes.error || 'Gagal menghasilkan kode dengan Gemini AI')
        }

        if (cancelRequestedRef.current) break

        // Step B: Mark status as rendering
        setSlots((prev) =>
          prev.map((s) => (s.id === currentSlot.id ? { ...s, status: 'rendering' } : s))
        )
        setStatusMessage(`[${i + 1}/${slots.length}] Merender video fisik untuk: ${currentSlot.title}...`)

        // Step C: Trigger physical Remotion render
        const renderRes = await api.startRender({
          format: batchFormat,
          isTransparent: batchFormat === 'mov',
          title: currentSlot.title
        })

        if (renderRes.success && renderRes.outputPath) {
          setSlots((prev) =>
            prev.map((s) =>
              s.id === currentSlot.id
                ? { ...s, status: 'completed', outputPath: renderRes.outputPath }
                : s
            )
          )
        } else if (renderRes.canceled) {
          setSlots((prev) =>
            prev.map((s) =>
              s.id === currentSlot.id ? { ...s, status: 'pending', error: 'Render dibatalkan' } : s
            )
          )
        } else {
          throw new Error(renderRes.error || 'Gagal render video motion asset')
        }
      } catch (err) {
        console.error('[AutoCoder] Error slot:', currentSlot.title, err)
        setSlots((prev) =>
          prev.map((s) =>
            s.id === currentSlot.id
              ? { ...s, status: 'error', error: err instanceof Error ? err.message : String(err) }
              : s
          )
        )
      }
    }

    setActiveSlotId(null)
    setIsProcessing(false)
    setStatusMessage('Selesai! Seluruh tugas antrean batch telah diproses.')
  }

  const handleCancelBatch = (): void => {
    cancelRequestedRef.current = true
    setIsProcessing(false)
    setStatusMessage('Membatalkan proses batch...')
    if (window.api?.cancelRender) {
      window.api.cancelRender().catch(() => {})
    }
  }

  const completedCount = slots.filter((s) => s.status === 'completed').length

  return (
    <div className="autocoder-container">
      {/* Header Bar */}
      <div className="autocoder-header">
        <div>
          <div className="autocoder-badge">{t("AUTONOMOUS BATCH GENERATOR")}</div>
          <h2 className="autocoder-title">{t("⚡ Batch Pipeline")}</h2>
          <p className="autocoder-subtitle"> {t("Otomasi produksi aset motion graphics massal berbasis antrean mandiri & Gemini AI.")} </p>
        </div>
        <div className="autocoder-stats-pill">
          <span className="stats-dot" />
          <span>
            {completedCount} / {slots.length} {t("Selesai")} </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="autocoder-grid">
        {/* Kolom Kiri: Antrean Tugas (Queue List) */}
        <div className="autocoder-queue-column">
          <div className="queue-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}><StudioIcon /></span>
              <h3 className="queue-header-title">{t("Antrean Tugas (")}{slots.length} {t("Slot)")}</h3>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn-queue-action"
                onClick={handleAddSlot}
                disabled={isProcessing}
                title={t("Tambah satu slot baru ke antrean")}
              > {t("+ Tambah Slot")} </button>
              <button
                type="button"
                className="btn-queue-action danger"
                onClick={handleResetSlots}
                disabled={isProcessing || slots.length === 0}
                title={t("Bersihkan semua slot")}
              > {t("🗑️ Reset")} </button>
            </div>
          </div>

          {/* Slot Cards List */}
          <div className="queue-slots-list">
            {slots.length === 0 ? (
              <div className="queue-empty-state">
                <div style={{ fontSize: '36px', marginBottom: '8px' }}><StudioIcon /></div>
                <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{t("Antrean Kosong")}</div>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 12px 0' }}> {t("Gunakan tombol \"+ Tambah Slot\" atau atur jumlah loop di panel kanan lalu klik \"Buat Slot\".")} </p>
                <button
                  type="button"
                  className="btn-queue-action"
                  onClick={() => setSlotCount(3)}
                > {t("+ Muat 3 Slot Contoh")} </button>
              </div>
            ) : (
              slots.map((slot, index) => (
                <div
                  key={slot.id}
                  className={`queue-slot-item ${activeSlotId === slot.id ? 'active' : ''} ${slot.status}`}
                >
                  <div className="slot-item-left">
                    <div className="slot-number-circle">{index + 1}</div>
                    <div className="slot-info">
                      <div className="slot-title-row">
                        <span className="slot-title">{slot.title}</span>
                        <span className={`slot-status-badge ${slot.status}`}>
                          {slot.status === 'pending' && '⏳ Menunggu'}
                          {slot.status === 'generating' && '⚡ Menulis Kode...'}
                          {slot.status === 'rendering' && '🎬 Merender Video...'}
                          {slot.status === 'completed' && '✅ Rendered'}
                          {slot.status === 'error' && '❌ Gagal'}
                        </span>
                      </div>
                      <div className="slot-prompt-preview">{slot.prompt}</div>
                      {slot.outputPath && (
                        <div className="slot-output-row">
                          <span className="slot-path-text" title={slot.outputPath}><StudioIcon />{slot.outputPath}
                          </span>
                          <button
                            type="button"
                            className="btn-slot-folder"
                            onClick={() => window.api?.openFileLocation(slot.outputPath!)}
                            title={t("Buka folder file di explorer")}
                          > {t("Buka")} </button>
                        </div>
                      )}
                      {slot.error && <div className="slot-error-text"><StudioIcon />{slot.error}</div>}
                    </div>
                  </div>

                  <div className="slot-item-right">
                    <button
                      type="button"
                      className="btn-remove-slot"
                      onClick={() => handleRemoveSlot(slot.id)}
                      disabled={isProcessing}
                      title={t("Hapus slot ini dari antrean")}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan Batch */}
        <div className="autocoder-settings-column">
          <div className="queue-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}><StudioIcon /></span>
              <h3 className="queue-header-title">{t("Pengaturan Batch Pipeline")}</h3>
            </div>
            <span className="autocoder-pro-badge">{t("AUTO PIPELINE")}</span>
          </div>

          {/* Loop Count & Format Row */}
          <div className="autocoder-form-row">
            <div className="template-form-group flex-1">
              <label className="template-form-label">{t("Jumlah Video (Loop Slot)")}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  className="template-input-text"
                  min={1}
                  max={10}
                  value={slotCount}
                  onChange={(e) => setSlotCount(parseInt(e.target.value, 10) || 1)}
                  disabled={isProcessing}
                />
                <button
                  type="button"
                  className="btn-queue-action"
                  onClick={handleGenerateSlotsFromCount}
                  disabled={isProcessing}
                  title={t("Generate slot otomatis sesuai jumlah")}
                  style={{ whiteSpace: 'nowrap' }}
                > {t("⚡ Buat Slot")} </button>
              </div>
            </div>

            <div className="template-form-group flex-1">
              <label className="template-form-label">{t("Format Export Render")}</label>
              <div className="template-select-wrap">
                <select
                  className="template-select"
                  value={batchFormat}
                  onChange={(e) => setBatchFormat(e.target.value as 'mp4' | 'mov')}
                  disabled={isProcessing}
                >
                  <option value="mp4">{t("MP4 Video (H.264)")}</option>
                  <option value="mov">{t("MOV (ProRes Alpha Transparan)")}</option>
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>
          </div>

          {/* Custom Base Instructions */}
          <div className="template-form-group">
            <label className="template-form-label">{t("Instruksi / Konsep Master Batch")}</label>
            <textarea
              className="template-output-textarea"
              rows={4}
              value={baseInstruction}
              onChange={(e) => setBaseInstruction(e.target.value)}
              placeholder={t("Berikan pedoman tema untuk seluruh video yang akan digenerate secara massal...")}
              disabled={isProcessing}
            />
          </div>

          {/* Multi-Reference Image Dropzone */}
          <div className="template-form-group">
            <label className="template-form-label"> {t("Gambar Referensi Massal")} <span className="label-optional">({batchRefImages.length} {t("gambar)")}</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            <div
              className="ref-image-dropzone"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
              }}
            >
              <span style={{ fontSize: '24px' }}><StudioIcon /></span>
              <div className="ref-dropzone-text">
                <strong>{t("Pilih atau Tarik Multi-Gambar")}</strong>
              </div>
              <span className="ref-dropzone-hint">{t("(Gambar akan dibagikan ke setiap slot antrean)")}</span>
            </div>

            {/* Uploaded Image Thumbnails Grid */}
            {batchRefImages.length > 0 && (
              <div className="batch-ref-thumb-grid">
                {batchRefImages.map((img) => (
                  <div key={img.id} className="batch-ref-thumb-card">
                    <img src={img.base64} alt={img.name} className="batch-ref-thumb-img" />
                    <span className="batch-ref-thumb-name">{img.name}</span>
                    <button
                      type="button"
                      className="btn-remove-thumb"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveBatchImage(img.id)
                      }}
                      title={t("Hapus gambar")}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Message Banner */}
          {statusMessage && (
            <div className="autocoder-status-banner">
              <span>{message(statusMessage)}</span>
            </div>
          )}

          {/* Main Action Buttons */}
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            {isProcessing ? (
              <button
                type="button"
                className="btn-batch-cancel"
                onClick={handleCancelBatch}
                title={t("Hentikan eksekusi antrean massal")}
              >
                <span><StudioIcon /></span>
                <span>{t("Hentikan Proses Batch")}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-batch-start-primary"
                onClick={handleStartBatchProcessing}
                disabled={slots.length === 0}
                title={t("Mulai eksekusi sekuensial seluruh antrean video")}
              >
                <span><StudioIcon /></span>
                <span>{t("Mulai Auto Generate Massal (")}{slots.length} {t("Video)")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default AutoCoder
