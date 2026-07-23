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
        'border-border bg-surface flex items-center gap-3 rounded-[12px] border px-3.5 py-3 transition-all duration-200',
        active && 'border-primary bg-primary-tint/40 ring-primary/15 ring-1',
        onClick && 'hover:border-primary/30 cursor-pointer',
        className,
      )}
    >
      <div className="bg-primary text-surface font-mono flex size-10 shrink-0 items-center justify-center rounded-[10px] text-sm font-medium">
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
