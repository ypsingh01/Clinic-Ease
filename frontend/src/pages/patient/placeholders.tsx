import { ModulePlaceholder } from '@/components/domain/ModulePlaceholder'

export function PatientDoctorsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Doctors"
      title="Discover the right clinician"
      description="Rich doctor cards with specialty, photo, and available days — not a directory table."
      bullets={['Specialty filters', 'Symptom helper entry', 'Available days at a glance']}
      action={{ label: 'Back to dashboard', to: '/patient' }}
    />
  )
}

export function PatientBookPage() {
  return (
    <ModulePlaceholder
      eyebrow="Booking"
      title="Hour blocks with remaining capacity"
      description="Calendar → capacity blocks → intake → hold timer → pay. Built as a calm multi-step ritual."
      bullets={['X of N spots remaining', '5-minute hold', 'Pre-visit intake form']}
      action={{ label: 'Browse doctors first', to: '/patient/doctors' }}
    />
  )
}

export function PatientAppointmentsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Appointments"
      title="Your care timeline"
      description="Upcoming and past visits with token, ETA window, reschedule policy, and check-in."
      bullets={['Live serving token', 'Cancel within policy', 'Check-in starts the queue clock']}
    />
  )
}

export function PatientWaitlistPage() {
  return (
    <ModulePlaceholder
      eyebrow="Waitlist"
      title="Claim openings with a calm countdown"
      description="When a block is full, join the FIFO waitlist. Claims expire in about 10 minutes."
      bullets={['Auto-notify on cancel', 'Time-limited claim banner', 'Then pay as usual']}
    />
  )
}

export function PatientNotificationsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Notifications"
      title="Confirmations, reminders, ETA shifts"
      description="In-app feed mirroring WhatsApp templates — 24h / 1h reminders and live updates."
    />
  )
}

export function PatientDependentsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Dependents"
      title="Family care cards"
      description="Parent, spouse, child profiles — book on their behalf with relation visible to clinicians."
    />
  )
}

export function PatientProfilePage() {
  return (
    <ModulePlaceholder
      eyebrow="Profile"
      title="Identity & preferences"
      description="Name, email, phone, WhatsApp link status, and notification preferences in grouped panels."
    />
  )
}
