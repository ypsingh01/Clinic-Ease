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
    return { title: 'Book a visit', subtitle: 'Hour block, intake, hold, and pay' }
  }
  const map: Record<string, { title: string; subtitle: string }> = {
    '/patient': { title: 'Your care today', subtitle: 'Next visit, live queue, and quick actions' },
    '/patient/doctors': { title: 'Doctors', subtitle: 'Specialty, availability, and care fit' },
    '/patient/book': { title: 'Book a visit', subtitle: 'Pick a doctor, hour block, then confirm' },
    '/patient/appointments': {
      title: 'Appointments',
      subtitle: 'Upcoming, history, and check-in',
    },
    '/patient/waitlist': {
      title: 'Waitlist',
      subtitle: 'Claim openings when capacity frees up',
    },
    '/patient/notifications': {
      title: 'Notifications',
      subtitle: 'Reminders and live ETA updates',
    },
    '/patient/dependents': {
      title: 'Family profiles',
      subtitle: 'Book on behalf of people you care for',
    },
    '/patient/profile': {
      title: 'Profile',
      subtitle: 'Account, WhatsApp link, and preferences',
    },
  }
  return map[pathname] ?? { title: 'Patient', subtitle: 'Guided care journey' }
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
