import { ModulePlaceholder } from '@/components/domain/ModulePlaceholder'

export function AdminDoctorsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Roster"
      title="Doctor gallery"
      description="Add, edit, deactivate the fixed 5–6 doctor roster with capacity override — gallery + detail sheet."
    />
  )
}

export function AdminAppointmentsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Schedule"
      title="Combined schedule grid"
      description="Cross-doctor canvas for the day/week with filters — the operations heartbeat."
    />
  )
}

export function AdminBookPage() {
  return (
    <ModulePlaceholder
      eyebrow="Walk-ins"
      title="Manual booking flow"
      description="Phone and walk-in bookings append to the end of the queue so existing tokens stay intact."
      bullets={['Pay at clinic option', 'Admin-comped flag', 'Never reorder existing patients']}
    />
  )
}

export function AdminRevenuePage() {
  return (
    <ModulePlaceholder
      eyebrow="Revenue"
      title="KPI band + ledger"
      description="Payment history with totals and filters — a revenue story, not a bare transactions table."
    />
  )
}

export function AdminReportsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Reports"
      title="Narrative clinic reports"
      description="Bookings/week, cancellations, no-shows, avg consult time — exportable summaries."
    />
  )
}

export function AdminNotificationsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Broadcasts"
      title="Clinic-wide messages"
      description="Manual notifications like “Doctor unavailable today” plus a delivery log."
    />
  )
}

export function AdminAnalyticsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Analytics"
      title="Doctor performance cockpit"
      description="Punctuality, busiest-hour heatmap, no-show trend, waitlist conversion — FR18 & FR28."
    />
  )
}
