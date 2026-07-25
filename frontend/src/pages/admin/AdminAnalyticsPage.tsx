import { Card, Heatmap, StatusPill, TrendChart } from '@/components/ui'
import { StatTile } from '@/components/domain/ModulePlaceholder'
import {
  BOOKING_TREND,
  HEAT_HOURS,
  HEAT_VALUES,
  REPORT_ROWS,
} from '@/api/mocks/adminData'
import { useAdminData } from '@/admin/AdminDataContext'

export function AdminAnalyticsPage() {
  const { activeDoctors, revenueTotal } = useAdminData()
  const avgWaitlist = Math.round(
    REPORT_ROWS.reduce((s, r) => s + r.waitlistPct, 0) / REPORT_ROWS.length,
  )
  const avgConsult = (
    REPORT_ROWS.reduce((s, r) => s + r.avgMin, 0) / REPORT_ROWS.length
  ).toFixed(1)

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Active doctors" value={String(activeDoctors)} />
        <StatTile label="Paid revenue" value={`₹${revenueTotal.toLocaleString('en-IN')}`} />
        <StatTile label="Avg consult" value={`${avgConsult} min`} />
        <StatTile label="Waitlist conversion" value={`${avgWaitlist}%`} hint="Claimed vs expired" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card padding="lg">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-lg">Clinic booking load</h2>
            <StatusPill tone="success">This week</StatusPill>
          </div>
          <TrendChart data={BOOKING_TREND} height={210} />
        </Card>
        <Card padding="lg">
          <h2 className="font-display mb-2 text-lg">Busiest-hour heatmap</h2>
          <Heatmap values={HEAT_VALUES} hours={HEAT_HOURS} />
        </Card>
      </div>

      <Card padding="lg">
        <h2 className="font-display mb-3 text-lg">Doctor punctuality snapshot</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_ROWS.map((r) => (
            <div
              key={r.doctor}
              className="border-border bg-nav-hover rounded-[var(--radius-card)] border px-4 py-4 shadow-[var(--shadow-soft)]"
            >
              <p className="text-sm font-medium">{r.doctor}</p>
              <p className="text-text-muted mt-1 text-xs">
                Avg {r.avgMin} min · No-shows {r.noShows} · Waitlist {r.waitlistPct}%
              </p>
              <div className="bg-primary-tint mt-3 h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-primary-light h-full rounded-full"
                  style={{ width: `${Math.min(100, (8 / r.avgMin) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
