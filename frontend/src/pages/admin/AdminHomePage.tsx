import { Link } from 'react-router-dom'
import { IconCalendarEvent, IconCoin, IconStethoscope, IconUsers } from '@tabler/icons-react'
import { Card, Heatmap, StatusPill, TrendChart } from '@/components/ui'
import { StatTile } from '@/components/domain/ModulePlaceholder'
import { BOOKING_TREND, HEAT_HOURS, HEAT_VALUES } from '@/api/mocks/adminData'
import { useAdminData } from '@/admin/AdminDataContext'

export function AdminHomePage() {
  const { doctors, revenueTotal, activeDoctors, payments, manualBookings } = useAdminData()
  const weekBookings = doctors.reduce((s, d) => s + d.tokensToday, 0) * 4
  const pendingPay = payments.filter((p) => p.status === 'pending').length

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Bookings this week"
          value={String(weekBookings)}
          hint="+12% vs last week (mock)"
          icon={<IconCalendarEvent size={18} stroke={1.5} />}
        />
        <StatTile
          label="Revenue (paid)"
          value={`₹${(revenueTotal / 1000).toFixed(2)}k`}
          hint={`${pendingPay} pending at clinic`}
          icon={<IconCoin size={18} stroke={1.5} />}
        />
        <StatTile
          label="Active doctors"
          value={String(activeDoctors)}
          hint={`of ${doctors.length} on roster`}
          icon={<IconStethoscope size={18} stroke={1.5} />}
        />
        <StatTile
          label="Walk-ins today"
          value={String(manualBookings.length || 3)}
          hint="Appended end of queue"
          icon={<IconUsers size={18} stroke={1.5} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg">Booking trend</h2>
            <StatusPill tone="success">Healthy</StatusPill>
          </div>
          <TrendChart data={BOOKING_TREND} height={200} />
        </Card>
        <Card padding="lg">
          <h2 className="font-display mb-2 text-lg">Busiest hours</h2>
          <Heatmap values={HEAT_VALUES} hours={HEAT_HOURS} />
        </Card>
      </div>

      <Card padding="lg">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg">Today by doctor</h2>
            <p className="text-text-secondary text-sm">Open the schedule grid for the full canvas.</p>
          </div>
          <Link to="/admin/appointments" className="text-primary text-sm font-medium no-underline">
            Open schedule grid →
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {doctors
            .filter((d) => d.active)
            .slice(0, 3)
            .map((d) => (
              <div
                key={d.id}
                className="border-border bg-nav-hover rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-soft)]"
              >
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-text-muted mt-1 text-xs">{d.tokensToday} tokens today</p>
                <div className="mt-3 flex gap-1">
                  {[40, 70, 55, 85].map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-primary-light/80 h-8 flex-1 rounded-md"
                      style={{ opacity: 0.35 + w / 200 }}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}
