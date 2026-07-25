import { Fragment } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/cn'

type Point = { label: string; value: number }

const CHART = {
  grid: 'var(--color-border)',
  muted: 'var(--color-text-muted)',
  surface: 'var(--color-surface)',
  primary: 'var(--color-primary)',
}

export function TrendChart({
  data,
  className,
  height = 220,
  color = CHART.primary,
}: {
  data: Point[]
  className?: string
  height?: number
  color?: string
}) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="ceTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: CHART.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: `1px solid ${CHART.grid}`,
              background: CHART.surface,
              boxShadow: 'var(--shadow-modal)',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#ceTrend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** values[dayIndex][hourIndex] */
export function Heatmap({
  values,
  hours,
  className,
}: {
  values: number[][]
  hours: string[]
  className?: string
}) {
  const flat = values.flat()
  const max = Math.max(1, ...flat)

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div
        className="grid min-w-[520px] gap-1"
        style={{ gridTemplateColumns: `48px repeat(${hours.length}, minmax(0, 1fr))` }}
      >
        <div />
        {hours.map((h) => (
          <div key={h} className="text-text-muted pb-1 text-center text-[10px]">
            {h}
          </div>
        ))}
        {DAYS.map((day, di) => (
          <Fragment key={day}>
            <div className="text-text-secondary flex items-center text-xs font-medium">{day}</div>
            {(values[di] ?? []).map((v, hi) => {
              const intensity = v / max
              return (
                <div
                  key={`${day}-${hours[hi] ?? hi}`}
                  title={`${day} ${hours[hi]}: ${v}`}
                  className="aspect-square rounded-[6px]"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--color-primary) ${Math.round(8 + intensity * 72)}%, transparent)`,
                  }}
                />
              )
            })}
          </Fragment>
        ))}
      </div>
      <p className="text-text-muted mt-3 text-xs">Busiest hours · darker = higher load</p>
    </div>
  )
}
