import { useState, type FormEvent } from 'react'
import { Banner, Button, Card, FormField, Input, StatusPill, useToast } from '@/components/ui'
import { useAdminData } from '@/admin/AdminDataContext'
import { todayISO } from '@/clinic/types'

export function AdminBookPage() {
  const { doctors, addManualBooking, manualBookings } = useAdminData()
  const toast = useToast()
  const active = doctors.filter((d) => d.active)
  const [patientName, setPatientName] = useState('')
  const [phone, setPhone] = useState('')
  const [doctorId, setDoctorId] = useState(active[0]?.id ?? '')
  const [blockStart, setBlockStart] = useState('10:00')
  const [payAtClinic, setPayAtClinic] = useState(true)
  const [note, setNote] = useState('Walk-in / phone booking')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const endHour = Number(blockStart.slice(0, 2)) + 1
    const booking = await Promise.resolve(
      addManualBooking({
        patientName,
        phone,
        doctorId,
        date: todayISO(),
        blockStart,
        blockEnd: `${String(endHour).padStart(2, '0')}:00`,
        payAtClinic,
        note,
      }),
    )
    toast.push({
      tone: 'success',
      title: `Walk-in token #${booking.token}`,
      description: 'Appended to end of queue — existing ETAs unchanged.',
    })
    setPatientName('')
    setPhone('')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-5">
        <Banner tone="accent">
          Manual bookings append to the <strong>end of the queue</strong> so existing patients keep
          their token order and ETAs.
        </Banner>
        <Card padding="lg">
          <h2 className="font-display text-xl">Create walk-in / phone booking</h2>
          <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit}>
            <FormField label="Patient name" htmlFor="pn">
              <Input
                id="pn"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Phone" htmlFor="ph">
              <Input
                id="ph"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Doctor" htmlFor="doc">
              <select
                id="doc"
                className="border-border bg-surface focus:border-primary min-h-[44px] w-full rounded-[var(--radius-control)] border px-3.5 text-[15px] focus:shadow-[var(--focus-ring)] focus:outline-none"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                {active.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Hour block start" htmlFor="bs">
              <Input
                id="bs"
                type="time"
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
              />
            </FormField>
            <FormField label="Note" htmlFor="nt">
              <Input id="nt" value={note} onChange={(e) => setNote(e.target.value)} />
            </FormField>
            <button
              type="button"
              onClick={() => setPayAtClinic((v) => !v)}
              className="border-border bg-surface flex min-h-[44px] items-center justify-between rounded-[var(--radius-control)] border px-4 text-left text-sm hover:bg-nav-hover"
            >
              <span>Pay at clinic (skip Razorpay)</span>
              <StatusPill tone={payAtClinic ? 'accent' : 'neutral'}>
                {payAtClinic ? 'On' : 'Off'}
              </StatusPill>
            </button>
            <Button type="submit">Create booking</Button>
          </form>
        </Card>
      </div>

      <Card padding="lg">
        <h2 className="font-display text-lg">Recent manual bookings</h2>
        <div className="mt-5 flex flex-col gap-3">
          {(manualBookings.length
            ? manualBookings
            : [
                {
                  id: 'demo',
                  patientName: 'Kavya (walk-in)',
                  phone: '+91 …',
                  doctorId: 'dr-mehta',
                  date: todayISO(),
                  blockStart: '10:00',
                  blockEnd: '11:00',
                  token: 10,
                  payAtClinic: true,
                  note: 'Demo',
                  createdAt: 'Earlier today',
                },
              ]
          ).map((b) => {
            const doc = doctors.find((d) => d.id === b.doctorId)
            return (
              <div
                key={b.id}
                className="border-border bg-nav-hover rounded-[var(--radius-card)] border px-4 py-3.5 shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{b.patientName}</p>
                    <p className="text-text-muted text-xs">
                      {doc?.name} · {b.blockStart}–{b.blockEnd} · Token #{b.token}
                    </p>
                  </div>
                  <StatusPill tone={b.payAtClinic ? 'warning' : 'success'}>
                    {b.payAtClinic ? 'Pay at clinic' : 'Paid'}
                  </StatusPill>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
