import { prisma } from '../lib/prisma.js'
import { env } from '../config/env.js'
import { HttpError } from '../lib/eta.js'
import { notifyUser } from './notifications.js'
import { holdAppointment } from './booking.js'
import { emitQueueUpdated } from '../sockets/io.js'

export async function joinWaitlist(input: {
  patientId: string
  doctorId: string
  date: string
  hourBlockStart: string
  hourBlockEnd: string
}) {
  const existing = await prisma.waitlistEntry.findFirst({
    where: {
      patientId: input.patientId,
      doctorId: input.doctorId,
      date: input.date,
      hourBlockStart: input.hourBlockStart,
      status: { in: ['waiting', 'notified'] },
    },
  })
  if (existing) return existing

  const last = await prisma.waitlistEntry.findFirst({
    where: {
      doctorId: input.doctorId,
      date: input.date,
      hourBlockStart: input.hourBlockStart,
    },
    orderBy: { position: 'desc' },
  })

  return prisma.waitlistEntry.create({
    data: {
      ...input,
      position: (last?.position ?? 0) + 1,
      status: 'waiting',
    },
  })
}

export async function offerNextWaitlist(
  doctorId: string,
  date: string,
  hourBlockStart: string,
  hourBlockEnd: string,
) {
  const next = await prisma.waitlistEntry.findFirst({
    where: {
      doctorId,
      date,
      hourBlockStart,
      status: 'waiting',
    },
    orderBy: { position: 'asc' },
  })
  if (!next) return null

  const updated = await prisma.waitlistEntry.update({
    where: { id: next.id },
    data: {
      status: 'notified',
      offerExpiresAt: new Date(Date.now() + env.CLAIM_MINUTES * 60 * 1000),
    },
  })

  await notifyUser(next.patientId, {
    kind: 'waitlist',
    title: 'Waitlist spot opened',
    message: `A token freed for ${hourBlockStart}–${hourBlockEnd}. Claim within ${env.CLAIM_MINUTES} minutes.`,
    whatsapp: true,
  })

  return updated
}

export async function claimWaitlist(id: string, patientId: string) {
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } })
  if (!entry || entry.patientId !== patientId) throw new HttpError(404, 'Not found')
  if (entry.status !== 'notified') throw new HttpError(400, 'Offer not available')
  if (entry.offerExpiresAt && entry.offerExpiresAt < new Date()) {
    await prisma.waitlistEntry.update({
      where: { id },
      data: { status: 'expired' },
    })
    await offerNextWaitlist(
      entry.doctorId,
      entry.date,
      entry.hourBlockStart,
      entry.hourBlockEnd,
    )
    throw new HttpError(410, 'Claim window expired')
  }

  await prisma.waitlistEntry.update({
    where: { id },
    data: { status: 'claimed' },
  })

  const held = await holdAppointment({
    patientId,
    doctorId: entry.doctorId,
    date: entry.date,
    hourBlockStart: entry.hourBlockStart,
    hourBlockEnd: entry.hourBlockEnd,
  })

  emitQueueUpdated(entry.doctorId, entry.date)
  return { entry, appointment: held }
}

export async function expireWaitlistOffers() {
  const expired = await prisma.waitlistEntry.findMany({
    where: { status: 'notified', offerExpiresAt: { lt: new Date() } },
  })
  for (const e of expired) {
    await prisma.waitlistEntry.update({
      where: { id: e.id },
      data: { status: 'expired' },
    })
    await offerNextWaitlist(e.doctorId, e.date, e.hourBlockStart, e.hourBlockEnd)
  }
  return expired.length
}

export function serializeWaitlist(w: {
  id: string
  doctorId: string
  date: string
  hourBlockStart: string
  hourBlockEnd: string
  position: number
  status: string
  offerExpiresAt: Date | null
  patient?: { name: string }
}) {
  const statusMap: Record<string, string> = {
    waiting: 'waiting',
    notified: 'offered',
    claimed: 'claimed',
    expired: 'expired',
  }
  return {
    id: w.id,
    doctorId: w.doctorId,
    date: w.date,
    blockStart: w.hourBlockStart,
    blockEnd: w.hourBlockEnd,
    position: w.position,
    status: statusMap[w.status] ?? w.status,
    offerExpiresAt: w.offerExpiresAt?.toISOString(),
    patientName: w.patient?.name,
  }
}
