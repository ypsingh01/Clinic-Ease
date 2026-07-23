import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

type RecaptchaStubProps = {
  onChange?: (ok: boolean) => void
  className?: string
  defaultChecked?: boolean
}

/** Frontend-only stand-in for Google reCAPTCHA until backend keys land */
export function RecaptchaStub({ onChange, className, defaultChecked = false }: RecaptchaStubProps) {
  const [checked, setChecked] = useState(defaultChecked)

  useEffect(() => {
    if (defaultChecked) onChange?.(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once for default
  }, [])

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => {
        const next = !checked
        setChecked(next)
        onChange?.(next)
      }}
      className={cn(
        'border-border bg-surface flex w-full items-center gap-3 rounded-[10px] border px-3 py-3 text-left text-sm transition-colors',
        checked ? 'border-primary/40 bg-primary-tint/40' : 'hover:border-primary/30',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded border',
          checked ? 'border-primary bg-primary text-white' : 'border-border',
        )}
      >
        {checked ? (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <path
              d="M2 6.5L4.5 9L10 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-text font-medium">I&apos;m not a robot</span>
        <span className="text-text-muted mt-0.5 block text-[11px]">
          reCAPTCHA stub · production uses Google site key
        </span>
      </span>
      <span className="text-text-muted shrink-0 text-[10px] tracking-wide uppercase">Mock</span>
    </button>
  )
}
