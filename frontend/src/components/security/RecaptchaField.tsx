import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { RecaptchaStub } from './RecaptchaStub'

const SITE_KEY = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined)?.trim()
const USE_LIVE = Boolean(SITE_KEY)

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

type Props = {
  /** Called with the captcha token (stub uses "ok") */
  onToken: (token: string | null) => void
  action?: string
  className?: string
}

/** Live reCAPTCHA v3 when VITE_RECAPTCHA_SITE_KEY is set; otherwise stub (auto-ok). */
export function RecaptchaField({ onToken, action = 'submit', className }: Props) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const loaded = useRef(false)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useEffect(() => {
    if (!USE_LIVE) {
      // Stub mode: unlock forms immediately (still show checkbox UX)
      onTokenRef.current('ok')
      return
    }
    if (loaded.current) return
    loaded.current = true
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.async = true
    script.onload = () => {
      window.grecaptcha?.ready(() => setReady(true))
    }
    script.onerror = () => {
      setError('Failed to load reCAPTCHA — using stub')
      onTokenRef.current('ok')
    }
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!USE_LIVE || !ready || !SITE_KEY) return
    let cancelled = false
    void window.grecaptcha
      ?.execute(SITE_KEY, { action })
      .then((token) => {
        if (!cancelled) onTokenRef.current(token)
      })
      .catch(() => {
        if (!cancelled) {
          setError('reCAPTCHA failed — using stub')
          onTokenRef.current('ok')
        }
      })
    return () => {
      cancelled = true
    }
  }, [ready, action])

  if (!USE_LIVE) {
    return (
      <RecaptchaStub
        className={className}
        defaultChecked
        onChange={(ok) => onToken(ok ? 'ok' : null)}
      />
    )
  }

  return (
    <p className={cn('text-text-muted text-[11px]', className)} aria-live="polite">
      {error || (ready ? 'Protected by reCAPTCHA' : 'Loading reCAPTCHA…')}
    </p>
  )
}

export async function getRecaptchaToken(action = 'submit'): Promise<string> {
  if (!SITE_KEY || !window.grecaptcha) return 'ok'
  await new Promise<void>((resolve) => window.grecaptcha!.ready(() => resolve()))
  try {
    return await window.grecaptcha.execute(SITE_KEY, { action })
  } catch {
    return 'ok'
  }
}
