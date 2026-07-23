import { cn } from '@/lib/cn'

/** Brand mark: teal circle + ECG path (design brief). */
export function BrandMark({
  size = 64,
  className,
  pulse = false,
  id,
}: {
  size?: number
  className?: string
  pulse?: boolean
  id?: string
}) {
  return (
    <svg
      id={id}
      width={size}
      height={size}
      viewBox="0 0 72 72"
      className={cn(pulse && 'brand-mark-pulse', className)}
      aria-hidden
    >
      <circle cx="36" cy="36" r="36" fill="#0F6E56" />
      <path
        d="M14 37h9l4-11 7 20 5-13 3 4h16"
        fill="none"
        stroke="#FDFBF7"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function BrandWordmark({
  className,
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-[20px]',
  }
  return (
    <span className={cn('font-display font-medium tracking-tight', sizes[size], className)}>
      <span className="text-[#085041]">Clinic</span>
      <span className="text-accent">Ease</span>
    </span>
  )
}
