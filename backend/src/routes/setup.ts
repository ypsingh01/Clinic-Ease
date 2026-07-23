import { Router } from 'express'
import { env, isFreeTier } from '../config/env.js'
import { HttpError } from '../lib/eta.js'
import { seedDatabase } from '../services/seedCatalog.js'

export const setupRouter = Router()

function assertSeedSecret(req: { headers: Record<string, unknown>; query: Record<string, unknown> }) {
  const secret = env.SEED_SECRET
  if (!secret) {
    throw new HttpError(503, 'SEED_SECRET is not configured on the server')
  }
  const provided =
    (req.headers['x-seed-secret'] as string | undefined) ||
    (typeof req.query.secret === 'string' ? req.query.secret : undefined)
  if (provided !== secret) {
    throw new HttpError(403, 'Invalid seed secret')
  }
}

/** Browser-friendly: GET /api/setup/seed?secret=YOUR_SEED_SECRET */
setupRouter.get('/seed', async (req, res, next) => {
  try {
    assertSeedSecret(req)
    const result = await seedDatabase({ demoUsers: isFreeTier || env.SEED_DEMO_USERS })
    res.json({
      ok: true,
      ...result,
      hint: 'Demo: patient@clinicease.app / demo1234 — then open /api/doctors',
    })
  } catch (e) {
    next(e)
  }
})

setupRouter.post('/seed', async (req, res, next) => {
  try {
    assertSeedSecret(req)
    const result = await seedDatabase({ demoUsers: isFreeTier || env.SEED_DEMO_USERS })
    res.json({ ok: true, ...result })
  } catch (e) {
    next(e)
  }
})
