import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { IconDots, IconLogout, IconX, type Icon } from '@tabler/icons-react'
import { useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { Button, StatusPill } from '@/components/ui'
import { SkipLink } from '@/a11y'
import { useAuth } from '@/auth/AuthContext'
import { LanguageToggle } from '@/i18n/I18nContext'
import { cn } from '@/lib/cn'
import { pageEnter } from '@/motion/variants'

export type NavItem = {
  to: string
  label: string
  icon: Icon
  end?: boolean
}

function NavItems({
  items,
  onNavigate,
  dense,
}: {
  items: NavItem[]
  onNavigate?: () => void
  dense?: boolean
}) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Portal">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm no-underline transition-[color,background-color] duration-[var(--duration-fast)]',
                dense && 'py-2 text-[13px]',
                isActive
                  ? 'bg-care font-semibold text-primary'
                  : 'text-text-secondary font-medium hover:bg-nav-hover hover:text-text',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} stroke={1.5} aria-hidden />
                <span>{item.label}</span>
                {isActive ? <span className="sr-only">(current)</span> : null}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

export function AppShell({
  items,
  mobileNav,
  title,
  subtitle,
  badge,
  children,
  dense = false,
}: {
  items: NavItem[]
  /** Primary bottom tabs on <1024px (4 recommended). Remaining items go under More. */
  mobileNav?: NavItem[]
  title: string
  subtitle?: string
  badge?: string
  children?: ReactNode
  dense?: boolean
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [moreOpen, setMoreOpen] = useState(false)

  const tabs = mobileNav?.length ? mobileNav : items.slice(0, 4)
  const moreItems = items.filter((i) => !tabs.some((t) => t.to === i.to))

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-border border-b px-5 py-5">
        <Logo />
        {badge ? (
          <StatusPill tone="info" className="mt-3">
            {badge}
          </StatusPill>
        ) : null}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavItems items={items} dense={dense} />
      </div>
      <div className="border-border border-t p-3">
        <div className="mb-2 px-2">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="text-text-muted truncate text-xs">{user?.email}</p>
        </div>
        <LanguageToggle className="border-border mb-2 flex w-fit items-center rounded-full border" />
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          leftIcon={<IconLogout size={16} stroke={1.5} />}
          onClick={onLogout}
        >
          Sign out
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <SkipLink />
      {/* Desktop ≥1024: side nav locked; mobile: top header + bottom tabs */}
      <div className="bg-bg min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
        <aside
          className="border-border bg-surface/85 sticky top-0 hidden h-dvh border-r backdrop-blur-md lg:block"
          aria-label="Main navigation"
        >
          {sidebar}
        </aside>

        <div className="flex min-h-dvh flex-col">
          <header
            className="border-border bg-surface/75 sticky top-0 z-20 border-b px-4 py-3.5 backdrop-blur-md lg:px-8"
            style={{ paddingTop: 'max(0.875rem, var(--safe-top))' }}
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="font-display truncate text-lg font-medium tracking-tight lg:text-xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="text-text-secondary truncate text-sm">{subtitle}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <LanguageToggle className="border-border flex items-center rounded-full border" />
                <Logo markOnly />
              </div>
            </div>
          </header>

          <motion.main
            id="main-content"
            className="mx-auto w-full max-w-[var(--content-max)] flex-1 px-4 py-6 pb-mobile-nav sm:py-7 lg:px-8 lg:py-10 lg:pb-10"
            initial="hidden"
            animate="visible"
            variants={pageEnter}
          >
            {children ?? <Outlet />}
          </motion.main>
        </div>
      </div>

      {/* Bottom navigation — mobile / tablet only */}
      <nav
        className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-0 px-1 pt-1">
          {tabs.slice(0, 4).map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-control)] px-1 text-[10px] font-medium no-underline active:scale-95',
                    isActive ? 'text-primary' : 'text-text-muted',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex size-9 items-center justify-center rounded-full',
                        isActive && 'bg-care',
                      )}
                    >
                      <Icon size={22} stroke={1.5} aria-hidden />
                    </span>
                    <span className="max-w-full truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
          <button
            type="button"
            className={cn(
              'text-text-muted flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-control)] px-1 text-[10px] font-medium active:scale-95',
              moreOpen && 'text-primary',
            )}
            aria-label="More"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen(true)}
          >
            <span className={cn('flex size-9 items-center justify-center rounded-full', moreOpen && 'bg-care')}>
              <IconDots size={22} stroke={1.5} />
            </span>
            <span>More</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {moreOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.2 }}
          >
            <button
              type="button"
              className="bg-overlay absolute inset-0"
              aria-label="Close more menu"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="border-border bg-surface absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[24px] border-t px-5 pt-3 shadow-[var(--shadow-modal)]"
              style={{ paddingBottom: 'max(1.25rem, var(--safe-bottom))' }}
              initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { type: 'spring', stiffness: 380, damping: 34 }
              }
              role="dialog"
              aria-modal
              aria-label="More"
            >
              <div className="bg-border mx-auto mb-4 h-1 w-10 rounded-full" aria-hidden />
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-base font-medium">More</p>
                <button
                  type="button"
                  className="touch-target border-border inline-flex items-center justify-center rounded-[var(--radius-control)] border"
                  aria-label="Close"
                  onClick={() => setMoreOpen(false)}
                >
                  <IconX size={18} stroke={1.5} />
                </button>
              </div>
              <div className="mb-2 px-1">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="text-text-muted truncate text-xs">{user?.email}</p>
              </div>
              <LanguageToggle className="border-border mb-3 flex w-fit items-center rounded-full border" />
              <nav className="flex flex-col gap-0.5" aria-label="More navigation">
                {moreItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex min-h-12 items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm no-underline',
                          isActive
                            ? 'bg-care font-semibold text-primary'
                            : 'text-text-secondary font-medium active:bg-nav-hover',
                        )
                      }
                    >
                      <Icon size={20} stroke={1.5} />
                      {item.label}
                    </NavLink>
                  )
                })}
              </nav>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="mt-4 min-h-12"
                leftIcon={<IconLogout size={16} stroke={1.5} />}
                onClick={() => {
                  setMoreOpen(false)
                  onLogout()
                }}
              >
                Sign out
              </Button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
