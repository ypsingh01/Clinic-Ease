import { useMemo, useState } from 'react'
import {
  IconClockPlus,
  IconPlayerPlay,
  IconCheck,
  IconUserOff,
} from '@tabler/icons-react'
import {
  Banner,
  Button,
  Card,
  Drawer,
  FormField,
  Input,
  StatusPill,
  TokenQueueRow,
  useToast,
} from '@/components/ui'
import { StatTile } from '@/components/domain/ModulePlaceholder'
import { QueueLiveAnnouncer } from '@/components/domain/QueueLiveAnnouncer'
import { useDoctorData } from '@/doctor/DoctorDataContext'
import type { QueuePatient } from '@/api/mocks/doctorData'
import { todayISO } from '@/clinic/types'

export function DoctorHomePage() {
  const {
    queue,
    counts,
    activePatient,
    delayOffsetMin,
    settings,
    setStatus,
    applyDelay,
    clearDelay,
    avgDuration,
    queueDate,
    setQueueDate,
    weekSummary,
  } = useDoctorData()
  const toast = useToast()
  const [selected, setSelected] = useState<QueuePatient | null>(null)
  const [duration, setDuration] = useState('6')
  const [view, setView] = useState<'today' | 'week'>('today')
  const isToday = queueDate === todayISO()

  const live = useMemo(
    () =>
      [...queue]
        .filter((p) => p.status === 'waiting' || p.status === 'in_progress')
        .sort((a, b) => a.token - b.token),
    [queue],
  )
  const done = useMemo(
    () =>
      [...queue]
        .filter((p) => p.status === 'completed' || p.status === 'no_show')
        .sort((a, b) => b.token - a.token),
    [queue],
  )

  const completeCurrent = () => {
    if (!activePatient) return
    const mins = Number(duration) || 5
    setStatus(activePatient.id, 'completed', mins)
    toast.push({
      tone: 'success',
      title: `Token #${activePatient.token} completed`,
      description: `Recorded ${mins} min · next patient promoted`,
    })
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-8">
      <QueueLiveAnnouncer servingToken={activePatient?.token ?? live[0]?.token ?? 0} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setView('today')
            setQueueDate(todayISO())
          }}
          className={
            view === 'today'
              ? 'bg-primary-tint text-primary border-primary/30 rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-medium'
              : 'border-border text-text-secondary hover:border-primary/30 rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs'
          }
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setView('week')}
          className={
            view === 'week'
              ? 'bg-primary-tint text-primary border-primary/30 rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-medium'
              : 'border-border text-text-secondary hover:border-primary/30 rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs'
          }
        >
          Week
        </button>
        {!isToday && view === 'today' ? (
          <StatusPill tone="warning">Viewing {queueDate}</StatusPill>
        ) : null}
      </div>

      {view === 'week' ? (
        <Card padding="md">
          <h2 className="font-display mb-3 text-lg">This week</h2>
          <div className="grid gap-2 sm:grid-cols-7">
            {weekSummary.map((d) => (
              <button
                key={d.date}
                type="button"
                onClick={() => {
                  setQueueDate(d.date)
                  setView('today')
                }}
                className={
                  d.date === queueDate
                    ? 'border-primary bg-primary-tint rounded-[var(--radius-card)] border p-3 text-left shadow-[var(--shadow-soft)]'
                    : 'border-border hover:border-primary/30 rounded-[var(--radius-card)] border bg-surface p-3 text-left'
                }
              >
                <p className="text-text-muted text-xs font-medium">{d.day}</p>
                <p className="font-display mt-1 text-lg">{d.total}</p>
                <p className="text-text-secondary mt-1 text-[11px]">
                  {d.waiting} live · {d.completed} done
                </p>
              </button>
            ))}
          </div>
          <p className="text-text-muted mt-3 text-xs">
            Tap a day to open that date&apos;s token queue. Patient bookings sync live.
          </p>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Banner
          className="min-w-0 flex-1"
          tone={delayOffsetMin ? 'warning' : 'info'}
          icon={<IconClockPlus size={20} stroke={1.5} className="text-warning" />}
        >
          {delayOffsetMin
            ? `Delay offset +${delayOffsetMin} min applied to remaining ETAs.`
            : 'Queue on time. Tap Running late to shift remaining ETAs at once.'}
        </Banner>
        <div className="flex flex-wrap gap-2">
          {delayOffsetMin ? (
            <Button variant="ghost" size="sm" onClick={clearDelay}>
              Clear delay
            </Button>
          ) : null}
          <Button
            variant="secondary"
            leftIcon={<IconClockPlus size={18} stroke={1.5} />}
            onClick={() => {
              applyDelay()
              toast.push({
                tone: 'warning',
                title: `Running late +${settings.delayMinutes}`,
                description: 'Remaining patient ETAs shifted.',
              })
            }}
          >
            Running late +{settings.delayMinutes}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Waiting" value={String(counts.waiting)} hint="In today's token queue" />
        <StatTile
          label="In progress"
          value={String(counts.inProgress)}
          hint={activePatient ? `Token #${activePatient.token}` : 'None'}
        />
        <StatTile
          label="Completed"
          value={String(counts.completed)}
          hint={avgDuration ? `Avg ${avgDuration} min` : 'No durations yet'}
        />
        <StatTile label="No-shows" value={String(counts.noShow)} hint="Today" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card padding="md">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg">Token queue</h2>
            <StatusPill tone="info">Live</StatusPill>
          </div>
          <div className="flex flex-col gap-2.5">
            {live.map((p) => (
              <TokenQueueRow
                key={p.id}
                token={p.token}
                name={p.name}
                eta={p.eta}
                meta={p.relation}
                status={p.status}
                active={p.status === 'in_progress'}
                onClick={() => setSelected(p)}
                actions={
                  <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
                    Open
                  </Button>
                }
              />
            ))}
          </div>

          {activePatient ? (
            <div className="border-border mt-4 flex flex-wrap items-end gap-2 border-t pt-4">
              <FormField label="Actual duration (min)" htmlFor="dur" className="w-28">
                <Input
                  id="dur"
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </FormField>
              <Button
                size="sm"
                className="max-lg:min-h-12"
                leftIcon={<IconCheck size={16} stroke={1.5} />}
                onClick={completeCurrent}
              >
                Complete
              </Button>
              <Button
                size="sm"
                variant="danger"
                className="max-lg:min-h-12"
                leftIcon={<IconUserOff size={16} stroke={1.5} />}
                onClick={() => {
                  setStatus(activePatient.id, 'no_show')
                  toast.push({ tone: 'danger', title: 'Marked no-show' })
                }}
              >
                No-show
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <Button
                size="sm"
                className="max-lg:min-h-12 max-lg:w-full"
                leftIcon={<IconPlayerPlay size={16} stroke={1.5} />}
                disabled={!live.some((p) => p.status === 'waiting')}
                onClick={() => {
                  const next = live.find((p) => p.status === 'waiting')
                  if (!next) return
                  setStatus(next.id, 'in_progress')
                  toast.push({ tone: 'info', title: `Now seeing token #${next.token}` })
                }}
              >
                Start next
              </Button>
            </div>
          )}

          {done.length ? (
            <div className="mt-6">
              <p className="text-text-muted mb-2 text-xs font-medium tracking-wide">
                Earlier today
              </p>
              <div className="flex flex-col gap-2 opacity-80">
                {done.slice(0, 4).map((p) => (
                  <TokenQueueRow
                    key={p.id}
                    token={p.token}
                    name={p.name}
                    status={p.status}
                    meta={p.durationMin ? `${p.durationMin} min` : undefined}
                    onClick={() => setSelected(p)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </Card>

        <Card tint="care" padding="lg" className="h-fit shadow-[var(--shadow-lift)]">
          <p className="text-primary text-xs font-medium tracking-wide">Now seeing</p>
          {activePatient ? (
            <>
              <h3 className="font-display mt-2 text-xl">{activePatient.name}</h3>
              {activePatient.relation ? (
                <p className="text-text-secondary mt-1 text-sm">{activePatient.relation}</p>
              ) : null}
              <p className="text-text-secondary mt-3 text-sm leading-relaxed">
                {activePatient.intake}
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <InfoRow label="Token" value={`#${activePatient.token}`} mono />
                <InfoRow
                  label="Block"
                  value={`${activePatient.blockStart}–${activePatient.blockEnd}`}
                />
                <InfoRow label="Phone" value={activePatient.phone} />
              </div>
              <Button className="mt-6" fullWidth onClick={() => setSelected(activePatient)}>
                Full patient panel
              </Button>
            </>
          ) : (
            <p className="text-text-secondary mt-3 text-sm leading-relaxed">
              No patient in progress. Start the next waiting token when you are ready.
            </p>
          )}
        </Card>
      </div>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Token #${selected.token}` : 'Patient'}
        footer={
          selected && selected.status === 'waiting' ? (
            <Button
              fullWidth
              onClick={() => {
                setStatus(selected.id, 'in_progress')
                toast.push({ tone: 'info', title: `In progress · #${selected.token}` })
                setSelected(null)
              }}
            >
              Mark in progress
            </Button>
          ) : selected && selected.status === 'in_progress' ? (
            <div className="flex w-full gap-2">
              <Button
                className="flex-1"
                variant="danger"
                onClick={() => {
                  setStatus(selected.id, 'no_show')
                  setSelected(null)
                }}
              >
                No-show
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setStatus(selected.id, 'completed', Number(duration) || 5)
                  setSelected(null)
                }}
              >
                Complete
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-text-muted text-xs">Patient</p>
              <p className="text-sm font-medium">{selected.name}</p>
              {selected.relation ? (
                <p className="text-text-secondary mt-1 text-xs">{selected.relation}</p>
              ) : null}
            </div>
            <div>
              <p className="text-text-muted text-xs">Intake</p>
              <p className="text-text-secondary text-sm leading-relaxed">{selected.intake}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">ETA</p>
              <p className="font-mono text-sm">{selected.eta}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Status</p>
              <StatusPill
                className="mt-1"
                tone={
                  selected.status === 'in_progress'
                    ? 'info'
                    : selected.status === 'completed'
                      ? 'success'
                      : selected.status === 'no_show'
                        ? 'danger'
                        : 'neutral'
                }
              >
                {selected.status.replace('_', ' ')}
              </StatusPill>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-surface/80 rounded-[var(--radius-control)] border border-primary/10 px-3 py-2 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className={`ml-2 font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
