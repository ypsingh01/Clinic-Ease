import { useState } from 'react'
import { Button, Card, FormField, Input, StatusPill, useToast } from '@/components/ui'
import { useAuth } from '@/auth/AuthContext'

export function ProfilePage() {
  const { user } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [reminders, setReminders] = useState(true)
  const [etaAlerts, setEtaAlerts] = useState(true)

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <Card padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl">Account</h2>
          <StatusPill tone={user?.whatsappLinked ? 'success' : 'warning'}>
            {user?.whatsappLinked ? 'WhatsApp linked' : 'WhatsApp pending'}
          </StatusPill>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="prof-name">
            <Input id="prof-name" value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Email" htmlFor="prof-email">
            <Input
              id="prof-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField
            className="sm:col-span-2"
            label="Phone"
            htmlFor="prof-phone"
            hint="OTP-verified for WhatsApp confirmations and live ETA updates"
          >
            <Input
              id="prof-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </FormField>
        </div>
        <Button
          className="mt-5"
          onClick={() => toast.push({ tone: 'success', title: 'Profile saved (mock)' })}
        >
          Save changes
        </Button>
      </Card>

      <Card padding="lg">
        <h2 className="font-display text-xl">Notification preferences</h2>
        <p className="text-text-secondary mt-1 text-sm">
          In-app always on. WhatsApp follows these toggles when templates are approved.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <ToggleRow
            label="24h and 1h reminders"
            checked={reminders}
            onChange={setReminders}
          />
          <ToggleRow
            label="Live ETA / queue shift alerts"
            checked={etaAlerts}
            onChange={setEtaAlerts}
          />
        </div>
      </Card>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="border-border flex min-h-[44px] items-center justify-between rounded-[12px] border px-4 text-left"
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}
        aria-hidden
      >
        <span
          className={`bg-surface absolute top-0.5 size-5 rounded-full transition-transform ${checked ? 'left-5' : 'left-0.5'}`}
        />
      </span>
    </button>
  )
}
