import React from 'react'
import { registerRoot, Composition } from 'remotion'
import { MotionTemplate, MotionTemplateProps } from './MotionTemplate'
import * as DynamicMotionModule from './DynamicMotion'
import { DynamicMotionProps } from './DynamicMotion'

const FallbackComponent: React.FC = () => null

// Smart Fallback Komponen (v1.0.7)
const ResolvedDynamicMotion: React.ComponentType<any> =
  (DynamicMotionModule as any).DynamicMotion ||
  (DynamicMotionModule as any).VibeGraphic ||
  (DynamicMotionModule as any).default ||
  (Object.values(DynamicMotionModule).find((exp: any) => typeof exp === 'function') as React.ComponentType<any>) ||
  FallbackComponent

const DynamicMotionWrapper: React.FC<any> = (props) => {
  const isAlpha = Boolean(props?.isTransparent)
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
            .remotion-alpha-active > div:first-child,
            .remotion-alpha-active > [style*="position: absolute"]:first-of-type {
              background: transparent !important;
              background-color: transparent !important;
              background-image: none !important;
            }
          `}
        </style>
      )}
      <ResolvedDynamicMotion
        {...props}
        isTransparent={isAlpha}
        backgroundColor={isAlpha ? 'transparent' : props?.backgroundColor}
      />
    </div>
  )
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DynamicMotion"
        component={DynamicMotionWrapper}
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
          titleText: 'MOTION SUITE PRO',
          subtitleText: 'AI Creative Motion Graphics Workstation',
          badgeText: 'OFFICIAL RELEASE v1.0',
          accentColor: '#00f2fe',
          secondaryColor: '#7928ca',
          backgroundColor: '#0a0d14',
          isTransparent: false,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          textOffsetX: 0,
          textOffsetY: 0,
          glowIntensity: 1,
          speedMultiplier: 1,
          width: 1920,
          height: 1080,
          durationInFrames: 150,
          fps: 30
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

export const Root = RemotionRoot
export default RemotionRoot
registerRoot(RemotionRoot)
