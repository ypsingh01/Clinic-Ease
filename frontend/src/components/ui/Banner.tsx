import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'info' | 'accent' | 'warning' | 'danger'

const tones: Record<Tone, string> = {
  info: 'bg-primary-tint border-primary/20 text-text',
  accent: 'bg-accent-tint border-accent/20 text-text',
  warning: 'bg-warning-tint border-warning/25 text-text',
  danger: 'bg-danger-tint border-danger/20 text-text',
}

export function Banner({
  children,
  tone = 'info',
  icon,
  action,
  className,
}: {
  children: ReactNode
  tone?: Tone
  icon?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3',
        tones[tone],
        className,
      )}
      role="status"
    >
      {icon ? <div className="shrink-0">{icon}</div> : null}
      <div className="min-w-0 flex-1 text-sm leading-snug">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
