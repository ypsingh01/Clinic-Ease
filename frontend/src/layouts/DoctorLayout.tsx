import {
  IconCalendarStats,
  IconChartBar,
  IconClipboardList,
  IconSettings,
} from '@tabler/icons-react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppShell, type NavItem } from './AppShell'

const items: NavItem[] = [
  { to: '/doctor', label: "Today's queue", icon: IconClipboardList, end: true },
  { to: '/doctor/availability', label: 'Availability', icon: IconCalendarStats },
  { to: '/doctor/analytics', label: 'Analytics', icon: IconChartBar },
  { to: '/doctor/settings', label: 'Settings', icon: IconSettings },
]

const titles: Record<string, { title: string; subtitle: string }> = {
  '/doctor': { title: "Today's queue", subtitle: 'Token stream, status, and running-late control' },
  '/doctor/availability': {
    title: 'Availability',
    subtitle: 'Hours, breaks, leave, and hourly capacity',
  },
  '/doctor/analytics': {
    title: 'Your analytics',
    subtitle: 'Punctuality, load, and no-show trends',
  },
  '/doctor/settings': { title: 'Settings', subtitle: 'Profile and delay shortcuts' },
}

export function DoctorLayout() {
  const { pathname } = useLocation()
  const meta = titles[pathname] ?? { title: 'Doctor', subtitle: 'Clinic command surface' }
  return (
    <AppShell
      items={items}
      title={meta.title}
      subtitle={meta.subtitle}
      badge="Doctor"
      dense
    >
      <Outlet />
    </AppShell>
  )
}
