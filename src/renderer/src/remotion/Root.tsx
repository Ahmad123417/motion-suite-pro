import React from 'react'
import { registerRoot, Composition } from 'remotion'
import { MotionTemplate, MotionTemplateProps } from './MotionTemplate'
import { DynamicMotion, DynamicMotionProps } from './DynamicMotion'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DynamicMotion"
        component={DynamicMotion}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        calculateMetadata={({ props }) => {
          const p = props as DynamicMotionProps
          return {
            width: p.width ?? 1920,
            height: p.height ?? 1080,
            durationInFrames: p.durationInFrames ?? 150,
            fps: Number(p.fps) || 30
          }
        }}
        defaultProps={{
          titleText: 'DYNAMIC MOTION',
          accentColor: '#00f2fe',
          backgroundColor: '#080c18',
          isTransparent: false,
          width: 1920,
          height: 1080,
          durationInFrames: 150,
          fps: 30,
          textOffsetX: 0,
          textOffsetY: 0,
          customAssetUrl: undefined
        }}
      />
      <Composition
        id="MotionTemplate"
        component={MotionTemplate}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        calculateMetadata={({ props }) => {
          const p = props as MotionTemplateProps
          return {
            width: p.width ?? 1920,
            height: p.height ?? 1080,
            durationInFrames: p.durationInFrames ?? 150,
            fps: Number(p.fps) || 30
          }
        }}
        defaultProps={{
          titleText: 'NEON PROTOCOL',
          accentColor: '#00f2fe',
          backgroundColor: '#080c18',
          isTransparent: false,
          width: 1920,
          height: 1080,
          durationInFrames: 150,
          fps: 30
        }}
      />
    </>
  )
}

registerRoot(RemotionRoot)
