import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, API_URL } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import {
  CANCEL_POLICY_HOURS,
  defaultWeek,
  minutesUntilEta,
  todayISO,
  type Broadcast,
  type ClinicAppointment,
  type ClinicDoctor,
  type DayAvailability,
  type DayKey,
  type Dependent,
  type NotificationItem,
  type PaymentRow,
  type WaitlistEntry,
} from './types'
import { useClinic as useMockClinic, ClinicProvider as MockClinicProvider } from './ClinicEngineContext'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_CLINIC === 'true'
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

type Block = {
  id: string
  startLabel: string
  endLabel: string
  capacity: number
  booked: number
  state: 'open' | 'full' | 'waitlist'
}

type ClinicValue = {
  doctors: ClinicDoctor[]
  weekByDoctor: Record<string, Record<DayKey, DayAvailability>>
  appointments: ClinicAppointment[]
  waitlist: WaitlistEntry[]
  dependents: Dependent[]
  notifications: NotificationItem[]
  payments: PaymentRow[]
  broadcasts: Broadcast[]
  blockFills: Record<string, number>
  delayByDoctor: Record<string, number>
  servingByDoctor: Record<string, number>
  getDoctor: (id: string) => ClinicDoctor | undefined
  getBlocks: (doctorId: string, date: string) => Block[]
  confirmBooking: (input: {
    doctorId: string
    date: string
    blockStart: string
    blockEnd: string
    patientName: string
    patientPhone: string
    dependentId: string | null
    intake: string
    token: number
  }) => ClinicAppointment | Promise<ClinicAppointment>
  cancelAppointment: (id: string) => { ok: boolean; reason?: string } | Promise<{ ok: boolean; reason?: string }>
  forceCancelAppointment: (id: string) => { ok: boolean; reason?: string } | Promise<{ ok: boolean; reason?: string }>
  rescheduleAppointment: (
    id: string,
    next: { date: string; blockStart: string; blockEnd: string; token: number },
  ) => { ok: boolean; reason?: string } | Promise<{ ok: boolean; reason?: string }>
  checkIn: (id: string) => { ok: boolean; reason?: string } | Promise<{ ok: boolean; reason?: string }>
  setAppointmentStatus: (
    id: string,
    status: ClinicAppointment['status'],
    durationMin?: number,
  ) => void | Promise<void>
  applyDelay: (doctorId: string, minutes: number) => void | Promise<void>
  clearDelay: (doctorId: string) => void | Promise<void>
  joinWaitlist: (input: {
    doctorId: string
    date: string
    blockStart: string
    blockEnd: string
    patientName: string
  }) => void | Promise<void>
  claimWaitlist: (id: string) => WaitlistEntry | null | Promise<WaitlistEntry | null>
  expireWaitlistOffers: () => void
  manualWalkIn: (input: {
    doctorId: string
    patientName: string
    patientPhone: string
    date: string
    blockStart: string
    blockEnd: string
    payAtClinic: boolean
    note: string
  }) => ClinicAppointment | Promise<ClinicAppointment>
  addDependent: (d: Omit<Dependent, 'id'>) => void | Promise<void>
  removeDependent: (id: string) => void | Promise<void>
  markNotificationsRead: () => void | Promise<void>
  addBroadcast: (input: Omit<Broadcast, 'id' | 'sentAt' | 'delivered' | 'failed'>) => void | Promise<void>
  updateDoctor: (id: string, patch: Partial<ClinicDoctor>) => void | Promise<void>
  toggleDoctor: (id: string) => void | Promise<void>
  addDoctor: (input: Omit<ClinicDoctor, 'id' | 'active'> & { active?: boolean }) => void | Promise<void>
  updateWeek: (doctorId: string, day: DayKey, patch: Partial<DayAvailability>) => void | Promise<void>
  queueForDoctor: (doctorId: string, date?: string) => ClinicAppointment[]
  canCancel: (apt: ClinicAppointment) => boolean
  pushNotification: (n: Omit<NotificationItem, 'id' | 'time' | 'read'>) => void
  refresh: () => Promise<void>
}

const Ctx = createContext<ClinicValue | null>(null)

function mapApt(a: Record<string, unknown>): ClinicAppointment {
  return {
    id: String(a.id),
    doctorId: String(a.doctorId),
    patientName: String(a.patientName ?? ''),
    patientPhone: String(a.patientPhone ?? ''),
    dependentId: (a.dependentId as string | null) ?? null,
    date: String(a.date),
    blockStart: String(a.blockStart),
    blockEnd: String(a.blockEnd),
    token: Number(a.token),
    etaStart: String(a.etaStart),
    etaEnd: String(a.etaEnd),
    status: a.status as ClinicAppointment['status'],
    intake: String(a.intake ?? ''),
    paid: Boolean(a.paid),
    payAtClinic: Boolean(a.payAtClinic),
    durationMin: a.durationMin as number | undefined,
    createdBy: (a.createdBy as 'patient' | 'admin') ?? 'patient',
  }
}

function ApiClinicProviderInner({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth()
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([])
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [dependents, setDependents] = useState<Dependent[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [weekByDoctor, setWeekByDoctor] = useState<
    Record<string, Record<DayKey, DayAvailability>>
  >({})
  const [delayByDoctor, setDelayByDoctor] = useState<Record<string, number>>({})
  const [servingByDoctor, setServingByDoctor] = useState<Record<string, number>>({})
  const [blocksCache, setBlocksCache] = useState<Record<string, Block[]>>({})

  const refresh = useCallback(async () => {
    try {
      const docs = await api<{ doctors: ClinicDoctor[] }>('/api/doctors')
      setDoctors(docs.doctors)

      if (!isAuthenticated) return

      const [apts, wl, deps, notes] = await Promise.all([
        api<{ appointments: ClinicAppointment[] }>('/api/appointments').catch(() => ({
          appointments: [] as ClinicAppointment[],
        })),
        api<{ waitlist: WaitlistEntry[] }>('/api/waitlist').catch(() => ({ waitlist: [] })),
        api<{ dependents: Dependent[] }>('/api/dependents').catch(() => ({ dependents: [] })),
        api<{
          notifications: (NotificationItem & { channel?: string })[]
        }>('/api/notifications').catch(() => ({
          notifications: [],
        })),
      ])
      setAppointments(apts.appointments.map((a) => mapApt(a as unknown as Record<string, unknown>)))
      setWaitlist(wl.waitlist)
      setDependents(deps.dependents)
      setNotifications(
        notes.notifications.map((n) => ({
          ...n,
          kind:
            n.channel === 'whatsapp' || n.kind === 'whatsapp'
              ? 'whatsapp'
              : n.kind === 'eta' ||
                  n.kind === 'confirm' ||
                  n.kind === 'waitlist' ||
                  n.kind === 'reminder'
                ? n.kind
                : 'confirm',
        })),
      )

      const mehtaQueue = await api<{
        appointments: ClinicAppointment[]
        delayOffsetMin: number
        servingToken: number
      }>(`/api/queue/dr-mehta/${todayISO()}`).catch(() => null)
      if (mehtaQueue) {
        setDelayByDoctor((p) => ({ ...p, 'dr-mehta': mehtaQueue.delayOffsetMin }))
        setServingByDoctor((p) => ({ ...p, 'dr-mehta': mehtaQueue.servingToken }))
      }

      const pay = await api<{
        payments: PaymentRow[]
        revenueTotal: number
      }>('/api/admin/payments').catch(() => null)
      if (pay) setPayments(pay.payments)

      const bc = await api<{ broadcasts: Broadcast[] }>('/api/notifications/broadcasts').catch(
        () => null,
      )
      if (bc) setBroadcasts(bc.broadcasts)

      const weeks: Record<string, Record<DayKey, DayAvailability>> = {}
      for (const d of docs.doctors.slice(0, 6)) {
        try {
          const av = await api<{
            availability: {
              dayOfWeek: number
              enabled: boolean
              startTime: string
              endTime: string
              breakStart: string
              breakEnd: string
              hourlyCapacity: number
            }[]
          }>(`/api/doctors/${d.id}/availability`)
          const week = defaultWeek()
          for (const row of av.availability) {
            const key = DAY_NAMES[row.dayOfWeek] as DayKey
            week[key] = {
              enabled: row.enabled,
              start: row.startTime,
              end: row.endTime,
              breakStart: row.breakStart,
              breakEnd: row.breakEnd,
              onLeave: false,
            }
          }
          weeks[d.id] = week
        } catch {
          weeks[d.id] = defaultWeek()
        }
      }
      setWeekByDoctor(weeks)
    } catch (e) {
      console.error('clinic refresh failed', e)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void refresh()
  }, [refresh, token])

  useEffect(() => {
    if (USE_MOCK || !API_URL || !isAuthenticated) return
    let socket: { disconnect: () => void } | null = null
    ;(async () => {
      try {
        const { io } = await import('socket.io-client')
        const s = io(import.meta.env.VITE_SOCKET_URL ?? API_URL, {
          transports: ['websocket', 'polling'],
          auth: { token },
        })
        s.on('clinic:updated', () => void refresh())
        s.on('queue:updated', () => void refresh())
        socket = s
      } catch {
        /* optional */
      }
    })()
    const t = window.setInterval(() => void refresh(), 20000)
    return () => {
      window.clearInterval(t)
      socket?.disconnect()
    }
  }, [refresh, isAuthenticated, token])

  const getBlocks = useCallback(
    (doctorId: string, date: string) => {
      const key = `${doctorId}|${date}`
      if (blocksCache[key]) return blocksCache[key]
      void api<{ blocks: Block[] }>(`/api/slots/${doctorId}?date=${date}`)
        .then((res) => {
          setBlocksCache((prev) => ({ ...prev, [key]: res.blocks }))
        })
        .catch(() => undefined)
      return (
        blocksCache[key] ??
        []
      )
    },
    [blocksCache],
  )

  // Prefetch today's slots when doctors load
  useEffect(() => {
    doctors.forEach((d) => {
      void api<{ blocks: Block[] }>(`/api/slots/${d.id}?date=${todayISO()}`).then((res) => {
        setBlocksCache((prev) => ({ ...prev, [`${d.id}|${todayISO()}`]: res.blocks }))
      })
    })
  }, [doctors])

  const confirmBooking = useCallback(
    async (input: {
      doctorId: string
      date: string
      blockStart: string
      blockEnd: string
      patientName: string
      patientPhone: string
      dependentId: string | null
      intake: string
      token: number
    }) => {
      const held = await api<{ appointment: ClinicAppointment }>('/api/appointments/hold', {
        method: 'POST',
        json: {
          doctorId: input.doctorId,
          date: input.date,
          hourBlockStart: input.blockStart,
          hourBlockEnd: input.blockEnd,
          dependentId: input.dependentId,
          intake: input.intake,
          captchaToken: await import('@/components/security/RecaptchaField').then((m) =>
            m.getRecaptchaToken('hold'),
          ),
        },
      })
      const order = await api<{
        mock?: boolean
        orderId: string
        amount: number
        keyId: string
        appointmentId: string
      }>('/api/payments/order', {
        method: 'POST',
        json: { appointmentId: held.appointment.id },
      })

      let confirmed: { appointment: ClinicAppointment }
      if (order.mock) {
        confirmed = await api<{ appointment: ClinicAppointment }>('/api/payments/confirm-mock', {
          method: 'POST',
          json: { appointmentId: held.appointment.id },
        })
      } else {
        const { openRazorpayCheckout } = await import('@/lib/razorpay')
        const pay = await openRazorpayCheckout({
          orderId: order.orderId,
          amountInr: order.amount,
          keyId: order.keyId,
          patientName: input.patientName,
          patientPhone: input.patientPhone,
          appointmentId: held.appointment.id,
        })
        confirmed = await api<{ appointment: ClinicAppointment }>('/api/payments/confirm', {
          method: 'POST',
          json: {
            appointmentId: held.appointment.id,
            ...pay,
          },
        })
      }
      await refresh()
      return mapApt(confirmed.appointment as unknown as Record<string, unknown>)
    },
    [refresh],
  )

  const cancelAppointment = useCallback(
    async (id: string) => {
      try {
        await api(`/api/appointments/${id}/cancel`, { method: 'POST' })
        await refresh()
        return { ok: true }
      } catch (e) {
        return { ok: false, reason: e instanceof Error ? e.message : 'Cancel failed' }
      }
    },
    [refresh],
  )

  const value = useMemo<ClinicValue>(
    () => ({
      doctors,
      weekByDoctor,
      appointments,
      waitlist,
      dependents,
      notifications,
      payments,
      broadcasts,
      blockFills: {},
      delayByDoctor,
      servingByDoctor,
      getDoctor: (id) => doctors.find((d) => d.id === id),
      getBlocks,
      confirmBooking,
      cancelAppointment,
      forceCancelAppointment: cancelAppointment,
      rescheduleAppointment: async (id, next) => {
        try {
          await api(`/api/appointments/${id}/reschedule`, {
            method: 'POST',
            json: {
              date: next.date,
              hourBlockStart: next.blockStart,
              hourBlockEnd: next.blockEnd,
            },
          })
          await refresh()
          return { ok: true }
        } catch (e) {
          return { ok: false, reason: e instanceof Error ? e.message : 'Failed' }
        }
      },
      checkIn: async (id) => {
        try {
          await api(`/api/appointments/${id}/check-in`, { method: 'POST' })
          await refresh()
          return { ok: true }
        } catch (e) {
          return { ok: false, reason: e instanceof Error ? e.message : 'Failed' }
        }
      },
      setAppointmentStatus: async (id, status, durationMin) => {
        const map: Record<string, string> = {
          in_progress: 'in_progress',
          completed: 'completed',
          no_show: 'no_show',
          upcoming: 'booked',
          checked_in: 'booked',
        }
        await api(`/api/appointments/${id}/status`, {
          method: 'PATCH',
          json: { status: map[status] ?? status, durationMin },
        })
        await refresh()
      },
      applyDelay: async (doctorId, minutes) => {
        await api(`/api/queue/${doctorId}/delay`, {
          method: 'POST',
          json: { date: todayISO(), minutes },
        })
        await refresh()
      },
      clearDelay: async (doctorId) => {
        await api(`/api/queue/${doctorId}/delay`, {
          method: 'POST',
          json: { date: todayISO(), minutes: 0 },
        })
        await refresh()
      },
      joinWaitlist: async (input) => {
        await api('/api/waitlist/join', {
          method: 'POST',
          json: {
            doctorId: input.doctorId,
            date: input.date,
            hourBlockStart: input.blockStart,
            hourBlockEnd: input.blockEnd,
          },
        })
        await refresh()
      },
      claimWaitlist: async (id) => {
        const res = await api<{ entry: WaitlistEntry }>(`/api/waitlist/${id}/claim`, {
          method: 'POST',
        })
        await refresh()
        return res.entry
      },
      expireWaitlistOffers: () => undefined,
      manualWalkIn: async (input) => {
        const res = await api<{ appointment: ClinicAppointment }>('/api/admin/walk-in', {
          method: 'POST',
          json: {
            doctorId: input.doctorId,
            patientName: input.patientName,
            patientPhone: input.patientPhone,
            date: input.date,
            hourBlockStart: input.blockStart,
            hourBlockEnd: input.blockEnd,
            payAtClinic: input.payAtClinic,
            note: input.note,
          },
        })
        await refresh()
        return mapApt(res.appointment as unknown as Record<string, unknown>)
      },
      addDependent: async (d) => {
        await api('/api/dependents', { method: 'POST', json: d })
        await refresh()
      },
      removeDependent: async (id) => {
        await api(`/api/dependents/${id}`, { method: 'DELETE' })
        await refresh()
      },
      markNotificationsRead: async () => {
        await api('/api/notifications/read-all', { method: 'POST' })
        await refresh()
      },
      addBroadcast: async (input) => {
        await api('/api/notifications/broadcast', { method: 'POST', json: input })
        await refresh()
      },
      updateDoctor: async (id, patch) => {
        await api(`/api/doctors/${id}`, {
          method: 'PATCH',
          json: {
            name: patch.name,
            specialty: patch.specialty,
            bio: patch.bio,
            photoUrl: patch.photoUrl,
            consultationFeeInr: patch.feeInr,
            hourlyCapacityOverride: patch.capacityPerHour,
            active: patch.active,
            initials: patch.initials,
          },
        })
        await refresh()
      },
      toggleDoctor: async (id) => {
        const d = doctors.find((x) => x.id === id)
        if (!d) return
        await api(`/api/doctors/${id}`, {
          method: 'PATCH',
          json: { active: !d.active },
        })
        await refresh()
      },
      addDoctor: async (input) => {
        await api('/api/doctors', {
          method: 'POST',
          json: {
            name: input.name,
            specialty: input.specialty,
            initials: input.initials,
            bio: input.bio,
            photoUrl: input.photoUrl,
            feeInr: input.feeInr,
            capacityPerHour: input.capacityPerHour,
            active: input.active,
          },
        })
        await refresh()
      },
      updateWeek: async (doctorId, day, patch) => {
        const dayOfWeek = DAY_NAMES.indexOf(day as (typeof DAY_NAMES)[number])
        await api(`/api/doctors/${doctorId}/availability`, {
          method: 'PUT',
          json: {
            dayOfWeek,
            enabled: patch.enabled,
            startTime: patch.start,
            endTime: patch.end,
            breakStart: patch.breakStart,
            breakEnd: patch.breakEnd,
          },
        })
        await refresh()
      },
      queueForDoctor: (doctorId, date = todayISO()) =>
        appointments.filter((a) => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled'),
      canCancel: (apt) => {
        if (apt.status !== 'upcoming' && apt.status !== 'checked_in') return false
        return minutesUntilEta(apt.date, apt.etaStart) >= CANCEL_POLICY_HOURS * 60
      },
      pushNotification: () => undefined,
      refresh,
    }),
    [
      doctors,
      weekByDoctor,
      appointments,
      waitlist,
      dependents,
      notifications,
      payments,
      broadcasts,
      delayByDoctor,
      servingByDoctor,
      getBlocks,
      confirmBooking,
      cancelAppointment,
      refresh,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

function MockBridge({ children }: { children: ReactNode }) {
  const mock = useMockClinic()
  const value = useMemo(
    () => ({ ...mock, refresh: async () => undefined }),
    [mock],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  if (USE_MOCK) {
    return (
      <MockClinicProvider>
        <MockBridge>{children}</MockBridge>
      </MockClinicProvider>
    )
  }
  return <ApiClinicProviderInner>{children}</ApiClinicProviderInner>
}

export function useClinic() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useClinic must be used within ClinicProvider')
  return ctx
}

export { CANCEL_POLICY_HOURS }
