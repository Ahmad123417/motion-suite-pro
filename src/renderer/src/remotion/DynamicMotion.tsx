import VibeGraphicComponent, {
  VibeGraphic,
  type VibeGraphicProps as BaseVibeProps
} from '../../../../remotion_env/src/VibeGraphic'

export type VibeGraphicProps = BaseVibeProps & {
  width?: number
  height?: number
  fps?: number
  durationInFrames?: number
  [key: string]: any
}

export type DynamicMotionProps = VibeGraphicProps

export default VibeGraphicComponent
export { VibeGraphic, VibeGraphicComponent as DynamicMotion }