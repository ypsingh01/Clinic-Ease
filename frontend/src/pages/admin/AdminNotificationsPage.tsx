import { useState, type FormEvent } from 'react'
import {
  Banner,
  Button,
  Card,
  FormField,
  Input,
  StatusPill,
  Textarea,
  useToast,
} from '@/components/ui'
import { useAdminData } from '@/admin/AdminDataContext'

export function AdminNotificationsPage() {
  const { broadcasts, addBroadcast } = useAdminData()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<'all' | 'patients' | 'doctors'>('patients')

  const onSend = (e: FormEvent) => {
    e.preventDefault()
    addBroadcast({ title, body, audience })
    toast.push({
      tone: 'success',
      title: 'Broadcast sent',
      description: 'In-app + WhatsApp templates where linked (mock delivery counts).',
    })
    setTitle('')
    setBody('')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <Card padding="lg">
        <h2 className="font-display text-xl">Compose broadcast</h2>
        <p className="text-text-secondary mt-1 text-sm">
          For clinic-wide messages like doctor unavailability. Patients still get personal ETA
          updates separately.
        </p>
        <form className="mt-5 flex flex-col gap-4" onSubmit={onSend}>
          <FormField label="Title" htmlFor="bt">
            <Input id="bt" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </FormField>
          <FormField label="Message" htmlFor="bb">
            <Textarea id="bb" value={body} onChange={(e) => setBody(e.target.value)} required />
          </FormField>
          <FormField label="Audience" htmlFor="ba">
            <select
              id="ba"
              className="border-border bg-surface focus:border-primary min-h-[44px] w-full rounded-[var(--radius-control)] border px-3.5 text-[15px] focus:shadow-[var(--focus-ring)] focus:outline-none"
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof audience)}
            >
              <option value="patients">Patients</option>
              <option value="doctors">Doctors</option>
              <option value="all">Everyone</option>
            </select>
          </FormField>
          <Button type="submit">Send broadcast</Button>
        </form>
      </Card>

      <div className="flex flex-col gap-5">
        <Banner tone="info">Delivery log is mocked — wire Twilio statuses in Phase 8.</Banner>
        {broadcasts.map((b) => (
          <Card key={b.id} padding="md">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <StatusPill tone="info">{b.audience}</StatusPill>
                <h3 className="font-display mt-2 text-[15px] font-medium">{b.title}</h3>
                <p className="text-text-secondary mt-1 text-sm leading-relaxed">{b.body}</p>
              </div>
              <p className="text-text-muted text-xs">{b.sentAt}</p>
            </div>
            <p className="text-text-muted mt-3 text-xs">
              Delivered {b.delivered} · Failed {b.failed}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
