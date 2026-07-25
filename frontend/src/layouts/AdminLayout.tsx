import {
  IconBell,
  IconCalendarEvent,
  IconChartBar,
  IconCoin,
  IconFileAnalytics,
  IconStethoscope,
  IconUserPlus,
} from '@tabler/icons-react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppShell, type NavItem } from './AppShell'

const items: NavItem[] = [
  { to: '/admin', label: 'Overview', icon: IconChartBar, end: true },
  { to: '/admin/doctors', label: 'Doctors', icon: IconStethoscope },
  { to: '/admin/appointments', label: 'Appointments', icon: IconCalendarEvent },
  { to: '/admin/book', label: 'Manual booking', icon: IconUserPlus },
  { to: '/admin/revenue', label: 'Revenue', icon: IconCoin },
  { to: '/admin/reports', label: 'Reports', icon: IconFileAnalytics },
  { to: '/admin/notifications', label: 'Notifications', icon: IconBell },
  { to: '/admin/analytics', label: 'Analytics', icon: IconChartBar },
]

const titles: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Clinic overview', subtitle: 'Calm pulse across doctors and revenue' },
  '/admin/doctors': { title: 'Doctor roster', subtitle: 'Profiles, capacity, and activation' },
  '/admin/appointments': {
    title: 'Schedule',
    subtitle: 'Combined view across all doctors',
  },
  '/admin/book': { title: 'Manual booking', subtitle: 'Walk-ins and phone bookings' },
  '/admin/revenue': { title: 'Revenue', subtitle: 'Payments, totals, and ledger' },
  '/admin/reports': { title: 'Reports', subtitle: 'Bookings, cancellations, no-shows' },
  '/admin/notifications': {
    title: 'Broadcasts',
    subtitle: 'Clinic-wide messages and delivery log',
  },
  '/admin/analytics': {
    title: 'Performance',
    subtitle: 'Punctuality, heatmap, waitlist conversion',
  },
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const meta = titles[pathname] ?? { title: 'Admin', subtitle: 'Calm clinic operations' }
  const mobileNav: NavItem[] = [
    items[0], // Overview
    items[1], // Doctors
    items[2], // Appointments
    items[4], // Revenue
  ]
  return (
    <AppShell
      items={items}
      mobileNav={mobileNav}
      title={meta.title}
      subtitle={meta.subtitle}
      badge="Admin"
      dense
    >
      <Outlet />
    </AppShell>
  )
}
