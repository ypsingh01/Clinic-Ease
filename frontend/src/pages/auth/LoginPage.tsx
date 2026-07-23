import { useState, type FormEvent, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Card, FormField, Input, useToast } from '@/components/ui'
import { RecaptchaField } from '@/components/security/RecaptchaField'
import { homePathForRole, useAuth } from '@/auth/AuthContext'
import type { Role } from '@/auth/types'
import { useI18n } from '@/i18n/I18nContext'
import { fadeUp } from '@/motion/variants'

const DEMO_LOGIN = import.meta.env.VITE_DEMO_LOGIN === 'true'

type Mode = 'email' | 'phone'

export function LoginPage() {
  const { login, beginPhoneLogin, enterAs } = useAuth()
  const { t } = useI18n()
  const toast = useToast()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('email')
  const [email, setEmail] = useState(DEMO_LOGIN ? 'patient@clinicease.app' : '')
  const [password, setPassword] = useState(DEMO_LOGIN ? 'demo1234' : '')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const onCaptcha = useCallback((token: string | null) => setCaptchaToken(token), [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!captchaToken) {
      setError('Complete captcha verification before continuing.')
      return
    }
    setLoading(true)
    try {
      if (mode === 'phone') {
        await beginPhoneLogin(phone)
        toast.push({
          tone: 'info',
          title: 'OTP sent',
          description: 'Enter the code sent to your phone.',
        })
        navigate('/otp')
        return
      }
      const user = await login(email, password, captchaToken)
      toast.push({ tone: 'success', title: `Welcome back, ${user.name.split(' ')[0]}` })
      navigate(homePathForRole(user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const quick = async (role: Role) => {
    try {
      await enterAs(role)
      toast.push({ tone: 'info', title: `Signed in as ${role}` })
      navigate(homePathForRole(role))
    } catch (err) {
      toast.push({
        tone: 'danger',
        title: 'Demo login failed',
        description: err instanceof Error ? err.message : 'Unavailable',
      })
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
      <h1 className="font-display text-2xl font-medium">{t('auth.signIn')}</h1>
      <p className="text-text-secondary mt-2 text-sm leading-relaxed">
        Email password or phone OTP (WhatsApp-linked).
      </p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('email')}
          className={
            mode === 'email'
              ? 'bg-primary text-surface rounded-full px-3 py-1.5 text-xs font-medium'
              : 'border-border text-text-secondary rounded-full border px-3 py-1.5 text-xs'
          }
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setMode('phone')}
          className={
            mode === 'phone'
              ? 'bg-primary text-surface rounded-full px-3 py-1.5 text-xs font-medium'
              : 'border-border text-text-secondary rounded-full border px-3 py-1.5 text-xs'
          }
        >
          Phone OTP
        </button>
      </div>

      <Card className="mt-4" padding="lg">
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {mode === 'email' ? (
            <>
              <FormField label="Email" htmlFor="login-email">
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Password" htmlFor="login-password">
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormField>
            </>
          ) : (
            <FormField
              label="Mobile number"
              htmlFor="login-phone"
              hint="We’ll send a one-time code via SMS."
            >
              <Input
                id="login-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </FormField>
          )}
          {error ? (
            <p className="text-danger text-xs" role="alert">
              {error}
            </p>
          ) : null}
          <RecaptchaField onToken={onCaptcha} action="login" />
          <Button type="submit" fullWidth loading={loading} disabled={!captchaToken}>
            {mode === 'phone' ? 'Send OTP' : t('auth.signIn')}
          </Button>
        </form>
      </Card>

      {DEMO_LOGIN ? (
        <div className="mt-6">
          <p className="text-text-muted mb-2 text-xs font-medium tracking-wide uppercase">
            Continue as
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(['patient', 'doctor', 'admin'] as Role[]).map((role) => (
              <Button key={role} variant="ghost" size="sm" onClick={() => void quick(role)}>
                {role}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-text-secondary mt-8 text-center text-sm">
        New here?{' '}
        <Link to="/register" className="text-primary font-medium">
          Create an account
        </Link>
      </p>
    </motion.div>
  )
}
