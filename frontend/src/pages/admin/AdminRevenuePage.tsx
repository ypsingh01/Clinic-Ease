import { useMemo, useState } from 'react'
import { Card, StatusPill, Table, TrendChart } from '@/components/ui'
import { StatTile } from '@/components/domain/ModulePlaceholder'
import { REVENUE_TREND } from '@/api/mocks/adminData'
import { useAdminData } from '@/admin/AdminDataContext'

export function AdminRevenuePage() {
  const { payments, revenueTotal } = useAdminData()
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'refunded'>('all')

  const rows = useMemo(
    () => (filter === 'all' ? payments : payments.filter((p) => p.status === filter)),
    [payments, filter],
  )

  const pending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const refunded = payments
    .filter((p) => p.status === 'refunded')
    .reduce((s, p) => s + p.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Paid revenue" value={`₹${revenueTotal.toLocaleString('en-IN')}`} />
        <StatTile label="Pending at clinic" value={`₹${pending.toLocaleString('en-IN')}`} />
        <StatTile label="Refunded" value={`₹${refunded.toLocaleString('en-IN')}`} />
      </div>

      <Card padding="lg">
        <h2 className="font-display mb-2 text-lg">Revenue trend (₹ thousands)</h2>
        <TrendChart data={REVENUE_TREND} color="#D85A30" height={200} />
      </Card>

      <div className="flex flex-wrap gap-2">
        {(['all', 'paid', 'pending', 'refunded'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? 'bg-primary text-surface rounded-full px-3 py-1.5 text-xs font-medium capitalize'
                : 'border-border rounded-full border px-3 py-1.5 text-xs capitalize'
            }
          >
            {f}
          </button>
        ))}
      </div>

      <Table
        rows={rows}
        rowKey={(r) => r.id}
        columns={[
          { key: 'patient', header: 'Patient', render: (r) => r.patient },
          { key: 'doctor', header: 'Doctor', render: (r) => r.doctor },
          {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            render: (r) => (r.amount ? `₹${r.amount}` : '—'),
          },
          {
            key: 'method',
            header: 'Method',
            render: (r) => (
              <StatusPill tone="neutral">{r.method}</StatusPill>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <StatusPill
                tone={
                  r.status === 'paid' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'
                }
              >
                {r.status}
              </StatusPill>
            ),
          },
          { key: 'at', header: 'When', render: (r) => (
            <span className="text-text-muted text-xs">{r.at}</span>
          ) },
        ]}
      />
    </div>
  )
}
