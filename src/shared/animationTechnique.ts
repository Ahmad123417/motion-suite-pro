export type AnimationType = 'auto' | '2d' | '2.5d' | '3d'

// Enable only after isolated development and packaged-runtime verification.
export const THREE_RUNTIME_READY = true
export const ANIMATION_TYPES = [
  { value: 'auto', label: 'Otomatis (Disarankan)', help: 'AI akan membantu menentukan jenis animasi yang sesuai dengan ide Anda.' },
  { value: '2d', label: 'Animasi 2D', help: 'Untuk tulisan, ikon, dan gambar datar yang bergerak.' },
  { value: '2.5d', label: 'Animasi 2.5D', help: 'Untuk animasi yang terlihat memiliki efek kedalaman.' },
  { value: '3d', label: 'Animasi 3D', help: 'Untuk animasi berbentuk tiga dimensi yang dapat dilihat dari berbagai sudut.' }
] as const

export function isAnimationType(value: unknown): value is AnimationType {
  return ANIMATION_TYPES.some(option => option.value === value)
}

// Backend selection only; import security is checked separately by the TSX validator.
export function usesThreeSource(code: string): boolean {
  return /\bfrom\s*['"](?:three|@react-three\/fiber|\.\/primitives\/ThreeScene)['"]/.test(code)
}

// Procedural geometry/materials/math only; no loaders or realtime loops.
export const THREE_IMPORTS: Record<string, readonly string[]> = {
  './primitives/ThreeScene': ['ThreeCanvas', 'ThreeCanvasProps'],
  '@react-three/fiber': ['useThree', 'ThreeElements', 'RootState'],
  three: ['Vector2', 'Vector3', 'Vector4', 'Euler', 'Quaternion', 'Matrix3', 'Matrix4',
    'Color', 'MathUtils', 'Shape', 'Path', 'Curve', 'CatmullRomCurve3', 'CubicBezierCurve3',
    'BufferGeometry', 'BufferAttribute', 'Float32BufferAttribute', 'BoxGeometry', 'SphereGeometry',
    'CylinderGeometry', 'ConeGeometry', 'TorusGeometry', 'TorusKnotGeometry', 'PlaneGeometry',
    'CircleGeometry', 'RingGeometry', 'ExtrudeGeometry', 'LatheGeometry', 'TubeGeometry',
    'Mesh', 'Group', 'Object3D', 'PerspectiveCamera', 'OrthographicCamera',
    'MeshStandardMaterial', 'MeshPhysicalMaterial', 'MeshBasicMaterial', 'MeshLambertMaterial',
    'DoubleSide', 'FrontSide', 'BackSide', 'SRGBColorSpace', 'LinearSRGBColorSpace',
    'ACESFilmicToneMapping', 'NoToneMapping', 'PCFSoftShadowMap']
}

export function animationTechniqueInstruction(type: AnimationType, ready = THREE_RUNTIME_READY): string {
  const direction = {
    auto: 'Choose 2D, 2.5D or supported 3D to suit the brief. Honor explicit technique requests; never force 3D.',
    '2d': 'Prioritize suitable 2D SVG/HTML/frame-based motion. Do not use 3D imports.',
    '2.5d': 'Prioritize perspective, isometric construction, layering or parallax where useful. Use the 2D runtime; no 3D imports.',
    '3d': 'Use genuine 3D geometry, scenes, cameras, materials and lighting, not a pseudo-3D substitute.'
  }[type]
  const three = ready && (type === 'auto' || type === '3d')
    ? `Supported 3D authoring: named static imports only, from ${JSON.stringify(THREE_IMPORTS)}. This narrowly extends the React/Remotion import contract, not other modules. Use ThreeCanvas from './primitives/ThreeScene' (the application wrapper around @remotion/three), not raw Canvas/WebGLRenderer. Its official ThreeCanvasProps include required width/height, children, camera, gl, shadows and dpr; it handles unavailable/lost WebGL contexts. Inside it use mesh/group/geometry/material/light JSX. useThree is for scene/camera access; never useFrame, loaders, timers, requestAnimationFrame or real-time animation. Sequence inside the canvas needs layout="none". Use useCurrentFrame/useVideoConfig; shared world geometry/attachments must project to the planned visible screen bounds, not use pixel bounds as world units. Preserve transparency: gl alpha=true (wrapper default), no scene background/opaque backdrop when isTransparent. No filesystem/network modules, dynamic import/require, external model assets or shader code. Keep complexity bounded; no real-time 4K/60 FPS promise.`
    : 'Use supported 2D/2.5D and React/Remotion imports only. 3D is unavailable for this selection; discuss conflicting explicit requests instead of falsely labeling a substitute as 3D.'
  return `[ANIMATION TECHNIQUE: ${type}]\n${direction}\n${three}\nTechnique does not prescribe colors, theme, genre, materials or aesthetic. Respect style and effect constraints. Preserve the single-file TSX/export/props contract.`
}
