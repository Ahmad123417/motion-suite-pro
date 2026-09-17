import { GoogleGenerativeAI } from '@google/generative-ai'
import { transformSync } from 'esbuild'

console.log('--- Testing GoogleGenerativeAI SDK & esbuild transform ---')

// 1. Check SDK import and instance initialization
const dummyKey = 'AIzaSyDummyKeyForInitializationTest12345'
const genAI = new GoogleGenerativeAI(dummyKey)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
console.log('✅ @google/generative-ai SDK initialized successfully. Model name:', model.model)

// 2. Test TSX Code syntax validation using esbuild
const sampleTsx = `
import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'

export interface DynamicMotionProps {
  titleText?: string
}

export const DynamicMotion: React.FC<DynamicMotionProps> = ({ titleText = 'TEST' }) => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  return <div style={{ width, height }}>{titleText}: {frame}</div>
}

export default DynamicMotion
`

try {
  const transformed = transformSync(sampleTsx, { loader: 'tsx', target: 'es2022' })
  console.log('✅ esbuild.transformSync passed: output JS length =', transformed.code.length)
} catch (e) {
  console.error('❌ esbuild validation failed:', e)
  process.exit(1)
}

// 3. Optional live test if environment key is provided
const liveKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '')
if (liveKey.length > 10) {
  console.log('Found GEMINI_API_KEY, testing live generation with gemini-3.6-flash...')
  const liveGenAI = new GoogleGenerativeAI(liveKey)
  const liveModel = liveGenAI.getGenerativeModel({ model: 'gemini-3.6-flash' })
  liveModel
    .generateContent('Generate a short test greeting')
    .then((res) => {
      console.log(
        '✅ Live Google Gemini API test response SUCCESS:',
        res.response.text().trim().slice(0, 80)
      )
    })
    .catch((err) => {
      console.warn('⚠️ Live call note:', err.message)
    })
} else {
  console.log(
    'ℹ️ No active process.env.GEMINI_API_KEY found (keys are managed via UI). Initialization & compilation tests passed!'
  )
}
