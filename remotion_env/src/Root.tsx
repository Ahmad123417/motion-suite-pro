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
      defaultProps={{
        titleText: cfg.titleText,
        subtitleText: cfg.subtitleText,
        badgeText: cfg.badgeText,
        accentColor: cfg.accentColor,
        secondaryColor: cfg.secondaryColor,
        backgroundColor: cfg.backgroundColor,
        isTransparent: cfg.isTransparent ?? false,
        scale: cfg.scale ?? 1,
        textOffsetX: cfg.textOffsetX ?? 0,
        textOffsetY: cfg.textOffsetY ?? 0,
        glowIntensity: cfg.glowIntensity ?? 15,
        speedMultiplier: cfg.speedMultiplier ?? 1,
        customAssetUrl
      }}
    />
  )
}

export const Root = RemotionRoot
export default RemotionRoot
