import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  IconBell,
  IconCalendarEvent,
  IconHeartbeat,
  IconStethoscope,
} from '@tabler/icons-react'
import { Banner, Button, Card, ProgressBar, StatusPill, TokenQueueRow } from '@/components/ui'
import { useAuth } from '@/auth/AuthContext'
import { StatTile } from '@/components/domain/ModulePlaceholder'
import { QueueLiveAnnouncer } from '@/components/domain/QueueLiveAnnouncer'
import { usePatientData } from '@/patient/PatientDataContext'

export function PatientHomePage() {
  const { user } = useAuth()
  const { upcoming, servingToken, notifications, waitlist, getDoctor } = usePatientData()
  const first = user?.name.split(' ')[0] ?? 'there'
  const doctor = upcoming ? getDoctor(upcoming.doctorId) : undefined
  const offer = waitlist.find((w) => w.status === 'offered')
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="flex flex-col gap-6">
      <QueueLiveAnnouncer
        servingToken={servingToken}
        yourToken={upcoming?.token}
        etaWindow={
          upcoming ? `${upcoming.etaStart}–${upcoming.etaEnd}` : undefined
        }
      />
      {offer ? (
        <Banner
          tone="accent"
          action={
            <Link to="/patient/waitlist" className="no-underline">
              <Button size="sm">Claim</Button>
            </Link>
          }
        >
          A waitlist spot opened — claim it before the window expires.
        </Banner>
      ) : upcoming ? (
        <Banner
          tone="info"
          icon={<IconHeartbeat size={20} stroke={1.5} className="text-primary" />}
        >
          Currently serving token <strong>#{servingToken}</strong>
          {upcoming ? (
            <>
              {' '}
              · your token is <strong>#{upcoming.token}</strong> · estimated window{' '}
              {upcoming.etaStart}–{upcoming.etaEnd} (estimate, not a guarantee)
            </>
          ) : null}
        </Banner>
      ) : (
        <Banner tone="info">
          No upcoming visit yet — book into an hour block to get your token.
        </Banner>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card padding="lg" className="relative overflow-hidden">
          <div className="bg-accent-tint/80 pointer-events-none absolute -right-10 -bottom-10 size-40 rounded-full blur-2xl" />
          {upcoming && doctor ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                    Next visit
                  </p>
                  <h2 className="font-display mt-1 text-xl md:text-2xl">
                    Hi {first} — {doctor.name}
                  </h2>
                  <p className="text-text-secondary mt-2 text-sm">
                    {doctor.specialty} · Token #{upcoming.token} · {upcoming.blockStart}–
                    {upcoming.blockEnd} · for {upcoming.forName}
                  </p>
                </div>
                <StatusPill tone={upcoming.status === 'checked_in' ? 'info' : 'accent'}>
                  {upcoming.status === 'checked_in' ? 'Checked in' : 'Upcoming'}
                </StatusPill>
              </div>
              <ProgressBar
                className="mt-6"
                value={servingToken}
                max={Math.max(servingToken, upcoming.token)}
                label="Queue progress"
              />
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to="/patient/appointments" className="no-underline">
                  <Button size="sm">Manage visit</Button>
                </Link>
                <Link to={`/patient/book/${upcoming.doctorId}`} className="no-underline">
                  <Button size="sm" variant="ghost">
                    Reschedule
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl md:text-2xl">Hi {first} — ready when you are</h2>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                Pick a doctor, choose an hour block with spots remaining, and get a token with an
                estimated window.
              </p>
              <div className="mt-6">
                <Link to="/patient/doctors" className="no-underline">
                  <Button>Find a doctor</Button>
                </Link>
              </div>
            </>
          )}
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <StatTile
            label="Live queue"
            value={`Token #${servingToken}`}
            hint="Updates as the doctor advances"
            icon={<IconHeartbeat size={18} stroke={1.5} />}
          />
          <StatTile
            label="Notifications"
            value={unread ? `${unread} new` : 'All clear'}
            hint="Reminders and ETA shifts"
            icon={<IconBell size={18} stroke={1.5} />}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickCard
          to="/patient/doctors"
          icon={<IconStethoscope size={20} stroke={1.5} />}
          title="Find a doctor"
          body="Specialty, available days, and symptom guidance."
        />
        <QuickCard
          to="/patient/book"
          icon={<IconCalendarEvent size={20} stroke={1.5} />}
          title="Book a visit"
          body="Hour blocks with remaining capacity — not exclusive slots."
        />
        <QuickCard
          to="/patient/dependents"
          icon={<IconBell size={20} stroke={1.5} />}
          title="Family care"
          body="Add dependents and book on their behalf."
        />
      </div>

      {upcoming ? (
        <Card padding="md">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg">Around you in queue</h3>
            <StatusPill tone="neutral">Live</StatusPill>
          </div>
          <div className="flex flex-col gap-2">
            <TokenQueueRow
              token={servingToken}
              name="Now serving"
              status="in_progress"
              active
            />
            <TokenQueueRow
              token={upcoming.token}
              name="You"
              eta={`~${upcoming.etaStart}`}
              status="waiting"
              meta={doctor?.name}
            />
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function QuickCard({
  to,
  icon,
  title,
  body,
}: {
  to: string
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <Link to={to} className="no-underline">
      <Card interactive padding="md" className="h-full">
        <div className="bg-primary-tint text-primary mb-3 flex size-10 items-center justify-center rounded-[10px]">
          {icon}
        </div>
        <p className="font-display text-[15px] font-medium text-[#2C2C2A]">{title}</p>
        <p className="text-text-secondary mt-1 text-sm leading-relaxed">{body}</p>
      </Card>
    </Link>
  )
}
