import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { HttpError, todayISO } from '../lib/eta.js'
import { routeParam } from '../lib/params.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { bookingLimiter } from '../middleware/rateLimit.js'
import { requireCaptcha } from '../middleware/security.js'
import {
  cancelAppointment,
  checkIn,
  confirmAppointment,
  holdAppointment,
  manualWalkIn,
  rescheduleAppointment,
  serializeAppointment,
  setAppointmentStatus,
  applyDelay,
  clearDelay,
} from '../services/booking.js'
import { getDelayMinutes } from '../services/slots.js'

export const appointmentsRouter = Router()

appointmentsRouter.use(authenticate)

appointmentsRouter.get('/', async (req, res, next) => {
  try {
    const where =
      req.user!.role === 'admin'
        ? {}
        : req.user!.role === 'doctor'
          ? {
              doctor: { userId: req.user!.id },
              ...(req.query.date ? { date: String(req.query.date) } : {}),
            }
          : { patientId: req.user!.id }

    const apts = await prisma.appointment.findMany({
      where,
      include: { patient: true, dependent: true, payment: true, doctor: true },
      orderBy: [{ date: 'desc' }, { queuePosition: 'asc' }],
    })
    res.json({ appointments: apts.map(serializeAppointment) })
  } catch (e) {
    next(e)
  }
})

appointmentsRouter.post(
  '/hold',
  bookingLimiter,
  requireCaptcha(),
  async (req, res, next) => {
    try {
      if (req.user!.role !== 'patient') throw new HttpError(403, 'Patients only')
      const body = z
        .object({
          doctorId: z.string(),
          date: z.string(),
          hourBlockStart: z.string(),
          hourBlockEnd: z.string(),
          dependentId: z.string().nullable().optional(),
          intake: z.string().optional(),
          captchaToken: z.string().optional(),
        })
        .parse(req.body)

      const apt = await holdAppointment({
        patientId: req.user!.id,
        ...body,
      })
      res.status(201).json({
        appointment: serializeAppointment({
          ...apt,
          patient: apt.patient,
          dependent: apt.dependent,
          payment: { status: 'pending' },
        }),
      })
    } catch (e) {
      next(e)
    }
  },
)

appointmentsRouter.post('/:id/confirm', async (req, res, next) => {
  try {
    const apt = await prisma.appointment.findUnique({ where: { id: routeParam(req.params.id) } })
    if (!apt) throw new HttpError(404, 'Not found')
    if (apt.patientId !== req.user!.id && req.user!.role !== 'admin') {
      throw new HttpError(403, 'Forbidden')
    }
    const confirmed = await confirmAppointment(routeParam(req.params.id))
    res.json({
      appointment: serializeAppointment({
        ...confirmed,
        patient: confirmed.patient,
        dependent: confirmed.dependent,
        payment: confirmed.payment,
      }),
    })
  } catch (e) {
    next(e)
  }
})

appointmentsRouter.post('/:id/cancel', async (req, res, next) => {
  try {
    const force = req.user!.role === 'admin'
    const result = await cancelAppointment(routeParam(req.params.id), {
      userId: req.user!.id,
      role: req.user!.role,
      force,
    })
    res.json(result)
  } catch (e) {
    next(e)
  }
})

appointmentsRouter.post('/:id/reschedule', async (req, res, next) => {
  try {
    const body = z
      .object({
        date: z.string(),
        hourBlockStart: z.string(),
        hourBlockEnd: z.string(),
      })
      .parse(req.body)
    const force = req.user!.role === 'admin'
    const apt = await rescheduleAppointment(routeParam(req.params.id), body, {
      userId: req.user!.id,
      role: req.user!.role,
      force,
    })
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

appointmentsRouter.post('/:id/check-in', async (req, res, next) => {
  try {
    const apt = await checkIn(routeParam(req.params.id), req.user!.id)
    res.json({ appointment: serializeAppointment({ ...apt, patient: undefined }) })
  } catch (e) {
    next(e)
  }
})

appointmentsRouter.patch(
  '/:id/status',
  requireRole('doctor', 'admin'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          status: z.enum(['in_progress', 'completed', 'no_show', 'booked']),
          durationMin: z.number().int().positive().optional(),
        })
        .parse(req.body)
      const apt = await setAppointmentStatus(routeParam(req.params.id), body.status, body.durationMin)
      res.json({ appointment: apt })
    } catch (e) {
      next(e)
    }
  },
)

export const queueRouter = Router()

queueRouter.get('/:doctorId/:date', authenticate, async (req, res, next) => {
  try {
    const apts = await prisma.appointment.findMany({
      where: {
        doctorId: routeParam(req.params.doctorId),
        date: routeParam(req.params.date, 'date'),
        status: { not: 'cancelled' },
      },
      include: { patient: true, dependent: true, payment: true },
      orderBy: { queuePosition: 'asc' },
    })
    const delay = await getDelayMinutes(
      routeParam(req.params.doctorId),
      routeParam(req.params.date, 'date'),
    )
    const serving = apts.find((a) => a.status === 'in_progress')
    res.json({
      appointments: apts.map(serializeAppointment),
      delayOffsetMin: delay,
      servingToken: serving?.queuePosition ?? 0,
    })
  } catch (e) {
    next(e)
  }
})

queueRouter.post(
  '/:doctorId/delay',
  authenticate,
  requireRole('doctor', 'admin'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          date: z.string().default(todayISO()),
          minutes: z.number().int().min(0).max(180),
          reason: z.string().optional(),
        })
        .parse(req.body)
      if (body.minutes === 0) {
        await clearDelay(routeParam(req.params.doctorId), body.date)
      } else {
        await applyDelay(routeParam(req.params.doctorId), body.date, body.minutes, body.reason ?? '')
      }
      res.json({ ok: true, delayOffsetMin: body.minutes })
    } catch (e) {
      next(e)
    }
  },
)

export const adminRouter = Router()
adminRouter.use(authenticate, requireRole('admin'))

adminRouter.post('/walk-in', async (req, res, next) => {
  try {
    const body = z
      .object({
        doctorId: z.string(),
        patientName: z.string(),
        patientPhone: z.string(),
        date: z.string(),
        hourBlockStart: z.string(),
        hourBlockEnd: z.string(),
        payAtClinic: z.boolean().default(true),
        note: z.string().default(''),
      })
      .parse(req.body)
    const apt = await manualWalkIn({ ...body, adminId: req.user!.id })
    res.status(201).json({
      appointment: serializeAppointment({
        ...apt,
        patient: apt.patient,
        payment: apt.payment,
      }),
    })
  } catch (e) {
    next(e)
  }
})

adminRouter.get('/grid', async (req, res, next) => {
  try {
    const date = String(req.query.date ?? todayISO())
    const doctors = await prisma.doctor.findMany({ where: { active: true } })
    const hours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00']
    const apts = await prisma.appointment.findMany({
      where: { date, status: { not: 'cancelled' } },
    })
    const grid = doctors.flatMap((d) =>
      hours.map((hour) => {
        const cell = apts.filter(
          (a) => a.doctorId === d.id && a.hourBlockStart === hour,
        )
        return {
          doctorId: d.id,
          hour,
          booked: cell.length,
          capacity: d.hourlyCapacityOverride ?? 12,
          labels: cell.map((a) => `#${a.queuePosition}`),
        }
      }),
    )
    res.json({ date, grid, doctors })
  } catch (e) {
    next(e)
  }
})

adminRouter.get('/payments', async (_req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        appointment: { include: { patient: true, doctor: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json({
      payments: payments.map((p) => ({
        id: p.id,
        patient: p.appointment.patient.name,
        doctor: p.appointment.doctor.name,
        doctorId: p.appointment.doctorId,
        amount: p.amountInr,
        method: p.method,
        status: p.status,
        at: p.createdAt.toISOString(),
      })),
      revenueTotal: payments
        .filter((p) => p.status === 'paid')
        .reduce((s, p) => s + p.amountInr, 0),
    })
  } catch (e) {
    next(e)
  }
})

adminRouter.get('/analytics/doctor-performance', async (_req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({ where: { active: true } })
    const completed = await prisma.appointment.findMany({
      where: { status: 'completed', durationMin: { not: null } },
    })
    const noShows = await prisma.appointment.groupBy({
      by: ['doctorId'],
      where: { status: 'no_show' },
      _count: true,
    })
    const waitlist = await prisma.waitlistEntry.groupBy({
      by: ['status'],
      _count: true,
    })
    const claimed = waitlist.find((w) => w.status === 'claimed')?._count ?? 0
    const expired = waitlist.find((w) => w.status === 'expired')?._count ?? 0
    const notified = waitlist.find((w) => w.status === 'notified')?._count ?? 0

    const punctuality = doctors.map((d) => {
      const mine = completed.filter((a) => a.doctorId === d.id)
      const avgActual =
        mine.length === 0
          ? 0
          : mine.reduce((s, a) => s + (a.durationMin ?? 0), 0) / mine.length
      return {
        doctorId: d.id,
        name: d.name,
        assumedAvg: d.avgConsultationMinutes,
        actualAvg: Math.round(avgActual * 10) / 10,
        completed: mine.length,
        noShows: noShows.find((n) => n.doctorId === d.id)?._count ?? 0,
      }
    })

    const heatmapRaw = await prisma.appointment.findMany({
      where: { status: { not: 'cancelled' } },
      select: { hourBlockStart: true, date: true },
    })
    const heat: Record<string, number> = {}
    for (const a of heatmapRaw) {
      heat[a.hourBlockStart] = (heat[a.hourBlockStart] ?? 0) + 1
    }

    res.json({
      punctuality,
      heatmap: heat,
      waitlistConversion: {
        claimed,
        expired,
        pendingOffers: notified,
        rate: claimed + expired === 0 ? 0 : claimed / (claimed + expired),
      },
    })
  } catch (e) {
    next(e)
  }
})

adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const bookings = await prisma.appointment.count({
      where: { createdAt: { gte: weekAgo }, status: { not: 'cancelled' } },
    })
    const cancellations = await prisma.appointment.count({
      where: { createdAt: { gte: weekAgo }, status: 'cancelled' },
    })
    const noShows = await prisma.appointment.count({
      where: { createdAt: { gte: weekAgo }, status: 'no_show' },
    })
    const paid = await prisma.payment.aggregate({
      where: { status: 'paid' },
      _sum: { amountInr: true },
    })
    res.json({
      bookingsThisWeek: bookings,
      cancellations,
      noShowRate: bookings === 0 ? 0 : noShows / (bookings + noShows),
      revenueTotal: paid._sum.amountInr ?? 0,
      activeDoctors: await prisma.doctor.count({ where: { active: true } }),
    })
  } catch (e) {
    next(e)
  }
})
