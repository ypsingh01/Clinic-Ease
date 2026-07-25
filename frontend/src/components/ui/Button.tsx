import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { pressable, transitions } from '@/motion/variants'
import { usePrefersReducedMotion } from '@/motion/usePrefersReducedMotion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-white shadow-[var(--shadow-soft)] hover:brightness-[1.05] hover:shadow-[var(--shadow-lift)] active:brightness-95 focus-visible:shadow-[var(--focus-ring)]',
  secondary:
    'bg-primary-tint text-primary border border-primary/20 hover:border-primary/40 hover:bg-care active:brightness-95 focus-visible:shadow-[var(--focus-ring)]',
  ghost:
    'bg-transparent text-primary hover:bg-primary-tint/80 active:bg-primary-tint focus-visible:shadow-[var(--focus-ring)]',
  danger:
    'bg-danger-tint text-danger hover:brightness-95 focus-visible:shadow-[var(--focus-ring)]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-10 min-h-10 px-3.5 text-sm gap-1.5 rounded-[var(--radius-control)]',
  md: 'h-12 min-h-[48px] px-5 text-[15px] gap-2 rounded-[var(--radius-control)]',
  lg: 'h-13 min-h-13 px-7 text-base gap-2 rounded-[var(--radius-control)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    leftIcon,
    rightIcon,
    fullWidth,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const reduceMotion = usePrefersReducedMotion()
  const isDisabled = disabled || loading

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-medium tracking-tight select-none',
        'transition-[filter,background-color,border-color,box-shadow,transform] duration-[var(--duration-fast)]',
        'disabled:pointer-events-none disabled:opacity-45',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      whileTap={reduceMotion || isDisabled ? undefined : pressable.whileTap}
      transition={transitions.fast}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {loading ? (
        <span
          className="border-current/30 border-t-current size-4 animate-spin rounded-full border-2"
          aria-hidden
        />
      ) : (
        leftIcon
      )}
      <span className={loading ? 'opacity-80' : undefined}>{children}</span>
      {!loading && rightIcon}
    </motion.button>
  )
})
