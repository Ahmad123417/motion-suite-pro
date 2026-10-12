import React from 'react'
import * as ImportedCode from '../../../../remotion_env/src/VibeGraphic'

const FallbackComponent: React.FC = () => null

// Smart Fallback Komponen (v1.0.7):
// Cegah error <Composition component="undefined"/> dengan deteksi prioritas
const MainComponent: React.ComponentType<any> =
  (ImportedCode as any).DynamicMotion ||
  (ImportedCode as any).VibeGraphic ||
  (ImportedCode as any).default ||
  (Object.values(ImportedCode).find((exp: any) => typeof exp === 'function') as React.ComponentType<any>) ||
  FallbackComponent

export type VibeGraphicProps = {
  titleText?: string
  subtitleText?: string
  badgeText?: string
  accentColor?: string
  secondaryColor?: string
  backgroundColor?: string
  isTransparent?: boolean
  scale?: number
  offsetX?: number
  offsetY?: number
  textOffsetX?: number
  textOffsetY?: number
  glowIntensity?: number
  speedMultiplier?: number
  customAssetUrl?: string
  width?: number
  height?: number
  fps?: number
  durationInFrames?: number
  [key: string]: any
}

export type DynamicMotionProps = VibeGraphicProps

export default MainComponent
export const DynamicMotion = MainComponent
export const VibeGraphic = MainComponent