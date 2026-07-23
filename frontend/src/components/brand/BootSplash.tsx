import { useEffect, useState, type ReactNode } from 'react'
import { BrandLoader } from '@/components/brand/BrandLoader'

const BOOT_KEY = 'clinicease.boot.shown'
const BOOT_MS = 1600

/** Shows branded splash once per browser session on first app mount. */
export function BootSplash({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() => {
    try {
      return sessionStorage.getItem(BOOT_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (ready) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ms = reduce ? 200 : BOOT_MS
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(BOOT_KEY, '1')
      } catch {
        /* ignore */
      }
      setReady(true)
    }, ms)
    return () => window.clearTimeout(t)
  }, [ready])

  if (!ready) return <BrandLoader fullScreen />
  return children
}
