import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

export interface Language {
  code: string
  name: string
  native: string
  rtl: boolean
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English',    native: 'English',    rtl: false },
  { code: 'ar', name: 'Arabic',     native: 'العربية',    rtl: true  },
  { code: 'ur', name: 'Urdu',       native: 'اردو',       rtl: true  },
  { code: 'fa', name: 'Farsi',      native: 'فارسی',      rtl: true  },
  { code: 'de', name: 'German',     native: 'Deutsch',    rtl: false },
  { code: 'fr', name: 'French',     native: 'Français',   rtl: false },
  { code: 'es', name: 'Spanish',    native: 'Español',    rtl: false },
  { code: 'it', name: 'Italian',    native: 'Italiano',   rtl: false },
  { code: 'pt', name: 'Portuguese', native: 'Português',  rtl: false },
  { code: 'ru', name: 'Russian',    native: 'Русский',    rtl: false },
  { code: 'zh', name: 'Chinese',    native: '中文',        rtl: false },
  { code: 'ja', name: 'Japanese',   native: '日本語',      rtl: false },
  { code: 'ko', name: 'Korean',     native: '한국어',      rtl: false },
  { code: 'hi', name: 'Hindi',      native: 'हिन्दी',     rtl: false },
  { code: 'bn', name: 'Bengali',    native: 'বাংলা',      rtl: false },
  { code: 'tr', name: 'Turkish',    native: 'Türkçe',     rtl: false },
  { code: 'pl', name: 'Polish',     native: 'Polski',     rtl: false },
  { code: 'nl', name: 'Dutch',      native: 'Nederlands', rtl: false },
  { code: 'sv', name: 'Swedish',    native: 'Svenska',    rtl: false },
  { code: 'no', name: 'Norwegian',  native: 'Norsk',      rtl: false },
  { code: 'da', name: 'Danish',     native: 'Dansk',      rtl: false },
  { code: 'ro', name: 'Romanian',   native: 'Română',     rtl: false },
  { code: 'id', name: 'Indonesian', native: 'Indonesia',  rtl: false },
  { code: 'so', name: 'Somali',     native: 'Soomaali',   rtl: false },
  { code: 'sw', name: 'Swahili',    native: 'Kiswahili',  rtl: false },
]

const cache = new Map<string, string>()

export async function myMemoryTranslate(text: string, targetLang: string): Promise<string> {
  if (!text.trim() || targetLang === 'en') return text
  const key = `${targetLang}::${text}`
  if (cache.has(key)) return cache.get(key)!
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) })
    const json = await res.json() as { responseData?: { translatedText?: string }; responseStatus?: number }
    const translated = json?.responseData?.translatedText
    if (translated && json?.responseStatus !== 403) {
      cache.set(key, translated)
      return translated
    }
  } catch {
    // network error - return original
  }
  return text
}

interface LanguageContextValue {
  lang: Language
  setLang: (code: string) => void
  translate: (text: string) => Promise<string>
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [langCode, setLangCode] = useState<string>(() => {
    try { return localStorage.getItem('cerevia_lang') ?? 'en' } catch { return 'en' }
  })

  const lang = LANGUAGES.find(l => l.code === langCode) ?? LANGUAGES[0]

  useEffect(() => {
    document.documentElement.dir = lang.rtl ? 'rtl' : 'ltr'
    document.documentElement.lang = lang.code
  }, [lang])

  const setLang = useCallback((code: string) => {
    setLangCode(code)
    try { localStorage.setItem('cerevia_lang', code) } catch {}
  }, [])

  const translate = useCallback(
    (text: string) => myMemoryTranslate(text, langCode),
    [langCode],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

/**
 * Hook: returns the translated version of an English string.
 * Shows the previous (or English) text while waiting for the API.
 */
export function useTranslate(en: string): string {
  const { lang, translate } = useLanguage()
  const [text, setText] = useState(en)
  const prevLangRef = useRef(lang.code)

  useEffect(() => {
    if (lang.code === 'en') {
      setText(en)
      return
    }
    let cancelled = false
    translate(en).then(t => { if (!cancelled) setText(t) })
    return () => { cancelled = true }
  }, [lang.code, en, translate])

  useEffect(() => {
    if (prevLangRef.current !== lang.code) {
      prevLangRef.current = lang.code
    }
  })

  return text
}

/** Inline component that auto-translates English text. */
export function T({ en }: { en: string }) {
  return <>{useTranslate(en)}</>
}
