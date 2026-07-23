import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useAuth } from '@/auth/AuthContext'
import { useClinic } from '@/clinic/ApiClinicProvider'
import type { ClinicAppointment } from '@/clinic/types'

/** Patient-facing appointment shape (keeps existing page props) */
export type PatientAppointment = {
  id: string
  doctorId: string
  date: string
  blockStart: string
  blockEnd: string
  token: number
  etaStart: string
  etaEnd: string
  status: ClinicAppointment['status']
  dependentId: string | null
  forName: string
  intake: string
  servingToken: number
  paid: boolean
}

type PatientDataValue = {
  dependents: ReturnType<typeof useClinic>['dependents']
  appointments: PatientAppointment[]
  waitlist: ReturnType<typeof useClinic>['waitlist']
  notifications: ReturnType<typeof useClinic>['notifications']
  servingToken: number
  addDependent: (d: { name: string; relation: 'parent' | 'spouse' | 'child'; age: number }) => void
  removeDependent: (id: string) => void
  confirmBooking: (input: {
    doctorId: string
    date: string
    blockStart: string
    blockEnd: string
    token: number
    dependentId: string | null
    forName: string
    intake: string
  }) => PatientAppointment | Promise<PatientAppointment>
  cancelAppointment: (id: string) =>
    | { ok: boolean; reason?: string }
    | Promise<{ ok: boolean; reason?: string }>
  checkIn: (id: string) =>
    | { ok: boolean; reason?: string }
    | Promise<{ ok: boolean; reason?: string }>
  joinWaitlist: (input: {
    doctorId: string
    date: string
    blockStart: string
    blockEnd: string
  }) => void
  claimWaitlist: (id: string) =>
    | import('@/clinic/types').WaitlistEntry
    | null
    | Promise<import('@/clinic/types').WaitlistEntry | null>
  markNotificationsRead: () => void
  upcoming: PatientAppointment | undefined
  getBlocks: ReturnType<typeof useClinic>['getBlocks']
  canCancel: (apt: PatientAppointment) => boolean
  getDoctor: ReturnType<typeof useClinic>['getDoctor']
  doctors: ReturnType<typeof useClinic>['doctors']
  rescheduleAppointment: ReturnType<typeof useClinic>['rescheduleAppointment']
}

const Ctx = createContext<PatientDataValue | null>(null)

function toPatientApt(
  a: ClinicAppointment,
  servingByDoctor: Record<string, number>,
): PatientAppointment {
  return {
    id: a.id,
    doctorId: a.doctorId,
    date: a.date,
    blockStart: a.blockStart,
    blockEnd: a.blockEnd,
    token: a.token,
    etaStart: a.etaStart,
    etaEnd: a.etaEnd,
    status: a.status,
    dependentId: a.dependentId,
    forName: a.patientName,
    intake: a.intake,
    servingToken: servingByDoctor[a.doctorId] ?? 0,
    paid: a.paid,
  }
}

export function PatientDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const clinic = useClinic()

  const appointments = useMemo(
    () =>
      clinic.appointments.map((a) => toPatientApt(a, clinic.servingByDoctor)),
    [clinic.appointments, clinic.servingByDoctor],
  )

  // Demo patient sees their bookings + seed Asha Verma appointments
  const visible = useMemo(() => {
    const name = user?.name ?? 'Asha Verma'
    const phone = user?.phone ?? '+91 98765 43210'
    return appointments.filter(
      (a) =>
        a.forName === name ||
        clinic.appointments.find((c) => c.id === a.id)?.patientPhone === phone ||
        a.forName === 'Asha Verma',
    )
  }, [appointments, clinic.appointments, user?.name, user?.phone])

  const upcoming = useMemo(
    () =>
      visible.find((a) => a.status === 'upcoming' || a.status === 'checked_in'),
    [visible],
  )

  const servingToken = upcoming
    ? clinic.servingByDoctor[upcoming.doctorId] ?? 0
    : Object.values(clinic.servingByDoctor)[0] ?? 0

  const confirmBooking = useCallback(
    async (input: {
      doctorId: string
      date: string
      blockStart: string
      blockEnd: string
      token: number
      dependentId: string | null
      forName: string
      intake: string
    }) => {
      const apt = await Promise.resolve(
        clinic.confirmBooking({
          doctorId: input.doctorId,
          date: input.date,
          blockStart: input.blockStart,
          blockEnd: input.blockEnd,
          token: input.token,
          dependentId: input.dependentId,
          patientName: input.forName,
          patientPhone: user?.phone ?? '+91 98765 43210',
          intake: input.intake,
        }),
      )
      return toPatientApt(apt, clinic.servingByDoctor)
    },
    [clinic, user?.phone],
  )

  const cancelAppointment = useCallback(
    async (id: string) => Promise.resolve(clinic.cancelAppointment(id)),
    [clinic],
  )

  const checkIn = useCallback(
    async (id: string) => Promise.resolve(clinic.checkIn(id)),
    [clinic],
  )

  const joinWaitlist = useCallback(
    (input: {
      doctorId: string
      date: string
      blockStart: string
      blockEnd: string
    }) => {
      clinic.joinWaitlist({
        ...input,
        patientName: user?.name ?? 'Patient',
      })
    },
    [clinic, user?.name],
  )

  const claimWaitlist = useCallback(
    (id: string) => clinic.claimWaitlist(id),
    [clinic],
  )

  const canCancel = useCallback(
    (apt: PatientAppointment) => {
      const raw = clinic.appointments.find((a) => a.id === apt.id)
      return raw ? clinic.canCancel(raw) : false
    },
    [clinic],
  )

  const value = useMemo<PatientDataValue>(
    () => ({
      dependents: clinic.dependents,
      appointments: visible,
      waitlist: clinic.waitlist,
      notifications: clinic.notifications,
      servingToken,
      addDependent: clinic.addDependent,
      removeDependent: clinic.removeDependent,
      confirmBooking,
      cancelAppointment,
      checkIn,
      joinWaitlist,
      claimWaitlist,
      markNotificationsRead: clinic.markNotificationsRead,
      upcoming,
      getBlocks: clinic.getBlocks,
      canCancel,
      getDoctor: clinic.getDoctor,
      doctors: clinic.doctors,
      rescheduleAppointment: clinic.rescheduleAppointment,
    }),
    [
      clinic.dependents,
      clinic.waitlist,
      clinic.notifications,
      clinic.addDependent,
      clinic.removeDependent,
      clinic.markNotificationsRead,
      clinic.getBlocks,
      clinic.getDoctor,
      clinic.doctors,
      clinic.rescheduleAppointment,
      visible,
      servingToken,
      confirmBooking,
      cancelAppointment,
      checkIn,
      joinWaitlist,
      claimWaitlist,
      upcoming,
      canCancel,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePatientData() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePatientData must be used within PatientDataProvider')
  return ctx
}
