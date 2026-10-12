import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { isUiLanguage, translateUi, translateUiMessage, UI_LANGUAGE_KEY } from '../../shared/i18n'
import type { UiLanguage, UiParams } from '../../shared/i18n'

const defaultContext = {
  language: 'id' as UiLanguage,
  setLanguage: (_language: UiLanguage): void => {},
  t: (key: string, params?: UiParams): string => translateUi(key, 'id', params),
  message: (value: string | null | undefined): string => translateUiMessage(value, 'id')
}

export const UiLanguageContext = createContext(defaultContext)

export function UiLanguageProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [language, updateLanguage] = useState<UiLanguage>(() => {
    try {
      const saved = localStorage.getItem(UI_LANGUAGE_KEY)
      return isUiLanguage(saved) ? saved : 'id'
    } catch { return 'id' }
  })
  const setLanguage = useCallback((next: UiLanguage): void => {
    if (!isUiLanguage(next)) return
    updateLanguage(next)
    try { localStorage.setItem(UI_LANGUAGE_KEY, next) } catch { /* Keep the in-memory preference. */ }
  }, [])
  useEffect(() => {
    document.documentElement.lang = language
    // Only a presentation preference is sent; no credentials, video settings or session data.
    void window.electronAPI?.setUiLanguage?.(language).catch(() => {})
  }, [language])
  const value = useMemo(() => ({
    language, setLanguage,
    t: (key: string, params?: UiParams): string => translateUi(key, language, params),
    message: (text: string | null | undefined): string => translateUiMessage(text, language)
  }), [language, setLanguage])
  return <UiLanguageContext.Provider value={value}>{children}</UiLanguageContext.Provider>
}

export const useUiLanguage = (): typeof defaultContext => useContext(UiLanguageContext)

export function StudioIcon(): React.JSX.Element {
  return <svg className="studio-icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></svg>
}
