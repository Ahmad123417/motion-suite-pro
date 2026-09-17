const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const rawPngToIco = require('png-to-ico');
const pngToIco = rawPngToIco.default || rawPngToIco;

// Ultra-premium 512x512 SVG for Motion Studio:
// Dark squircle, layered isometric motion plates (Teal, Purple, Cyan Neon)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Dark Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0e1a" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#050811" />
    </linearGradient>

    <!-- Squircle Border Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#a855f7" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.7" />
    </linearGradient>

    <!-- Layer 1: Teal Isometric Motion Plate -->
    <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14b8a6" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>

    <!-- Layer 2: Electric Purple Isometric Motion Plate -->
    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="100%" stop-color="#6b21a8" />
    </linearGradient>

    <!-- Layer 3: Cyan Neon Isometric Motion Plate -->
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#00f2fe" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <!-- Core Glow Filter -->
    <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.25" />
      <stop offset="60%" stop-color="#8b5cf6" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Drop Shadows for floating 3D layers -->
    <filter id="layerShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.7" />
    </filter>

    <filter id="topGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#00f2fe" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Base Ambient Glow -->
  <circle cx="256" cy="256" r="220" fill="url(#ambientGlow)" />

  <!-- Outer Squircle Container -->
  <rect x="24" y="24" width="464" height="464" rx="108" ry="108" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="4.5" />

  <!-- Inner Soft Accent Ring -->
  <rect x="36" y="36" width="440" height="440" rx="96" ry="96" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="2" />

  <!-- Central Isometric Motion Composition -->
  <g transform="translate(256, 260)">

    <!-- LAYER 1 (BOTTOM - TEAL PLATE): Base Foundation -->
    <g filter="url(#layerShadow)">
      <!-- Isometric Rhombus / Ribbon Layer 1 -->
      <path d="M 0,110 L 130,45 L 0,-20 L -130,45 Z" fill="url(#tealGrad)" opacity="0.9" />
      <!-- Left side extrusion -->
      <path d="M -130,45 L 0,110 L 0,126 L -130,61 Z" fill="#065f46" />
      <!-- Right side extrusion -->
      <path d="M 0,110 L 130,45 L 130,61 L 0,126 Z" fill="#047857" />
    </g>

    <!-- LAYER 2 (MIDDLE - ELECTRIC PURPLE PLATE): Motion Flow -->
    <g filter="url(#layerShadow)" transform="translate(0, -50)">
      <!-- Isometric Rhombus / Ribbon Layer 2 -->
      <path d="M 0,90 L 115,32 L 0,-26 L -115,32 Z" fill="url(#purpleGrad)" opacity="0.95" />
      <!-- Left side extrusion -->
      <path d="M -115,32 L 0,90 L 0,104 L -115,46 Z" fill="#581c87" />
      <!-- Right side extrusion -->
      <path d="M 0,90 L 115,32 L 115,46 L 0,104 Z" fill="#7e22ce" />
    </g>

    <!-- LAYER 3 (TOP - CYAN NEON PLATE & MOTION PLAY GLYPH) -->
    <g filter="url(#layerShadow)" transform="translate(0, -100)">
      <!-- Isometric Rhombus / Ribbon Layer 3 -->
      <path d="M 0,70 L 100,20 L 0,-30 L -100,20 Z" fill="url(#cyanGrad)" />
      <!-- Left side extrusion -->
      <path d="M -100,20 L 0,70 L 0,82 L -100,32 Z" fill="#0369a1" />
      <!-- Right side extrusion -->
      <path d="M 0,70 L 100,20 L 100,32 L 0,82 Z" fill="#0284c7" />

      <!-- Top Plate Surface Specular Highlight -->
      <path d="M 0,66 L 94,19 L 0,-26 L -94,19 Z" fill="none" stroke="#e0f2fe" stroke-width="2" stroke-opacity="0.6" />

      <!-- Floating Motion Play/Studio Emblem on Top -->
      <g filter="url(#topGlow)" transform="translate(0, 18) scale(0.9)">
        <!-- Dynamic modern forward Play/Speed Chevron -->
        <path d="M -22,-36 L 28, -8 L -22, 20 Z" fill="#ffffff" />
        <path d="M 4,-26 L 38, -8 L 4, 10 Z" fill="#a5f3fc" opacity="0.8" />
      </g>
    </g>

    <!-- Motion Streaks / Neon Energy Lines (Indicating Animation Studio Speed) -->
    <line x1="-160" y1="20" x2="-80" y2="60" stroke="#00f2fe" stroke-width="3.5" stroke-linecap="round" opacity="0.75" />
    <line x1="80" y1="-80" x2="160" y2="-40" stroke="#c084fc" stroke-width="3" stroke-linecap="round" opacity="0.65" />
    <line x1="-140" y1="-30" x2="-70" y2="5" stroke="#10b981" stroke-width="3" stroke-linecap="round" opacity="0.6" />

    <!-- Sparkle Accents -->
    <circle cx="120" cy="-110" r="3.5" fill="#00f2fe" />
    <circle cx="-130" cy="100" r="2.5" fill="#10b981" />
    <circle cx="140" cy="80" r="2" fill="#c084fc" />

  </g>
</svg>`;

async function main() {
  console.log('[generate-brand-icon] Rendering official Motion Studio SVG to PNG 512x512...');
  
  const resvg512 = new Resvg(svgContent, {
    fitTo: {
      mode: 'width',
      value: 512
    }
  });

  const pngData = resvg512.render();
  const pngBuffer = pngData.asPng();

  const resourcesDir = path.resolve(__dirname, '../resources');
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
  }

  const pngPath = path.join(resourcesDir, 'icon.png');
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`[generate-brand-icon] Wrote PNG: ${pngPath} (${pngBuffer.length} bytes)`);

  console.log('[generate-brand-icon] Rendering multi-resolution PNGs (16, 32, 48, 64, 128, 256 px)...');
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const sizeBuffers = icoSizes.map((size) => {
    const r = new Resvg(svgContent, {
      fitTo: {
        mode: 'width',
        value: size
      }
    });
    return r.render().asPng();
  });

  console.log('[generate-brand-icon] Converting to multi-resolution Windows ICO...');
  const icoBuffer = await pngToIco(sizeBuffers);
  const icoPath = path.join(resourcesDir, 'icon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`[generate-brand-icon] Wrote ICO: ${icoPath} (${icoBuffer.length} bytes) with sizes [${icoSizes.join(', ')}]`);

  console.log('[generate-brand-icon] Official Motion Studio brand icon generated successfully!');
}

main().catch((err) => {
  console.error('[generate-brand-icon] Error:', err);
  process.exit(1);
});
