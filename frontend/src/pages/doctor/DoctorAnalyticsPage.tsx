import { Card, StatusPill, TrendChart } from '@/components/ui'
import { StatTile } from '@/components/domain/ModulePlaceholder'
import { LOAD_TREND, PUNCTUALITY } from '@/api/mocks/doctorData'
import { useDoctorData } from '@/doctor/DoctorDataContext'

export function DoctorAnalyticsPage() {
  const { counts, avgDuration, capacity, delayOffsetMin } = useDoctorData()
  const noShowRate =
    counts.completed + counts.noShow === 0
      ? 0
      : Math.round((counts.noShow / (counts.completed + counts.noShow)) * 100)

  const punctualityAbs = PUNCTUALITY.map((p) => ({
    label: p.label,
    value: Math.abs(p.value),
  }))

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Avg consult (today)" value={avgDuration ? `${avgDuration} min` : '—'} />
        <StatTile label="Capacity setting" value={`${capacity}/hr`} hint="Your hourly spots" />
        <StatTile label="No-show rate (today)" value={`${noShowRate}%`} />
        <StatTile
          label="Delay offset"
          value={delayOffsetMin ? `+${delayOffsetMin}m` : 'None'}
          hint="Currently applied"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card padding="lg">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-lg">Weekly load</h2>
            <StatusPill tone="info">Visits / day</StatusPill>
          </div>
          <TrendChart data={LOAD_TREND} height={210} />
        </Card>
        <Card padding="lg">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-lg">Punctuality drift</h2>
            <StatusPill tone="warning">|ETA − actual| mins</StatusPill>
          </div>
          <TrendChart data={punctualityAbs} height={210} color="var(--color-accent)" />
          <p className="text-text-muted mt-3 text-xs leading-relaxed">
            Lower is better. Large drift often means capacity is set too high for real consult
            length — try lowering patients/hour.
          </p>
        </Card>
      </div>

      <Card padding="lg" tint="primary">
        <h2 className="font-display text-lg">Insight</h2>
        <p className="text-text-secondary mt-2 text-sm leading-relaxed">
          Your rolling average today is {avgDuration || 'not yet recorded'} minutes. With capacity
          at {capacity}/hour, the schedule assumes ~{Math.round(60 / capacity)} minutes per visit.
          {avgDuration && avgDuration > 60 / capacity
            ? ' Actual visits are running longer than capacity implies — consider reducing hourly spots.'
            : ' Capacity looks aligned with today’s pace.'}
        </p>
      </Card>
    </div>
  )
}
