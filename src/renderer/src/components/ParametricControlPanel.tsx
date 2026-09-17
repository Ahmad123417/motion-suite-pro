import React, { useState } from 'react'
import './ParametricControlPanel.css'

export interface ParametricControlPanelProps {
  titleText: string
  onChangeTitleText: (val: string) => void
  accentColor: string
  onChangeAccentColor: (val: string) => void
  backgroundColor: string
  onChangeBackgroundColor: (val: string) => void
  isTransparent: boolean
  onChangeIsTransparent: (val: boolean) => void
  textOffsetX: number
  onChangeTextOffsetX: (val: number) => void
  textOffsetY: number
  onChangeTextOffsetY: (val: number) => void
  onResetPosition: () => void
  onClose?: () => void
  isFloating?: boolean
  disabled?: boolean
}

export const ParametricControlPanel: React.FC<ParametricControlPanelProps> = ({
  titleText,
  onChangeTitleText,
  accentColor,
  onChangeAccentColor,
  backgroundColor,
  onChangeBackgroundColor,
  isTransparent,
  onChangeIsTransparent,
  textOffsetX,
  onChangeTextOffsetX,
  textOffsetY,
  onChangeTextOffsetY,
  onResetPosition,
  onClose,
  isFloating = false,
  disabled = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  return (
    <div className={`param-tweaker-card ${isFloating ? 'param-tweaker-floating' : ''}`}>
      {/* Header Bar */}
      <div className="param-tweaker-header">
        <div className="param-tweaker-title-box">
          <span className="param-tweaker-icon">🎛️</span>
          <h4 className="param-tweaker-title">
            Parametric Tweaker
            <span className="param-tweaker-live-badge">Live Hot-Sync</span>
          </h4>
        </div>
        <div className="param-tweaker-header-actions">
          {onClose ? (
            <button
              type="button"
              className="btn-param-close"
              onClick={onClose}
              title="Tutup panel (✕)"
            >
              ✕
            </button>
          ) : (
            <button
              type="button"
              className="btn-param-toggle-collapse"
              onClick={() => setIsCollapsed((prev) => !prev)}
              title={isCollapsed ? 'Buka panel kontrol' : 'Ciutkan panel kontrol'}
            >
              {isCollapsed ? '▼ Buka' : '▲ Ciutkan'}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="param-tweaker-grid">
          {/* GRUP A: Konten & Skema Warna */}
          <div className="param-tweaker-group">
            <span className="param-group-label">
              <span>🎨</span> Konten & Skema Warna
            </span>

            {/* Title Text Input */}
            <div className="param-field">
              <label className="param-field-label">
                <span>Teks Judul (titleText)</span>
                <span className="param-field-val">{titleText.length} char</span>
              </label>
              <input
                type="text"
                className="param-input-text"
                value={titleText}
                onChange={(e) => onChangeTitleText(e.target.value)}
                placeholder="Tulis judul video..."
                disabled={disabled}
              />
            </div>

            {/* Colors Picker Row */}
            <div className="param-colors-row">
              <div className="param-field">
                <label className="param-field-label">Warna Aksen</label>
                <div className="param-color-picker-box">
                  <input
                    type="color"
                    className="param-native-color-input"
                    value={accentColor.startsWith('#') && accentColor.length === 7 ? accentColor : '#00f2fe'}
                    onChange={(e) => onChangeAccentColor(e.target.value)}
                    disabled={disabled}
                    title="Pilih warna aksen"
                  />
                  <span className="param-color-hex-text">{accentColor}</span>
                </div>
              </div>

              <div className="param-field">
                <label className="param-field-label">
                  Warna Background
                  {isTransparent && <span style={{ color: '#c77dff', fontSize: '9px' }}>(Alpha)</span>}
                </label>
                <div className={`param-color-picker-box ${isTransparent ? 'disabled' : ''}`}>
                  <input
                    type="color"
                    className="param-native-color-input"
                    value={backgroundColor.startsWith('#') && backgroundColor.length === 7 ? backgroundColor : '#0a0d14'}
                    onChange={(e) => onChangeBackgroundColor(e.target.value)}
                    disabled={disabled || isTransparent}
                    title={isTransparent ? 'Latar saat ini transparan' : 'Pilih warna latar belakang'}
                  />
                  <span className="param-color-hex-text">
                    {isTransparent ? 'Transparent' : backgroundColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle Transparansi */}
            <div className="param-field">
              <label className="param-field-label">Latar Belakang (Transparansi)</label>
              <div className="param-transparency-toggle">
                <button
                  type="button"
                  className={`param-toggle-btn ${!isTransparent ? 'active' : ''}`}
                  onClick={() => onChangeIsTransparent(false)}
                  disabled={disabled}
                >
                  ⬛ Solid
                </button>
                <button
                  type="button"
                  className={`param-toggle-btn alpha ${isTransparent ? 'active alpha' : ''}`}
                  onClick={() => onChangeIsTransparent(true)}
                  disabled={disabled}
                >
                  🏁 Alpha (Transparan)
                </button>
              </div>
            </div>
          </div>

          {/* GRUP B: Kontrol Posisi Teks (Position Offset) */}
          <div className="param-tweaker-group">
            <span className="param-group-label">
              <span>📐</span> Posisi Teks (Position Offset)
            </span>

            {/* Horizontal Offset X */}
            <div className="param-field">
              <label className="param-field-label">
                <span>Sumbu X (Horizontal)</span>
                <span className="param-field-val">
                  {textOffsetX > 0 ? `+${textOffsetX}` : textOffsetX}px
                </span>
              </label>
              <div className="param-slider-wrap">
                <input
                  type="range"
                  min={-500}
                  max={500}
                  step={1}
                  className="param-range-input"
                  value={textOffsetX}
                  onChange={(e) => onChangeTextOffsetX(Number(e.target.value))}
                  disabled={disabled}
                />
                <div className="param-slider-ticks">
                  <span>-500px</span>
                  <span>0 (Center)</span>
                  <span>+500px</span>
                </div>
              </div>
            </div>

            {/* Vertical Offset Y */}
            <div className="param-field">
              <label className="param-field-label">
                <span>Sumbu Y (Vertikal)</span>
                <span className="param-field-val">
                  {textOffsetY > 0 ? `+${textOffsetY}` : textOffsetY}px
                </span>
              </label>
              <div className="param-slider-wrap">
                <input
                  type="range"
                  min={-500}
                  max={500}
                  step={1}
                  className="param-range-input"
                  value={textOffsetY}
                  onChange={(e) => onChangeTextOffsetY(Number(e.target.value))}
                  disabled={disabled}
                />
                <div className="param-slider-ticks">
                  <span>-500px</span>
                  <span>0 (Center)</span>
                  <span>+500px</span>
                </div>
              </div>
            </div>

            {/* Action Row: Reset Posisi */}
            <div className="param-pos-bottom-row">
              <button
                type="button"
                className="btn-reset-pos"
                onClick={onResetPosition}
                disabled={disabled || (textOffsetX === 0 && textOffsetY === 0)}
                title="Kembalikan offset posisi X dan Y ke titik tengah (0px)"
              >
                ↺ Reset Posisi (0, 0)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
