import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useClinic } from '@/clinic/ApiClinicProvider'
import { todayISO, type DayAvailability, type DayKey } from '@/clinic/types'
import type { DoctorSettings, QueuePatient, QueueStatus } from '@/api/mocks/doctorData'

/** Demo doctor portal is always Dr. Mehta until multi-doctor login lands */
export const DEMO_DOCTOR_ID = 'dr-mehta'

export type WeekDaySummary = {
  date: string
  day: DayKey
  total: number
  waiting: number
  completed: number
}

type DoctorDataValue = {
  queue: QueuePatient[]
  queueDate: string
  setQueueDate: (date: string) => void
  weekSummary: WeekDaySummary[]
  week: Record<DayKey, DayAvailability>
  capacity: number
  delayOffsetMin: number
  settings: DoctorSettings
  setStatus: (id: string, status: QueueStatus, durationMin?: number) => void
  applyDelay: () => void
  clearDelay: () => void
  updateDay: (day: DayKey, patch: Partial<DayAvailability>) => void
  setCapacity: (n: number) => void
  updateSettings: (patch: Partial<DoctorSettings>) => void
  counts: { waiting: number; inProgress: number; completed: number; noShow: number }
  activePatient: QueuePatient | undefined
  avgDuration: number
}

const Ctx = createContext<DoctorDataValue | null>(null)

function mapStatus(s: string): QueueStatus {
  if (s === 'in_progress') return 'in_progress'
  if (s === 'completed') return 'completed'
  if (s === 'no_show') return 'no_show'
  return 'waiting'
}

function toQueueStatus(s: QueueStatus): 'upcoming' | 'in_progress' | 'completed' | 'no_show' {
  if (s === 'waiting') return 'upcoming'
  return s
}

function addDaysISO(iso: string, n: number) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function startOfWeekISO(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

const DAY_FROM_DATE: DayKey[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function DoctorDataProvider({ children }: { children: ReactNode }) {
  const clinic = useClinic()
  const doctorId = DEMO_DOCTOR_ID
  const doctor = clinic.getDoctor(doctorId)
  const [queueDate, setQueueDate] = useState(todayISO)

  const [notifyFlags, setNotifyFlags] = useState({
    notifyOnNoShow: true,
    notifyOnWaitlistClaim: true,
  })

  const queue = useMemo(() => {
    return clinic.queueForDoctor(doctorId, queueDate).map(
      (a): QueuePatient => ({
        id: a.id,
        token: a.token,
        name: a.patientName,
        relation:
          a.createdBy === 'admin'
            ? 'Admin added · walk-in'
            : a.dependentId
              ? 'Dependent'
              : undefined,
        blockStart: a.blockStart,
        blockEnd: a.blockEnd,
        eta:
          a.status === 'in_progress'
            ? 'now'
            : a.status === 'completed'
              ? 'done'
              : `~${a.etaStart}`,
        status: mapStatus(a.status),
        intake: a.intake,
        phone: a.patientPhone,
        durationMin: a.durationMin,
      }),
    )
  }, [clinic, doctorId, queueDate])

  const weekSummary = useMemo(() => {
    const monday = startOfWeekISO(todayISO())
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDaysISO(monday, i)
      const day = DAY_FROM_DATE[new Date(date + 'T12:00:00').getDay()] as DayKey
      const apts = clinic.queueForDoctor(doctorId, date)
      return {
        date,
        day,
        total: apts.filter((a) => a.status !== 'cancelled').length,
        waiting: apts.filter(
          (a) =>
            a.status === 'upcoming' ||
            a.status === 'checked_in' ||
            a.status === 'in_progress',
        ).length,
        completed: apts.filter((a) => a.status === 'completed').length,
      }
    })
  }, [clinic, doctorId])

  const week = clinic.weekByDoctor[doctorId] ?? ({} as Record<DayKey, DayAvailability>)
  const capacity = doctor?.capacityPerHour ?? 12
  const delayOffsetMin = clinic.delayByDoctor[doctorId] ?? 0

  const settings: DoctorSettings = useMemo(
    () => ({
      displayName: doctor?.name ?? 'Doctor',
      specialty: doctor?.specialty ?? '',
      defaultCapacity: capacity,
      delayMinutes: 15,
      ...notifyFlags,
    }),
    [doctor, capacity, notifyFlags],
  )

  const setStatus = useCallback(
    (id: string, status: QueueStatus, durationMin?: number) => {
      clinic.setAppointmentStatus(id, toQueueStatus(status), durationMin)
    },
    [clinic],
  )

  const applyDelay = useCallback(() => {
    clinic.applyDelay(doctorId, settings.delayMinutes)
  }, [clinic, doctorId, settings.delayMinutes])

  const clearDelay = useCallback(() => {
    clinic.clearDelay(doctorId)
  }, [clinic, doctorId])

  const updateDay = useCallback(
    (day: DayKey, patch: Partial<DayAvailability>) => {
      clinic.updateWeek(doctorId, day, patch)
    },
    [clinic, doctorId],
  )

  const setCapacity = useCallback(
    (n: number) => {
      clinic.updateDoctor(doctorId, { capacityPerHour: Math.max(1, Math.min(20, n)) })
    },
    [clinic, doctorId],
  )

  const updateSettings = useCallback(
    (patch: Partial<DoctorSettings>) => {
      if (patch.displayName != null || patch.specialty != null) {
        clinic.updateDoctor(doctorId, {
          ...(patch.displayName != null ? { name: patch.displayName } : {}),
          ...(patch.specialty != null ? { specialty: patch.specialty } : {}),
        })
      }
      if (patch.defaultCapacity != null) {
        clinic.updateDoctor(doctorId, { capacityPerHour: patch.defaultCapacity })
      }
      setNotifyFlags((prev) => ({
        notifyOnNoShow: patch.notifyOnNoShow ?? prev.notifyOnNoShow,
        notifyOnWaitlistClaim: patch.notifyOnWaitlistClaim ?? prev.notifyOnWaitlistClaim,
      }))
    },
    [clinic, doctorId],
  )

  const counts = useMemo(() => {
    const waiting = queue.filter((p) => p.status === 'waiting').length
    const inProgress = queue.filter((p) => p.status === 'in_progress').length
    const completed = queue.filter((p) => p.status === 'completed').length
    const noShow = queue.filter((p) => p.status === 'no_show').length
    return { waiting, inProgress, completed, noShow }
  }, [queue])

  const activePatient = useMemo(
    () => queue.find((p) => p.status === 'in_progress'),
    [queue],
  )

  const avgDuration = useMemo(() => {
    const done = queue.filter((p) => p.status === 'completed' && p.durationMin)
    if (!done.length) return 0
    return (
      Math.round(
        (done.reduce((s, p) => s + (p.durationMin ?? 0), 0) / done.length) * 10,
      ) / 10
    )
  }, [queue])

  const value = useMemo(
    () => ({
      queue,
      queueDate,
      setQueueDate,
      weekSummary,
      week,
      capacity,
      delayOffsetMin,
      settings,
      setStatus,
      applyDelay,
      clearDelay,
      updateDay,
      setCapacity,
      updateSettings,
      counts,
      activePatient,
      avgDuration,
    }),
    [
      queue,
      queueDate,
      weekSummary,
      week,
      capacity,
      delayOffsetMin,
      settings,
      setStatus,
      applyDelay,
      clearDelay,
      updateDay,
      setCapacity,
      updateSettings,
      counts,
      activePatient,
      avgDuration,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDoctorData() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDoctorData must be used within DoctorDataProvider')
  return ctx
}
