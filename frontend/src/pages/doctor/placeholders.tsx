import { ModulePlaceholder } from '@/components/domain/ModulePlaceholder'

export function DoctorAvailabilityPage() {
  return (
    <ModulePlaceholder
      eyebrow="Availability"
      title="Paint your week"
      description="Weekly hours, breaks, leave, and hourly patient capacity — with live spots-per-hour preview."
      bullets={['Default from avg consult time', 'Leave days', 'Capacity without breaking booked tokens']}
    />
  )
}

export function DoctorAnalyticsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Analytics"
      title="Your performance story"
      description="Punctuality (ETA vs actual), daily load, and personal no-show rate — not a raw export dump."
    />
  )
}

export function DoctorSettingsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Settings"
      title="Command preferences"
      description="Profile display, default capacity hints, notification prefs, and delay shortcut defaults."
    />
  )
}
