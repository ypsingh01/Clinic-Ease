const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined

type CheckoutInput = {
  orderId: string
  amountInr: number
  keyId: string
  patientName: string
  patientPhone: string
  appointmentId: string
}

type CheckoutResult = {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Razorpay Checkout'))
    document.body.appendChild(s)
  })
}

/** Opens Razorpay Checkout and resolves with payment verification payload. */
export async function openRazorpayCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  await loadScript()
  if (!window.Razorpay) throw new Error('Razorpay unavailable')

  const key = RAZORPAY_KEY || input.keyId
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key,
      amount: input.amountInr * 100,
      currency: 'INR',
      name: 'ClinicEase',
      description: `Appointment ${input.appointmentId.slice(0, 8)}`,
      order_id: input.orderId,
      prefill: {
        name: input.patientName,
        contact: input.patientPhone.replace(/\s/g, ''),
      },
      handler: (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => {
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        })
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    })
    rzp.open()
  })
}
