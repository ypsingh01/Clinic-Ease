import {
  IconBell,
  IconCalendarEvent,
  IconHeartbeat,
  IconLayoutDashboard,
  IconStethoscope,
  IconUser,
  IconUsers,
  IconClockHour4,
} from '@tabler/icons-react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppShell, type NavItem } from './AppShell'

const items: NavItem[] = [
  { to: '/patient', label: 'Dashboard', icon: IconLayoutDashboard, end: true },
  { to: '/patient/doctors', label: 'Doctors', icon: IconStethoscope },
  { to: '/patient/book', label: 'Book', icon: IconCalendarEvent },
  { to: '/patient/appointments', label: 'Appointments', icon: IconClockHour4 },
  { to: '/patient/waitlist', label: 'Waitlist', icon: IconHeartbeat },
  { to: '/patient/notifications', label: 'Notifications', icon: IconBell },
  { to: '/patient/dependents', label: 'Dependents', icon: IconUsers },
  { to: '/patient/profile', label: 'Profile', icon: IconUser },
]

function metaForPath(pathname: string) {
  if (pathname.startsWith('/patient/doctors/')) {
    return { title: 'Doctor profile', subtitle: 'Specialty, days, and booking' }
  }
  if (pathname.startsWith('/patient/book/')) {
    return { title: 'Book a visit', subtitle: 'Pick a time, share a note, confirm' }
  }
  const map: Record<string, { title: string; subtitle: string }> = {
    '/patient': { title: 'Your care today', subtitle: 'Next visit and live queue' },
    '/patient/doctors': { title: 'Find a doctor', subtitle: 'Specialty and availability' },
    '/patient/book': { title: 'Book a visit', subtitle: 'Choose who, then when' },
    '/patient/appointments': {
      title: 'Your visits',
      subtitle: 'Upcoming, check-in, and history',
    },
    '/patient/waitlist': {
      title: 'Waitlist',
      subtitle: 'Claim a spot when one opens',
    },
    '/patient/notifications': {
      title: 'Updates',
      subtitle: 'Reminders and ETA shifts',
    },
    '/patient/dependents': {
      title: 'Family',
      subtitle: 'Book for people you care for',
    },
    '/patient/profile': {
      title: 'You',
      subtitle: 'Account and preferences',
    },
  }
  return map[pathname] ?? { title: 'Patient', subtitle: 'Guided care' }
}

export function PatientLayout() {
  const { pathname } = useLocation()
  const meta = metaForPath(pathname)
  return (
    <AppShell items={items} title={meta.title} subtitle={meta.subtitle} badge="Patient">
      <Outlet />
    </AppShell>
  )
}
