import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { publicLimiter } from '../middleware/rateLimit.js'
import {
  claimWaitlist,
  joinWaitlist,
  serializeWaitlist,
} from '../services/waitlist.js'
import { createBroadcast } from '../services/notifications.js'
import {
  confirmMockPayment,
  createPaymentOrder,
  handleRazorpayWebhook,
  verifyRazorpayCheckout,
} from '../services/payments.js'
import { serializeAppointment } from '../services/booking.js'
import { HttpError } from '../lib/eta.js'
import { routeParam } from '../lib/params.js'

export const waitlistRouter = Router()
waitlistRouter.use(authenticate)

waitlistRouter.get('/', async (req, res, next) => {
  try {
    const where =
      req.user!.role === 'admin' ? {} : { patientId: req.user!.id }
    const rows = await prisma.waitlistEntry.findMany({
      where,
      include: { patient: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ waitlist: rows.map(serializeWaitlist) })
  } catch (e) {
    next(e)
  }
})

waitlistRouter.post('/join', async (req, res, next) => {
  try {
    const body = z
      .object({
        doctorId: z.string(),
        date: z.string(),
        hourBlockStart: z.string(),
        hourBlockEnd: z.string(),
      })
      .parse(req.body)
    const entry = await joinWaitlist({ patientId: req.user!.id, ...body })
    res.status(201).json({ entry: serializeWaitlist(entry) })
  } catch (e) {
    next(e)
  }
})

waitlistRouter.post('/:id/claim', async (req, res, next) => {
  try {
    const result = await claimWaitlist(routeParam(req.params.id), req.user!.id)
    res.json({
      entry: serializeWaitlist(result.entry),
      appointment: serializeAppointment({
        ...result.appointment,
        patient: result.appointment.patient,
        dependent: result.appointment.dependent,
        payment: { status: 'pending' },
      }),
    })
  } catch (e) {
    next(e)
  }
})

export const dependentsRouter = Router()
dependentsRouter.use(authenticate, requireRole('patient'))

dependentsRouter.get('/', async (req, res, next) => {
  try {
    const dependents = await prisma.dependent.findMany({
      where: { patientUserId: req.user!.id },
    })
    res.json({ dependents })
  } catch (e) {
    next(e)
  }
})

dependentsRouter.post('/', async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(1),
        relation: z.enum(['parent', 'spouse', 'child']),
        age: z.number().int().min(0).optional(),
        dateOfBirth: z.string().optional(),
        gender: z.string().optional(),
      })
      .parse(req.body)
    const dependent = await prisma.dependent.create({
      data: {
        patientUserId: req.user!.id,
        name: body.name,
        relation: body.relation,
        age: body.age ?? 0,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
      },
    })
    res.status(201).json({ dependent })
  } catch (e) {
    next(e)
  }
})

dependentsRouter.delete('/:id', async (req, res, next) => {
  try {
    const dep = await prisma.dependent.findUnique({ where: { id: routeParam(req.params.id) } })
    if (!dep || dep.patientUserId !== req.user!.id) throw new HttpError(404, 'Not found')
    await prisma.dependent.delete({ where: { id: routeParam(req.params.id) } })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

export const notificationsRouter = Router()
notificationsRouter.use(authenticate)

notificationsRouter.get('/', async (req, res, next) => {
  try {
    const rows = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { sentAt: 'desc' },
      take: 50,
    })
    res.json({
      notifications: rows.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.message,
        time: n.sentAt.toISOString(),
        read: n.read,
        kind: n.kind,
        channel: n.type,
      })),
    })
  } catch (e) {
    next(e)
  }
})

notificationsRouter.post('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

notificationsRouter.post(
  '/broadcast',
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          title: z.string(),
          body: z.string(),
          audience: z.enum(['all', 'patients', 'doctors']),
        })
        .parse(req.body)
      const broadcast = await createBroadcast({
        ...body,
        createdBy: req.user!.id,
      })
      res.status(201).json({ broadcast })
    } catch (e) {
      next(e)
    }
  },
)

notificationsRouter.get('/broadcasts', requireRole('admin'), async (_req, res, next) => {
  try {
    const broadcasts = await prisma.broadcast.findMany({ orderBy: { sentAt: 'desc' } })
    res.json({ broadcasts })
  } catch (e) {
    next(e)
  }
})

export const paymentsRouter = Router()

paymentsRouter.post('/order', authenticate, async (req, res, next) => {
  try {
    const body = z.object({ appointmentId: z.string() }).parse(req.body)
    const order = await createPaymentOrder(body.appointmentId, req.user!.id)
    res.json(order)
  } catch (e) {
    next(e)
  }
})

paymentsRouter.post('/confirm-mock', authenticate, async (req, res, next) => {
  try {
    const body = z.object({ appointmentId: z.string() }).parse(req.body)
    const apt = await confirmMockPayment(body.appointmentId, req.user!.id)
    res.json({
      appointment: serializeAppointment({
        ...apt,
        patient: apt.patient,
        dependent: apt.dependent,
        payment: apt.payment,
      }),
    })
  } catch (e) {
    next(e)
  }
})

paymentsRouter.post('/confirm', authenticate, async (req, res, next) => {
  try {
    const body = z
      .object({
        appointmentId: z.string(),
        razorpayOrderId: z.string(),
        razorpayPaymentId: z.string(),
        razorpaySignature: z.string(),
      })
      .parse(req.body)
    const apt = await verifyRazorpayCheckout(body.appointmentId, req.user!.id, body)
    res.json({
      appointment: serializeAppointment({
        ...apt,
        patient: apt.patient,
        dependent: apt.dependent,
        payment: apt.payment,
      }),
    })
  } catch (e) {
    next(e)
  }
})

paymentsRouter.post('/webhook', async (req, res, next) => {
  try {
    const raw =
      (req as typeof req & { rawBody?: string }).rawBody ??
      (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
    const result = await handleRazorpayWebhook(
      raw,
      req.headers['x-razorpay-signature'] as string | undefined,
    )
    res.json(result)
  } catch (e) {
    next(e)
  }
})

export const symptomRouter = Router()

symptomRouter.post('/', publicLimiter, async (req, res, next) => {
  try {
    const body = z
      .object({
        symptoms: z.array(z.string()).default([]),
        text: z.string().optional(),
      })
      .parse(req.body)

    const map = await prisma.symptomSpecialtyMap.findMany()
    const specialties = new Set<string>()
    for (const id of body.symptoms) {
      const row = map.find((m) => m.symptomKeyword === id)
      if (row) specialties.add(row.specialty)
    }
    if (body.text) {
      const lower = body.text.toLowerCase()
      for (const m of map) {
        if (lower.includes(m.symptomKeyword.replace('_', ' ')) || lower.includes(m.label.toLowerCase())) {
          specialties.add(m.specialty)
        }
      }
    }

    const doctors = await prisma.doctor.findMany({
      where: {
        active: true,
        specialty: { in: [...specialties] },
      },
      include: { availability: true },
    })

    res.json({
      suggestedSpecialties: [...specialties],
      doctors: doctors.map((d) => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        photoUrl: d.photoUrl,
      })),
      disclaimer:
        'Based on what you described, you may want to see these specialties. This is guidance, not a medical diagnosis. For urgent symptoms, call the clinic or seek emergency care.',
      map: map.map((m) => ({ id: m.symptomKeyword, label: m.label || m.symptomKeyword, specialty: m.specialty })),
    })
  } catch (e) {
    next(e)
  }
})

symptomRouter.get('/map', async (_req, res, next) => {
  try {
    const map = await prisma.symptomSpecialtyMap.findMany()
    res.json({
      map: map.map((m) => ({
        id: m.symptomKeyword,
        label: m.label || m.symptomKeyword,
        specialty: m.specialty,
      })),
    })
  } catch (e) {
    next(e)
  }
})
