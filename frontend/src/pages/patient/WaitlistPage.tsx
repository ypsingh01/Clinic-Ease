import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconHeartbeat } from '@tabler/icons-react'
import { Banner, Button, Card, EmptyState, ProgressBar, StatusPill, useToast } from '@/components/ui'
import { usePatientData } from '@/patient/PatientDataContext'

export function WaitlistPage() {
  const { waitlist, claimWaitlist, getDoctor } = usePatientData()
  const toast = useToast()
  const navigate = useNavigate()
  const active = waitlist.filter((w) => w.status === 'waiting' || w.status === 'offered')

  return (
    <div className="flex flex-col gap-10">
      <Banner tone="accent">
        Full hour blocks can still work out — join the waitlist and claim within about 10
        minutes when a token frees up.
      </Banner>

      {!active.length ? (
        <EmptyState
          icon={<IconHeartbeat size={22} stroke={1.5} />}
          title="No active waitlist entries"
          description="When a block shows Waitlist on booking, you can join here automatically."
          actionLabel="Browse doctors"
          onAction={() => navigate('/patient/doctors')}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {active.map((w) => {
            const doctor = getDoctor(w.doctorId)
            return (
              <Card key={w.id} padding="md" tint={w.status === 'offered' ? 'accent' : 'none'}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <StatusPill tone={w.status === 'offered' ? 'accent' : 'neutral'}>
                      {w.status === 'offered' ? 'Claim now' : 'Waiting'}
                    </StatusPill>
                    <h3 className="font-display mt-2 text-lg">{doctor?.name}</h3>
                    <p className="text-text-secondary mt-1 text-sm">
                      {w.date} · {w.blockStart}–{w.blockEnd} · Position #{w.position}
                    </p>
                  </div>
                  {w.status === 'offered' ? (
                    <ClaimControls
                      expiresAt={w.offerExpiresAt}
                      onClaim={() => {
                        const claimed = claimWaitlist(w.id)
                        if (!claimed) {
                          toast.push({
                            tone: 'warning',
                            title: 'Claim unavailable',
                            description: 'This offer may have expired.',
                          })
                          return
                        }
                        toast.push({
                          tone: 'success',
                          title: 'Spot claimed',
                          description: 'Complete payment to lock your token.',
                        })
                        navigate(
                          `/patient/book/${w.doctorId}?claim=1&date=${w.date}&block=${w.blockStart}`,
                        )
                      }}
                    />
                  ) : (
                    <Link to={`/patient/book/${w.doctorId}`} className="no-underline">
                      <Button size="sm" variant="ghost">
                        View blocks
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ClaimControls({
  expiresAt,
  onClaim,
}: {
  expiresAt?: string
  onClaim: () => void
}) {
  const total = 10 * 60
  const [left, setLeft] = useState(() => {
    if (!expiresAt) return total
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  })

  useEffect(() => {
    if (left <= 0) return
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [left])

  const label = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`

  return (
    <div className="w-full max-w-[200px]">
      <ProgressBar value={left} max={total} label={`Claim window ${label}`} />
      <Button className="mt-3" size="sm" fullWidth disabled={left <= 0} onClick={onClaim}>
        Claim & pay
      </Button>
    </div>
  )
}
