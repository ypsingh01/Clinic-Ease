import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Card, FormField, Input, useToast } from '@/components/ui'
import { homePathForRole, useAuth } from '@/auth/AuthContext'
import { fadeUp } from '@/motion/variants'

export function OtpPage() {
  const { pendingPhone, verifyOtp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const storedPhone = sessionStorage.getItem('clinicease.pendingPhone')
  const displayPhone = pendingPhone ?? storedPhone

  if (!pendingPhone && !storedPhone && !sessionStorage.getItem('clinicease.pendingUser')) {
    return <Navigate to="/login" replace />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await verifyOtp(code)
      toast.push({
        tone: 'success',
        title: 'Phone verified',
        description: 'You are signed in.',
      })
      navigate(homePathForRole(user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
      <h1 className="font-display text-2xl font-medium">Enter OTP</h1>
      <p className="text-text-secondary mt-2 text-sm leading-relaxed">
        We sent a code to{' '}
        <span className="text-text font-medium">{displayPhone ?? 'your phone'}</span>.
        Demo free-tier code: <span className="font-mono font-medium">123456</span>
      </p>

      <Card className="mt-8" padding="lg">
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <FormField label="One-time code" htmlFor="otp-code">
            <Input
              id="otp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="font-mono tracking-[0.35em]"
              required
            />
          </FormField>
          {error ? (
            <p className="text-danger text-xs" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" fullWidth loading={loading}>
            Verify & continue
          </Button>
        </form>
      </Card>

      <p className="text-text-secondary mt-8 text-center text-sm">
        <Link to="/login" className="text-primary font-medium">
          Back to sign in
        </Link>
      </p>
    </motion.div>
  )
}
