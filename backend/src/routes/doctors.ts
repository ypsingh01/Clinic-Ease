import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { HttpError, todayISO } from '../lib/eta.js'
import { routeParam } from '../lib/params.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { getHourBlocks, mapDoctor } from '../services/slots.js'

export const doctorsRouter = Router()

doctorsRouter.get('/', async (_req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { availability: true },
      orderBy: { name: 'asc' },
    })
    res.json({ doctors: doctors.map(mapDoctor) })
  } catch (e) {
    next(e)
  }
})

doctorsRouter.get('/:id', async (req, res, next) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: routeParam(req.params.id) },
      include: { availability: true },
    })
    if (!doctor) throw new HttpError(404, 'Doctor not found')
    res.json({ doctor: mapDoctor(doctor) })
  } catch (e) {
    next(e)
  }
})

doctorsRouter.get('/:id/availability', authenticate, async (req, res, next) => {
  try {
    const rows = await prisma.doctorAvailability.findMany({
      where: { doctorId: routeParam(req.params.id) },
      orderBy: { dayOfWeek: 'asc' },
    })
    const leaves = await prisma.doctorLeave.findMany({
      where: { doctorId: routeParam(req.params.id) },
    })
    res.json({ availability: rows, leaves })
  } catch (e) {
    next(e)
  }
})

doctorsRouter.put(
  '/:id/availability',
  authenticate,
  requireRole('doctor', 'admin'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          dayOfWeek: z.number().int().min(0).max(6),
          enabled: z.boolean().optional(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          breakStart: z.string().optional(),
          breakEnd: z.string().optional(),
          hourlyCapacity: z.number().int().min(1).max(20).optional(),
        })
        .parse(req.body)

      if (req.user!.role === 'doctor') {
        const doc = await prisma.doctor.findFirst({
          where: { userId: req.user!.id },
        })
        if (!doc || doc.id !== routeParam(req.params.id)) throw new HttpError(403, 'Forbidden')
      }

      const row = await prisma.doctorAvailability.upsert({
        where: {
          doctorId_dayOfWeek: {
            doctorId: routeParam(req.params.id),
            dayOfWeek: body.dayOfWeek,
          },
        },
        create: {
          doctorId: routeParam(req.params.id),
          dayOfWeek: body.dayOfWeek,
          enabled: body.enabled ?? true,
          startTime: body.startTime ?? '09:00',
          endTime: body.endTime ?? '17:00',
          breakStart: body.breakStart ?? '',
          breakEnd: body.breakEnd ?? '',
          hourlyCapacity: body.hourlyCapacity ?? 12,
        },
        update: {
          enabled: body.enabled,
          startTime: body.startTime,
          endTime: body.endTime,
          breakStart: body.breakStart,
          breakEnd: body.breakEnd,
          hourlyCapacity: body.hourlyCapacity,
        },
      })
      res.json({ availability: row })
    } catch (e) {
      next(e)
    }
  },
)

doctorsRouter.post(
  '/',
  authenticate,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          id: z.string().optional(),
          name: z.string().min(2),
          specialty: z.string().min(2),
          initials: z.string().min(1),
          bio: z.string().optional(),
          photoUrl: z.string().optional(),
          feeInr: z.number().int().positive().optional(),
          capacityPerHour: z.number().int().min(1).max(20).optional(),
          active: z.boolean().optional(),
        })
        .parse(req.body)

      const id = body.id ?? `dr-${Date.now()}`
      const capacity = body.capacityPerHour ?? 10
      const doctor = await prisma.doctor.create({
        data: {
          id,
          name: body.name,
          specialty: body.specialty,
          initials: body.initials,
          bio: body.bio ?? '',
          photoUrl:
            body.photoUrl ??
            `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(body.name)}`,
          consultationFeeInr: body.feeInr ?? 500,
          hourlyCapacityOverride: capacity,
          active: body.active ?? true,
          availability: {
            create: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
              dayOfWeek,
              enabled: dayOfWeek >= 1 && dayOfWeek <= 5,
              hourlyCapacity: capacity,
            })),
          },
        },
        include: { availability: true },
      })
      res.status(201).json({ doctor: mapDoctor(doctor) })
    } catch (e) {
      next(e)
    }
  },
)

doctorsRouter.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'doctor'),
  async (req, res, next) => {
    try {
      if (req.user!.role === 'doctor') {
        const doc = await prisma.doctor.findFirst({ where: { userId: req.user!.id } })
        if (!doc || doc.id !== routeParam(req.params.id)) throw new HttpError(403, 'Forbidden')
      }
      const body = z
        .object({
          name: z.string().optional(),
          specialty: z.string().optional(),
          bio: z.string().optional(),
          photoUrl: z.string().optional(),
          consultationFeeInr: z.number().int().optional(),
          hourlyCapacityOverride: z.number().int().min(1).max(20).optional(),
          active: z.boolean().optional(),
          initials: z.string().optional(),
        })
        .parse(req.body)

      const doctor = await prisma.doctor.update({
        where: { id: routeParam(req.params.id) },
        data: body,
        include: { availability: true },
      })
      res.json({ doctor: mapDoctor(doctor) })
    } catch (e) {
      next(e)
    }
  },
)

export const slotsRouter = Router()

slotsRouter.get('/:doctorId', async (req, res, next) => {
  try {
    const date = String(req.query.date ?? todayISO())
    const blocks = await getHourBlocks(routeParam(req.params.doctorId), date)
    res.json({ date, blocks })
  } catch (e) {
    next(e)
  }
})
