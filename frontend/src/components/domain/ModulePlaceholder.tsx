import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, StatusPill } from '@/components/ui'
import { cn } from '@/lib/cn'

/** Polished placeholder for modules not yet built — never a blank void. */
export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  bullets,
  action,
  className,
}: {
  eyebrow: string
  title: string
  description: string
  bullets?: string[]
  action?: { label: string; to: string }
  className?: string
}) {
  return (
    <div className={cn('grid gap-4 lg:grid-cols-[1.4fr_1fr]', className)}>
      <Card padding="lg" className="relative overflow-hidden">
        <div className="bg-primary-tint/60 pointer-events-none absolute -top-16 -right-16 size-48 rounded-full blur-2xl" />
        <StatusPill tone="info">{eyebrow}</StatusPill>
        <h2 className="font-display mt-4 text-xl font-medium md:text-2xl">{title}</h2>
        <p className="text-text-secondary mt-2 max-w-lg text-sm leading-relaxed">{description}</p>
        {bullets?.length ? (
          <ul className="mt-5 space-y-2">
            {bullets.map((b) => (
              <li key={b} className="text-text flex gap-2 text-sm">
                <span className="bg-primary-light mt-1.5 size-1.5 shrink-0 rounded-full" />
                {b}
              </li>
            ))}
          </ul>
        ) : null}
        {action ? (
          <div className="mt-6">
            <Link to={action.to} className="no-underline">
              <Button>{action.label}</Button>
            </Link>
          </div>
        ) : null}
      </Card>
      <Card tint="primary" padding="lg" className="flex flex-col justify-between">
        <div>
          <p className="text-primary text-xs font-medium tracking-wide uppercase">Coming in flow</p>
          <p className="font-display mt-2 text-lg">Same visual language</p>
          <p className="text-text-secondary mt-2 text-sm leading-relaxed">
            This module will compose the design system — capacity blocks, live tokens, calm
            ETA copy — not a plain CRUD screen.
          </p>
        </div>
        <p className="text-primary mt-8 text-xs font-medium">Phase 5–7 · Product modules</p>
      </Card>
    </div>
  )
}

export function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
}) {
  return (
    <Card padding="md" className="flex items-start gap-3">
      {icon ? (
        <div className="bg-primary-tint text-primary flex size-10 shrink-0 items-center justify-center rounded-[10px]">
          {icon}
        </div>
      ) : null}
      <div>
        <p className="text-text-muted text-xs font-medium">{label}</p>
        <p className="font-display mt-1 text-xl font-medium">{value}</p>
        {hint ? <p className="text-text-secondary mt-0.5 text-xs">{hint}</p> : null}
      </div>
    </Card>
  )
}
