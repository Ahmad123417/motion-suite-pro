# Motion Suite Pro

> AI-Powered Creative Motion Graphics Workstation (v1.0.0)

Motion Suite Pro is a professional desktop motion graphics suite combining Remotion (React + TypeScript) and Google Gemini AI to programmatically generate pixel-precise, studio-grade video assets, countdowns, lower thirds, HUD overlays, and broadcast graphics.

## Key Features in v1.0.0

- **Collapsible Visual Tweaker Drawer**: Full viewport right-side drawer for real-time parametric adjustments (Texts, Colors, Positions, Scale 50%-200%, Neon Glow, Speed Multiplier) with live hot-sync.
- **Undo & Revert Engine**: Instant "Revert to Initial State" and a 20-step sequential "Undo" stack to seamlessly test parameter variations.
- **Apple ProRes 4444 Alpha & MP4 Export**: Full support for physical Remotion CLI rendering with true transparent Alpha Channel or lightweight H.264 MP4.
- **AI Coding Assistant & Self-Healing**: Powered by Google Gemini Flash to generate and auto-fix programmatic TypeScript animation code.

## Build & Release

```bash
# Type check
npm run typecheck

# Build app bundle
npm run build

# Build Windows NSIS Installer (.exe)
npm run build:win
```
