import { ACTIVE_APPOINTMENT_STATUSES, HOUR_STARTS } from '../config/env.js'
import { prisma } from '../lib/prisma.js'
import { addHourLabel, HttpError, weekdayIndex } from '../lib/eta.js'

export async function getDoctorOrThrow(doctorId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { availability: true, leaves: true },
  })
  if (!doctor) throw new HttpError(404, 'Doctor not found')
  return doctor
}

export function mapDoctor(d: {
  id: string
  name: string
  specialty: string
  initials: string
  bio: string
  photoUrl: string
  consultationFeeInr: number
  avgConsultationMinutes: number
  hourlyCapacityOverride: number | null
  active: boolean
  availability: { dayOfWeek: number; enabled: boolean; hourlyCapacity: number }[]
}) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
  const availableDays = d.availability
    .filter((a) => a.enabled)
    .map((a) => dayNames[a.dayOfWeek])
  const capacity =
    d.hourlyCapacityOverride ??
    Math.max(1, Math.round(60 / Math.max(1, d.avgConsultationMinutes)))
  return {
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    initials: d.initials,
    bio: d.bio,
    photoUrl: d.photoUrl,
    availableDays,
    capacityPerHour: capacity,
    feeInr: d.consultationFeeInr,
    active: d.active,
    avgConsultationMinutes: d.avgConsultationMinutes,
  }
}

export async function getHourBlocks(doctorId: string, date: string) {
  const doctor = await getDoctorOrThrow(doctorId)
  const dow = weekdayIndex(date)
  const avail = doctor.availability.find((a) => a.dayOfWeek === dow)
  const onLeave = doctor.leaves.some((l) => l.date === date)
  const capacity =
    avail?.hourlyCapacity ??
    doctor.hourlyCapacityOverride ??
    Math.max(1, Math.round(60 / Math.max(1, doctor.avgConsultationMinutes)))

  const availableDay = Boolean(avail?.enabled) && !onLeave && doctor.active

  const startMin = avail ? timeParts(avail.startTime) : 9 * 60
  const endMin = avail ? timeParts(avail.endTime) : 17 * 60
  const breakStart = avail?.breakStart ? timeParts(avail.breakStart) : null
  const breakEnd = avail?.breakEnd ? timeParts(avail.breakEnd) : null

  const counts = await prisma.appointment.groupBy({
    by: ['hourBlockStart'],
    where: {
      doctorId,
      date,
      status: { in: [...ACTIVE_APPOINTMENT_STATUSES] },
    },
    _count: { _all: true },
  })
  const countMap = Object.fromEntries(counts.map((c) => [c.hourBlockStart, c._count._all]))

  return HOUR_STARTS.map((start, i) => {
    const startM = timeParts(start)
    const inHours = availableDay && startM >= startMin && startM < endMin
    const inBreak =
      breakStart != null && breakEnd != null && startM >= breakStart && startM < breakEnd
    const booked = countMap[start] ?? 0
    const full = !inHours || inBreak || booked >= capacity
    const waitlistHint = full && inHours && !inBreak && i % 2 === 1
    return {
      id: `block-${start}`,
      startLabel: start,
      endLabel: addHourLabel(start),
      capacity,
      booked: Math.min(booked, capacity),
      state: (!inHours || inBreak
        ? 'full'
        : full
          ? waitlistHint
            ? 'waitlist'
            : 'full'
          : 'open') as 'open' | 'full' | 'waitlist',
    }
  })
}

function timeParts(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export async function getDelayMinutes(doctorId: string, date = todayISO()) {
  const row = await prisma.queueDelayOffset.findUnique({
    where: { doctorId_date: { doctorId, date } },
  })
  return row?.offsetMinutes ?? 0
}

function todayISO(d = new Date()) {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  return x.toISOString().slice(0, 10)
}
