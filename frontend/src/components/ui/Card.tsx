import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { transitions } from '@/motion/variants'
import { usePrefersReducedMotion } from '@/motion/usePrefersReducedMotion'

type CardProps = {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  tint?: 'none' | 'primary' | 'accent' | 'care'
} & Omit<HTMLMotionProps<'div'>, 'children'>

const paddingMap = {
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
} as const

const tintMap = {
  none: 'bg-surface',
  primary: 'bg-primary-tint/70',
  accent: 'bg-accent-tint/70',
  care: 'bg-care',
} as const

export function Card({
  children,
  className,
  padding = 'md',
  interactive = false,
  tint = 'none',
  ...props
}: CardProps) {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <motion.div
      className={cn(
        'rounded-[var(--radius-card)] border border-border shadow-[var(--shadow-soft)]',
        tintMap[tint],
        paddingMap[padding],
        interactive &&
          'cursor-pointer transition-[border-color,box-shadow,transform] duration-[var(--duration-normal)] hover:border-primary/30 hover:shadow-[var(--shadow-lift)]',
        className,
      )}
      whileHover={
        interactive && !reduceMotion ? { y: -3, transition: transitions.fast } : undefined
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}
