import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { StatusPill } from './StatusPill'

type QueueStatus = 'waiting' | 'in_progress' | 'completed' | 'no_show'

const statusTone: Record<QueueStatus, 'neutral' | 'info' | 'success' | 'danger'> = {
  waiting: 'neutral',
  in_progress: 'info',
  completed: 'success',
  no_show: 'danger',
}

const statusLabel: Record<QueueStatus, string> = {
  waiting: 'Waiting',
  in_progress: 'In progress',
  completed: 'Completed',
  no_show: 'No-show',
}

export function TokenQueueRow({
  token,
  name,
  meta,
  eta,
  status,
  active,
  actions,
  onClick,
  className,
}: {
  token: number
  name: string
  meta?: string
  eta?: string
  status: QueueStatus
  active?: boolean
  actions?: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'border-border bg-surface flex items-center gap-3.5 rounded-[var(--radius-card)] border px-4 py-3.5 shadow-[var(--shadow-soft)] transition-[border-color,box-shadow] duration-[var(--duration-normal)]',
        active && 'border-primary bg-care shadow-[var(--shadow-lift)] ring-1 ring-primary/15',
        onClick && 'hover:border-primary/30 cursor-pointer',
        className,
      )}
    >
      <div className="bg-primary text-surface font-mono flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-sm font-medium">
        #{token}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-text-muted truncate text-xs">
          {eta ? `ETA ${eta}` : null}
          {eta && meta ? ' · ' : null}
          {meta}
        </p>
      </div>
      <StatusPill tone={statusTone[status]}>{statusLabel[status]}</StatusPill>
      {actions}
    </div>
  )
}
