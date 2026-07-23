import { useReducedMotion } from 'framer-motion'

/** Returns true when the user prefers reduced motion. */
export function usePrefersReducedMotion() {
  return useReducedMotion() ?? false
}
