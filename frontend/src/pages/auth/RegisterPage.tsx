import { useState, type FormEvent, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Card, FormField, Input, useToast } from '@/components/ui'
import { RecaptchaField } from '@/components/security/RecaptchaField'
import { useAuth } from '@/auth/AuthContext'
import { useI18n } from '@/i18n/I18nContext'
import { fadeUp } from '@/motion/variants'

export function RegisterPage() {
  const { register } = useAuth()
  const { t } = useI18n()
  const toast = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const onCaptcha = useCallback((token: string | null) => setCaptchaToken(token), [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ name, email, phone, password, captchaToken: captchaToken ?? 'ok' })
      toast.push({
        tone: 'info',
        title: 'Verify your phone',
        description: 'Enter OTP 123456 on the free-tier demo.',
      })
      navigate('/otp')
    } catch (err) {
      toast.push({
        tone: 'danger',
        title: 'Registration failed',
        description: err instanceof Error ? err.message : 'Try again',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
      <h1 className="font-display text-2xl font-medium tracking-tight">{t('auth.create')}</h1>
      <p className="text-text-secondary mt-2 text-sm leading-relaxed">
        Register with email and phone. We&apos;ll send a one-time code to link WhatsApp
        reminders and live ETA updates.
      </p>

      <Card className="mt-8 shadow-[var(--shadow-soft)]" padding="lg">
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <FormField label="Full name" htmlFor="reg-name">
            <Input
              id="reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </FormField>
          <FormField label="Email" htmlFor="reg-email">
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </FormField>
          <FormField label="Phone" htmlFor="reg-phone" hint="Used for OTP and WhatsApp">
            <Input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+91 …"
              autoComplete="tel"
            />
          </FormField>
          <FormField label="Password" htmlFor="reg-password">
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </FormField>
          <RecaptchaField onToken={onCaptcha} action="register" />
          <Button type="submit" fullWidth loading={loading}>
            Continue to OTP
          </Button>
        </form>
      </Card>

      <p className="text-text-secondary mt-8 text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
