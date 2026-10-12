import React, { useEffect, useRef, useState } from 'react'
import { ThreeCanvas as RemotionThreeCanvas } from '@remotion/three'
import type { ThreeCanvasProps } from '@remotion/three'
import { cancelRender, useRemotionEnvironment } from 'remotion'

export type { ThreeCanvasProps }
const GPU_MESSAGE = 'Grafis 3D tidak tersedia. WebGL2/GPU gagal dimulai atau konteks grafis terputus. Periksa dukungan grafis dan driver, lalu coba kembali.'

function Failure({ message }: { message: string }): React.ReactElement {
  const { isRendering } = useRemotionEnvironment()
  useEffect(() => { if (isRendering) cancelRender(new Error(message)) }, [isRendering, message])
  return <div role="alert" style={{ padding: 24, color: '#fff', background: '#31252a' }}>{message}</div>
}

class SceneBoundary extends React.Component<{ children: React.ReactNode }, { message?: string }> {
  state: { message?: string } = {}
  static getDerivedStateFromError(error: Error): { message: string } {
    return { message: /webgl|gpu|context/i.test(error.message) ? GPU_MESSAGE
      : 'Adegan 3D gagal ditampilkan. Periksa diagnostik Code Inspector sebelum mencoba kembali.' }
  }
  render(): React.ReactNode {
    return this.state.message ? <Failure message={this.state.message} /> : this.props.children
  }
}

// This trusted wrapper loads only when a composition imports it; 2D needs no WebGL.
export function ThreeCanvas(props: ThreeCanvasProps): React.ReactElement {
  const [failure, setFailure] = useState<string | null>(() => {
    if (typeof document === 'undefined') return null
    try {
      const context = document.createElement('canvas').getContext('webgl2')
      if (!context) return GPU_MESSAGE
      context.getExtension('WEBGL_lose_context')?.loseContext()
      return null
    } catch { return GPU_MESSAGE }
  })
  const cleanup = useRef<() => void>(() => {})
  useEffect(() => () => cleanup.current(), [])
  if (failure) return <Failure message={failure} />
  return <SceneBoundary><RemotionThreeCanvas {...props}
    gl={props.gl ?? { alpha: true, antialias: true }}
    // R3F mounts HTML canvas fallback children even with a working context.
    // Keep this passive; only an actual failure may cancel an export.
    fallback={<span>{GPU_MESSAGE}</span>}
    onCreated={(state) => {
      cleanup.current()
      const lost = (event: Event): void => { event.preventDefault(); setFailure(GPU_MESSAGE) }
      state.gl.domElement.addEventListener('webglcontextlost', lost)
      cleanup.current = () => state.gl.domElement.removeEventListener('webglcontextlost', lost)
      props.onCreated?.(state)
    }}
  /></SceneBoundary>
}
