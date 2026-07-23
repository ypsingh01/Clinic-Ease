import rateLimit from 'express-rate-limit'

const freeTier = process.env.FREE_TIER === 'true'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: freeTier ? 300 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Try again later.' },
})

export const bookingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: freeTier ? 80 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many booking requests. Slow down.' },
})

export const publicLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: freeTier ? 120 : 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
})
