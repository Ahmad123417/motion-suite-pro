import React from 'react'
import { Composition, staticFile } from 'remotion'
import videoConfig from './video_config.json'
import * as ImportedCode from './VibeGraphic'

const FallbackComponent: React.FC = () => null

// Smart Fallback Komponen (v1.0.7):
// Cegah error <Composition component="undefined"/> dengan deteksi prioritas
const MainComponent: React.ComponentType<any> =
  (ImportedCode as any).DynamicMotion ||
  (ImportedCode as any).VibeGraphic ||
  (ImportedCode as any).default ||
  (Object.values(ImportedCode).find((exp: any) => typeof exp === 'function') as React.ComponentType<any>) ||
  FallbackComponent

/**
 * CompositionRootWrapper
 * Arsitektur Resmi Transparansi Remotion (WYSIWYG Alpha Channel).
 * Jika isTransparent === true:
 * Meng-override konteks background dan menetralkan HANYA elemen root terluar tanpa
 * merusak elemen di dalamnya (seperti kartu pop-art, tombol subscribe, dsb).
 */
const CompositionRootWrapper: React.FC<any> = (props) => {
  const isAlpha = Boolean(props?.isTransparent ?? (videoConfig as any).isTransparent)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (!isAlpha || !wrapperRef.current) return

    const container = wrapperRef.current
    const directRoot = container.firstElementChild as HTMLElement | null
    if (directRoot && directRoot.style) {
      directRoot.style.setProperty('background', 'transparent', 'important')
      directRoot.style.setProperty('background-color', 'transparent', 'important')
      directRoot.style.setProperty('background-image', 'none', 'important')
    }
  }, [isAlpha])

  return (
    <div
      ref={wrapperRef}
      className={`remotion-canvas-root-wrapper ${isAlpha ? 'remotion-alpha-active' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'transparent',
        backgroundColor: 'transparent'
      }}
    >
      {isAlpha && (
        <style>
          {`
            /* Netralkan HANYA direct child pertama (root AbsoluteFill) tanpa merusak elemen dalam */
            .remotion-alpha-active > div:first-child,
            .remotion-alpha-active > [style*="position: absolute"]:first-of-type {
              background: transparent !important;
              background-color: transparent !important;
              background-image: none !important;
            }

            /* Jika di dalam root AbsoluteFill ada direct backdrop pattern layar penuh */
            .remotion-alpha-active > div:first-child > div:first-child[style*="radial-gradient"],
            .remotion-alpha-active > div:first-child > div:first-child[style*="linear-gradient"] {
              background: transparent !important;
              background-image: none !important;
            }
          `}
        </style>
      )}
      <MainComponent
        {...props}
        isTransparent={isAlpha}
        backgroundColor={isAlpha ? 'transparent' : (props?.backgroundColor ?? (videoConfig as any).backgroundColor)}
      />
    </div>
  )
}

export const RemotionRoot: React.FC = () => {
  const customAssetUrl = (videoConfig as { assetPath?: string | null }).assetPath
    ? staticFile((videoConfig as { assetPath?: string | null }).assetPath!)
    : undefined

  const cfg = videoConfig as any

  return (
    <>
      <Composition
        id="VibeGraphic"
        component={CompositionRootWrapper}
        durationInFrames={videoConfig.durationInFrames || 150}
        fps={videoConfig.fps || 30}
        width={videoConfig.width || 1920}
        height={videoConfig.height || 1080}
        calculateMetadata={({ defaultProps, props }) => {
          const isAlpha = Boolean(props?.isTransparent ?? defaultProps?.isTransparent ?? videoConfig.isTransparent)
          const effectiveBg = isAlpha
            ? 'transparent'
            : (props?.backgroundColor ?? defaultProps?.backgroundColor ?? cfg.backgroundColor)
          return {
            durationInFrames: Number(props?.durationInFrames ?? videoConfig.durationInFrames) || 150,
            fps: Number(props?.fps ?? videoConfig.fps) || 30,
            width: Number(props?.width ?? videoConfig.width) || 1920,
            height: Number(props?.height ?? videoConfig.height) || 1080,
            props: {
              ...defaultProps,
              ...props,
              isTransparent: isAlpha,
              backgroundColor: effectiveBg
            }
          }
        }}
        defaultProps={{
          titleText: cfg.titleText,
          subtitleText: cfg.subtitleText,
          badgeText: cfg.badgeText,
          accentColor: cfg.accentColor,
          secondaryColor: cfg.secondaryColor,
          backgroundColor: cfg.isTransparent ? 'transparent' : cfg.backgroundColor,
          isTransparent: cfg.isTransparent ?? false,
          scale: cfg.scale ?? 1,
          offsetX: cfg.offsetX ?? cfg.textOffsetX ?? 0,
          offsetY: cfg.offsetY ?? cfg.textOffsetY ?? 0,
          textOffsetX: cfg.textOffsetX ?? cfg.offsetX ?? 0,
          textOffsetY: cfg.textOffsetY ?? cfg.offsetY ?? 0,
          glowIntensity: cfg.glowIntensity ?? 1,
          speedMultiplier: cfg.speedMultiplier ?? 1,
          customAssetUrl
        }}
      />
      <Composition
        id="DynamicMotion"
        component={CompositionRootWrapper}
        durationInFrames={videoConfig.durationInFrames || 150}
        fps={videoConfig.fps || 30}
        width={videoConfig.width || 1920}
        height={videoConfig.height || 1080}
        calculateMetadata={({ defaultProps, props }) => {
          const isAlpha = Boolean(props?.isTransparent ?? defaultProps?.isTransparent ?? videoConfig.isTransparent)
          const effectiveBg = isAlpha
            ? 'transparent'
            : (props?.backgroundColor ?? defaultProps?.backgroundColor ?? cfg.backgroundColor)
          return {
            durationInFrames: Number(props?.durationInFrames ?? videoConfig.durationInFrames) || 150,
            fps: Number(props?.fps ?? videoConfig.fps) || 30,
            width: Number(props?.width ?? videoConfig.width) || 1920,
            height: Number(props?.height ?? videoConfig.height) || 1080,
            props: {
              ...defaultProps,
              ...props,
              isTransparent: isAlpha,
              backgroundColor: effectiveBg
            }
          }
        }}
        defaultProps={{
          titleText: cfg.titleText,
          subtitleText: cfg.subtitleText,
          badgeText: cfg.badgeText,
          accentColor: cfg.accentColor,
          secondaryColor: cfg.secondaryColor,
          backgroundColor: cfg.isTransparent ? 'transparent' : cfg.backgroundColor,
          isTransparent: cfg.isTransparent ?? false,
          scale: cfg.scale ?? 1,
          offsetX: cfg.offsetX ?? cfg.textOffsetX ?? 0,
          offsetY: cfg.offsetY ?? cfg.textOffsetY ?? 0,
          textOffsetX: cfg.textOffsetX ?? cfg.offsetX ?? 0,
          textOffsetY: cfg.textOffsetY ?? cfg.offsetY ?? 0,
          glowIntensity: cfg.glowIntensity ?? 1,
          speedMultiplier: cfg.speedMultiplier ?? 1,
          customAssetUrl
        }}
      />
    </>
)
}

export const Root = RemotionRoot
export default RemotionRoot
