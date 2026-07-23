import 'dotenv/config'
import { z } from 'zod'

const isProd = process.env.NODE_ENV === 'production'
const freeTierFlag = process.env.FREE_TIER === 'true'

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    FREE_TIER: z
      .string()
      .default('false')
      .transform((v) => v === 'true'),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(isProd ? 32 : 8),
    JWT_EXPIRES_IN: z.string().default(isProd ? '12h' : '7d'),
    PORT: z.coerce.number().default(4000),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
    WHATSAPP_MODE: z
      .enum(['mock', 'live'])
      .default(isProd && !freeTierFlag ? 'live' : 'mock'),
    OTP_DEV_CODE: z.string().optional().default(''),
    ALLOW_MOCK_PAY: z
      .string()
      .default('false')
      .transform((v) => v === 'true'),
    HOLD_MINUTES: z.coerce.number().default(5),
    CLAIM_MINUTES: z.coerce.number().default(10),
    CANCEL_POLICY_HOURS: z.coerce.number().default(2),
    RAZORPAY_KEY_ID: z.string().optional().default(''),
    RAZORPAY_KEY_SECRET: z.string().optional().default(''),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
    TWILIO_ACCOUNT_SID: z.string().optional().default(''),
    TWILIO_AUTH_TOKEN: z.string().optional().default(''),
    TWILIO_WHATSAPP_FROM: z.string().optional().default(''),
    TWILIO_SMS_FROM: z.string().optional().default(''),
    RECAPTCHA_SECRET: z.string().optional().default(''),
    RECAPTCHA_MODE: z
      .enum(['stub', 'live'])
      .default(isProd && !freeTierFlag ? 'live' : 'stub'),
    SENTRY_DSN: z.string().optional().default(''),
    LOG_LEVEL: z.string().default(isProd ? 'info' : 'debug'),
    SEED_DEMO_USERS: z
      .string()
      .default('false')
      .transform((v) => v === 'true'),
    ADMIN_BOOTSTRAP_EMAIL: z.string().optional().default(''),
    ADMIN_BOOTSTRAP_PASSWORD: z.string().optional().default(''),
    ADMIN_BOOTSTRAP_NAME: z.string().optional().default('Clinic Admin'),
    ADMIN_BOOTSTRAP_PHONE: z.string().optional().default('+91 90000 00000'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== 'production') return
    // Free-tier cloud demo: skip paid Twilio / live Razorpay / strict captcha gates
    if (data.FREE_TIER) return

    if (data.WHATSAPP_MODE !== 'live') {
      ctx.addIssue({
        code: 'custom',
        message: 'WHATSAPP_MODE must be live in production (or set FREE_TIER=true)',
        path: ['WHATSAPP_MODE'],
      })
    }
    if (data.RECAPTCHA_MODE !== 'live' || !data.RECAPTCHA_SECRET) {
      ctx.addIssue({
        code: 'custom',
        message: 'Live reCAPTCHA required in production (or set FREE_TIER=true)',
        path: ['RECAPTCHA_MODE'],
      })
    }
    if (!data.RAZORPAY_KEY_ID || !data.RAZORPAY_KEY_SECRET || !data.RAZORPAY_WEBHOOK_SECRET) {
      ctx.addIssue({
        code: 'custom',
        message: 'Razorpay live keys + webhook secret required (or set FREE_TIER=true)',
        path: ['RAZORPAY_KEY_ID'],
      })
    }
    if (!data.TWILIO_ACCOUNT_SID || !data.TWILIO_AUTH_TOKEN || !data.TWILIO_SMS_FROM) {
      ctx.addIssue({
        code: 'custom',
        message: 'Twilio SMS credentials required (or set FREE_TIER=true)',
        path: ['TWILIO_ACCOUNT_SID'],
      })
    }
    if (data.ALLOW_MOCK_PAY) {
      ctx.addIssue({
        code: 'custom',
        message: 'ALLOW_MOCK_PAY cannot be true in production (or set FREE_TIER=true)',
        path: ['ALLOW_MOCK_PAY'],
      })
    }
    if (data.OTP_DEV_CODE) {
      ctx.addIssue({
        code: 'custom',
        message: 'OTP_DEV_CODE must be empty in production (or set FREE_TIER=true)',
        path: ['OTP_DEV_CODE'],
      })
    }
  })

export const env = envSchema.parse(process.env)
export const isProduction = env.NODE_ENV === 'production'
/** Soft production (Vercel+Render+Neon demo) without paid Twilio/live Razorpay */
export const isFreeTier = env.FREE_TIER
/** Paid clinic launch: production and not free-tier */
export const isStrictProduction = isProduction && !isFreeTier

export const ACTIVE_APPOINTMENT_STATUSES = [
  'held',
  'booked',
  'checked_in',
  'in_progress',
] as const

export const HOUR_STARTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
] as const
