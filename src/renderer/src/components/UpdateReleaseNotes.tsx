import { useUiLanguage } from '../i18n'
import type { UiLanguage } from '../../../shared/i18n'

export function normalizeUpdateVersion(value: unknown): string {
  return typeof value === 'string' && value.length <= 64 &&
    /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(value) ? value : ''
}

// Updater notes are untrusted presentation data: bounded plain text, never HTML.
export function updateNoteLines(version: string, notes: unknown, language: UiLanguage): string[] {
  if (!normalizeUpdateVersion(version)) return []
  let raw: string
  if (typeof notes === 'string') {
    raw = notes
  } else if (Array.isArray(notes) && notes.length <= 50) {
    raw = notes.filter((entry) => entry && typeof entry === 'object' &&
      normalizeUpdateVersion(entry.version) === version && typeof entry.note === 'string')
      .map((entry) => entry.note).join('\n')
  } else {
    return []
  }
  if (!raw.trim() || raw.length > 8192) return []
  const text = raw
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<h[1-6]\b[^>]*>/gi, '\n## ')
    .replace(/<\/?(?:p|div|li|ul|ol|br|h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/gi, (_, entity: string) =>
      ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[entity.toLowerCase()] || '')
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, entity: string) => {
      const code = entity[0].toLowerCase() === 'x' ? parseInt(entity.slice(1), 16) : Number(entity)
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code) : ''
    })
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\u200d\ufe0e\ufe0f]/gu, '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, '')
  let lines = text.split(/\r?\n/)
  const versionHeading = (line: string): string | undefined =>
    /^\s*(?:#{1,6}\s*)?(?:Motion Suite Pro\s+|HIGHLIGHT[^\n]*?\s+)?v?(\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?)(?:\s*[:—-].*)?\s*$/i.exec(line)?.[1]
  if (lines.some((line) => versionHeading(line))) {
    let selected = false
    lines = lines.filter((line) => {
      const heading = versionHeading(line)
      if (heading) { selected = heading === version; return false }
      return selected
    })
  }
  const languageHeading = (line: string): UiLanguage | undefined => {
    const heading = line.replace(/^\s*#{1,6}\s*/, '').trim().toLowerCase()
    if (['bahasa indonesia', 'indonesia', 'indonesian', 'id'].includes(heading)) return 'id'
    if (['english', 'en'].includes(heading)) return 'en'
    return undefined
  }
  if (lines.some((line) => languageHeading(line))) {
    let selected = false
    lines = lines.filter((line) => {
      const heading = languageHeading(line)
      if (heading) { selected = heading === language; return false }
      return selected
    })
  }
  return lines.map((line) => line
    .replace(/^\s*(?:#{1,6}\s*|[-*+•]\s*|\d+[.)]\s+)/, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*`]/g, '').trim())
    .filter(Boolean).slice(0, 12)
    .map((line) => line.length > 480 ? line.slice(0, 477) + '...' : line)
}

export function UpdateReleaseNotes({ version, notes }: { version: string; notes: unknown }): React.JSX.Element {
  const { language, t } = useUiLanguage()
  const lines = updateNoteLines(version, notes, language)
  return <section className="update-modal-notes-section" aria-label={t('update.notesTitle')}>
    <div className="update-modal-notes-label">
      <span>{t('update.notesTitle')}</span>
      {normalizeUpdateVersion(version) && <span className="update-modal-tag">v{version}</span>}
    </div>
    <div className="update-release-notes-box">
      {lines.length ? <ul className="update-release-notes-list">
        {lines.map((line, index) => <li key={index}>{line}</li>)}
      </ul> : <p className="update-release-notes-empty">{t('update.notesUnavailable')}</p>}
    </div>
  </section>
}
