import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/eta.js'
import { authenticate, signToken, type AuthUser } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { requireCaptcha, audit } from '../middleware/security.js'
import { env } from '../config/env.js'

export const authRouter = Router()

function publicUser(u: {
  id: string
  name: string
  email: string
  phone: string
  role: string
  whatsappLinked: boolean
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role as AuthUser['role'],
    whatsappLinked: u.whatsappLinked,
  }
}

authRouter.post(
  '/register',
  authLimiter,
  requireCaptcha(),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          name: z.string().min(2),
          email: z.string().email(),
          phone: z.string().min(8),
          password: z.string().min(6),
          captchaToken: z.string().optional(),
        })
        .parse(req.body)

      const exists = await prisma.user.findFirst({
        where: { OR: [{ email: body.email }, { phone: body.phone }] },
      })
      if (exists) throw new HttpError(409, 'Email or phone already registered')

      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email.toLowerCase(),
          phone: body.phone,
          passwordHash: await bcrypt.hash(body.password, 10),
          role: 'patient',
        },
      })

      const code = env.OTP_DEV_CODE
      await prisma.otpCode.create({
        data: {
          userId: user.id,
          phone: body.phone,
          code,
          purpose: 'register',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      })
      console.log(`[otp] ${body.phone} => ${code}`)
      await audit('auth.register', { userId: user.id }, req)

      res.status(201).json({
        pendingPhone: body.phone,
        message: 'OTP sent. Demo code logged server-side.',
      })
    } catch (e) {
      next(e)
    }
  },
)

authRouter.post('/login', authLimiter, requireCaptcha(), async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
        captchaToken: z.string().optional(),
      })
      .parse(req.body)

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    })
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      throw new HttpError(401, 'Invalid email or password')
    }

    const authUser: AuthUser = {
      id: user.id,
      role: user.role as AuthUser['role'],
      email: user.email,
      name: user.name,
    }
    const token = signToken(authUser)
    await audit('auth.login', { userId: user.id }, req)
    res.json({ token, user: publicUser(user) })
  } catch (e) {
    next(e)
  }
})

authRouter.post('/otp/send', authLimiter, async (req, res, next) => {
  try {
    const body = z.object({ phone: z.string().min(8) }).parse(req.body)
    let user = await prisma.user.findUnique({ where: { phone: body.phone } })
    if (!user) {
      // Phone login for demo patient flow — create draft only after verify
      user = null as unknown as typeof user
    }
    const code = env.OTP_DEV_CODE
    await prisma.otpCode.create({
      data: {
        userId: user?.id,
        phone: body.phone,
        code,
        purpose: 'login',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })
    console.log(`[otp] ${body.phone} => ${code}`)
    res.json({ pendingPhone: body.phone, message: 'OTP sent' })
  } catch (e) {
    next(e)
  }
})

authRouter.post('/otp/verify', authLimiter, async (req, res, next) => {
  try {
    const body = z
      .object({
        phone: z.string().min(8),
        code: z.string().min(4),
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
      .parse(req.body)

    const otp = await prisma.otpCode.findFirst({
      where: {
        phone: body.phone,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })
    if (!otp || otp.code !== body.code) {
      throw new HttpError(400, 'Invalid or expired OTP')
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumed: true },
    })

    let user = await prisma.user.findUnique({ where: { phone: body.phone } })
    if (!user && otp.userId) {
      user = await prisma.user.findUnique({ where: { id: otp.userId } })
    }
    if (!user) {
      // Phone-only login: attach to demo patient or create
      user = await prisma.user.create({
        data: {
          name: body.name ?? 'Patient',
          email: body.email ?? `phone_${Date.now()}@clinicease.app`,
          phone: body.phone,
          passwordHash: await bcrypt.hash(`otp_${Date.now()}`, 8),
          role: 'patient',
          whatsappLinked: true,
        },
      })
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { whatsappLinked: true },
      })
    }

    const authUser: AuthUser = {
      id: user.id,
      role: user.role as AuthUser['role'],
      email: user.email,
      name: user.name,
    }
    res.json({ token: signToken(authUser), user: publicUser(user) })
  } catch (e) {
    next(e)
  }
})

authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user) throw new HttpError(404, 'User not found')
    res.json({ user: publicUser(user) })
  } catch (e) {
    next(e)
  }
})
