import { prisma } from '../lib/prisma.js'
import { env } from '../config/env.js'
import { logger } from '../lib/logger.js'

export async function notifyUser(
  userId: string,
  input: {
    kind: string
    title: string
    message: string
    whatsapp?: boolean
  },
) {
  const inApp = await prisma.notification.create({
    data: {
      userId,
      type: 'in_app',
      kind: input.kind,
      title: input.title,
      message: input.message,
      status: 'sent',
    },
  })

  if (input.whatsapp) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const waStatus = await sendWhatsApp(user?.phone ?? '', input.message)
    await prisma.notification.create({
      data: {
        userId,
        type: 'whatsapp',
        kind: 'whatsapp',
        title: 'WhatsApp queued',
        message: `To ${user?.phone ?? 'unknown'}: ${input.message}`,
        status: waStatus,
      },
    })
  }

  return inApp
}

export async function sendWhatsApp(phone: string, body: string) {
  if (env.WHATSAPP_MODE === 'mock' || !env.TWILIO_ACCOUNT_SID) {
    logger.info({ phone, preview: body.slice(0, 120) }, 'whatsapp:mock')
    return 'sent'
  }
  try {
    const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString(
      'base64',
    )
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: env.TWILIO_WHATSAPP_FROM,
          To: `whatsapp:${phone.replace(/\s/g, '')}`,
          Body: body,
        }),
      },
    )
    return res.ok ? 'sent' : 'failed'
  } catch (err) {
    logger.error({ err }, 'whatsapp:send-failed')
    return 'failed'
  }
}

export async function sendReminders() {
  const apts = await prisma.appointment.findMany({
    where: { status: { in: ['booked', 'checked_in'] } },
    include: { doctor: true, patient: true },
  })
  let sent = 0
  for (const a of apts) {
    const [h, m] = a.estimatedStart.split(':').map(Number)
    const target = new Date(
      `${a.date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`,
    )
    const mins = (target.getTime() - Date.now()) / 60000
    if (mins <= 24 * 60 && mins > 60 && !a.reminder24Sent) {
      await notifyUser(a.patientId, {
        kind: 'reminder',
        title: 'Reminder · 24 hours',
        message: `Upcoming visit · Token #${a.queuePosition} with ${a.doctor.name} · ETA ${a.estimatedStart}–${a.estimatedEnd}`,
        whatsapp: true,
      })
      await prisma.appointment.update({
        where: { id: a.id },
        data: { reminder24Sent: true },
      })
      sent++
    }
    if (mins <= 60 && mins > -30 && !a.reminder1Sent) {
      await notifyUser(a.patientId, {
        kind: 'reminder',
        title: 'Reminder · 1 hour',
        message: `Your estimated window is approaching. Token #${a.queuePosition} · ${a.estimatedStart}–${a.estimatedEnd}`,
        whatsapp: true,
      })
      await prisma.appointment.update({
        where: { id: a.id },
        data: { reminder1Sent: true },
      })
      sent++
    }
  }
  return sent
}

export async function createBroadcast(input: {
  title: string
  body: string
  audience: 'all' | 'patients' | 'doctors'
  createdBy?: string
}) {
  const where =
    input.audience === 'all'
      ? {}
      : input.audience === 'patients'
        ? { role: 'patient' }
        : { role: 'doctor' }
  const users = await prisma.user.findMany({ where })
  let delivered = 0
  let failed = 0
  for (const u of users) {
    try {
      await notifyUser(u.id, {
        kind: 'broadcast',
        title: input.title,
        message: input.body,
        whatsapp: true,
      })
      delivered++
    } catch {
      failed++
    }
  }
  return prisma.broadcast.create({
    data: {
      title: input.title,
      body: input.body,
      audience: input.audience,
      delivered,
      failed,
      createdBy: input.createdBy,
    },
  })
}
