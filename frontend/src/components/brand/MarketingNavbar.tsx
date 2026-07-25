import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { IconMenu2, IconX } from '@tabler/icons-react'
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

const spring = { type: 'spring' as const, stiffness: 380, damping: 32, mass: 0.85 }

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

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <>
      {/* —— Mobile top bar (logo + EN + menu) — desktop unchanged below —— */}
      <header
        className="relative z-30 bg-transparent lg:hidden"
        style={{ paddingTop: 'var(--safe-top)' }}
      >
        <div className="safe-px flex h-14 items-center justify-between">
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 no-underline" aria-label="ClinicEase home">
            <BrandMark size={32} />
            <BrandWordmark size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle className="border-border flex items-center rounded-full border" />
            <button
              type="button"
              className="border-border text-text touch-target inline-flex items-center justify-center rounded-[var(--radius-control)] border bg-surface active:scale-95"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <IconMenu2 size={22} stroke={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen mobile menu */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-[70] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0.15 } : { duration: 0.22 }}
          >
            <div className="absolute inset-0 bg-bg/70 backdrop-blur-xl" aria-hidden />
            <motion.div
              className="bg-surface relative flex h-full flex-col px-6 pt-[max(1.25rem,var(--safe-top))] pb-[max(1.25rem,var(--safe-bottom))]"
              initial={reduceMotion ? { opacity: 0 } : { y: '8%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: '6%', opacity: 0 }}
              transition={reduceMotion ? { duration: 0.15 } : spring}
              role="dialog"
              aria-modal
              aria-label="Menu"
            >
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  <BrandMark size={36} />
                  <BrandWordmark size="sm" />
                </Link>
                <button
                  type="button"
                  className="border-border touch-target inline-flex items-center justify-center rounded-[var(--radius-control)] border active:scale-95"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <IconX size={22} stroke={1.5} />
                </button>
              </div>

              <nav className="mt-10 flex flex-1 flex-col gap-1" aria-label="Primary">
                {NAV.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className="font-display text-text flex min-h-14 items-center rounded-[var(--radius-control)] px-2 text-2xl font-medium no-underline active:bg-care active:text-primary"
                    onClick={() => setMenuOpen(false)}
                    initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={reduceMotion ? { duration: 0.15 } : { ...spring, delay: 0.04 * i }}
                  >
                    {item.label}
                  </motion.a>
                ))}
                <Link
                  to={isAuthenticated && user ? homePathForRole(user.role) : '/login'}
                  className="font-display text-primary mt-2 flex min-h-14 items-center px-2 text-xl font-medium no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  {isAuthenticated && user ? 'Open portal' : t('nav.signIn')}
                </Link>
              </nav>

              <div className="mt-auto space-y-4 pt-6">
                <LanguageToggle className="border-border flex w-fit items-center rounded-full border" />
                <Link to={bookTo} className="block no-underline" onClick={() => setMenuOpen(false)}>
                  <Button size="lg" fullWidth className="min-h-13 active:scale-[0.98]">
                    {t('nav.book')} appointment
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* —— Desktop document-flow navbar (locked ≥1024px) —— */}
      <header className="relative z-30 hidden bg-transparent lg:block">
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
          <nav className="flex items-center gap-8" aria-label="Primary">
            {NAV.map((item) => (
              <NavLinkItem key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
          <NavActions bookTo={bookTo} />
        </div>
      </header>

      {/* Smart floating pill — desktop / tablet scroll-up only; hide on small phones when menu owns nav */}
      <AnimatePresence>
        {floatVisible ? (
          <motion.div
            className="pointer-events-none fixed inset-x-0 top-4 z-50 hidden justify-center px-4 sm:flex"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-border bg-surface/80 pointer-events-auto flex max-w-[min(100%,920px)] items-center gap-4 rounded-[var(--radius-pill)] border px-3 py-2 shadow-[var(--shadow-lift)] backdrop-blur-xl md:gap-6 md:px-5">
              <Link to="/" className="shrink-0 no-underline" aria-label="ClinicEase home">
                <BrandMark size={28} />
              </Link>
              <nav className="hidden items-center gap-5 lg:flex" aria-label="Floating">
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
