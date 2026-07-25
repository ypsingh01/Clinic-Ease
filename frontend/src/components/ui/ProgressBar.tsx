import { cn } from '@/lib/cn'

export function ProgressBar({
  value,
  max = 100,
  label,
  className,
}: {
  value: number
  max?: number
  label?: string
  className?: string
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('w-full', className)}>
      {label ? (
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-text-secondary">{label}</span>
          <span className="text-text-muted font-mono">{Math.round(pct)}%</span>
        </div>
      ) : null}
      <div
        className="bg-primary-tint h-1.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className="bg-primary-light h-full rounded-full transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-emphasized)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
