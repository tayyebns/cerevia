import { Globe } from 'lucide-react'
import { useLanguage, LANGUAGES } from '@/lib/i18n/LanguageContext'

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-1" style={{ position: 'relative' }}>
      <Globe
        className="flex-shrink-0"
        style={{ width: compact ? 13 : 14, height: compact ? 13 : 14, color: '#68B8AF' }}
      />
      <div style={{ position: 'relative' }}>
        <select
          value={lang.code}
          onChange={e => setLang(e.target.value)}
          title="Select language"
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: compact ? 11 : 12,
            fontWeight: 600,
            background: 'var(--surface-2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            paddingTop: 3,
            paddingBottom: 3,
            paddingLeft: 8,
            paddingRight: 22,
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            maxWidth: compact ? 110 : 140,
          }}
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>
              {l.native}
            </option>
          ))}
        </select>
        <span
          style={{
            position: 'absolute',
            right: 7,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 8,
            color: 'var(--text-muted)',
            pointerEvents: 'none',
            lineHeight: 1,
          }}
        >
          ▼
        </span>
      </div>
    </div>
  )
}
