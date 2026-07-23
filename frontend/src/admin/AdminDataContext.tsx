import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useClinic } from '@/clinic/ApiClinicProvider'
import { HOURS, type AdminDoctor, type GridSlot, type ManualBooking, type PaymentRow } from '@/api/mocks/adminData'
import { todayISO } from '@/clinic/types'

type AdminDataValue = {
  doctors: AdminDoctor[]
  payments: PaymentRow[]
  broadcasts: ReturnType<typeof useClinic>['broadcasts']
  manualBookings: ManualBooking[]
  toggleDoctor: (id: string) => void
  setCapacity: (id: string, capacity: number) => void
  addDoctor: (input: Omit<AdminDoctor, 'id' | 'tokensToday' | 'active'> & { active?: boolean }) => void
  addBroadcast: ReturnType<typeof useClinic>['addBroadcast']
  addManualBooking: (
    input: Omit<ManualBooking, 'id' | 'token' | 'createdAt'>,
  ) => ManualBooking | Promise<ManualBooking>
  grid: GridSlot[]
  revenueTotal: number
  activeDoctors: number
  cancelAppointment: (
    id: string,
  ) => { ok: boolean; reason?: string } | Promise<{ ok: boolean; reason?: string }>
  rescheduleAppointment: (
    id: string,
    next: { date: string; blockStart: string; blockEnd: string; token: number },
  ) => { ok: boolean; reason?: string } | Promise<{ ok: boolean; reason?: string }>
  updateDoctor: ReturnType<typeof useClinic>['updateDoctor']
  appointments: ReturnType<typeof useClinic>['appointments']
  getBlocks: ReturnType<typeof useClinic>['getBlocks']
}

const Ctx = createContext<AdminDataValue | null>(null)

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const clinic = useClinic()
  const date = todayISO()

  const doctors: AdminDoctor[] = useMemo(
    () =>
      clinic.doctors.map((d) => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        initials: d.initials,
        capacity: d.capacityPerHour,
        active: d.active,
        tokensToday: clinic.appointments.filter(
          (a) => a.doctorId === d.id && a.date === date && a.status !== 'cancelled',
        ).length,
      })),
    [clinic.doctors, clinic.appointments, date],
  )

  const payments: PaymentRow[] = useMemo(
    () =>
      clinic.payments.map((p) => ({
        id: p.id,
        patient: p.patient,
        doctor: clinic.doctors.find((d) => d.id === p.doctorId)?.name ?? 'Doctor',
        amount: p.amount,
        method: p.method,
        status: p.status,
        at: p.at,
      })),
    [clinic.payments, clinic.doctors],
  )

  const manualBookings: ManualBooking[] = useMemo(
    () =>
      clinic.appointments
        .filter((a) => a.createdBy === 'admin')
        .map((a) => ({
          id: a.id,
          patientName: a.patientName,
          phone: a.patientPhone,
          doctorId: a.doctorId,
          date: a.date,
          blockStart: a.blockStart,
          blockEnd: a.blockEnd,
          token: a.token,
          payAtClinic: a.payAtClinic,
          note: a.intake,
          createdAt: 'Today',
        })),
    [clinic.appointments],
  )

  const grid: GridSlot[] = useMemo(() => {
    const slots: GridSlot[] = []
    doctors
      .filter((d) => d.active)
      .forEach((d) => {
        HOURS.forEach((hour) => {
          const apts = clinic.appointments.filter(
            (a) =>
              a.doctorId === d.id &&
              a.date === date &&
              a.blockStart === hour &&
              a.status !== 'cancelled',
          )
          slots.push({
            doctorId: d.id,
            hour,
            booked: apts.length,
            capacity: d.capacity,
            labels: apts.map((a) => `#${a.token}`),
          })
        })
      })
    return slots
  }, [doctors, clinic.appointments, date])

  const revenueTotal = useMemo(
    () =>
      clinic.payments
        .filter((p) => p.status === 'paid')
        .reduce((s, p) => s + p.amount, 0),
    [clinic.payments],
  )

  const activeDoctors = useMemo(
    () => clinic.doctors.filter((d) => d.active).length,
    [clinic.doctors],
  )

  const setCapacity = useCallback(
    (id: string, capacity: number) => {
      clinic.updateDoctor(id, { capacityPerHour: Math.max(1, Math.min(20, capacity)) })
    },
    [clinic],
  )

  const addDoctor = useCallback(
    (input: Omit<AdminDoctor, 'id' | 'tokensToday' | 'active'> & { active?: boolean }) => {
      clinic.addDoctor({
        name: input.name,
        specialty: input.specialty,
        initials: input.initials || input.name.slice(0, 2).toUpperCase(),
        bio: 'New clinic doctor.',
        photoUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(input.name)}`,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        capacityPerHour: input.capacity,
        feeInr: 500,
        active: input.active ?? true,
      })
    },
    [clinic],
  )

  const addManualBooking = useCallback(
    async (input: Omit<ManualBooking, 'id' | 'token' | 'createdAt'>) => {
      const apt = await Promise.resolve(
        clinic.manualWalkIn({
          doctorId: input.doctorId,
          patientName: input.patientName,
          patientPhone: input.phone,
          date: input.date,
          blockStart: input.blockStart,
          blockEnd: input.blockEnd,
          payAtClinic: input.payAtClinic,
          note: input.note,
        }),
      )
      return {
        id: apt.id,
        patientName: apt.patientName,
        phone: apt.patientPhone,
        doctorId: apt.doctorId,
        date: apt.date,
        blockStart: apt.blockStart,
        blockEnd: apt.blockEnd,
        token: apt.token,
        payAtClinic: apt.payAtClinic,
        note: apt.intake,
        createdAt: 'Just now',
      }
    },
    [clinic],
  )

  const value = useMemo(
    () => ({
      doctors,
      payments,
      broadcasts: clinic.broadcasts,
      manualBookings,
      toggleDoctor: clinic.toggleDoctor,
      setCapacity,
      addDoctor,
      addBroadcast: clinic.addBroadcast,
      addManualBooking,
      grid,
      revenueTotal,
      activeDoctors,
      cancelAppointment: clinic.forceCancelAppointment,
      rescheduleAppointment: clinic.rescheduleAppointment,
      updateDoctor: clinic.updateDoctor,
      appointments: clinic.appointments,
      getBlocks: clinic.getBlocks,
    }),
    [
      doctors,
      payments,
      clinic.broadcasts,
      clinic.toggleDoctor,
      clinic.addBroadcast,
      clinic.cancelAppointment,
      clinic.forceCancelAppointment,
      clinic.rescheduleAppointment,
      clinic.updateDoctor,
      clinic.appointments,
      clinic.getBlocks,
      manualBookings,
      setCapacity,
      addDoctor,
      addManualBooking,
      grid,
      revenueTotal,
      activeDoctors,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAdminData() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider')
  return ctx
}
