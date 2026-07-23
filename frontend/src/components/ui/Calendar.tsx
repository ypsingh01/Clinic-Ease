import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function addMonths(d: Date, n: number) {
  const x = new Date(d)
  x.setMonth(x.getMonth() + n)
  return x
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

type CalendarProps = {
  value: Date | null
  onChange: (date: Date) => void
  minDate?: Date
  /** When set, only these weekdays are selectable (e.g. doctor available days) */
  availableDays?: readonly string[]
  className?: string
}

export function Calendar({
  value,
  onChange,
  minDate,
  availableDays,
  className,
}: CalendarProps) {
  const today = startOfDay(new Date())
  const min = minDate ? startOfDay(minDate) : undefined
  const [viewMonth, setViewMonth] = useState(() => startOfDay(value ?? today))

  const monthStart = useMemo(
    () => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1),
    [viewMonth],
  )

  const days = useMemo(() => {
    const firstDow = monthStart.getDay()
    const grid: (Date | null)[] = []
    for (let i = 0; i < firstDow; i++) grid.push(null)
    const count = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
    for (let day = 1; day <= count; day++) {
      grid.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), day))
    }
    while (grid.length % 7 !== 0) grid.push(null)
    return grid
  }, [monthStart])

  const label = monthStart.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div
      className={cn(
        'border-border bg-surface w-full max-w-sm rounded-[var(--radius-card)] border p-4',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="size-9 min-h-9 px-0"
          aria-label="Previous month"
          onClick={() => setViewMonth(addMonths(monthStart, -1))}
        >
          <IconChevronLeft size={18} stroke={1.5} />
        </Button>
        <p className="font-display text-sm font-medium">{label}</p>
        <Button
          variant="ghost"
          size="sm"
          className="size-9 min-h-9 px-0"
          aria-label="Next month"
          onClick={() => setViewMonth(addMonths(monthStart, 1))}
        >
          <IconChevronRight size={18} stroke={1.5} />
        </Button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-text-muted py-1 text-center text-[11px] font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Choose date">
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const weekday = DAY_KEYS[day.getDay()]
          const dayUnavailable = availableDays
            ? !availableDays.includes(weekday)
            : false
          const disabled = (min ? day < min : false) || dayUnavailable
          const selected = value ? sameDay(day, value) : false
          const isToday = sameDay(day, today)
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onChange(startOfDay(day))}
              className={cn(
                'font-body flex aspect-square items-center justify-center rounded-[10px] text-sm transition-colors duration-120',
                'focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none',
                disabled && 'text-text-muted/40 cursor-not-allowed',
                !disabled && !selected && 'hover:bg-primary-tint text-text',
                selected && 'bg-primary text-white',
                !selected && isToday && 'ring-primary/40 ring-1 ring-inset',
              )}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
