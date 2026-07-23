import crypto from 'node:crypto'
import { env, isFreeTier, isStrictProduction } from '../config/env.js'
import { HttpError } from '../lib/eta.js'
import { logger } from '../lib/logger.js'

function twilioAuthHeader() {
  return Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64')
}

/** Fixed OTP when OTP_DEV_CODE set (free-tier/local). Random otherwise. */
export function generateOtpCode() {
  const dev = env.OTP_DEV_CODE?.trim()
  if (dev && (!isStrictProduction || isFreeTier)) return dev
  // Free tier without OTP_DEV_CODE still needs a predictable demo code
  if (isFreeTier) return '123456'
  return String(crypto.randomInt(100000, 999999))
}

export async function sendSmsOtp(phone: string, code: string) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_SMS_FROM) {
    if (isStrictProduction) throw new HttpError(500, 'SMS OTP is not configured')
    logger.info({ phone, code }, 'otp:dev-log (Twilio SMS not configured — free tier / local)')
    return 'sent'
  }

  const to = phone.replace(/\s/g, '')
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${twilioAuthHeader()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: env.TWILIO_SMS_FROM,
        To: to.startsWith('+') ? to : `+${to}`,
        Body: `ClinicEase verification code: ${code}. Valid for 10 minutes.`,
      }),
    },
  )
  if (!res.ok) {
    const text = await res.text()
    logger.error({ status: res.status, text }, 'otp:sms-failed')
    throw new HttpError(502, 'Failed to send OTP')
  }
  return 'sent'
}
