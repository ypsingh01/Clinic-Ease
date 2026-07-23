import { useMemo, useState } from 'react'
import { Fragment } from 'react'
import {
  Banner,
  Button,
  Card,
  Drawer,
  FormField,
  Input,
  StatusPill,
  useToast,
} from '@/components/ui'
import { HOURS } from '@/api/mocks/adminData'
import { useAdminData } from '@/admin/AdminDataContext'
import { todayISO } from '@/clinic/types'
import { cn } from '@/lib/cn'

type Cell = { doctorId: string; hour: string }

export function AdminAppointmentsPage() {
  const {
    doctors,
    grid,
    appointments,
    cancelAppointment,
    rescheduleAppointment,
    getBlocks,
  } = useAdminData()
  const toast = useToast()
  const active = doctors.filter((d) => d.active)
  const [filter, setFilter] = useState<string>('all')
  const [cell, setCell] = useState<Cell | null>(null)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState(todayISO())
  const [newBlock, setNewBlock] = useState('10:00')

  const visibleDocs = useMemo(
    () => (filter === 'all' ? active : active.filter((d) => d.id === filter)),
    [active, filter],
  )

  const cellApts = useMemo(() => {
    if (!cell) return []
    return appointments.filter(
      (a) =>
        a.doctorId === cell.doctorId &&
        a.date === todayISO() &&
        a.blockStart === cell.hour &&
        a.status !== 'cancelled',
    )
  }, [appointments, cell])

  const doctorName = (id: string) =>
    doctors.find((d) => d.id === id)?.name ?? 'Doctor'

  return (
    <div className="flex flex-col gap-6">
      <Banner tone="info">
        Live schedule from shared clinic bookings. Tap a cell to cancel or reschedule tokens.
      </Banner>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="All doctors" />
        {active.map((d) => (
          <FilterChip
            key={d.id}
            active={filter === d.id}
            onClick={() => setFilter(d.id)}
            label={d.name.replace('Dr. ', '')}
          />
        ))}
      </div>

      <Card padding="sm" className="overflow-x-auto">
        <div
          className="grid min-w-[720px] gap-1 p-2"
          style={{
            gridTemplateColumns: `140px repeat(${HOURS.length}, minmax(72px, 1fr))`,
          }}
        >
          <div />
          {HOURS.map((h) => (
            <div key={h} className="text-text-muted py-2 text-center text-[11px] font-medium">
              {h}
            </div>
          ))}
          {visibleDocs.map((d) => (
            <Fragment key={d.id}>
              <div className="text-text flex items-center pr-2 text-xs font-medium">
                <div>
                  <p>{d.name.replace('Dr. ', '')}</p>
                  <p className="text-text-muted font-normal">{d.tokensToday} today</p>
                </div>
              </div>
              {HOURS.map((hour) => {
                const slot = grid.find((g) => g.doctorId === d.id && g.hour === hour)
                const fill = slot ? slot.booked / Math.max(1, slot.capacity) : 0
                return (
                  <button
                    key={`${d.id}-${hour}`}
                    type="button"
                    onClick={() => setCell({ doctorId: d.id, hour })}
                    className={cn(
                      'flex min-h-[64px] flex-col items-center justify-center rounded-[10px] border border-transparent px-1 py-2 text-center transition-transform hover:-translate-y-px',
                      fill >= 1 && 'bg-accent-tint',
                    )}
                    style={
                      fill >= 1
                        ? undefined
                        : { backgroundColor: `rgba(15, 110, 86, ${0.08 + fill * 0.55})` }
                    }
                    title={`${d.name} ${hour} · ${slot?.booked ?? 0}/${slot?.capacity ?? 0}`}
                  >
                    <span className="font-mono text-[11px] font-medium text-text">
                      {slot?.booked ?? 0}/{slot?.capacity ?? 0}
                    </span>
                    {slot?.labels?.length ? (
                      <span className="text-text-muted mt-0.5 max-w-full truncate text-[9px]">
                        {slot.labels.slice(0, 3).join(' ')}
                      </span>
                    ) : null}
                    {fill >= 1 ? (
                      <StatusPill tone="accent" className="mt-1 scale-90">
                        Full
                      </StatusPill>
                    ) : null}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </Card>

      <Drawer
        open={Boolean(cell)}
        onClose={() => {
          setCell(null)
          setRescheduleId(null)
        }}
        title={
          cell
            ? `${doctorName(cell.doctorId).replace('Dr. ', '')} · ${cell.hour}`
            : 'Block'
        }
      >
        {!cellApts.length ? (
          <p className="text-text-secondary text-sm">No tokens in this hour yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {cellApts.map((a) => (
              <Card key={a.id} padding="sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-medium">#{a.token}</p>
                    <p className="text-sm">{a.patientName}</p>
                    <p className="text-text-muted text-xs">
                      ETA {a.etaStart}–{a.etaEnd} · {a.status.replace('_', ' ')}
                    </p>
                  </div>
                  {a.status === 'upcoming' || a.status === 'checked_in' ? (
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRescheduleId(a.id)
                          setNewDate(a.date)
                          setNewBlock(a.blockStart)
                        }}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          const result = await Promise.resolve(cancelAppointment(a.id))
                          if (!result.ok) {
                            toast.push({
                              tone: 'warning',
                              title: 'Cancel blocked',
                              description: result.reason,
                            })
                            return
                          }
                          toast.push({ tone: 'info', title: `Token #${a.token} cancelled` })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}

        {rescheduleId ? (
          <div className="border-border mt-6 border-t pt-4">
            <p className="font-display mb-3 text-sm font-medium">Reschedule token</p>
            <FormField label="Date" htmlFor="rs-date">
              <Input
                id="rs-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </FormField>
            <FormField className="mt-3" label="Hour block start" htmlFor="rs-block">
              <select
                id="rs-block"
                className="border-border bg-surface min-h-[44px] w-full rounded-[10px] border px-3 text-sm"
                value={newBlock}
                onChange={(e) => setNewBlock(e.target.value)}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </FormField>
            <Button
              className="mt-4"
              fullWidth
              onClick={async () => {
                const apt = appointments.find((a) => a.id === rescheduleId)
                if (!apt) return
                const endHour = Number(newBlock.slice(0, 2)) + 1
                const blockEnd = `${String(endHour).padStart(2, '0')}:00`
                const fills = getBlocks(apt.doctorId, newDate)
                const booked =
                  fills.find((b) => b.startLabel === newBlock)?.booked ?? 0
                const result = await Promise.resolve(
                  rescheduleAppointment(rescheduleId, {
                    date: newDate,
                    blockStart: newBlock,
                    blockEnd,
                    token: booked + 1,
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
                toast.push({ tone: 'success', title: 'Appointment rescheduled' })
                setRescheduleId(null)
                setCell(null)
              }}
            >
              Confirm reschedule
            </Button>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'bg-primary text-surface rounded-full px-3 py-1.5 text-xs font-medium'
          : 'border-border text-text-secondary rounded-full border bg-surface px-3 py-1.5 text-xs'
      }
    >
      {label}
    </button>
  )
}
