import crypto from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { env, isStrictProduction } from '../config/env.js'
import { HttpError } from '../lib/eta.js'
import { confirmAppointment } from './booking.js'

export async function createPaymentOrder(appointmentId: string, userId: string) {
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { payment: true, doctor: true },
  })
  if (!apt || apt.patientId !== userId) throw new HttpError(404, 'Not found')
  if (!apt.payment) throw new HttpError(400, 'No payment record')
  if (apt.status !== 'held') throw new HttpError(400, 'Appointment not held')

  const amount = apt.payment.amountInr
  const allowMock =
    env.ALLOW_MOCK_PAY &&
    !isStrictProduction &&
    (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET)

  if (allowMock) {
    const orderId = `order_mock_${appointmentId.slice(-8)}_${Date.now()}`
    await prisma.payment.update({
      where: { id: apt.payment.id },
      data: { razorpayOrderId: orderId },
    })
    return {
      mock: true,
      orderId,
      amount,
      currency: 'INR',
      keyId: 'rzp_test_mock',
      appointmentId,
    }
  }

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new HttpError(503, 'Payments are not configured')
  }

  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString(
    'base64',
  )
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100,
      currency: 'INR',
      receipt: appointmentId,
    }),
  })
  if (!res.ok) throw new HttpError(502, 'Failed to create Razorpay order')
  const order = (await res.json()) as { id: string; amount: number; currency: string }
  await prisma.payment.update({
    where: { id: apt.payment.id },
    data: { razorpayOrderId: order.id },
  })
  return {
    mock: false,
    orderId: order.id,
    amount,
    currency: 'INR',
    keyId: env.RAZORPAY_KEY_ID,
    appointmentId,
  }
}

export async function confirmMockPayment(appointmentId: string, userId: string) {
  if (isStrictProduction || !env.ALLOW_MOCK_PAY) {
    throw new HttpError(403, 'Mock payment is disabled')
  }
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { payment: true },
  })
  if (!apt || apt.patientId !== userId) throw new HttpError(404, 'Not found')
  if (apt.payment) {
    await prisma.payment.update({
      where: { id: apt.payment.id },
      data: {
        status: 'paid',
        razorpayPaymentId: apt.payment.razorpayPaymentId ?? `pay_mock_${Date.now()}`,
      },
    })
  }
  return confirmAppointment(appointmentId)
}

export async function verifyRazorpayCheckout(
  appointmentId: string,
  userId: string,
  input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
) {
  if (!env.RAZORPAY_KEY_SECRET) throw new HttpError(503, 'Payments are not configured')
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { payment: true },
  })
  if (!apt || apt.patientId !== userId) throw new HttpError(404, 'Not found')
  if (apt.payment?.razorpayOrderId !== input.razorpayOrderId) {
    throw new HttpError(400, 'Order mismatch')
  }

  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest('hex')
  if (expected !== input.razorpaySignature) {
    throw new HttpError(400, 'Invalid payment signature')
  }

  await prisma.payment.update({
    where: { id: apt.payment!.id },
    data: {
      status: 'paid',
      razorpayPaymentId: input.razorpayPaymentId,
    },
  })
  return confirmAppointment(appointmentId)
}

export async function handleRazorpayWebhook(rawBody: string, signature: string | undefined) {
  if (isStrictProduction || env.RAZORPAY_WEBHOOK_SECRET) {
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      throw new HttpError(503, 'Webhook secret not configured')
    }
    if (!signature) throw new HttpError(400, 'Missing webhook signature')
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex')
    if (expected !== signature) throw new HttpError(400, 'Invalid webhook signature')
  }

  const payload = JSON.parse(rawBody) as {
    event?: string
    payload?: {
      payment?: {
        entity?: {
          id?: string
          order_id?: string
          status?: string
        }
      }
    }
  }

  const paymentEntity = payload.payload?.payment?.entity
  if (!paymentEntity?.order_id || paymentEntity.status !== 'captured') {
    return { ok: true, ignored: true }
  }

  const existing = await prisma.payment.findFirst({
    where: { razorpayPaymentId: paymentEntity.id },
  })
  if (existing?.status === 'paid') return { ok: true, idempotent: true }

  const payment = await prisma.payment.findFirst({
    where: { razorpayOrderId: paymentEntity.order_id },
  })
  if (!payment) return { ok: true, missing: true }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'paid',
      razorpayPaymentId: paymentEntity.id,
    },
  })

  await confirmAppointment(payment.appointmentId, { force: true })
  return { ok: true }
}
