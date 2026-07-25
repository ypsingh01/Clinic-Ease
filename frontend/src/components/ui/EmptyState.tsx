import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  icon?: ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border bg-surface flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed px-6 py-16 text-center shadow-[var(--shadow-soft)]',
        className,
      )}
    >
      {icon ? (
        <div className="bg-primary-tint text-primary mb-4 flex size-12 items-center justify-center rounded-full">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg font-medium">{title}</h3>
      <p className="text-text-secondary mt-2 max-w-sm text-sm leading-relaxed">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
