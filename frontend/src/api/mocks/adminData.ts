export type AdminDoctor = {
  id: string
  name: string
  specialty: string
  initials: string
  capacity: number
  active: boolean
  tokensToday: number
}

export type GridSlot = {
  doctorId: string
  hour: string
  booked: number
  capacity: number
  labels: string[]
}

export type PaymentRow = {
  id: string
  patient: string
  doctor: string
  amount: number
  method: 'razorpay' | 'clinic' | 'comped'
  status: 'paid' | 'pending' | 'refunded'
  at: string
}

export type Broadcast = {
  id: string
  title: string
  body: string
  audience: 'all' | 'patients' | 'doctors'
  sentAt: string
  delivered: number
  failed: number
}

export type ManualBooking = {
  id: string
  patientName: string
  phone: string
  doctorId: string
  date: string
  blockStart: string
  blockEnd: string
  token: number
  payAtClinic: boolean
  note: string
  createdAt: string
}

export const ADMIN_DOCTORS: AdminDoctor[] = [
  { id: 'dr-mehta', name: 'Dr. Ananya Mehta', specialty: 'General physician', initials: 'AM', capacity: 12, active: true, tokensToday: 14 },
  { id: 'dr-iyer', name: 'Dr. Rohan Iyer', specialty: 'Pediatrics', initials: 'RI', capacity: 10, active: true, tokensToday: 11 },
  { id: 'dr-khan', name: 'Dr. Sara Khan', specialty: 'Dermatology', initials: 'SK', capacity: 8, active: true, tokensToday: 9 },
  { id: 'dr-desai', name: 'Dr. Vikram Desai', specialty: 'Orthopedics', initials: 'VD', capacity: 8, active: true, tokensToday: 7 },
  { id: 'dr-rao', name: 'Dr. Nisha Rao', specialty: 'Gynecology', initials: 'NR', capacity: 8, active: true, tokensToday: 8 },
  { id: 'dr-patel', name: 'Dr. Kabir Patel', specialty: 'General physician', initials: 'KP', capacity: 12, active: false, tokensToday: 0 },
]

export const HOURS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00']

export function buildGrid(doctors: AdminDoctor[]): GridSlot[] {
  const slots: GridSlot[] = []
  doctors
    .filter((d) => d.active)
    .forEach((d, di) => {
      HOURS.forEach((hour, hi) => {
        const booked = Math.min(d.capacity, [3, 8, 10, 5, 2, 7, 4][(di + hi) % 7] ?? 4)
        slots.push({
          doctorId: d.id,
          hour,
          booked,
          capacity: d.capacity,
          labels:
            booked === 0
              ? []
              : booked <= 2
                ? [`#${hi + 1}`]
                : [`#${hi + 1}–${hi + booked}`, `${booked}/${d.capacity}`],
        })
      })
    })
  return slots
}

export const PAYMENTS: PaymentRow[] = [
  { id: 'p1', patient: 'Asha Verma', doctor: 'Dr. Mehta', amount: 500, method: 'razorpay', status: 'paid', at: 'Today · 8:14 AM' },
  { id: 'p2', patient: 'Priya Nair', doctor: 'Dr. Mehta', amount: 500, method: 'razorpay', status: 'paid', at: 'Today · 8:02 AM' },
  { id: 'p3', patient: 'Kavya (walk-in)', doctor: 'Dr. Mehta', amount: 500, method: 'clinic', status: 'pending', at: 'Today · 10:12 AM' },
  { id: 'p4', patient: 'Aman Shah', doctor: 'Dr. Iyer', amount: 600, method: 'razorpay', status: 'paid', at: 'Yesterday · 4:20 PM' },
  { id: 'p5', patient: 'Staff family', doctor: 'Dr. Khan', amount: 0, method: 'comped', status: 'paid', at: 'Yesterday · 11:05 AM' },
  { id: 'p6', patient: 'Neha Kapoor', doctor: 'Dr. Mehta', amount: 500, method: 'razorpay', status: 'refunded', at: 'Mon · 2:40 PM' },
]

export const BROADCASTS: Broadcast[] = [
  {
    id: 'b1',
    title: 'Dr. Patel unavailable today',
    body: 'General physician slots with Dr. Patel are closed. Please book Mehta or call reception.',
    audience: 'patients',
    sentAt: 'Today · 7:30 AM',
    delivered: 186,
    failed: 4,
  },
  {
    id: 'b2',
    title: 'Saturday half-day reminder',
    body: 'Clinic closes at 1:00 PM this Saturday. Prefer morning blocks.',
    audience: 'all',
    sentAt: 'Fri · 6:00 PM',
    delivered: 412,
    failed: 9,
  },
]

export const BOOKING_TREND = [
  { label: 'Mon', value: 42 },
  { label: 'Tue', value: 51 },
  { label: 'Wed', value: 47 },
  { label: 'Thu', value: 58 },
  { label: 'Fri', value: 55 },
  { label: 'Sat', value: 28 },
  { label: 'Sun', value: 12 },
]

export const REVENUE_TREND = [
  { label: 'Mon', value: 21 },
  { label: 'Tue', value: 26 },
  { label: 'Wed', value: 24 },
  { label: 'Thu', value: 31 },
  { label: 'Fri', value: 29 },
  { label: 'Sat', value: 14 },
  { label: 'Sun', value: 5 },
]

export const HEAT_HOURS = ['9', '10', '11', '12', '2', '3', '4']
export const HEAT_VALUES = [
  [4, 8, 10, 7, 5, 9, 4],
  [5, 9, 11, 8, 6, 10, 5],
  [3, 7, 9, 6, 4, 8, 3],
  [6, 10, 12, 9, 7, 11, 6],
  [4, 8, 9, 6, 5, 8, 4],
  [2, 4, 5, 3, 2, 4, 2],
  [1, 2, 3, 2, 1, 2, 1],
]

export const REPORT_ROWS = [
  { doctor: 'Dr. Mehta', bookings: 58, cancels: 4, noShows: 3, avgMin: 6.1, waitlistPct: 72 },
  { doctor: 'Dr. Iyer', bookings: 44, cancels: 2, noShows: 5, avgMin: 7.4, waitlistPct: 61 },
  { doctor: 'Dr. Khan', bookings: 39, cancels: 3, noShows: 2, avgMin: 8.2, waitlistPct: 68 },
  { doctor: 'Dr. Desai', bookings: 31, cancels: 1, noShows: 1, avgMin: 9.0, waitlistPct: 54 },
  { doctor: 'Dr. Rao', bookings: 36, cancels: 2, noShows: 2, avgMin: 8.5, waitlistPct: 70 },
]
