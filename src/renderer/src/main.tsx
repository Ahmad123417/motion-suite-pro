import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { UiLanguageProvider } from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UiLanguageProvider><App /></UiLanguageProvider>
  </StrictMode>
)
