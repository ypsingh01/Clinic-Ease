import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui'
import { homePathForRole, useAuth } from '@/auth/AuthContext'
import { LanguageToggle, useI18n } from '@/i18n/I18nContext'
import { cn } from '@/lib/cn'

export function MarketingNavbar() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const NAV = [
    { href: '#home', label: t('nav.home') },
    { href: '#doctors', label: t('nav.doctors') },
    { href: '#services', label: t('nav.services') },
    { href: '#about', label: t('nav.about') },
    { href: '#contact', label: t('nav.contact') },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const bookTo = isAuthenticated && user ? homePathForRole(user.role) : '/register'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-200',
        scrolled
          ? 'bg-surface/80 border-border border-b shadow-[var(--shadow-soft)] backdrop-blur-md'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[var(--content-max)] items-center justify-between gap-4 px-6 md:h-[72px] md:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-text-secondary hover:text-primary text-sm font-medium no-underline transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle className="border-border hidden items-center rounded-full border sm:flex" />
          {isAuthenticated && user ? (
            <Link to={homePathForRole(user.role)} className="no-underline">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Open portal
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="no-underline">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                {t('nav.signIn')}
              </Button>
            </Link>
          )}
          <Link to={bookTo} className="no-underline">
            <Button size="sm">{t('nav.book')}</Button>
          </Link>
          <button
            type="button"
            className="text-text border-border hover:bg-primary-tint inline-flex size-10 items-center justify-center rounded-[10px] border md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="font-display text-lg leading-none">{menuOpen ? '×' : '☰'}</span>
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div className="border-border bg-bg/95 border-t px-6 py-4 backdrop-blur md:hidden">
          <div className="flex flex-col gap-3">
            <LanguageToggle className="mb-1 flex w-fit items-center rounded-full border border-border" />
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
  )
}
