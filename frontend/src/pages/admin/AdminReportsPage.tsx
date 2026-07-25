import { Button, Card, StatusPill, Table, useToast } from '@/components/ui'
import { StatTile } from '@/components/domain/ModulePlaceholder'
import { REPORT_ROWS } from '@/api/mocks/adminData'

export function AdminReportsPage() {
  const toast = useToast()
  const totals = REPORT_ROWS.reduce(
    (acc, r) => ({
      bookings: acc.bookings + r.bookings,
      cancels: acc.cancels + r.cancels,
      noShows: acc.noShows + r.noShows,
    }),
    { bookings: 0, cancels: 0, noShows: 0 },
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-text-secondary max-w-xl text-sm leading-relaxed">
          Weekly clinic narrative — bookings, cancellations, no-shows, and waitlist conversion per
          doctor.
        </p>
        <Button
          variant="secondary"
          onClick={() =>
            toast.push({
              tone: 'info',
              title: 'Export queued',
              description: 'CSV export will wire to the API in Phase 8.',
            })
          }
        >
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Bookings (week)" value={String(totals.bookings)} />
        <StatTile label="Cancellations" value={String(totals.cancels)} />
        <StatTile
          label="No-shows"
          value={String(totals.noShows)}
          hint={`${Math.round((totals.noShows / totals.bookings) * 100)}% rate`}
        />
      </div>

      <Card padding="lg" tint="primary">
        <h2 className="font-display text-lg">Story this week</h2>
        <p className="text-text-secondary mt-2 text-sm leading-relaxed">
          Load peaks mid-week. Waitlist conversion is strongest for Mehta and Rao — keep capacity
          honest where average consult time is climbing (Desai / Khan).
        </p>
      </Card>

      <Table
        rows={REPORT_ROWS}
        rowKey={(r) => r.doctor}
        columns={[
          { key: 'doctor', header: 'Doctor', render: (r) => r.doctor },
          { key: 'bookings', header: 'Bookings', align: 'right', render: (r) => r.bookings },
          { key: 'cancels', header: 'Cancels', align: 'right', render: (r) => r.cancels },
          { key: 'noShows', header: 'No-shows', align: 'right', render: (r) => r.noShows },
          {
            key: 'avg',
            header: 'Avg min',
            align: 'right',
            render: (r) => r.avgMin.toFixed(1),
          },
          {
            key: 'wl',
            header: 'Waitlist claim %',
            render: (r) => <StatusPill tone="info">{r.waitlistPct}%</StatusPill>,
          },
        ]}
      />
    </div>
  )
}
