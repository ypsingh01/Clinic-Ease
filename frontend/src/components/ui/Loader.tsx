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
    <div className={cn('bg-border/50 animate-pulse rounded-[10px]', className)} aria-hidden />
  )
}

/** Suspense / inline splash — branded loader. */
export function SplashLoader({ fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return <BrandLoader fullScreen={fullScreen} />
}
