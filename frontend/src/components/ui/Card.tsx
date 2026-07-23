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
  tint?: 'none' | 'primary' | 'accent'
} & Omit<HTMLMotionProps<'div'>, 'children'>

const paddingMap = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
} as const

const tintMap = {
  none: 'bg-surface',
  primary: 'bg-primary-tint/80',
  accent: 'bg-accent-tint/80',
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
        'rounded-[var(--radius-card)] border border-border',
        tintMap[tint],
        paddingMap[padding],
        interactive &&
          'cursor-pointer transition-[border-color,transform] duration-200 hover:border-primary/35',
        className,
      )}
      whileHover={
        interactive && !reduceMotion ? { y: -2, transition: transitions.fast } : undefined
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}
