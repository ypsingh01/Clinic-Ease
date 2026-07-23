import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  CANCEL_POLICY_HOURS,
  DEFAULT_DOCTORS,
  blockFillKey,
  defaultWeek,
  etaWindow,
  minutesUntilEta,
  todayISO,
  weekdayKey,
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

const STORAGE = 'clinicease.clinic.v1'

type BlockFills = Record<string, number>

type Store = {
  doctors: ClinicDoctor[]
  weekByDoctor: Record<string, Record<DayKey, DayAvailability>>
  appointments: ClinicAppointment[]
  waitlist: WaitlistEntry[]
  dependents: Dependent[]
  notifications: NotificationItem[]
  payments: PaymentRow[]
  broadcasts: Broadcast[]
  blockFills: BlockFills
  delayByDoctor: Record<string, number>
  servingByDoctor: Record<string, number>
}

type ClinicValue = Store & {
  getDoctor: (id: string) => ClinicDoctor | undefined
  getBlocks: (doctorId: string, date: string) => {
    id: string
    startLabel: string
    endLabel: string
    capacity: number
    booked: number
    state: 'open' | 'full' | 'waitlist'
  }[]
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
  }) => ClinicAppointment
  cancelAppointment: (id: string) => { ok: boolean; reason?: string }
  /** Admin / staff cancel — bypasses patient 2h policy */
  forceCancelAppointment: (id: string) => { ok: boolean; reason?: string }
  rescheduleAppointment: (
    id: string,
    next: { date: string; blockStart: string; blockEnd: string; token: number },
  ) => { ok: boolean; reason?: string }
  checkIn: (id: string) => { ok: boolean; reason?: string }
  setAppointmentStatus: (
    id: string,
    status: ClinicAppointment['status'],
    durationMin?: number,
  ) => void
  applyDelay: (doctorId: string, minutes: number) => void
  clearDelay: (doctorId: string) => void
  joinWaitlist: (input: {
    doctorId: string
    date: string
    blockStart: string
    blockEnd: string
    patientName: string
  }) => void
  claimWaitlist: (id: string) => WaitlistEntry | null
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
  }) => ClinicAppointment
  addDependent: (d: Omit<Dependent, 'id'>) => void
  removeDependent: (id: string) => void
  markNotificationsRead: () => void
  addBroadcast: (input: Omit<Broadcast, 'id' | 'sentAt' | 'delivered' | 'failed'>) => void
  updateDoctor: (id: string, patch: Partial<ClinicDoctor>) => void
  toggleDoctor: (id: string) => void
  addDoctor: (input: Omit<ClinicDoctor, 'id' | 'active'> & { active?: boolean }) => void
  updateWeek: (doctorId: string, day: DayKey, patch: Partial<DayAvailability>) => void
  queueForDoctor: (doctorId: string, date?: string) => ClinicAppointment[]
  canCancel: (apt: ClinicAppointment) => boolean
  pushNotification: (n: Omit<NotificationItem, 'id' | 'time' | 'read'>) => void
}

function seedStore(): Store {
  const doctors = DEFAULT_DOCTORS
  const weekByDoctor: Store['weekByDoctor'] = {}
  doctors.forEach((d) => {
    weekByDoctor[d.id] = defaultWeek()
  })
  const date = todayISO()
  const delayByDoctor: Record<string, number> = {}
  const servingByDoctor: Record<string, number> = { 'dr-mehta': 7 }
  const appointments: ClinicAppointment[] = [
    {
      id: 'apt-seed-1',
      doctorId: 'dr-mehta',
      patientName: 'Asha Verma',
      patientPhone: '+91 98765 43210',
      dependentId: null,
      date,
      blockStart: '10:00',
      blockEnd: '11:00',
      token: 11,
      ...etaWindow('10:00', 11, 5, 0),
      status: 'upcoming',
      intake: 'Mild fever since yesterday. No known allergies.',
      paid: true,
      payAtClinic: false,
      createdBy: 'patient',
    },
    {
      id: 'apt-seed-2',
      doctorId: 'dr-mehta',
      patientName: 'Priya Nair',
      patientPhone: '+91 98765 11101',
      dependentId: null,
      date,
      blockStart: '10:00',
      blockEnd: '11:00',
      token: 7,
      etaStart: '10:00',
      etaEnd: '10:05',
      status: 'in_progress',
      intake: 'Mild fever since yesterday. Prefers morning slots.',
      paid: true,
      payAtClinic: false,
      createdBy: 'patient',
    },
    {
      id: 'apt-seed-3',
      doctorId: 'dr-mehta',
      patientName: 'Aman Shah',
      patientPhone: '+91 98765 11102',
      dependentId: 'dep-1',
      date,
      blockStart: '10:00',
      blockEnd: '11:00',
      token: 8,
      ...etaWindow('10:00', 8),
      status: 'upcoming',
      intake: 'Sore throat for 2 days. Child visit.',
      paid: true,
      payAtClinic: false,
      createdBy: 'patient',
    },
    {
      id: 'apt-seed-done',
      doctorId: 'dr-mehta',
      patientName: 'Ravi Menon',
      patientPhone: '+91 98765 11100',
      dependentId: null,
      date,
      blockStart: '09:00',
      blockEnd: '10:00',
      token: 6,
      etaStart: '09:25',
      etaEnd: '09:30',
      status: 'completed',
      intake: 'Annual checkup.',
      paid: true,
      payAtClinic: false,
      durationMin: 7,
      createdBy: 'patient',
    },
  ]
  const blockFills: BlockFills = {
    [blockFillKey('dr-mehta', date, '10:00')]: 4,
    [blockFillKey('dr-mehta', date, '09:00')]: 6,
  }
  return {
    doctors,
    weekByDoctor,
    appointments,
    waitlist: [
      {
        id: 'wl-1',
        doctorId: 'dr-khan',
        date,
        blockStart: '11:00',
        blockEnd: '12:00',
        patientName: 'Asha Verma',
        position: 2,
        status: 'offered',
        offerExpiresAt: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
      },
    ],
    dependents: [{ id: 'dep-1', name: 'Aarav Verma', relation: 'child', age: 8 }],
    notifications: [
      {
        id: 'n1',
        title: 'Visit confirmed',
        body: 'Token #11 with Dr. Mehta · estimated window 10:40–10:55',
        time: 'Today · 8:12 AM',
        read: false,
        kind: 'confirm',
      },
      {
        id: 'n2',
        title: 'Reminder in 1 hour',
        body: 'Your estimated window is approaching.',
        time: 'Today · 9:40 AM',
        read: false,
        kind: 'reminder',
      },
    ],
    payments: [
      {
        id: 'p1',
        patient: 'Asha Verma',
        doctorId: 'dr-mehta',
        amount: 500,
        method: 'razorpay',
        status: 'paid',
        at: 'Today · 8:14 AM',
      },
    ],
    broadcasts: [],
    blockFills,
    delayByDoctor,
    servingByDoctor,
  }
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (!raw) return seedStore()
    return { ...seedStore(), ...JSON.parse(raw) } as Store
  } catch {
    return seedStore()
  }
}

function save(store: Store) {
  localStorage.setItem(STORAGE, JSON.stringify(store))
}

const HOUR_STARTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

const Ctx = createContext<ClinicValue | null>(null)

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => load())
  const remindersFired = useRef(new Set<string>())

  const commit = useCallback((updater: (prev: Store) => Store) => {
    setStore((prev) => {
      const next = updater(prev)
      save(next)
      return next
    })
  }, [])

  // Mock scheduled reminders (24h / 1h) while the app is open
  useEffect(() => {
    const tick = () => {
      commit((prev) => {
        let notifications = prev.notifications
        let changed = false
        prev.appointments.forEach((a) => {
          if (a.status !== 'upcoming' && a.status !== 'checked_in') return
          const mins = minutesUntilEta(a.date, a.etaStart)
          const key24 = `${a.id}:24h`
          const key1 = `${a.id}:1h`
          if (mins <= 24 * 60 && mins > 60 && !remindersFired.current.has(key24)) {
            remindersFired.current.add(key24)
            changed = true
            notifications = [
              {
                id: `n-r24-${a.id}-${Date.now()}`,
                title: 'Reminder · 24 hours',
                body: `Upcoming visit · Token #${a.token} · ETA ${a.etaStart}–${a.etaEnd}. WhatsApp template queued.`,
                time: 'Just now',
                read: false,
                kind: 'reminder' as const,
              },
              {
                id: `n-wa24-${a.id}-${Date.now()}`,
                title: 'WhatsApp reminder queued',
                body: `Mock WA to ${a.patientPhone}: 24h reminder for token #${a.token}`,
                time: 'Just now',
                read: false,
                kind: 'whatsapp' as const,
              },
              ...notifications,
            ]
          }
          if (mins <= 60 && mins > -30 && !remindersFired.current.has(key1)) {
            remindersFired.current.add(key1)
            changed = true
            notifications = [
              {
                id: `n-r1-${a.id}-${Date.now()}`,
                title: 'Reminder · 1 hour',
                body: `Your estimated window is approaching. Token #${a.token} · ${a.etaStart}–${a.etaEnd}.`,
                time: 'Just now',
                read: false,
                kind: 'reminder' as const,
              },
              {
                id: `n-wa1-${a.id}-${Date.now()}`,
                title: 'WhatsApp reminder queued',
                body: `Mock WA to ${a.patientPhone}: 1h reminder for token #${a.token}`,
                time: 'Just now',
                read: false,
                kind: 'whatsapp' as const,
              },
              ...notifications,
            ]
          }
        })
        if (!changed) return prev
        return { ...prev, notifications }
      })
    }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [commit])

  const pushNotification = useCallback(
    (n: Omit<NotificationItem, 'id' | 'time' | 'read'>) => {
      commit((prev) => ({
        ...prev,
        notifications: [
          {
            ...n,
            id: `n-${Date.now()}`,
            time: 'Just now',
            read: false,
          },
          ...prev.notifications,
        ],
      }))
    },
    [commit],
  )

  const getDoctor = useCallback(
    (id: string) => store.doctors.find((d) => d.id === id),
    [store.doctors],
  )

  const getBlocks = useCallback(
    (doctorId: string, date: string) => {
      const doctor = store.doctors.find((d) => d.id === doctorId)
      const capacity = doctor?.capacityPerHour ?? 12
      const day = weekdayKey(date)
      const available = doctor?.availableDays.includes(day) ?? false
      return HOUR_STARTS.map((start, i) => {
        const endHour = Number(start.slice(0, 2)) + 1
        const end = `${String(endHour).padStart(2, '0')}:00`
        const key = blockFillKey(doctorId, date, start)
        const booked =
          store.blockFills[key] ??
          store.appointments.filter(
            (a) =>
              a.doctorId === doctorId &&
              a.date === date &&
              a.blockStart === start &&
              a.status !== 'cancelled',
          ).length
        const full = !available || booked >= capacity
        const waitlistHint = full && i % 2 === 1
        return {
          id: `block-${start}`,
          startLabel: start,
          endLabel: end,
          capacity,
          booked: Math.min(booked, capacity),
          state: (!available
            ? 'full'
            : full
              ? waitlistHint
                ? 'waitlist'
                : 'full'
              : 'open') as 'open' | 'full' | 'waitlist',
        }
      })
    },
    [store],
  )

  const canCancel = useCallback((apt: ClinicAppointment) => {
    if (apt.status !== 'upcoming' && apt.status !== 'checked_in') return false
    return minutesUntilEta(apt.date, apt.etaStart) >= CANCEL_POLICY_HOURS * 60
  }, [])

  const confirmBooking = useCallback(
    (input: {
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
      const delay = store.delayByDoctor[input.doctorId] ?? 0
      const { etaStart, etaEnd } = etaWindow(input.blockStart, input.token, 5, delay)
      const apt: ClinicAppointment = {
        id: `apt-${Date.now()}`,
        doctorId: input.doctorId,
        patientName: input.patientName,
        patientPhone: input.patientPhone,
        dependentId: input.dependentId,
        date: input.date,
        blockStart: input.blockStart,
        blockEnd: input.blockEnd,
        token: input.token,
        etaStart,
        etaEnd,
        status: 'upcoming',
        intake: input.intake,
        paid: true,
        payAtClinic: false,
        createdBy: 'patient',
      }
      const doctor = store.doctors.find((d) => d.id === input.doctorId)
      const key = blockFillKey(input.doctorId, input.date, input.blockStart)
      commit((prev) => ({
        ...prev,
        appointments: [apt, ...prev.appointments],
        blockFills: {
          ...prev.blockFills,
          [key]: (prev.blockFills[key] ?? 0) + 1,
        },
        payments: [
          {
            id: `pay-${Date.now()}`,
            patient: input.patientName,
            doctorId: input.doctorId,
            amount: doctor?.feeInr ?? 500,
            method: 'razorpay',
            status: 'paid',
            at: 'Just now',
          },
          ...prev.payments,
        ],
        notifications: [
          {
            id: `n-${Date.now()}`,
            title: 'Booking confirmed',
            body: `Token #${apt.token} with ${doctor?.name ?? 'doctor'} · estimated ${etaStart}–${etaEnd}`,
            time: 'Just now',
            read: false,
            kind: 'confirm',
          },
          {
            id: `n-wa-${Date.now()}`,
            title: 'WhatsApp confirmation queued',
            body: `Mock WhatsApp to ${input.patientPhone}: Token #${apt.token}, ETA ${etaStart}–${etaEnd}`,
            time: 'Just now',
            read: false,
            kind: 'whatsapp',
          },
          ...prev.notifications,
        ],
      }))
      return apt
    },
    [commit, store.delayByDoctor, store.doctors],
  )

  const applyCancel = useCallback(
    (id: string) => {
      const apt = store.appointments.find((a) => a.id === id)
      if (!apt) return { ok: false, reason: 'Not found' }
      const key = blockFillKey(apt.doctorId, apt.date, apt.blockStart)
      commit((prev) => ({
        ...prev,
        appointments: prev.appointments.map((a) =>
          a.id === id ? { ...a, status: 'cancelled' as const } : a,
        ),
        blockFills: {
          ...prev.blockFills,
          [key]: Math.max(0, (prev.blockFills[key] ?? 1) - 1),
        },
        notifications: [
          {
            id: `n-${Date.now()}`,
            title: 'Appointment cancelled',
            body: 'Your token was released and may go to the waitlist.',
            time: 'Just now',
            read: false,
            kind: 'confirm' as const,
          },
          ...prev.notifications,
        ],
      }))
      return { ok: true as const }
    },
    [commit, store.appointments],
  )

  const cancelAppointment = useCallback(
    (id: string) => {
      const apt = store.appointments.find((a) => a.id === id)
      if (!apt) return { ok: false, reason: 'Not found' }
      if (!canCancel(apt)) {
        return {
          ok: false,
          reason: `Cannot cancel within ${CANCEL_POLICY_HOURS} hours of estimated start`,
        }
      }
      return applyCancel(id)
    },
    [canCancel, store.appointments, applyCancel],
  )

  const forceCancelAppointment = useCallback(
    (id: string) => {
      const apt = store.appointments.find((a) => a.id === id)
      if (!apt) return { ok: false, reason: 'Not found' }
      if (apt.status === 'cancelled') return { ok: false, reason: 'Already cancelled' }
      return applyCancel(id)
    },
    [store.appointments, applyCancel],
  )

  const rescheduleAppointment = useCallback(
    (
      id: string,
      next: { date: string; blockStart: string; blockEnd: string; token: number },
    ) => {
      const apt = store.appointments.find((a) => a.id === id)
      if (!apt) return { ok: false, reason: 'Not found' }
      if (!canCancel(apt)) {
        return { ok: false, reason: 'Outside reschedule policy window' }
      }
      const delay = store.delayByDoctor[apt.doctorId] ?? 0
      const { etaStart, etaEnd } = etaWindow(next.blockStart, next.token, 5, delay)
      const oldKey = blockFillKey(apt.doctorId, apt.date, apt.blockStart)
      const newKey = blockFillKey(apt.doctorId, next.date, next.blockStart)
      commit((prev) => ({
        ...prev,
        appointments: prev.appointments.map((a) =>
          a.id === id
            ? {
                ...a,
                ...next,
                etaStart,
                etaEnd,
                status: 'upcoming' as const,
              }
            : a,
        ),
        blockFills: {
          ...prev.blockFills,
          [oldKey]: Math.max(0, (prev.blockFills[oldKey] ?? 1) - 1),
          [newKey]: (prev.blockFills[newKey] ?? 0) + 1,
        },
        notifications: [
          {
            id: `n-${Date.now()}`,
            title: 'Visit rescheduled',
            body: `New token #${next.token} · ${next.date} ${next.blockStart}–${next.blockEnd} · ETA ${etaStart}–${etaEnd}`,
            time: 'Just now',
            read: false,
            kind: 'confirm',
          },
          ...prev.notifications,
        ],
      }))
      return { ok: true }
    },
    [canCancel, commit, store.appointments, store.delayByDoctor],
  )

  const checkIn = useCallback(
    (id: string) => {
      const apt = store.appointments.find((a) => a.id === id)
      if (!apt || apt.status !== 'upcoming') return { ok: false, reason: 'Unavailable' }
      if (apt.date !== todayISO()) return { ok: false, reason: 'Check-in opens on visit day' }
      const mins = minutesUntilEta(apt.date, apt.etaStart)
      if (mins > 90) return { ok: false, reason: 'Check-in opens closer to your ETA window' }
      commit((prev) => ({
        ...prev,
        appointments: prev.appointments.map((a) =>
          a.id === id ? { ...a, status: 'checked_in' as const } : a,
        ),
      }))
      return { ok: true }
    },
    [commit, store.appointments],
  )

  const setAppointmentStatus = useCallback(
    (id: string, status: ClinicAppointment['status'], durationMin?: number) => {
      commit((prev) => {
        let appointments = prev.appointments.map((a) => {
          if (a.id !== id) {
            if (status === 'in_progress' && a.status === 'in_progress') {
              return { ...a, status: 'upcoming' as const }
            }
            return a
          }
          return {
            ...a,
            status,
            durationMin: durationMin ?? a.durationMin,
          }
        })
        const current = appointments.find((a) => a.id === id)
        const servingByDoctor = { ...prev.servingByDoctor }
        if (current && (status === 'completed' || status === 'no_show' || status === 'in_progress')) {
          servingByDoctor[current.doctorId] = current.token
        }
        if (current && (status === 'completed' || status === 'no_show')) {
          const next = appointments
            .filter(
              (a) =>
                a.doctorId === current.doctorId &&
                a.date === current.date &&
                (a.status === 'upcoming' || a.status === 'checked_in') &&
                a.token > current.token,
            )
            .sort((a, b) => a.token - b.token)[0]
          if (next && !appointments.some((a) => a.status === 'in_progress' && a.doctorId === current.doctorId)) {
            appointments = appointments.map((a) =>
              a.id === next.id ? { ...a, status: 'in_progress' as const } : a,
            )
            servingByDoctor[current.doctorId] = next.token
          }
          // Recompute ETAs for remaining waiting
          const delay = prev.delayByDoctor[current.doctorId] ?? 0
          appointments = appointments.map((a) => {
            if (
              a.doctorId !== current.doctorId ||
              a.date !== current.date ||
              (a.status !== 'upcoming' && a.status !== 'checked_in')
            ) {
              return a
            }
            const { etaStart, etaEnd } = etaWindow(a.blockStart, a.token, 5, delay)
            return { ...a, etaStart, etaEnd }
          })
        }
        return {
          ...prev,
          appointments,
          servingByDoctor,
          notifications:
            status === 'completed' || status === 'no_show'
              ? [
                  {
                    id: `n-${Date.now()}`,
                    title: 'Queue update',
                    body: `Currently serving token #${servingByDoctor[current?.doctorId ?? ''] ?? ''}. ETAs may have shifted (estimates, not guarantees).`,
                    time: 'Just now',
                    read: false,
                    kind: 'eta' as const,
                  },
                  ...prev.notifications,
                ]
              : prev.notifications,
        }
      })
    },
    [commit],
  )

  const applyDelay = useCallback(
    (doctorId: string, minutes: number) => {
      commit((prev) => {
        const nextDelay = (prev.delayByDoctor[doctorId] ?? 0) + minutes
        return {
          ...prev,
          delayByDoctor: { ...prev.delayByDoctor, [doctorId]: nextDelay },
          appointments: prev.appointments.map((a) => {
            if (
              a.doctorId !== doctorId ||
              (a.status !== 'upcoming' && a.status !== 'checked_in')
            ) {
              return a
            }
            const { etaStart, etaEnd } = etaWindow(a.blockStart, a.token, 5, nextDelay)
            return { ...a, etaStart, etaEnd }
          }),
          notifications: [
            {
              id: `n-${Date.now()}`,
              title: 'Doctor running late',
              body: `ETAs shifted +${minutes} min (estimate window updated).`,
              time: 'Just now',
              read: false,
              kind: 'eta',
            },
            ...prev.notifications,
          ],
        }
      })
    },
    [commit],
  )

  const clearDelay = useCallback(
    (doctorId: string) => {
      commit((prev) => ({
        ...prev,
        delayByDoctor: { ...prev.delayByDoctor, [doctorId]: 0 },
        appointments: prev.appointments.map((a) => {
          if (
            a.doctorId !== doctorId ||
            (a.status !== 'upcoming' && a.status !== 'checked_in')
          ) {
            return a
          }
          const { etaStart, etaEnd } = etaWindow(a.blockStart, a.token, 5, 0)
          return { ...a, etaStart, etaEnd }
        }),
      }))
    },
    [commit],
  )

  const joinWaitlist = useCallback(
    (input: {
      doctorId: string
      date: string
      blockStart: string
      blockEnd: string
      patientName: string
    }) => {
      commit((prev) => ({
        ...prev,
        waitlist: [
          {
            id: `wl-${Date.now()}`,
            ...input,
            position: prev.waitlist.filter((w) => w.status === 'waiting').length + 1,
            status: 'waiting',
          },
          ...prev.waitlist,
        ],
        notifications: [
          {
            id: `n-${Date.now()}`,
            title: 'Joined waitlist',
            body: `We’ll notify you if a spot opens for ${input.blockStart}–${input.blockEnd}.`,
            time: 'Just now',
            read: false,
            kind: 'waitlist',
          },
          ...prev.notifications,
        ],
      }))
    },
    [commit],
  )

  const claimWaitlist = useCallback(
    (id: string) => {
      let claimed: WaitlistEntry | null = null
      commit((prev) => {
        const entry = prev.waitlist.find((w) => w.id === id)
        if (!entry || entry.status !== 'offered') return prev
        claimed = { ...entry, status: 'claimed' }
        const key = blockFillKey(entry.doctorId, entry.date, entry.blockStart)
        return {
          ...prev,
          waitlist: prev.waitlist.map((w) =>
            w.id === id ? { ...w, status: 'claimed' as const } : w,
          ),
          // Free one seat so the claimer can book into the block
          blockFills: {
            ...prev.blockFills,
            [key]: Math.max(0, (prev.blockFills[key] ?? 1) - 1),
          },
          notifications: [
            {
              id: `n-${Date.now()}`,
              title: 'Waitlist claim ready',
              body: `Complete payment for ${entry.blockStart}–${entry.blockEnd} to lock your token.`,
              time: 'Just now',
              read: false,
              kind: 'waitlist' as const,
            },
            ...prev.notifications,
          ],
        }
      })
      return claimed
    },
    [commit],
  )

  const expireWaitlistOffers = useCallback(() => {
    commit((prev) => ({
      ...prev,
      waitlist: prev.waitlist.map((w) => {
        if (w.status !== 'offered' || !w.offerExpiresAt) return w
        if (new Date(w.offerExpiresAt).getTime() > Date.now()) return w
        return { ...w, status: 'expired' as const }
      }),
    }))
  }, [commit])

  const manualWalkIn = useCallback(
    (input: {
      doctorId: string
      patientName: string
      patientPhone: string
      date: string
      blockStart: string
      blockEnd: string
      payAtClinic: boolean
      note: string
    }) => {
      const sameBlock = store.appointments.filter(
        (a) =>
          a.doctorId === input.doctorId &&
          a.date === input.date &&
          a.blockStart === input.blockStart &&
          a.status !== 'cancelled',
      )
      const token = Math.max(0, ...sameBlock.map((a) => a.token)) + 1
      const delay = store.delayByDoctor[input.doctorId] ?? 0
      const { etaStart, etaEnd } = etaWindow(input.blockStart, token, 5, delay)
      const apt: ClinicAppointment = {
        id: `apt-w-${Date.now()}`,
        doctorId: input.doctorId,
        patientName: input.patientName,
        patientPhone: input.patientPhone,
        dependentId: null,
        date: input.date,
        blockStart: input.blockStart,
        blockEnd: input.blockEnd,
        token,
        etaStart,
        etaEnd,
        status: 'upcoming',
        intake: input.note,
        paid: !input.payAtClinic,
        payAtClinic: input.payAtClinic,
        createdBy: 'admin',
      }
      const key = blockFillKey(input.doctorId, input.date, input.blockStart)
      commit((prev) => ({
        ...prev,
        appointments: [apt, ...prev.appointments],
        blockFills: {
          ...prev.blockFills,
          [key]: (prev.blockFills[key] ?? sameBlock.length) + 1,
        },
        payments: [
          {
            id: `pay-${Date.now()}`,
            patient: input.patientName,
            doctorId: input.doctorId,
            amount: prev.doctors.find((d) => d.id === input.doctorId)?.feeInr ?? 500,
            method: input.payAtClinic ? 'clinic' : 'comped',
            status: input.payAtClinic ? 'pending' : 'paid',
            at: 'Just now',
          },
          ...prev.payments,
        ],
      }))
      return apt
    },
    [commit, store.appointments, store.delayByDoctor],
  )

  const addDependent = useCallback(
    (d: Omit<Dependent, 'id'>) => {
      commit((prev) => ({
        ...prev,
        dependents: [...prev.dependents, { ...d, id: `dep-${Date.now()}` }],
      }))
    },
    [commit],
  )

  const removeDependent = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        dependents: prev.dependents.filter((d) => d.id !== id),
      }))
    },
    [commit],
  )

  const markNotificationsRead = useCallback(() => {
    commit((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }))
  }, [commit])

  const addBroadcast = useCallback(
    (input: Omit<Broadcast, 'id' | 'sentAt' | 'delivered' | 'failed'>) => {
      commit((prev) => ({
        ...prev,
        broadcasts: [
          {
            ...input,
            id: `b-${Date.now()}`,
            sentAt: 'Just now',
            delivered: 150 + Math.floor(Math.random() * 50),
            failed: Math.floor(Math.random() * 4),
          },
          ...prev.broadcasts,
        ],
        notifications: [
          {
            id: `n-${Date.now()}`,
            title: input.title,
            body: input.body,
            time: 'Just now',
            read: false,
            kind: 'confirm',
          },
          ...prev.notifications,
        ],
      }))
    },
    [commit],
  )

  const updateDoctor = useCallback(
    (id: string, patch: Partial<ClinicDoctor>) => {
      commit((prev) => ({
        ...prev,
        doctors: prev.doctors.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      }))
    },
    [commit],
  )

  const toggleDoctor = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        doctors: prev.doctors.map((d) =>
          d.id === id ? { ...d, active: !d.active } : d,
        ),
      }))
    },
    [commit],
  )

  const addDoctor = useCallback(
    (input: Omit<ClinicDoctor, 'id' | 'active'> & { active?: boolean }) => {
      const id = `dr-${Date.now()}`
      commit((prev) => ({
        ...prev,
        doctors: [
          ...prev.doctors,
          { ...input, id, active: input.active ?? true },
        ],
        weekByDoctor: { ...prev.weekByDoctor, [id]: defaultWeek() },
      }))
    },
    [commit],
  )

  const updateWeek = useCallback(
    (doctorId: string, day: DayKey, patch: Partial<DayAvailability>) => {
      commit((prev) => ({
        ...prev,
        weekByDoctor: {
          ...prev.weekByDoctor,
          [doctorId]: {
            ...prev.weekByDoctor[doctorId],
            [day]: { ...prev.weekByDoctor[doctorId][day], ...patch },
          },
        },
      }))
    },
    [commit],
  )

  const queueForDoctor = useCallback(
    (doctorId: string, date = todayISO()) =>
      store.appointments
        .filter((a) => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
        .sort((a, b) => a.token - b.token),
    [store.appointments],
  )

  const value = useMemo(
    () => ({
      ...store,
      getDoctor,
      getBlocks,
      confirmBooking,
      cancelAppointment,
      forceCancelAppointment,
      rescheduleAppointment,
      checkIn,
      setAppointmentStatus,
      applyDelay,
      clearDelay,
      joinWaitlist,
      claimWaitlist,
      expireWaitlistOffers,
      manualWalkIn,
      addDependent,
      removeDependent,
      markNotificationsRead,
      addBroadcast,
      updateDoctor,
      toggleDoctor,
      addDoctor,
      updateWeek,
      queueForDoctor,
      canCancel,
      pushNotification,
    }),
    [
      store,
      getDoctor,
      getBlocks,
      confirmBooking,
      cancelAppointment,
      forceCancelAppointment,
      rescheduleAppointment,
      checkIn,
      setAppointmentStatus,
      applyDelay,
      clearDelay,
      joinWaitlist,
      claimWaitlist,
      expireWaitlistOffers,
      manualWalkIn,
      addDependent,
      removeDependent,
      markNotificationsRead,
      addBroadcast,
      updateDoctor,
      toggleDoctor,
      addDoctor,
      updateWeek,
      queueForDoctor,
      canCancel,
      pushNotification,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useClinic() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useClinic must be used within ClinicProvider')
  return ctx
}
