import { isUiLanguage, translateUi } from '../shared/i18n'
import type { UiLanguage, UiParams } from '../shared/i18n'

let language: UiLanguage = 'id'

export function setUiLanguage(value: unknown): UiLanguage {
  if (!isUiLanguage(value)) throw new Error('Unsupported UI language')
  language = value
  return language
}

// Presentation only. This module neither reads nor writes application storage.
export function uiText(key: string, params?: UiParams): string {
  return translateUi(key, language, params)
}

export function uiLocale(): 'id-ID' | 'en-US' {
  return language === 'en' ? 'en-US' : 'id-ID'
}
