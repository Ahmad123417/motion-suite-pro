export const rasioOptions = [
  '1080p FHD (1920x1080)',
  '720p HD (1280x720)',
  '1440p / 2K QHD (2560x1440)',
  '4K UHD (3840x2160)',
  'Square (1080x1080)',
  'Portrait / Reels (1080x1920)',
  'Portrait 4K (2160x3840)'
] as const

export const waktuOptions = [
  '5 Detik',
  '8 Detik',
  '15 Detik',
  '24 Detik'
] as const

export const fpsOptions = [
  '30 FPS',
  '60 FPS'
] as const

export const artStyles = [
  'Auto (Serahkan AI)',
  'Random (Acak)',
  'Glassmorphism (Frosted Glass)',
  'Neumorphism (Soft UI)',
  'Flat Design Minimalist',
  'Cyberpunk / Futuristik',
  'Corporate Premium',
  'Abstract Geometric',
  'Vaporwave / Synthwave (Retro 80s)',
  'Bauhaus / Swiss Style',
  'Y2K / 2000s Tech',
  'Pop Art / Comic Book',
  'Pastel / Kawaii Cute',
  'Dark Academia / Vintage',
  'Grungy / Street Art',
  'Holographic / Iridescent',
  'Memphis Design (80s pop)',
  'Claymorphism (3D Clay)'
] as const

export const animasiMasuk = [
  'Auto (Serahkan AI)',
  'Random (Acak)',
  'Smooth Spring (Bawaan)',
  'Bouncy / Elastis (Memantul)',
  'Slow Fade In',
  'Energetic / Cepat',
  'Glitch / Stutter Reveal',
  'Masking / Wipe Effect',
  '3D Flip / Tumble',
  'Kinetic Typography Reveal',
  'Cinematic Scale Up',
  'Minimalist Slide & Fade',
  'Elastic Snap'
] as const

export const kameraIdle = [
  'Auto (Serahkan AI)',
  'Random (Acak)',
  'Statis / Subtle Float (Bawaan)',
  'Slow Zoom In',
  'Parallax 3D Effect',
  'Rotasi Sangat Lambat',
  'Handheld Camera Shake (Subtle)',
  'Cinematic Panning (Kiri-Kanan)',
  'Orbit / Circular Motion',
  'Dolly Zoom (Vertigo Effect)',
  'Isometric Angle Drift',
  'Pulsing / Heartbeat Scale'
] as const

export const pacingOptions = [
  'Auto (Serahkan AI)',
  'Random (Acak)',
  'Smooth & Continuous (Mengalir)',
  'Snappy & Energetic (Cepat)',
  'Slow & Cinematic (Lambat)',
  'Rhythmic (Sync with Beat)',
  'Stop-Motion / Stepped (Low FPS Illusion)',
  'Ease-In Heavy (Lambat ke Cepat)',
  'Flashy & Aggressive',
  'Calm & Meditative'
] as const

export const kompleksitasOptions = [
  'Auto (Serahkan AI)',
  'Random (Acak)',
  'Medium (Professional)',
  'Sangat Minimalis / Bersih',
  'Extremely Detailed (Banyak Layer)',
  'Brutalist (Raw & Bold)',
  'Layered Paper Cut-out',
  'Abstract & Chaotic',
  'Symmetrical & Structured',
  'Micro-interactions focused'
] as const

export const tipografiOptions = [
  'Auto (Serahkan AI)',
  'Random (Acak)',
  'Modern Sans-serif (Bersih)',
  'Elegant Serif (Klasik)',
  'Monospace (Tech/Coding)',
  'Bold & Chunky (Dinamis)',
  'Kinetic / Moving Text',
  'Handwritten / Script',
  'Pixel Art / Retro Gaming',
  'Outline / Hollow Text',
  'Brutalist / Oversized',
  'Glowing / Neon Fonts'
] as const

export interface TemplateParams {
  rasio: string
  waktu: string
  fps: string
  tema: string
  artStyle: string
  animasiMasuk: string
  kameraIdle: string
  pacing: string
  kompleksitas: string
  tipografi: string
}

export const defaultTemplateParams: TemplateParams = {
  rasio: rasioOptions[0],
  waktu: waktuOptions[0],
  fps: fpsOptions[0],
  tema: '',
  artStyle: artStyles[2], // Glassmorphism
  animasiMasuk: animasiMasuk[2], // Smooth Spring
  kameraIdle: kameraIdle[2], // Statis / Subtle Float
  pacing: pacingOptions[2], // Smooth & Continuous
  kompleksitas: kompleksitasOptions[2], // Medium (Professional)
  tipografi: tipografiOptions[2] // Modern Sans-serif
}

/**
 * Meracik prompt terstruktur lengkap tanpa memanggil API (Offline Generator)
 */
export function buildOfflinePrompt(params: TemplateParams): string {
  const cleanOption = (val: string): string => {
    if (val.startsWith('Auto') || val.startsWith('Random')) return 'Modern dynamic balanced'
    return val
  }

  const parts: string[] = []

  if (params.tema.trim()) {
    parts.push(`Tema Video: "${params.tema.trim()}".`)
  } else {
    parts.push(`Tema Video: Modern High-Impact Creative Motion Graphic.`)
  }

  parts.push(`Format & Dimensi: ${params.rasio}, durasi ${params.waktu}, frame rate ${params.fps}.`)
  parts.push(`Art Style & Aesthetic: ${cleanOption(params.artStyle)}. Gunakan palet warna yang harmonis, gradien halus, dan kedalaman visual.`)
  parts.push(`Gaya Animasi Masuk (Entry): ${cleanOption(params.animasiMasuk)} menggunakan interpolasi spring dan transisi dinamis.`)
  parts.push(`Pergerakan Kamera / Idle Motion: ${cleanOption(params.kameraIdle)} agar komposisi tetap hidup dan tidak kaku di sepanjang durasi.`)
  parts.push(`Pacing & Ritme: ${cleanOption(params.pacing)} dengan timing kurva easing yang presisi.`)
  parts.push(`Tingkat Kompleksitas: ${cleanOption(params.kompleksitas)}. Tata letak rapi, elemen berlayer terorganisir.`)
  parts.push(`Tipografi: ${cleanOption(params.tipografi)} dengan kontras tinggi dan hierarki teks yang tegas.`)
  parts.push(`Pastikan menggunakan official Remotion libraries (@remotion/shapes, @remotion/paths, @remotion/noise) tanpa pustaka eksternal yang tidak didukung.`)

  return parts.join('\n\n')
}
