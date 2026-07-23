import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IconArrowLeft, IconLock } from '@tabler/icons-react'
import {
  Banner,
  Button,
  Calendar,
  Card,
  FormField,
  HourBlockPicker,
  ProgressBar,
  StatusPill,
  Textarea,
  useToast,
} from '@/components/ui'
import { useAuth } from '@/auth/AuthContext'
import { usePatientData } from '@/patient/PatientDataContext'
import { todayISO } from '@/clinic/types'
import { fadeUp } from '@/motion/variants'

const HOLD_SECONDS = 5 * 60

type Step = 'schedule' | 'intake' | 'hold' | 'pay' | 'done'

function toISODate(d: Date) {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  return x.toISOString().slice(0, 10)
}

export function BookPage() {
  const { doctorId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { dependents, confirmBooking, joinWaitlist, getBlocks, getDoctor, doctors, rescheduleAppointment } =
    usePatientData()

  const doctor = doctorId ? getDoctor(doctorId) : undefined
  const rescheduleId = params.get('reschedule')
  const claimDate = params.get('date')
  const claimBlock = params.get('block')
  const isClaim = params.get('claim') === '1'

  const [step, setStep] = useState<Step>(() => (isClaim ? 'pay' : 'schedule'))
  const [date, setDate] = useState<Date | null>(() => {
    if (claimDate) return new Date(claimDate + 'T12:00:00')
    return new Date()
  })
  const [blockId, setBlockId] = useState<string | null>(
    claimBlock ? `block-${claimBlock}` : null,
  )
  const [dependentId, setDependentId] = useState<string | null>(
    params.get('dependent') || null,
  )
  const [intake, setIntake] = useState('')
  const [holdLeft, setHoldLeft] = useState(HOLD_SECONDS)
  const [paying, setPaying] = useState(false)
  const [confirmedToken, setConfirmedToken] = useState<number | null>(null)

  const dateISO = date ? toISODate(date) : todayISO()

  const [blocks, setBlocks] = useState<
    {
      id: string
      startLabel: string
      endLabel: string
      capacity: number
      booked: number
      state: 'open' | 'full' | 'waitlist'
    }[]
  >([])

  useEffect(() => {
    if (!doctor) {
      setBlocks([])
      return
    }
    let cancelled = false
    const load = () => {
      const next = getBlocks(doctor.id, dateISO)
      if (!cancelled) setBlocks(next)
      // Re-poll shortly for API cache fill
      window.setTimeout(() => {
        if (cancelled) return
        setBlocks(getBlocks(doctor.id, dateISO))
      }, 400)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [doctor, dateISO, getBlocks])

  const selectedBlock = blocks.find((b) => b.id === blockId)

  const nextToken = useMemo(() => {
    if (!selectedBlock) return 1
    return selectedBlock.booked + 1
  }, [selectedBlock])

  useEffect(() => {
    if (isClaim) return
    setBlockId(null)
  }, [dateISO, doctorId, isClaim])

  useEffect(() => {
    if (!isClaim || !claimBlock) return
    setBlockId(`block-${claimBlock}`)
    setHoldLeft(HOLD_SECONDS)
  }, [isClaim, claimBlock])

  useEffect(() => {
    if (step !== 'hold' && step !== 'pay') return
    if (holdLeft <= 0) {
      toast.push({
        tone: 'warning',
        title: 'Hold expired',
        description: 'Your temporary token was released. Pick a block again.',
      })
      setStep('schedule')
      setHoldLeft(HOLD_SECONDS)
      return
    }
    const t = window.setTimeout(() => setHoldLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [step, holdLeft, toast])

  if (!doctorId) {
    return (
      <div className="flex flex-col gap-4">
        <Banner tone="info">Choose a doctor to start booking into an hour block.</Banner>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {doctors
            .filter((d) => d.active)
            .map((d) => (
              <Link key={d.id} to={`/patient/book/${d.id}`} className="no-underline">
                <Card interactive padding="md">
                  <div className="flex items-center gap-3">
                    <img
                      src={d.photoUrl}
                      alt=""
                      className="size-10 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-display font-medium text-[#2C2C2A]">{d.name}</p>
                      <p className="text-primary text-sm">{d.specialty}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      </div>
    )
  }

  if (!doctor) return <Navigate to="/patient/book" replace />

  const forName =
    dependentId != null
      ? dependents.find((d) => d.id === dependentId)?.name ?? user?.name ?? 'Patient'
      : user?.name ?? 'Patient'

  const holdPct = (holdLeft / HOLD_SECONDS) * 100
  const holdLabel = `${Math.floor(holdLeft / 60)}:${String(holdLeft % 60).padStart(2, '0')}`

  const onSelectBlock = (id: string) => {
    const block = blocks.find((b) => b.id === id)
    if (!block) return
    if (block.state === 'waitlist') {
      joinWaitlist({
        doctorId: doctor.id,
        date: dateISO,
        blockStart: block.startLabel,
        blockEnd: block.endLabel,
      })
      toast.push({
        tone: 'info',
        title: 'Joined waitlist',
        description: 'We’ll notify you if a spot opens. Check Waitlist for claims.',
      })
      navigate('/patient/waitlist')
      return
    }
    if (block.state === 'full') return
    setBlockId(id)
  }

  const startHold = () => {
    if (!selectedBlock || selectedBlock.state !== 'open') return
    setHoldLeft(HOLD_SECONDS)
    setStep('hold')
  }

  const pay = async () => {
    setPaying(true)
    try {
      if (rescheduleId) {
        const result = await Promise.resolve(
          rescheduleAppointment(rescheduleId, {
            date: dateISO,
            blockStart: selectedBlock!.startLabel,
            blockEnd: selectedBlock!.endLabel,
            token: nextToken,
          }),
        )
        if (!result.ok) {
          toast.push({
            tone: 'danger',
            title: 'Reschedule failed',
            description: result.reason,
          })
          return
        }
        setConfirmedToken(nextToken)
        setStep('done')
        toast.push({
          tone: 'success',
          title: 'Visit rescheduled',
          description: `New token #${nextToken}`,
        })
        return
      }
      const apt = await Promise.resolve(
        confirmBooking({
          doctorId: doctor.id,
          date: dateISO,
          blockStart: selectedBlock!.startLabel,
          blockEnd: selectedBlock!.endLabel,
          token: nextToken,
          dependentId,
          forName,
          intake: intake.trim() || 'No additional notes.',
        }),
      )
      setConfirmedToken(apt.token)
      setStep('done')
      toast.push({
        tone: 'success',
        title: 'Payment successful',
        description: `Token #${apt.token} confirmed · ETA ${apt.etaStart}–${apt.etaEnd}`,
      })
    } catch (e) {
      toast.push({
        tone: 'danger',
        title: 'Booking failed',
        description: e instanceof Error ? e.message : 'Try again',
      })
    } finally {
      setPaying(false)
    }
  }

  const steps: Step[] = ['schedule', 'intake', 'hold', 'pay', 'done']
  const stepIndex = steps.indexOf(step)

  return (
    <motion.div
      className="mx-auto flex max-w-4xl flex-col gap-6"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/patient/doctors"
          className="text-text-secondary hover:text-primary inline-flex items-center gap-1 text-sm no-underline"
        >
          <IconArrowLeft size={16} stroke={1.5} /> Doctors
        </Link>
        <StatusPill tone="info">
          {doctor.name} · ₹{doctor.feeInr}
        </StatusPill>
      </div>

      {rescheduleId ? (
        <Banner tone="warning">Rescheduling visit — pick a new block, then confirm payment.</Banner>
      ) : null}
      {isClaim ? (
        <Banner tone="accent">Waitlist claim — complete payment to lock this hour block.</Banner>
      ) : null}

      <div className="flex gap-2">
        {['Schedule', 'Intake', 'Hold', 'Pay'].map((label, i) => (
          <div
            key={label}
            className={`h-1.5 flex-1 rounded-full ${i <= Math.min(stepIndex, 3) ? 'bg-primary-light' : 'bg-border'}`}
          />
        ))}
      </div>

      {step === 'schedule' ? (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Calendar
            value={date}
            onChange={setDate}
            minDate={new Date()}
            availableDays={doctor.availableDays}
          />
          <div className="flex flex-col gap-4">
            <Card padding="md">
              <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                Booking for
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDependentId(null)}
                  className={
                    dependentId == null
                      ? 'bg-primary text-surface rounded-full px-3 py-1.5 text-sm'
                      : 'border-border rounded-full border px-3 py-1.5 text-sm'
                  }
                >
                  Myself
                </button>
                {dependents.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDependentId(d.id)}
                    className={
                      dependentId === d.id
                        ? 'bg-primary text-surface rounded-full px-3 py-1.5 text-sm'
                        : 'border-border rounded-full border px-3 py-1.5 text-sm'
                    }
                  >
                    {d.name} · {d.relation}
                  </button>
                ))}
              </div>
            </Card>
            <div>
              <h3 className="font-display mb-3 text-lg">Hour blocks</h3>
              <p className="text-text-muted mb-3 text-xs">
                Capacity updates live across patient, doctor, and admin views.
              </p>
              <HourBlockPicker blocks={blocks} value={blockId} onChange={onSelectBlock} />
            </div>
            <Button
              disabled={!selectedBlock || selectedBlock.state !== 'open'}
              onClick={() => setStep('intake')}
            >
              Continue to intake
            </Button>
          </div>
        </div>
      ) : null}

      {step === 'intake' ? (
        <Card padding="lg">
          <h3 className="font-display text-xl">Pre-visit intake</h3>
          <p className="text-text-secondary mt-1 text-sm">
            Shared with {doctor.name} before your consult. Keep it brief.
          </p>
          <FormField
            className="mt-5"
            label="What should the doctor know?"
            htmlFor="intake"
            hint="Symptoms, duration, allergies — guidance for the visit, not a diagnosis form."
          >
            <Textarea
              id="intake"
              value={intake}
              onChange={(e) => setIntake(e.target.value)}
              placeholder="e.g. Mild fever for 2 days, no known allergies…"
            />
          </FormField>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setStep('schedule')}>
              Back
            </Button>
            <Button onClick={startHold}>Hold token & continue</Button>
          </div>
        </Card>
      ) : null}

      {step === 'hold' || step === 'pay' ? (
        <Card padding="lg">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <StatusPill tone="warning" icon={<IconLock size={14} />}>
                Token held · {holdLabel}
              </StatusPill>
              <h3 className="font-display mt-3 text-xl">Token #{nextToken}</h3>
              <p className="text-text-secondary mt-1 text-sm">
                {forName} · {dateISO} · {selectedBlock?.startLabel}–{selectedBlock?.endLabel}
              </p>
              <p className="text-text-muted mt-2 text-xs">
                Estimated window calculated at confirm · estimate, not a guarantee
              </p>
            </div>
            <StatusPill tone="accent">₹{doctor.feeInr}</StatusPill>
          </div>
          <ProgressBar className="mt-6" value={holdPct} max={100} label="Hold remaining" />
          {step === 'hold' ? (
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setStep('intake')}>
                Back
              </Button>
              <Button onClick={() => setStep('pay')}>Continue to payment</Button>
            </div>
          ) : (
            <div className="border-border mt-6 rounded-[12px] border bg-[#F7F5F0] p-4">
              <p className="font-display text-sm font-medium">Razorpay checkout (sandbox mock)</p>
              <p className="text-text-secondary mt-1 text-xs leading-relaxed">
                Order created server-side in production. Webhook confirms payment before the
                token becomes permanent.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => setStep('hold')}>
                  Back
                </Button>
                <Button loading={paying} onClick={pay}>
                  Confirm & pay ₹{doctor.feeInr}
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : null}

      {step === 'done' ? (
        <Card padding="lg" tint="primary">
          <StatusPill tone="success">Confirmed</StatusPill>
          <h3 className="font-display mt-3 text-2xl">
            You&apos;re booked — token #{confirmedToken ?? nextToken}
          </h3>
          <p className="text-text-secondary mt-2 text-sm leading-relaxed">
            Confirmation sent in-app and WhatsApp. Watch the live queue on your dashboard.
            Reminders go out 24h and 1h before your estimated window.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => navigate('/patient/appointments')}>View appointments</Button>
            <Button variant="ghost" onClick={() => navigate('/patient')}>
              Go to dashboard
            </Button>
          </div>
        </Card>
      ) : null}
    </motion.div>
  )
}
