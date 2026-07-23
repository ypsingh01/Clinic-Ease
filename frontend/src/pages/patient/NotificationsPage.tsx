import { IconBell } from '@tabler/icons-react'
import { Button, Card, EmptyState, StatusPill } from '@/components/ui'
import { usePatientData } from '@/patient/PatientDataContext'

const kindTone = {
  reminder: 'warning',
  eta: 'info',
  confirm: 'success',
  waitlist: 'accent',
  whatsapp: 'info',
} as const

export function NotificationsPage() {
  const { notifications, markNotificationsRead } = usePatientData()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-text-secondary text-sm">
          {unread ? `${unread} unread` : 'All caught up'} · mirrors WhatsApp templates
        </p>
        {unread ? (
          <Button size="sm" variant="ghost" onClick={markNotificationsRead}>
            Mark all read
          </Button>
        ) : null}
      </div>

      {!notifications.length ? (
        <EmptyState
          icon={<IconBell size={22} stroke={1.5} />}
          title="No notifications yet"
          description="Confirmations, 24h/1h reminders, and live ETA shifts will appear here."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              padding="md"
              className={n.read ? 'opacity-80' : 'border-primary/25'}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={kindTone[n.kind]}>{n.kind}</StatusPill>
                    {!n.read ? <StatusPill tone="accent">New</StatusPill> : null}
                  </div>
                  <h3 className="font-display mt-2 text-[15px] font-medium">{n.title}</h3>
                  <p className="text-text-secondary mt-1 text-sm leading-relaxed">{n.body}</p>
                </div>
                <p className="text-text-muted shrink-0 text-xs">{n.time}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
