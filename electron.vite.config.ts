import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        include: ['@remotion/bundler', '@remotion/renderer', 'remotion', 'react', 'react-dom']
      })
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    optimizeDeps: {
      include: [
        'remotion',
        '@remotion/shapes',
        '@remotion/paths',
        '@remotion/noise',
        '@remotion/google-fonts'
      ]
    },
    plugins: [react()]
  }
})
