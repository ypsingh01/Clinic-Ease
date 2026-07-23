import type { Transition, Variants } from 'framer-motion'

export const transitions = {
  fast: { duration: 0.12, ease: [0.2, 0.8, 0.2, 1] as const },
  normal: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] as const },
  slow: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
} satisfies Record<string, Transition>

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.normal,
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.slow,
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
}

export const pressable = {
  whileTap: { scale: 0.98 },
  transition: transitions.fast,
}
