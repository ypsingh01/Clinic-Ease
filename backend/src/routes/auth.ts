import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/eta.js'
import { authenticate, signToken, type AuthUser } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { requireCaptcha, audit } from '../middleware/security.js'
import { generateOtpCode, sendSmsOtp } from '../services/otp.js'

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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizePhone(phone: string) {
  return phone.trim().replace(/\s+/g, ' ')
}

function mapPrismaAuthError(e: unknown): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    throw new HttpError(409, 'Email or phone already registered')
  }
  throw e
}

async function issueAndSendOtp(phone: string, purpose: string, userId?: string) {
  const code = generateOtpCode()
  await prisma.otpCode.create({
    data: {
      userId,
      phone,
      code,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  })
  await sendSmsOtp(phone, code)
  return code
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

      const email = normalizeEmail(body.email)
      const phone = normalizePhone(body.phone)

      const exists = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] },
      })
      if (exists) throw new HttpError(409, 'Email or phone already registered')

      const user = await prisma.user
        .create({
          data: {
            name: body.name.trim(),
            email,
            phone,
            passwordHash: await bcrypt.hash(body.password, 10),
            role: 'patient',
          },
        })
        .catch(mapPrismaAuthError)

      await issueAndSendOtp(phone, 'register', user.id)
      await audit('auth.register', { userId: user.id }, req)

      res.status(201).json({
        pendingPhone: phone,
        message: 'OTP sent to your phone. Demo code is 123456 when OTP_DEV_CODE is set.',
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

    const email = normalizeEmail(body.email)
    const user = await prisma.user.findUnique({ where: { email } })
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
    const phone = normalizePhone(body.phone)
    const user = await prisma.user.findUnique({ where: { phone } })
    await issueAndSendOtp(phone, 'login', user?.id)
    res.json({ pendingPhone: phone, message: 'OTP sent' })
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

    const phone = normalizePhone(body.phone)
    const otp = await prisma.otpCode.findFirst({
      where: {
        phone,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })
    if (!otp || otp.code !== body.code.trim()) {
      throw new HttpError(400, 'Invalid or expired OTP. Demo: use 123456')
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumed: true },
    })

    let user = await prisma.user.findUnique({ where: { phone } })
    if (!user && otp.userId) {
      user = await prisma.user.findUnique({ where: { id: otp.userId } })
    }
    if (!user) {
      user = await prisma.user
        .create({
          data: {
            name: body.name ?? 'Patient',
            email: body.email
              ? normalizeEmail(body.email)
              : `phone_${Date.now()}@clinicease.app`,
            phone,
            passwordHash: await bcrypt.hash(`otp_${Date.now()}`, 8),
            role: 'patient',
            whatsappLinked: true,
          },
        })
        .catch(mapPrismaAuthError)
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
