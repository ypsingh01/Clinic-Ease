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
    'bg-accent text-white shadow-none hover:brightness-105 active:brightness-95 focus-visible:shadow-[var(--focus-ring)]',
  secondary:
    'bg-primary text-white hover:brightness-110 active:brightness-95 focus-visible:shadow-[var(--focus-ring)]',
  ghost:
    'bg-transparent text-primary border border-border hover:bg-primary-tint/60 active:bg-primary-tint focus-visible:shadow-[var(--focus-ring)]',
  danger:
    'bg-danger-tint text-danger border border-transparent hover:brightness-95 focus-visible:shadow-[var(--focus-ring)]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 min-h-9 px-3 text-sm gap-1.5 rounded-[10px]',
  md: 'h-11 min-h-[44px] px-4 text-[15px] gap-2 rounded-[10px]',
  lg: 'h-12 min-h-12 px-6 text-base gap-2 rounded-[10px]',
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
        'transition-[filter,background-color,border-color,color] duration-120',
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
      <span>{children}</span>
      {!loading && rightIcon}
    </motion.button>
  )
})
