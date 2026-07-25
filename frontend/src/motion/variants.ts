import type { Transition, Variants } from 'framer-motion'

/** Next-level motion recipe — Framer Motion only */
export const transitions = {
  fast: { duration: 0.14, ease: [0.22, 1, 0.36, 1] as const },
  normal: { duration: 0.26, ease: [0.4, 0, 0.2, 1] as const },
  slow: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
  page: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
} satisfies Record<string, Transition>

/** Soft fade + rise — page / section enter */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.page,
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.normal,
  },
}

export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.page,
  },
}

/** Hims-inspired panel reveal */
export const reveal: Variants = {
  hidden: { opacity: 0, clipPath: 'inset(8% 0 8% 0)' },
  visible: {
    opacity: 1,
    clipPath: 'inset(0% 0 0% 0)',
    transition: transitions.slow,
  },
}

/** Booking / auth step crossfade */
export const flowStep: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    x: -12,
    transition: transitions.fast,
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
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
      staggerChildren: 0.035,
      delayChildren: 0.05,
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
  whileHover: { y: -1 },
  transition: transitions.fast,
}

/** Live token / ETA whisper — trust, not alarm */
export const livePulse: Variants = {
  idle: { opacity: 1, scale: 1 },
  pulse: {
    opacity: [1, 0.88, 1],
    scale: [1, 1.015, 1],
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
  },
}

/** @deprecated alias — prefer livePulse */
export const softPulse = livePulse
