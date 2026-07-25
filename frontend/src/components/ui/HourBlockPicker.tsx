import { cn } from '@/lib/cn'
import { StatusPill } from './StatusPill'

export type HourBlock = {
  id: string
  /** e.g. "10:00" */
  startLabel: string
  /** e.g. "11:00" */
  endLabel: string
  capacity: number
  booked: number
  /** full | open | waitlist */
  state?: 'open' | 'full' | 'waitlist'
}

type HourBlockPickerProps = {
  blocks: HourBlock[]
  value: string | null
  onChange: (blockId: string) => void
  className?: string
}

export function HourBlockPicker({ blocks, value, onChange, className }: HourBlockPickerProps) {
  return (
    <div className={cn('grid gap-2 sm:grid-cols-2', className)} role="listbox" aria-label="Hour blocks">
      {blocks.map((block) => {
        const remaining = Math.max(0, block.capacity - block.booked)
        const state = block.state ?? (remaining === 0 ? 'full' : 'open')
        const selected = value === block.id
        const fill = block.capacity === 0 ? 0 : (block.booked / block.capacity) * 100

        return (
          <button
            key={block.id}
            type="button"
            role="option"
            aria-selected={selected}
            disabled={state === 'full'}
            onClick={() => {
              if (state === 'waitlist' || state === 'open') onChange(block.id)
            }}
            className={cn(
              'border-border bg-surface rounded-[var(--radius-card)] border p-3.5 text-left transition-[border-color,transform,background-color] duration-[var(--duration-normal)]',
              'focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none',
              selected && 'border-primary bg-primary-tint/50 shadow-[var(--shadow-soft)] ring-1 ring-primary/20',
              state === 'full' && !selected && 'cursor-not-allowed opacity-55',
              state !== 'full' && !selected && 'hover:border-primary/35 hover:-translate-y-0.5',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-[15px] font-medium">
                  {block.startLabel} – {block.endLabel}
                </p>
                <p className="text-text-secondary mt-0.5 text-xs">
                  {remaining} of {block.capacity} spots remaining
                </p>
              </div>
              {state === 'full' ? (
                <StatusPill tone="neutral">Full</StatusPill>
              ) : state === 'waitlist' ? (
                <StatusPill tone="accent">Waitlist</StatusPill>
              ) : remaining <= 3 ? (
                <StatusPill tone="warning">Few left</StatusPill>
              ) : (
                <StatusPill tone="success">Open</StatusPill>
              )}
            </div>
            <div className="bg-primary-tint mt-3 h-1 overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-320',
                  fill >= 90 ? 'bg-accent' : 'bg-primary-light',
                )}
                style={{ width: `${Math.min(100, fill)}%` }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
