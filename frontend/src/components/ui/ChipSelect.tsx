import { cn } from '@/lib/cn'

export function ChipSelect({
  options,
  value,
  onChange,
  multiple = true,
  className,
}: {
  options: { id: string; label: string }[]
  value: string[]
  onChange: (next: string[]) => void
  multiple?: boolean
  className?: string
}) {
  const toggle = (id: string) => {
    if (multiple) {
      onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
      return
    }
    onChange(value.includes(id) ? [] : [id])
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="group">
      {options.map((opt) => {
        const selected = value.includes(opt.id)
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(opt.id)}
            className={cn(
              'min-h-9 rounded-full border px-3.5 text-sm transition-colors duration-120',
              'focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none',
              selected
                ? 'border-primary bg-primary-tint text-primary'
                : 'border-border bg-surface text-text-secondary hover:border-primary/30',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
