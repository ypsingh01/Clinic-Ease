import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconCalendarEvent } from '@tabler/icons-react'
import {
  Banner,
  Button,
  Card,
  EmptyState,
  Modal,
  StatusPill,
  useToast,
} from '@/components/ui'
import { CANCEL_POLICY_HOURS } from '@/clinic/types'
import { usePatientData } from '@/patient/PatientDataContext'

const statusTone = {
  upcoming: 'accent',
  checked_in: 'info',
  completed: 'success',
  cancelled: 'neutral',
  no_show: 'danger',
  in_progress: 'info',
} as const

export function AppointmentsPage() {
  const {
    appointments,
    cancelAppointment,
    checkIn,
    servingToken,
    canCancel,
    getDoctor,
  } = usePatientData()
  const toast = useToast()
  const navigate = useNavigate()
  const [cancelId, setCancelId] = useState<string | null>(null)

  const upcoming = appointments.filter(
    (a) => a.status === 'upcoming' || a.status === 'checked_in',
  )
  const past = appointments.filter(
    (a) =>
      a.status === 'completed' ||
      a.status === 'cancelled' ||
      a.status === 'no_show' ||
      a.status === 'in_progress',
  )

  const cancelTarget = cancelId ? appointments.find((a) => a.id === cancelId) : undefined
  const cancelAllowed = cancelTarget ? canCancel(cancelTarget) : false

  const onCancel = async () => {
    if (!cancelId) return
    const result = await Promise.resolve(cancelAppointment(cancelId))
    setCancelId(null)
    if (!result.ok) {
      toast.push({
        tone: 'danger',
        title: 'Cannot cancel',
        description: result.reason ?? `Policy: ${CANCEL_POLICY_HOURS}h before ETA`,
      })
      return
    }
    toast.push({
      tone: 'info',
      title: 'Appointment cancelled',
      description: 'Token released to the waitlist.',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Banner tone="info">
        Currently serving token <strong>#{servingToken}</strong>. Free cancel / reschedule until{' '}
        {CANCEL_POLICY_HOURS}h before your ETA. Estimates are not guarantees.
      </Banner>

      <section>
        <h2 className="font-display mb-3 text-lg">Upcoming</h2>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={<IconCalendarEvent size={22} stroke={1.5} />}
            title="No upcoming visits"
            description="Book into an hour block to get a token and estimated window."
            actionLabel="Book appointment"
            onAction={() => navigate('/patient/book')}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((a) => {
              const doctor = getDoctor(a.doctorId)
              const allowed = canCancel(a)
              return (
                <Card key={a.id} padding="md">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <StatusPill tone={statusTone[a.status] ?? 'neutral'}>
                        {a.status === 'checked_in' ? 'Checked in' : 'Upcoming'}
                      </StatusPill>
                      <h3 className="font-display mt-2 text-lg">{doctor?.name}</h3>
                      <p className="text-text-secondary mt-1 text-sm">
                        {a.forName}
                        {a.dependentId ? ' · dependent' : ''} · {a.date} · {a.blockStart}–
                        {a.blockEnd}
                      </p>
                      <p className="text-text mt-2 font-mono text-sm">
                        Token #{a.token} · ETA {a.etaStart}–{a.etaEnd}
                      </p>
                      <p className="text-text-muted mt-1 text-xs">
                        Now serving #{a.servingToken || servingToken}
                      </p>
                      {!allowed ? (
                        <p className="text-warning mt-2 text-xs">
                          Within {CANCEL_POLICY_HOURS}h of ETA — cancel/reschedule locked
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {a.status === 'upcoming' ? (
                        <Button
                          size="sm"
                          onClick={async () => {
                            const result = await Promise.resolve(checkIn(a.id))
                            if (!result.ok) {
                              toast.push({
                                tone: 'warning',
                                title: 'Check-in unavailable',
                                description: result.reason,
                              })
                              return
                            }
                            toast.push({
                              tone: 'success',
                              title: 'Checked in',
                              description: 'Queue clock started.',
                            })
                          }}
                        >
                          Check in
                        </Button>
                      ) : null}
                      <Link
                        to={
                          allowed
                            ? `/patient/book/${a.doctorId}?reschedule=${a.id}`
                            : `/patient/book/${a.doctorId}`
                        }
                        className="no-underline"
                      >
                        <Button size="sm" variant="ghost" disabled={!allowed}>
                          Reschedule
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={!allowed}
                        onClick={() => setCancelId(a.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                  {a.intake ? (
                    <p className="text-text-secondary border-border mt-4 border-t pt-3 text-sm">
                      Intake: {a.intake}
                    </p>
                  ) : null}
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {past.length ? (
        <section>
          <h2 className="font-display mb-3 text-lg">History</h2>
          <div className="flex flex-col gap-2">
            {past.map((a) => {
              const doctor = getDoctor(a.doctorId)
              return (
                <Card
                  key={a.id}
                  padding="sm"
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {doctor?.name} · Token #{a.token}
                    </p>
                    <p className="text-text-muted text-xs">
                      {a.date} · {a.forName}
                    </p>
                  </div>
                  <StatusPill tone={statusTone[a.status] ?? 'neutral'}>
                    {a.status.replace('_', ' ')}
                  </StatusPill>
                </Card>
              )
            })}
          </div>
        </section>
      ) : null}

      <Modal
        open={Boolean(cancelId)}
        onClose={() => setCancelId(null)}
        title="Cancel appointment?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelId(null)}>
              Keep visit
            </Button>
            <Button variant="danger" onClick={onCancel} disabled={!cancelAllowed}>
              Cancel visit
            </Button>
          </>
        }
      >
        <p className="text-text-secondary text-sm leading-relaxed">
          {cancelAllowed
            ? 'Your token will be released and may be offered to the waitlist.'
            : `Cancellation is locked within ${CANCEL_POLICY_HOURS} hours of your estimated start.`}
        </p>
      </Modal>
    </div>
  )
}
