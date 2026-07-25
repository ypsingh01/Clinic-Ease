import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Locale = 'en' | 'hi'

const STRINGS = {
  en: {
    'nav.home': 'Home',
    'nav.doctors': 'Doctors',
    'nav.services': 'Services',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.signIn': 'Sign in',
    'nav.book': 'Book appointment',
    'auth.signIn': 'Sign in',
    'auth.create': 'Create account',
    'auth.otp': 'Enter OTP',
    'lang.label': 'Language',
  },
  hi: {
    'nav.home': 'होम',
    'nav.doctors': 'डॉक्टर',
    'nav.services': 'सेवाएँ',
    'nav.about': 'हमारे बारे में',
    'nav.contact': 'संपर्क',
    'nav.signIn': 'साइन इन',
    'nav.book': 'अपॉइंटमेंट बुक करें',
    'auth.signIn': 'साइन इन',
    'auth.create': 'खाता बनाएँ',
    'auth.otp': 'OTP दर्ज करें',
    'lang.label': 'भाषा',
  },
} as const

type Key = keyof (typeof STRINGS)['en']

type I18nValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: Key) => string
}

const Ctx = createContext<I18nValue | null>(null)
const STORAGE = 'clinicease.locale'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const raw = localStorage.getItem(STORAGE)
      return raw === 'hi' ? 'hi' : 'en'
    } catch {
      return 'en'
    }
  })

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE, l)
  }, [])

  const t = useCallback((key: Key) => STRINGS[locale][key] ?? STRINGS.en[key], [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()
  return (
    <div className={className} role="group" aria-label={t('lang.label')}>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={
          locale === 'en'
            ? 'bg-primary-tint text-primary border-primary/30 rounded-[var(--radius-pill)] border px-2.5 py-1 text-[11px] font-medium max-lg:min-h-11 max-lg:min-w-11 max-lg:px-3'
            : 'text-text-secondary rounded-[var(--radius-pill)] px-2.5 py-1 text-[11px] max-lg:min-h-11 max-lg:min-w-11 max-lg:px-3'
        }
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('hi')}
        className={
          locale === 'hi'
            ? 'bg-primary-tint text-primary border-primary/30 rounded-[var(--radius-pill)] border px-2.5 py-1 text-[11px] font-medium max-lg:min-h-11 max-lg:min-w-11 max-lg:px-3'
            : 'text-text-secondary rounded-[var(--radius-pill)] px-2.5 py-1 text-[11px] max-lg:min-h-11 max-lg:min-w-11 max-lg:px-3'
        }
      >
        हिं
      </button>
    </div>
  )
}
