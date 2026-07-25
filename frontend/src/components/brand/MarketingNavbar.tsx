import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BrandMark, BrandWordmark } from '@/components/brand/BrandMark'
import { Button } from '@/components/ui'
import { homePathForRole, useAuth } from '@/auth/AuthContext'
import { LanguageToggle, useI18n } from '@/i18n/I18nContext'
import { cn } from '@/lib/cn'

function NavLinkItem({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="group text-text-secondary relative inline-flex py-1 text-sm font-medium no-underline transition-[color,text-shadow] duration-200 ease-out hover:text-primary hover:[text-shadow:0_0_18px_rgba(15,110,86,0.35)]"
    >
      {label}
      <span
        aria-hidden
        className="bg-primary absolute inset-x-0 -bottom-0.5 mx-auto h-[2px] w-0 rounded-full transition-[width] duration-200 ease-out group-hover:w-full"
      />
    </a>
  )
}

function NavActions({
  bookTo,
  compact,
  onNavigate,
}: {
  bookTo: string
  compact?: boolean
  onNavigate?: () => void
}) {
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()

  return (
    <div className={cn('flex items-center gap-2', compact && 'gap-1.5')}>
      {/* LanguageToggle kept exact — only repositioned */}
      <LanguageToggle
        className={cn(
          'border-border items-center rounded-full border',
          compact ? 'flex' : 'hidden sm:flex',
        )}
      />
      {isAuthenticated && user ? (
        <Link to={homePathForRole(user.role)} className="no-underline" onClick={onNavigate}>
          <Button variant="ghost" size="sm" className={compact ? undefined : 'hidden sm:inline-flex'}>
            Open portal
          </Button>
        </Link>
      ) : (
        <Link to="/login" className="no-underline" onClick={onNavigate}>
          <Button variant="ghost" size="sm" className={compact ? undefined : 'hidden sm:inline-flex'}>
            {t('nav.signIn')}
          </Button>
        </Link>
      )}
      <Link to={bookTo} className="no-underline" onClick={onNavigate}>
        <Button
          size="sm"
          className="shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] hover:scale-[1.02]"
        >
          {t('nav.book')}
        </Button>
      </Link>
    </div>
  )
}

export function MarketingNavbar() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [floatVisible, setFloatVisible] = useState(false)
  const lastY = useRef(0)

  const NAV = [
    { href: '#home', label: t('nav.home') },
    { href: '#doctors', label: t('nav.doctors') },
    { href: '#services', label: t('nav.services') },
    { href: '#about', label: t('nav.about') },
    { href: '#contact', label: t('nav.contact') },
  ]

  const bookTo = isAuthenticated && user ? homePathForRole(user.role) : '/register'

  useEffect(() => {
    lastY.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const goingUp = y < lastY.current
      const pastHero = y > 280
      setFloatVisible(pastHero && goingUp)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const bar = (
    <div className="mx-auto flex h-[72px] max-w-[var(--content-max)] items-center justify-between gap-4 px-6 md:px-8">
      <Link
        to="/"
        className="group inline-flex items-center gap-2.5 no-underline"
        aria-label="ClinicEase home"
      >
        <span className="inline-flex transition-transform duration-300 group-hover:scale-[1.04]">
          <BrandMark size={36} className="group-hover:brand-mark-pulse" />
        </span>
        <BrandWordmark size="sm" />
      </Link>
      <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
        {NAV.map((item) => (
          <NavLinkItem key={item.href} href={item.href} label={item.label} />
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <NavActions bookTo={bookTo} />
        <button
          type="button"
          className="text-text border-border hover:bg-primary-tint inline-flex size-10 items-center justify-center rounded-[var(--radius-control)] border md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="font-display text-lg leading-none">{menuOpen ? '×' : '☰'}</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Document-flow navbar — scrolls away (not sticky) */}
      <header className="relative z-30 bg-transparent">
        {bar}
        {menuOpen ? (
          <div className="border-border bg-bg/95 border-t px-6 py-4 backdrop-blur md:hidden">
            <div className="flex flex-col gap-3">
              <LanguageToggle className="border-border mb-1 flex w-fit items-center rounded-full border" />
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-text py-1 text-sm font-medium no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link
                to="/login"
                className="text-primary text-sm font-medium no-underline"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.signIn')}
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      {/* Smart floating pill — scroll-up only */}
      <AnimatePresence>
        {floatVisible ? (
          <motion.div
            className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-border bg-surface/80 pointer-events-auto flex max-w-[min(100%,920px)] items-center gap-4 rounded-[var(--radius-pill)] border px-3 py-2 shadow-[var(--shadow-lift)] backdrop-blur-xl md:gap-6 md:px-5">
              <Link to="/" className="shrink-0 no-underline" aria-label="ClinicEase home">
                <BrandMark size={28} />
              </Link>
              <nav className="hidden items-center gap-5 sm:flex" aria-label="Floating">
                {NAV.slice(0, 4).map((item) => (
                  <NavLinkItem key={item.href} href={item.href} label={item.label} />
                ))}
              </nav>
              <NavActions bookTo={bookTo} compact />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
