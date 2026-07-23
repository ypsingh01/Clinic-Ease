import { useEffect, useRef } from 'react'

/** Announces dynamic updates to screen readers (token/ETA changes). */
export function LiveRegion({
  message,
  politeness = 'polite',
}: {
  message: string
  politeness?: 'polite' | 'assertive'
}) {
  return (
    <div className="sr-only" role="status" aria-live={politeness} aria-atomic="true">
      {message}
    </div>
  )
}

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="bg-primary text-surface fixed top-0 left-0 z-[100] -translate-y-full rounded-br-[10px] px-4 py-3 text-sm font-medium transition-transform focus:translate-y-0"
    >
      Skip to main content
    </a>
  )
}

/** Focus trap helper for modals — focuses first focusable on mount. */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const focusable = el.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.focus()
  }, [])
  return ref
}
