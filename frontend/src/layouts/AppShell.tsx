import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { IconLogout, IconMenu2, IconX, type Icon } from '@tabler/icons-react'
import { useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { Button, StatusPill } from '@/components/ui'
import { SkipLink } from '@/a11y'
import { useAuth } from '@/auth/AuthContext'
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
  title,
  subtitle,
  badge,
  children,
  dense = false,
}: {
  items: NavItem[]
  title: string
  subtitle?: string
  badge?: string
  children?: ReactNode
  dense?: boolean
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

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
        <NavItems items={items} dense={dense} onNavigate={() => setMobileOpen(false)} />
      </div>
      <div className="border-border border-t p-3">
        <div className="mb-2 px-2">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="text-text-muted truncate text-xs">{user?.email}</p>
        </div>
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
      <div className="bg-bg min-h-dvh md:grid md:grid-cols-[248px_1fr]">
        <aside
          className="border-border bg-surface/85 sticky top-0 hidden h-dvh border-r backdrop-blur-md md:block"
          aria-label="Main navigation"
        >
          {sidebar}
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="bg-overlay absolute inset-0"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="border-border bg-surface relative z-10 h-full w-[min(100%,300px)] border-r shadow-[var(--shadow-modal)]">
              <div className="flex justify-end p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-9 min-h-9 px-0"
                  aria-label="Close"
                  onClick={() => setMobileOpen(false)}
                >
                  <IconX size={18} stroke={1.5} />
                </Button>
              </div>
              {sidebar}
            </div>
          </div>
        ) : null}

        <div className="flex min-h-dvh flex-col">
          <header className="border-border bg-surface/75 sticky top-0 z-20 border-b px-4 py-3.5 backdrop-blur-md md:px-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="size-10 min-h-10 px-0 md:hidden"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <IconMenu2 size={20} stroke={1.5} />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="font-display truncate text-lg font-medium tracking-tight md:text-xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="text-text-secondary truncate text-sm">{subtitle}</p>
                ) : null}
              </div>
              <Logo markOnly className="md:hidden" />
            </div>
          </header>
          <motion.main
            id="main-content"
            className="mx-auto w-full max-w-[var(--content-max)] flex-1 px-4 py-7 md:px-8 md:py-10"
            initial="hidden"
            animate="visible"
            variants={pageEnter}
          >
            {children ?? <Outlet />}
          </motion.main>
        </div>
      </div>
    </>
  )
}
