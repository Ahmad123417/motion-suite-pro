import { useUiLanguage, StudioIcon } from '../i18n'
import React, { useState } from 'react'
import './ParametricControlPanel.css'

export interface ParametricControlPanelProps {
  isOpen: boolean
  onClose: () => void
  // Undo & Revert
  onUndo?: () => void
  canUndo?: boolean
  onRevert?: () => void
  onSnapshotBeforeChange?: () => void
  // Group Teks
  titleText: string
  onChangeTitleText: (val: string) => void
  subtitleText: string
  onChangeSubtitleText: (val: string) => void
  badgeText: string
  onChangeBadgeText: (val: string) => void
  // Group Warna
  accentColor: string
  onChangeAccentColor: (val: string) => void
  secondaryColor: string
  onChangeSecondaryColor: (val: string) => void
  backgroundColor: string
  onChangeBackgroundColor: (val: string) => void
  isTransparent: boolean
  onChangeIsTransparent: (val: boolean) => void
  // Group Transform
  scale: number
  onChangeScale: (val: number) => void
  textOffsetX: number
  onChangeTextOffsetX: (val: number) => void
  textOffsetY: number
  onChangeTextOffsetY: (val: number) => void
  onResetTransform: () => void
  // Group Efek
  glowIntensity: number
  onChangeGlowIntensity: (val: number) => void
  speedMultiplier: number
  onChangeSpeedMultiplier: (val: number) => void
  disabled?: boolean
}

type TabType = 'all' | 'text' | 'color' | 'transform' | 'fx'

export const ParametricControlPanel: React.FC<ParametricControlPanelProps> = ({
  isOpen,
  onClose,
  onUndo,
  canUndo = false,
  onRevert,
  onSnapshotBeforeChange,
  titleText,
  onChangeTitleText,
  subtitleText,
  onChangeSubtitleText,
  badgeText,
  onChangeBadgeText,
  accentColor,
  onChangeAccentColor,
  secondaryColor,
  onChangeSecondaryColor,
  backgroundColor,
  onChangeBackgroundColor,
  isTransparent,
  onChangeIsTransparent,
  scale,
  onChangeScale,
  textOffsetX,
  onChangeTextOffsetX,
  textOffsetY,
  onChangeTextOffsetY,
  onResetTransform,
  glowIntensity,
  onChangeGlowIntensity,
  speedMultiplier,
  onChangeSpeedMultiplier,
  disabled = false
}) => {
  const { t, message } = useUiLanguage()
  const [activeTab, setActiveTab] = useState<TabType>('all')

  if (!isOpen) return null

  const isTransformModified = textOffsetX !== 0 || textOffsetY !== 0 || scale !== 1

  return (
    <aside
      className="param-tweaker-drawer"
      role="dialog"
      aria-label={t("Visual Tweaker Inspector")}
    >
      {/* Header Bar */}
      <div className="param-drawer-header">
        <div className="param-drawer-title-box">
          <span className="param-drawer-icon"><StudioIcon /></span>
          <div className="param-drawer-title-stack">
            <h4 className="param-drawer-title">{t("Visual Tweaker")}</h4>
            <span className="param-drawer-live-badge">{t("Live Hot-Sync")}</span>
          </div>
        </div>

        <div className="param-drawer-header-actions">
          {onUndo && (
            <button
              type="button"
              className="btn-param-header-action btn-param-undo"
              onClick={onUndo}
              disabled={disabled || !canUndo}
              title={t("Batalkan pergeseran/perubahan terakhir (Undo ↶)")}
            > {t("↶ Undo")} </button>
          )}

          {onRevert && (
            <button
              type="button"
              className="btn-param-header-action btn-param-revert"
              onClick={onRevert}
              disabled={disabled}
              title={t("Kembalikan semua parameter ke nilai asli template (↺ Revert)")}
            > {t("↺ Kembalikan ke Asli")} </button>
          )}

          <button
            type="button"
            className="btn-param-drawer-close"
            onClick={onClose}
            title={t("Tutup Inspector (✕)")}
            aria-label={t("Tutup panel")}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Quick Category Navigation Tabs */}
      <div className="param-drawer-tabs">
        <button
          type="button"
          className={`param-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        > {t("Semua")} </button>
        <button
          type="button"
          className={`param-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        > {t("Teks")} </button>
        <button
          type="button"
          className={`param-tab-btn ${activeTab === 'color' ? 'active' : ''}`}
          onClick={() => setActiveTab('color')}
        > {t("Warna")} </button>
        <button
          type="button"
          className={`param-tab-btn ${activeTab === 'transform' ? 'active' : ''}`}
          onClick={() => setActiveTab('transform')}
        > {t("Transform")} </button>
        <button
          type="button"
          className={`param-tab-btn ${activeTab === 'fx' ? 'active' : ''}`}
          onClick={() => setActiveTab('fx')}
        > {t("Efek")} </button>
      </div>

      {/* Scrollable Groups Body */}
      <div className="param-drawer-body">
        {/* GROUP 1: TEKS */}
        {(activeTab === 'all' || activeTab === 'text') && (
          <div className="param-group-card">
            <div className="param-group-header">
              <span className="param-group-icon"><StudioIcon /></span>
              <h5 className="param-group-heading">{t("Konten Teks")}</h5>
            </div>

            {/* Title Text Input */}
            <div className="param-field">
              <div className="param-field-label">
                <span>{t("Judul Utama (titleText)")}</span>
                <span className="param-field-val">{titleText.length} {t("char")}</span>
              </div>
              <input
                type="text"
                className="param-input-text"
                value={titleText}
                onFocus={onSnapshotBeforeChange}
                onChange={(e) => onChangeTitleText(e.target.value)}
                placeholder={t("Masukkan judul utama...")}
                disabled={disabled}
              />
            </div>

            {/* Subtitle Text Input */}
            <div className="param-field">
              <div className="param-field-label">
                <span>{t("Sub-judul / Informasi Sekunder (subtitleText)")}</span>
                <span className="param-field-val">{subtitleText.length} {t("char")}</span>
              </div>
              <input
                type="text"
                className="param-input-text"
                value={subtitleText}
                onFocus={onSnapshotBeforeChange}
                onChange={(e) => onChangeSubtitleText(e.target.value)}
                placeholder={t("Masukkan sub-judul atau info sekunder...")}
                disabled={disabled}
              />
            </div>

            {/* Badge Text Input */}
            <div className="param-field">
              <div className="param-field-label">
                <span>{t("Label Atas / Kategori (badgeText)")}</span>
                <span className="param-field-val">{badgeText.length} {t("char")}</span>
              </div>
              <input
                type="text"
                className="param-input-text"
                value={badgeText}
                onFocus={onSnapshotBeforeChange}
                onChange={(e) => onChangeBadgeText(e.target.value)}
                placeholder={t("Masukkan label atas / badge...")}
                disabled={disabled}
              />
            </div>
          </div>
        )}

        {/* GROUP 2: WARNA & LATAR */}
        {(activeTab === 'all' || activeTab === 'color') && (
          <div className="param-group-card">
            <div className="param-group-header">
              <span className="param-group-icon"><StudioIcon /></span>
              <h5 className="param-group-heading">{t("Warna & Latar Belakang")}</h5>
            </div>

            {/* Accent Color & Secondary Color */}
            <div className="param-colors-grid">
              <div className="param-field">
                <div className="param-field-label">
                  <span>{t("Warna Aksen")}</span>
                </div>
                <div className="param-color-picker-box">
                  <input
                    type="color"
                    className="param-native-color-input"
                    value={accentColor.startsWith('#') && accentColor.length === 7 ? accentColor : '#00f2fe'}
                    onPointerDown={onSnapshotBeforeChange}
                    onChange={(e) => onChangeAccentColor(e.target.value)}
                    disabled={disabled}
                    title={t("Pilih warna aksen utama")}
                  />
                  <span className="param-color-hex-text">{accentColor}</span>
                </div>
              </div>

              <div className="param-field">
                <div className="param-field-label">
                  <span>{t("Warna Sekunder")}</span>
                </div>
                <div className="param-color-picker-box">
                  <input
                    type="color"
                    className="param-native-color-input"
                    value={secondaryColor.startsWith('#') && secondaryColor.length === 7 ? secondaryColor : '#ff0055'}
                    onPointerDown={onSnapshotBeforeChange}
                    onChange={(e) => onChangeSecondaryColor(e.target.value)}
                    disabled={disabled}
                    title={t("Pilih warna aksen sekunder")}
                  />
                  <span className="param-color-hex-text">{secondaryColor}</span>
                </div>
              </div>
            </div>

            {/* Transparency Alpha / Solid Switch */}
            <div className="param-field">
              <div className="param-field-label">
                <span>{t("Mode Latar Belakang")}</span>
                <span className={`param-field-val ${isTransparent ? 'badge-alpha' : ''}`}>
                  {isTransparent ? t("Alpha Channel") : t("Solid Background")}
                </span>
              </div>
              <div className="param-transparency-toggle">
                <button
                  type="button"
                  className={`param-toggle-btn ${!isTransparent ? 'active' : ''}`}
                  onClick={() => {
                    onSnapshotBeforeChange?.()
                    onChangeIsTransparent(false)
                  }}
                  disabled={disabled}
                > {t("⬛ Solid")} </button>
                <button
                  type="button"
                  className={`param-toggle-btn alpha ${isTransparent ? 'active alpha' : ''}`}
                  onClick={() => {
                    onSnapshotBeforeChange?.()
                    onChangeIsTransparent(true)
                  }}
                  disabled={disabled}
                > {t("🏁 Alpha (Transparan)")} </button>
              </div>
            </div>

            {/* Background Color Picker (active if Solid) */}
            <div className="param-field">
              <div className="param-field-label">
                <span>{t("Warna Latar (Solid)")}</span>
                {isTransparent && <span className="param-hint-text">{t("(Diabaikan di mode Alpha)")}</span>}
              </div>
              <div className={`param-color-picker-box ${isTransparent ? 'disabled' : ''}`}>
                <input
                  type="color"
                  className="param-native-color-input"
                  value={backgroundColor.startsWith('#') && backgroundColor.length === 7 ? backgroundColor : '#0a0d14'}
                  onPointerDown={onSnapshotBeforeChange}
                  onChange={(e) => onChangeBackgroundColor(e.target.value)}
                  disabled={disabled || isTransparent}
                  title={isTransparent ? t("Latar saat ini transparan") : t("Pilih warna latar belakang")}
                />
                <span className="param-color-hex-text">
                  {isTransparent ? t("Transparent") : backgroundColor}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* GROUP 3: TRANSFORMASI */}
        {(activeTab === 'all' || activeTab === 'transform') && (
          <div className="param-group-card">
            <div className="param-group-header">
              <span className="param-group-icon"><StudioIcon /></span>
              <h5 className="param-group-heading">{t("Transformasi Dinamis")}</h5>
            </div>

            {/* Horizontal Position X Slider */}
            <div className="param-field">
              <div className="param-field-label">
                <span>{t("Posisi Sumbu X")}</span>
                <span className="param-field-val">
                  {textOffsetX > 0 ? t("+{p0}", {p0: textOffsetX}) : textOffsetX} {t("px")} </span>
              </div>
              <div className="param-slider-wrap">
                <input
                  type="range"
                  min={-500}
                  max={500}
                  step={1}
                  className="param-range-input"
                  value={textOffsetX}
                  onPointerDown={onSnapshotBeforeChange}
                  onChange={(e) => onChangeTextOffsetX(Number(e.target.value))}
                  disabled={disabled}
                />
                <div className="param-slider-ticks">
                  <span>{t("-500px")}</span>
                  <span>{t("0 (Tengah)")}</span>
                  <span>{t("+500px")}</span>
                </div>
              </div>
            </div>

            {/* Vertical Position Y Slider */}
            <div className="param-field">
              <div className="param-field-label">
                <span>{t("Posisi Sumbu Y")}</span>
                <span className="param-field-val">
                  {textOffsetY > 0 ? t("+{p0}", {p0: textOffsetY}) : textOffsetY} {t("px")} </span>
              </div>
              <div className="param-slider-wrap">
                <input
                  type="range"
                  min={-500}
                  max={500}
                  step={1}
                  className="param-range-input"
                  value={textOffsetY}
                  onPointerDown={onSnapshotBeforeChange}
                  onChange={(e) => onChangeTextOffsetY(Number(e.target.value))}
                  disabled={disabled}
                />
                <div className="param-slider-ticks">
                  <span>{t("-500px")}</span>
                  <span>{t("0 (Tengah)")}</span>
                  <span>{t("+500px")}</span>
                </div>
              </div>
            </div>

            {/* Scale Slider (50% - 200%) */}
            <div className="param-field">
              <div className="param-field-label">
                <span>{t("Skala Tampilan (Scale)")}</span>
                <span className="param-field-val">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <div className="param-slider-wrap">
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  className="param-range-input"
                  value={scale}
                  onPointerDown={onSnapshotBeforeChange}
                  onChange={(e) => onChangeScale(Number(e.target.value))}
                  disabled={disabled}
                />
                <div className="param-slider-ticks">
                  <span>50%</span>
                  <span>{t("100% (Normal)")}</span>
                  <span>200%</span>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="param-actions-row">
              <button
                type="button"
                className="btn-reset-transform"
                onClick={onResetTransform}
                disabled={disabled || !isTransformModified}
                title={t("Kembalikan posisi X, Y ke 0px dan skala ke 100%")}
              > {t("↺ Reset Transform")} </button>
            </div>
          </div>
        )}

        {/* GROUP 4: FX & EFEK */}
        {(activeTab === 'all' || activeTab === 'fx') && (
          <div className="param-group-card">
            <div className="param-group-header">
              <span className="param-group-icon"><StudioIcon /></span>
              <h5 className="param-group-heading">{t("FX & Efek Visual")}</h5>
            </div>

            {/* Neon Glow Intensity Slider (0 - 40px) */}
            <div className="param-field">
              <div className="param-field-label">
                <span>{t("Intensitas Neon Glow")}</span>
                <span className="param-field-val">{glowIntensity} {t("px")}</span>
              </div>
              <div className="param-slider-wrap">
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={1}
                  className="param-range-input"
                  value={glowIntensity}
                  onPointerDown={onSnapshotBeforeChange}
                  onChange={(e) => onChangeGlowIntensity(Number(e.target.value))}
                  disabled={disabled}
                />
                <div className="param-slider-ticks">
                  <span>{t("0px (Off)")}</span>
                  <span>{t("15px (Default)")}</span>
                  <span>{t("40px")}</span>
                </div>
              </div>
            </div>

            {/* Speed Multiplier Slider (0.5x - 2.0x) */}
            <div className="param-field">
              <div className="param-field-label">
                <span>{t("Kecepatan Animasi (Speed)")}</span>
                <span className="param-field-val">{speedMultiplier.toFixed(1)}x</span>
              </div>
              <div className="param-slider-wrap">
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="param-range-input"
                  value={speedMultiplier}
                  onPointerDown={onSnapshotBeforeChange}
                  onChange={(e) => onChangeSpeedMultiplier(Number(e.target.value))}
                  disabled={disabled}
                />
                <div className="param-slider-ticks">
                  <span>{t("0.5x (Lambat)")}</span>
                  <span>{t("1.0x (Normal)")}</span>
                  <span>{t("2.0x (Cepat)")}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer Note */}
      <div className="param-drawer-footer">
        <span className="param-footer-sync-icon"><StudioIcon /></span>
        <span className="param-footer-text"> {t("Nilai slider otomatis hot-sync ke kanvas dan render engine.")} </span>
      </div>
    </aside>
  )
}
