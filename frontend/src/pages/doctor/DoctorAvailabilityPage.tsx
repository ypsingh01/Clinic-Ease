import { IconLeaf } from '@tabler/icons-react'
import { Banner, Button, Card, FormField, Input, StatusPill, useToast } from '@/components/ui'
import { useDoctorData } from '@/doctor/DoctorDataContext'
import type { DayKey } from '@/api/mocks/doctorData'

const DAYS: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function DoctorAvailabilityPage() {
  const { week, capacity, updateDay, setCapacity } = useDoctorData()
  const toast = useToast()
  const spotsHint = Math.round(60 / Math.max(1, Math.floor(60 / capacity)))

  return (
    <div className="flex flex-col gap-10">
      <Banner tone="info" icon={<IconLeaf size={20} stroke={1.5} className="text-primary" />}>
        Edits apply going forward. Already-booked tokens keep their order — capacity changes
        don&apos;t reshuffle today&apos;s queue.
      </Banner>

      <Card padding="lg">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-lg">Hourly patient capacity</h2>
            <p className="text-text-secondary mt-1 text-sm">
              Default from average consult time. Preview: about {capacity} spots per open hour
              (~{Math.round(60 / capacity)} min each).
            </p>
          </div>
          <FormField label="Patients / hour" htmlFor="cap" className="w-36">
            <Input
              id="cap"
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value) || 1)}
            />
          </FormField>
        </div>
        <div className="bg-primary-tint mt-6 rounded-[var(--radius-card)] px-5 py-4 text-sm">
          <span className="text-primary font-medium">Live preview · </span>
          <span className="text-text-secondary">
            A 10:00–11:00 block would show “{capacity} of {capacity} spots” when empty
            {spotsHint ? ` · ~${Math.round(60 / capacity)} min average` : ''}.
          </span>
        </div>
      </Card>

      <div className="grid gap-4">
        {DAYS.map((day) => {
          const d = week[day]
          return (
            <Card key={day} padding="md" className={!d.enabled || d.onLeave ? 'opacity-75' : ''}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-pressed={d.enabled}
                    onClick={() => updateDay(day, { enabled: !d.enabled, onLeave: false })}
                    className={`flex size-10 items-center justify-center rounded-[var(--radius-control)] border text-sm font-medium ${
                      d.enabled && !d.onLeave
                        ? 'bg-primary-tint text-primary border-primary/30'
                        : 'bg-nav-hover text-text-muted border-transparent'
                    }`}
                  >
                    {day.slice(0, 2)}
                  </button>
                  <div>
                    <p className="font-display text-[15px] font-medium">{day}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {!d.enabled ? <StatusPill tone="neutral">Off</StatusPill> : null}
                      {d.onLeave ? <StatusPill tone="warning">Leave</StatusPill> : null}
                      {d.enabled && !d.onLeave ? (
                        <StatusPill tone="success">Working</StatusPill>
                      ) : null}
                    </div>
                  </div>
                </div>

                {d.enabled ? (
                  <div className="flex flex-wrap items-end gap-2">
                    <TimeField
                      label="Start"
                      value={d.start}
                      onChange={(v) => updateDay(day, { start: v })}
                      disabled={d.onLeave}
                    />
                    <TimeField
                      label="End"
                      value={d.end}
                      onChange={(v) => updateDay(day, { end: v })}
                      disabled={d.onLeave}
                    />
                    <TimeField
                      label="Break from"
                      value={d.breakStart}
                      onChange={(v) => updateDay(day, { breakStart: v })}
                      disabled={d.onLeave}
                    />
                    <TimeField
                      label="Break to"
                      value={d.breakEnd}
                      onChange={(v) => updateDay(day, { breakEnd: v })}
                      disabled={d.onLeave}
                    />
                    <Button
                      size="sm"
                      variant={d.onLeave ? 'secondary' : 'ghost'}
                      onClick={() => updateDay(day, { onLeave: !d.onLeave })}
                    >
                      {d.onLeave ? 'Clear leave' : 'Mark leave'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-text-muted text-sm">Day off — tap the day chip to enable</p>
                )}
              </div>

              {d.enabled && !d.onLeave ? (
                <DayTimeline day={d} />
              ) : null}
            </Card>
          )
        })}
      </div>

      <div>
        <Button
          onClick={() =>
            toast.push({
              tone: 'success',
              title: 'Availability saved',
              description: 'Patients will see updated hour blocks on their next refresh.',
            })
          }
        >
          Save availability
        </Button>
      </div>
    </div>
  )
}

function toMin(t: string) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function DayTimeline({
  day,
}: {
  day: { start: string; end: string; breakStart: string; breakEnd: string }
}) {
  const start = toMin(day.start)
  const end = toMin(day.end)
  const span = Math.max(1, end - start)
  const hasBreak = Boolean(day.breakStart && day.breakEnd)
  const b0 = hasBreak ? Math.max(start, toMin(day.breakStart)) : start
  const b1 = hasBreak ? Math.min(end, toMin(day.breakEnd)) : start
  const morning = ((b0 - start) / span) * 100
  const brk = hasBreak ? ((b1 - b0) / span) * 100 : 0
  const afternoon = ((end - (hasBreak ? b1 : start)) / span) * 100

  return (
    <div className="mt-4">
      <div className="flex h-3 overflow-hidden rounded-[var(--radius-pill)] bg-nav-hover">
        {morning > 0 ? (
          <div
            className="bg-primary-light/80 h-full"
            style={{ width: `${morning}%` }}
            title={`Clinic ${day.start}–${day.breakStart || day.end}`}
          />
        ) : null}
        {brk > 0 ? (
          <div
            className="bg-border h-full"
            style={{ width: `${brk}%` }}
            title={`Break ${day.breakStart}–${day.breakEnd}`}
          />
        ) : null}
        {afternoon > 0 ? (
          <div
            className="bg-primary/70 h-full"
            style={{ width: `${afternoon}%` }}
            title={`Clinic ${day.breakEnd || day.start}–${day.end}`}
          />
        ) : null}
      </div>
      <p className="text-text-muted mt-1.5 text-[11px]">
        {day.start}–{day.end}
        {hasBreak ? ` · break ${day.breakStart}–${day.breakEnd}` : ' · no break'}
      </p>
    </div>
  )
}

function TimeField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-text-muted">{label}</span>
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="border-border bg-surface focus:border-primary disabled:opacity-40 min-h-10 rounded-[var(--radius-control)] border px-2 text-sm focus:shadow-[var(--focus-ring)] focus:outline-none"
      />
    </label>
  )
}
