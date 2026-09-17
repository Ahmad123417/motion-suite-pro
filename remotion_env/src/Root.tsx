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
        accentColor: cfg.accentColor,
        backgroundColor: cfg.backgroundColor,
        isTransparent: cfg.isTransparent ?? false,
        textOffsetX: cfg.textOffsetX ?? 0,
        textOffsetY: cfg.textOffsetY ?? 0,
        customAssetUrl
      }}
    />
  )
}

export const Root = RemotionRoot
export default RemotionRoot
