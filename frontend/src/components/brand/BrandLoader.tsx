import { BrandMark, BrandWordmark } from './BrandMark'
import { cn } from '@/lib/cn'

/** Full-screen / panel splash matching frontend design brief. */
export function BrandLoader({
  className,
  fullScreen = true,
}: {
  className?: string
  fullScreen?: boolean
}) {
  return (
    <div
      role="status"
      aria-label="Loading ClinicEase"
      className={cn(
        'bg-bg flex flex-col items-center justify-center gap-4',
        fullScreen ? 'min-h-dvh w-full' : 'min-h-[420px] rounded-[var(--radius-card)]',
        className,
      )}
    >
      <BrandMark size={64} pulse id="loader-mark" />
      <BrandWordmark size="lg" />
      <div className="mt-2 flex gap-1.5" aria-hidden>
        <span className="bg-primary-light size-1.5 rounded-full" />
        <span className="bg-primary-light/60 size-1.5 rounded-full" />
        <span className="bg-primary-light/40 size-1.5 rounded-full" />
      </div>
    </div>
  )
}
