import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env.js'
import { HttpError } from '../lib/eta.js'
import { prisma } from '../lib/prisma.js'

/** Stub or live reCAPTCHA verification */
export async function verifyCaptcha(token: string | undefined, ip?: string) {
  if (env.RECAPTCHA_MODE === 'stub') {
    if (!token || token.length < 2) {
      throw new HttpError(400, 'CAPTCHA verification required')
    }
    return true
  }
  if (!env.RECAPTCHA_SECRET) {
    throw new HttpError(500, 'reCAPTCHA not configured')
  }
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: env.RECAPTCHA_SECRET,
      response: token ?? '',
      remoteip: ip ?? '',
    }),
  })
  const data = (await res.json()) as { success?: boolean }
  if (!data.success) throw new HttpError(400, 'CAPTCHA failed')
  return true
}

export function requireCaptcha(field = 'captchaToken') {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await verifyCaptcha(req.body?.[field], req.ip)
      next()
    } catch (e) {
      next(e)
    }
  }
}

export async function audit(kind: string, meta: Record<string, unknown>, req?: Request) {
  await prisma.auditEvent.create({
    data: {
      kind,
      ip: req?.ip,
      userId: req?.user?.id,
      meta: JSON.stringify(meta),
    },
  })
}
