import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { randomUUID } from 'node:crypto'
import { env } from './config/env.js'
import { HttpError } from './lib/eta.js'
import { logger } from './lib/logger.js'
import { prisma } from './lib/prisma.js'
import { authRouter } from './routes/auth.js'
import { doctorsRouter, slotsRouter } from './routes/doctors.js'
import { adminRouter, appointmentsRouter, queueRouter } from './routes/appointments.js'
import {
  dependentsRouter,
  notificationsRouter,
  paymentsRouter,
  symptomRouter,
  waitlistRouter,
} from './routes/misc.js'
import { setupRouter } from './routes/setup.js'

export type RequestWithRaw = Request & { rawBody?: string; requestId?: string }

export function createApp() {
  const app = express()
  app.set('trust proxy', 1)
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

  const allowedOrigins = env.CLIENT_ORIGIN.split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  app.use(
    cors({
      origin(origin, callback) {
        // Non-browser / same-origin tools
        if (!origin) {
          callback(null, true)
          return
        }
        if (allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }
        // Free-tier: allow any Vercel deployment URL so preview/prod both work
        if (env.FREE_TIER && /\.vercel\.app$/i.test(new URL(origin).hostname)) {
          callback(null, true)
          return
        }
        callback(new Error(`CORS blocked for origin: ${origin}`))
      },
      credentials: true,
    }),
  )
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        ;(req as RequestWithRaw).rawBody = buf.toString('utf8')
      },
    }),
  )

  app.use((req, res, next) => {
    const id = (req.headers['x-request-id'] as string) || randomUUID()
    ;(req as RequestWithRaw).requestId = id
    res.setHeader('x-request-id', id)
    const start = Date.now()
    res.on('finish', () => {
      logger.info(
        {
          requestId: id,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          ms: Date.now() - start,
        },
        'http',
      )
    })
    next()
  })

  app.get('/api/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      res.json({
        ok: true,
        service: 'clinicease-api',
        db: 'up',
        time: new Date().toISOString(),
      })
    } catch (e) {
      logger.error({ err: e }, 'health:db-down')
      res.status(503).json({
        ok: false,
        service: 'clinicease-api',
        db: 'down',
        time: new Date().toISOString(),
      })
    }
  })

  app.use('/api/auth', authRouter)
  app.use('/api/setup', setupRouter)
  app.use('/api/doctors', doctorsRouter)
  app.use('/api/slots', slotsRouter)
  app.use('/api/appointments', appointmentsRouter)
  app.use('/api/queue', queueRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/waitlist', waitlistRouter)
  app.use('/api/dependents', dependentsRouter)
  app.use('/api/notifications', notificationsRouter)
  app.use('/api/payments', paymentsRouter)
  app.use('/api/symptom-check', symptomRouter)

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const requestId = (req as RequestWithRaw).requestId
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message, requestId })
      return
    }
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status?: number; message?: string }
      res.status(e.status ?? 500).json({ error: e.message ?? 'Error', requestId })
      return
    }
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', requestId })
      return
    }
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      res.status(409).json({ error: 'Email or phone already registered', requestId })
      return
    }
    logger.error({ err, requestId }, 'unhandled')
    res.status(500).json({ error: 'Internal server error', requestId })
  })

  return app
}
