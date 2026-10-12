import React, { useMemo } from 'react'
import { getBoundingBox, getLength } from '@remotion/paths'
import { Easing, useCurrentFrame } from 'remotion'

export type SvgStrokePath = {
  d: string
  startFrame?: number
  durationInFrames?: number
  color?: string
  strokeWidth?: number
  eraseStartFrame?: number
  eraseDurationInFrames?: number
}

export type SvgStrokeRevealProps = {
  paths: SvgStrokePath[]
  viewBox: string
  fitToPaths?: boolean
  padding?: number
  width?: number | string
  height?: number | string
  frame?: number
  startFrame?: number
  durationInFrames?: number
  color?: string
  strokeWidth?: number
  lineCap?: 'butt' | 'round' | 'square'
  lineJoin?: 'miter' | 'round' | 'bevel'
  easing?: 'linear' | 'smooth'
  style?: React.CSSProperties
}

const smooth = Easing.bezier(0.45, 0, 0.2, 1)
const validTiming = (start: number, duration: number): boolean =>
  Number.isFinite(start) && start >= 0 && Number.isFinite(duration) && duration >= 1

// The first and last frames are explicit endpoints, including a one-frame reveal.
const progressAt = (frame: number, start: number, duration: number, easing: 'linear' | 'smooth'): number => {
  const progress = duration === 1 ? (frame >= start ? 1 : 0)
    : Math.max(0, Math.min(1, (frame - start) / (duration - 1)))
  return easing === 'smooth' ? smooth(progress) : progress
}

/** Geometry stays in viewBox units. Paths draw sequentially unless given explicit starts.
 * By default the authored viewBox/whitespace is preserved. fitToPaths uses the stable
 * union of ALL full paths, including stroke caps/joins plus extra padding in geometry units.
 * An optional effective frame lets the caller apply its speed control exactly once.
 */
export const SvgStrokeReveal: React.FC<SvgStrokeRevealProps> = ({
  paths, viewBox, fitToPaths = false, padding = 0, width = '100%', height = '100%', frame: effectiveFrame,
  startFrame = 0, durationInFrames = 30, color = '#059669', strokeWidth = 4,
  lineCap = 'round', lineJoin = 'round', easing = 'smooth', style
}) => {
  const currentFrame = useCurrentFrame()
  const frame = effectiveFrame ?? currentFrame
  const geometry = useMemo(() => {
    const bounds = viewBox.trim().split(/[\s,]+/).map(Number)
    if (bounds.length !== 4 || !bounds.every(Number.isFinite) || bounds[2] <= 0 || bounds[3] <= 0 ||
      !validTiming(startFrame, durationInFrames) || !Number.isFinite(strokeWidth) || strokeWidth <= 0 ||
      !Array.isArray(paths) || paths.length > 128 || typeof fitToPaths !== 'boolean' ||
      !Number.isFinite(padding) || padding < 0) throw new Error('Invalid SVG stroke geometry or timing.')
    let nextFrame = startFrame
    const fitted = [Infinity, Infinity, -Infinity, -Infinity]
    const entries = paths.map(path => {
      if (!path) throw new Error('Invalid SVG stroke path.')
      const start = path.startFrame ?? nextFrame
      const duration = path.durationInFrames ?? durationInFrames
      const stroke = path.strokeWidth ?? strokeWidth
      const eraseDuration = path.eraseDurationInFrames ?? duration
      if (typeof path.d !== 'string' || !path.d.trim() || path.d.length > 12000 ||
        !validTiming(start, duration) || !Number.isFinite(stroke) || stroke <= 0 ||
        (path.eraseStartFrame !== undefined && !validTiming(path.eraseStartFrame, eraseDuration))) {
        throw new Error('Invalid SVG stroke path or timing.')
      }
      let length: number
      try { length = getLength(path.d) } catch { throw new Error('Invalid SVG stroke path geometry.') }
      if (!Number.isFinite(length) || length <= 0) throw new Error('Invalid SVG stroke path length.')
      if (fitToPaths) {
        let box: ReturnType<typeof getBoundingBox>
        try { box = getBoundingBox(path.d) } catch { throw new Error('Invalid SVG stroke path bounds.') }
        if (![box.x1, box.y1, box.x2, box.y2].every(Number.isFinite) || box.x2 < box.x1 || box.y2 < box.y1) {
          throw new Error('Invalid SVG stroke path bounds.')
        }
        // SVG's default miter limit is 4; its tip can extend two stroke widths.
        const margin = stroke * (lineJoin === 'miter' ? 2 : lineCap === 'square' ? Math.SQRT1_2 : 0.5) + padding
        fitted[0] = Math.min(fitted[0], box.x1 - margin)
        fitted[1] = Math.min(fitted[1], box.y1 - margin)
        fitted[2] = Math.max(fitted[2], box.x2 + margin)
        fitted[3] = Math.max(fitted[3], box.y2 + margin)
      }
      nextFrame = start + duration
      return { path, length, stroke, start, duration, eraseDuration }
    })
    const fittedBox = [fitted[0], fitted[1], fitted[2] - fitted[0], fitted[3] - fitted[1]]
    if (fitToPaths && entries.length && (!fittedBox.every(Number.isFinite) || fittedBox[2] <= 0 || fittedBox[3] <= 0)) {
      throw new Error('Invalid SVG stroke fitted viewport.')
    }
    return { entries, viewBox: fitToPaths && entries.length ? fittedBox.join(' ') : viewBox }
  }, [paths, viewBox, fitToPaths, padding, startFrame, durationInFrames, strokeWidth, lineCap, lineJoin])
  if (!Number.isFinite(frame)) throw new Error('Invalid SVG stroke frame.')
  return (
    <svg width={width} height={height} viewBox={geometry.viewBox} preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', ...style, overflow: 'hidden' }}>
      {geometry.entries.map(({ path, length, stroke, start, duration, eraseDuration }, index) => {
        const drawn = progressAt(frame, start, duration, easing)
        const erased = path.eraseStartFrame === undefined ? 0
          : progressAt(frame, path.eraseStartFrame, eraseDuration, easing)
        const visible = drawn * (1 - erased)
        return <path key={index} d={path.d} fill="none" stroke={path.color ?? color}
          strokeWidth={stroke} strokeLinecap={lineCap} strokeLinejoin={lineJoin} strokeMiterlimit={4}
          strokeDasharray={`${length} ${length}`} strokeDashoffset={length * (1 - visible)}
          // Taper only a sub-stroke-length cap to prevent a dot at a zero-length dash.
          opacity={Math.min(1, visible * length / stroke)} />
      })}
    </svg>
  )
}
