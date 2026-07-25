import { cn } from '@/lib/cn'
import { BrandLoader } from '@/components/brand/BrandLoader'

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'size-4 border-2', md: 'size-6 border-2', lg: 'size-10 border-[3px]' }
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'border-primary/25 border-t-primary inline-block animate-spin rounded-full',
        sizes[size],
        className,
      )}
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-border/40 animate-pulse rounded-[var(--radius-control)]',
        className,
      )}
      aria-hidden
    />
  )
}

/** Layout-shaped loading placeholder for lists and dashboards */
export function SkeletonBlock({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-3', className)} aria-hidden>
      <Skeleton className="h-5 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

/** Suspense / inline splash — branded loader. */
export function SplashLoader({ fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return <BrandLoader fullScreen={fullScreen} />
}
