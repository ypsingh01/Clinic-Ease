import { prisma } from '../lib/prisma.js'
import { env } from '../config/env.js'
import { etaWindow, HttpError, minutesUntilEta, todayISO } from '../lib/eta.js'
import { ACTIVE_APPOINTMENT_STATUSES } from '../config/env.js'
import { getDelayMinutes, getDoctorOrThrow, getHourBlocks } from './slots.js'
import { emitQueueUpdated } from '../sockets/io.js'
import { notifyUser } from './notifications.js'

const ACTIVE = [...ACTIVE_APPOINTMENT_STATUSES]

async function offerWaitlist(
  doctorId: string,
  date: string,
  hourBlockStart: string,
  hourBlockEnd: string,
) {
  const { offerNextWaitlist } = await import('./waitlist.js')
  return offerNextWaitlist(doctorId, date, hourBlockStart, hourBlockEnd)
}

export async function holdAppointment(input: {
  patientId: string
  doctorId: string
  date: string
  hourBlockStart: string
  hourBlockEnd: string
  dependentId?: string | null
  intake?: string
}) {
  return prisma.$transaction(async (tx) => {
    const doctor = await tx.doctor.findUnique({ where: { id: input.doctorId } })
    if (!doctor?.active) throw new HttpError(400, 'Doctor unavailable')

    const blocks = await getHourBlocks(input.doctorId, input.date)
    const block = blocks.find((b) => b.startLabel === input.hourBlockStart)
    if (!block || block.state !== 'open') {
      throw new HttpError(409, 'Hour block is full or unavailable')
    }

    // Serialize token assignment for this block
    const existing = await tx.appointment.findMany({
      where: {
        doctorId: input.doctorId,
        date: input.date,
        hourBlockStart: input.hourBlockStart,
        status: { in: ACTIVE },
      },
      orderBy: { queuePosition: 'desc' },
      take: 1,
    })
    const nextToken = (existing[0]?.queuePosition ?? 0) + 1
    if (nextToken > block.capacity) {
      throw new HttpError(409, 'No capacity remaining')
    }

    const delay = await getDelayMinutes(input.doctorId, input.date)
    const { estimatedStart, estimatedEnd } = etaWindow(
      input.hourBlockStart,
      nextToken,
      doctor.avgConsultationMinutes,
      delay,
    )

    const apt = await tx.appointment.create({
      data: {
        patientId: input.patientId,
        doctorId: input.doctorId,
        dependentId: input.dependentId || null,
        date: input.date,
        hourBlockStart: input.hourBlockStart,
        hourBlockEnd: input.hourBlockEnd,
        queuePosition: nextToken,
        estimatedStart,
        estimatedEnd,
        status: 'held',
        intake: input.intake ?? '',
        holdExpiresAt: new Date(Date.now() + env.HOLD_MINUTES * 60 * 1000),
      },
      include: { doctor: true, patient: true, dependent: true },
    })

    await tx.payment.create({
      data: {
        appointmentId: apt.id,
        amountInr: doctor.consultationFeeInr,
        method: 'razorpay',
        status: 'pending',
      },
    })

    return apt
  }).then(async (apt) => {
    emitQueueUpdated(input.doctorId, input.date)
    return apt
  })
}

export async function confirmAppointment(appointmentId: string, opts?: { force?: boolean }) {
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { payment: true, patient: true, doctor: true, dependent: true },
  })
  if (!apt) throw new HttpError(404, 'Appointment not found')
  if (apt.status !== 'held' && apt.status !== 'booked') {
    if (apt.status === 'booked') return apt
    throw new HttpError(400, 'Cannot confirm this appointment')
  }

  if (apt.status === 'held' && apt.holdExpiresAt && apt.holdExpiresAt < new Date() && !opts?.force) {
    await expireHold(appointmentId)
    throw new HttpError(410, 'Hold expired')
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'booked', holdExpiresAt: null },
    include: { payment: true, patient: true, doctor: true, dependent: true },
  })

  if (updated.payment && updated.payment.status !== 'paid' && !updated.payAtClinic) {
    await prisma.payment.update({
      where: { id: updated.payment.id },
      data: { status: 'paid', method: updated.payment.method || 'razorpay' },
    })
  }

  await notifyUser(updated.patientId, {
    kind: 'confirm',
    title: 'Booking confirmed',
    message: `Token #${updated.queuePosition} with ${updated.doctor.name} · estimated ${updated.estimatedStart}–${updated.estimatedEnd} (estimate, not a guarantee)`,
    whatsapp: true,
  })

  emitQueueUpdated(updated.doctorId, updated.date)
  return updated
}

export async function expireHold(appointmentId: string) {
  const apt = await prisma.appointment.findUnique({ where: { id: appointmentId } })
  if (!apt || apt.status !== 'held') return
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'cancelled' },
  })
  await offerWaitlist(apt.doctorId, apt.date, apt.hourBlockStart, apt.hourBlockEnd)
  emitQueueUpdated(apt.doctorId, apt.date)
}

export async function releaseExpiredHolds() {
  const expired = await prisma.appointment.findMany({
    where: { status: 'held', holdExpiresAt: { lt: new Date() } },
  })
  for (const a of expired) {
    await expireHold(a.id)
  }
  return expired.length
}

export async function cancelAppointment(
  appointmentId: string,
  opts: { userId: string; role: string; force?: boolean },
) {
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true, patient: true },
  })
  if (!apt) throw new HttpError(404, 'Not found')
  if (['cancelled', 'completed', 'no_show'].includes(apt.status)) {
    throw new HttpError(400, 'Already closed')
  }

  if (!opts.force && opts.role === 'patient') {
    if (apt.patientId !== opts.userId) throw new HttpError(403, 'Forbidden')
    const mins = minutesUntilEta(apt.date, apt.estimatedStart)
    if (mins < env.CANCEL_POLICY_HOURS * 60) {
      throw new HttpError(
        400,
        `Cannot cancel within ${env.CANCEL_POLICY_HOURS} hours of estimated start`,
      )
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: 'cancelled' },
    })
  })

  await recalculateQueue(apt.doctorId, apt.date)
  await offerWaitlist(apt.doctorId, apt.date, apt.hourBlockStart, apt.hourBlockEnd)
  await notifyUser(apt.patientId, {
    kind: 'confirm',
    title: 'Appointment cancelled',
    message: 'Your token was released and may go to the waitlist.',
    whatsapp: true,
  })
  emitQueueUpdated(apt.doctorId, apt.date)
  return { ok: true }
}

export async function rescheduleAppointment(
  appointmentId: string,
  next: { date: string; hourBlockStart: string; hourBlockEnd: string },
  opts: { userId: string; role: string; force?: boolean },
) {
  const apt = await prisma.appointment.findUnique({ where: { id: appointmentId } })
  if (!apt) throw new HttpError(404, 'Not found')
  if (!opts.force && opts.role === 'patient') {
    if (apt.patientId !== opts.userId) throw new HttpError(403, 'Forbidden')
    const mins = minutesUntilEta(apt.date, apt.estimatedStart)
    if (mins < env.CANCEL_POLICY_HOURS * 60) {
      throw new HttpError(400, 'Outside reschedule policy window')
    }
  }

  await cancelAppointment(appointmentId, { ...opts, force: true })
  const held = await holdAppointment({
    patientId: apt.patientId,
    doctorId: apt.doctorId,
    date: next.date,
    hourBlockStart: next.hourBlockStart,
    hourBlockEnd: next.hourBlockEnd,
    dependentId: apt.dependentId,
    intake: apt.intake,
  })
  const confirmed = await confirmAppointment(held.id, { force: true })
  return confirmed
}

export async function checkIn(appointmentId: string, userId: string) {
  const apt = await prisma.appointment.findUnique({ where: { id: appointmentId } })
  if (!apt || apt.patientId !== userId) throw new HttpError(404, 'Not found')
  if (apt.status !== 'booked') throw new HttpError(400, 'Unavailable')
  if (apt.date !== todayISO()) throw new HttpError(400, 'Check-in opens on visit day')
  const mins = minutesUntilEta(apt.date, apt.estimatedStart)
  if (mins > 90) throw new HttpError(400, 'Check-in opens closer to your ETA window')
  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'checked_in' },
  })
  emitQueueUpdated(apt.doctorId, apt.date)
  return updated
}

export async function setAppointmentStatus(
  appointmentId: string,
  status: 'in_progress' | 'completed' | 'no_show' | 'booked',
  durationMin?: number,
) {
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true },
  })
  if (!apt) throw new HttpError(404, 'Not found')

  if (status === 'completed' && apt.status !== 'in_progress') {
    throw new HttpError(400, 'Mark in progress before completing')
  }

  const now = new Date()
  await prisma.$transaction(async (tx) => {
    if (status === 'in_progress') {
      await tx.appointment.updateMany({
        where: {
          doctorId: apt.doctorId,
          date: apt.date,
          status: 'in_progress',
          NOT: { id: appointmentId },
        },
        data: { status: 'booked' },
      })
    }

    await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        durationMin: durationMin ?? apt.durationMin,
        actualStartTime: status === 'in_progress' ? now : apt.actualStartTime,
        actualEndTime: status === 'completed' || status === 'no_show' ? now : apt.actualEndTime,
      },
    })

    if (status === 'completed' && durationMin) {
      const doctor = await tx.doctor.findUnique({ where: { id: apt.doctorId } })
      if (doctor) {
        const nextAvg = doctor.avgConsultationMinutes * 0.7 + durationMin * 0.3
        await tx.doctor.update({
          where: { id: apt.doctorId },
          data: { avgConsultationMinutes: Math.round(nextAvg * 10) / 10 },
        })
      }
    }
  })

  if (status === 'completed' || status === 'no_show' || status === 'in_progress') {
    await recalculateQueue(apt.doctorId, apt.date)
  }

  if (status === 'completed' || status === 'no_show') {
    // Auto-promote next waiting
    const next = await prisma.appointment.findFirst({
      where: {
        doctorId: apt.doctorId,
        date: apt.date,
        status: { in: ['booked', 'checked_in'] },
        queuePosition: { gt: apt.queuePosition },
      },
      orderBy: { queuePosition: 'asc' },
    })
    const anyInProgress = await prisma.appointment.findFirst({
      where: { doctorId: apt.doctorId, date: apt.date, status: 'in_progress' },
    })
    if (next && !anyInProgress) {
      await prisma.appointment.update({
        where: { id: next.id },
        data: { status: 'in_progress', actualStartTime: new Date() },
      })
    }
    await notifyQueueShift(apt.doctorId, apt.date)
  }

  emitQueueUpdated(apt.doctorId, apt.date)
  return prisma.appointment.findUnique({ where: { id: appointmentId } })
}

export async function applyDelay(doctorId: string, date: string, minutes: number, reason = '') {
  await prisma.queueDelayOffset.upsert({
    where: { doctorId_date: { doctorId, date } },
    create: { doctorId, date, offsetMinutes: minutes, reason },
    update: { offsetMinutes: minutes, reason },
  })
  await recalculateQueue(doctorId, date)
  await notifyQueueShift(doctorId, date)
  emitQueueUpdated(doctorId, date)
}

export async function clearDelay(doctorId: string, date: string) {
  await prisma.queueDelayOffset.deleteMany({ where: { doctorId, date } })
  await recalculateQueue(doctorId, date)
  emitQueueUpdated(doctorId, date)
}

export async function recalculateQueue(doctorId: string, date: string) {
  const doctor = await getDoctorOrThrow(doctorId)
  const delay = await getDelayMinutes(doctorId, date)
  const waiting = await prisma.appointment.findMany({
    where: {
      doctorId,
      date,
      status: { in: ['held', 'booked', 'checked_in', 'in_progress'] },
    },
    orderBy: [{ hourBlockStart: 'asc' }, { queuePosition: 'asc' }],
  })

  for (const a of waiting) {
    const { estimatedStart, estimatedEnd } = etaWindow(
      a.hourBlockStart,
      a.queuePosition,
      doctor.avgConsultationMinutes,
      delay,
    )
    await prisma.appointment.update({
      where: { id: a.id },
      data: { estimatedStart, estimatedEnd },
    })
  }
}

async function notifyQueueShift(doctorId: string, date: string) {
  const serving = await prisma.appointment.findFirst({
    where: { doctorId, date, status: 'in_progress' },
  })
  const waiting = await prisma.appointment.findMany({
    where: { doctorId, date, status: { in: ['booked', 'checked_in'] } },
  })
  for (const a of waiting) {
    await notifyUser(a.patientId, {
      kind: 'eta',
      title: 'Queue update',
      message: `Currently serving token #${serving?.queuePosition ?? '—'}. Your ETA window may have shifted (estimate, not a guarantee).`,
      whatsapp: true,
    })
  }
}

export async function manualWalkIn(input: {
  doctorId: string
  patientName: string
  patientPhone: string
  date: string
  hourBlockStart: string
  hourBlockEnd: string
  payAtClinic: boolean
  note: string
  adminId: string
}) {
  let patient = await prisma.user.findUnique({ where: { phone: input.patientPhone } })
  if (!patient) {
    const bcrypt = await import('bcryptjs')
    patient = await prisma.user.create({
      data: {
        name: input.patientName,
        email: `walkin_${Date.now()}@clinicease.app`,
        phone: input.patientPhone,
        passwordHash: await bcrypt.hash(`walkin_${Date.now()}`, 8),
        role: 'patient',
      },
    })
  }

  const doctor = await getDoctorOrThrow(input.doctorId)
  const last = await prisma.appointment.findFirst({
    where: {
      doctorId: input.doctorId,
      date: input.date,
      hourBlockStart: input.hourBlockStart,
      status: { in: ACTIVE },
    },
    orderBy: { queuePosition: 'desc' },
  })
  const token = (last?.queuePosition ?? 0) + 1
  const delay = await getDelayMinutes(input.doctorId, input.date)
  const { estimatedStart, estimatedEnd } = etaWindow(
    input.hourBlockStart,
    token,
    doctor.avgConsultationMinutes,
    delay,
  )

  const apt = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: input.doctorId,
      date: input.date,
      hourBlockStart: input.hourBlockStart,
      hourBlockEnd: input.hourBlockEnd,
      queuePosition: token,
      estimatedStart,
      estimatedEnd,
      status: 'booked',
      intake: input.note,
      createdByAdmin: true,
      payAtClinic: input.payAtClinic,
      payment: {
        create: {
          amountInr: doctor.consultationFeeInr,
          method: input.payAtClinic ? 'clinic' : 'comped',
          status: input.payAtClinic ? 'pending' : 'paid',
        },
      },
    },
    include: { payment: true, patient: true, doctor: true },
  })

  emitQueueUpdated(input.doctorId, input.date)
  return apt
}

export function serializeAppointment(a: {
  id: string
  doctorId: string
  patientId: string
  dependentId: string | null
  date: string
  hourBlockStart: string
  hourBlockEnd: string
  queuePosition: number
  estimatedStart: string
  estimatedEnd: string
  status: string
  intake: string
  durationMin: number | null
  createdByAdmin: boolean
  payAtClinic: boolean
  patient?: { name: string; phone: string }
  dependent?: { name: string } | null
  payment?: { status: string } | null
}) {
  const statusMap: Record<string, string> = {
    held: 'upcoming',
    booked: 'upcoming',
    checked_in: 'checked_in',
    in_progress: 'in_progress',
    completed: 'completed',
    cancelled: 'cancelled',
    no_show: 'no_show',
  }
  return {
    id: a.id,
    doctorId: a.doctorId,
    patientId: a.patientId,
    patientName: a.dependent?.name ?? a.patient?.name ?? 'Patient',
    patientPhone: a.patient?.phone ?? '',
    dependentId: a.dependentId,
    date: a.date,
    blockStart: a.hourBlockStart,
    blockEnd: a.hourBlockEnd,
    token: a.queuePosition,
    etaStart: a.estimatedStart,
    etaEnd: a.estimatedEnd,
    status: statusMap[a.status] ?? a.status,
    rawStatus: a.status,
    intake: a.intake,
    paid: a.payment?.status === 'paid' || a.payAtClinic === false,
    payAtClinic: a.payAtClinic,
    durationMin: a.durationMin ?? undefined,
    createdBy: a.createdByAdmin ? 'admin' : 'patient',
  }
}
