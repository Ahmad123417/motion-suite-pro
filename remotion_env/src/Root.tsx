import React from 'react'
import { Composition, staticFile } from 'remotion'
import videoConfig from './video_config.json'
import { VibeGraphic } from './VibeGraphic'

export const RemotionRoot: React.FC = () => {
  const customAssetUrl = (videoConfig as { assetPath?: string | null }).assetPath
    ? staticFile((videoConfig as { assetPath?: string | null }).assetPath!)
    : undefined

  const cfg = videoConfig as any

  return (
    <Composition
      id="VibeGraphic"
      component={VibeGraphic}
      durationInFrames={videoConfig.durationInFrames || 150}
      fps={videoConfig.fps || 30}
      width={videoConfig.width || 1920}
      height={videoConfig.height || 1080}
      calculateMetadata={({ defaultProps, props }) => {
        return {
          durationInFrames: Number(props?.durationInFrames ?? videoConfig.durationInFrames) || 150,
          fps: Number(props?.fps ?? videoConfig.fps) || 30,
          width: Number(props?.width ?? videoConfig.width) || 1920,
          height: Number(props?.height ?? videoConfig.height) || 1080,
          props: { ...defaultProps, ...props }
        }
      }}
      defaultProps={{
        titleText: cfg.titleText,
        subtitleText: cfg.subtitleText,
        badgeText: cfg.badgeText,
        accentColor: cfg.accentColor,
        secondaryColor: cfg.secondaryColor,
        backgroundColor: cfg.backgroundColor,
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
  )
}

export const Root = RemotionRoot
export default RemotionRoot
