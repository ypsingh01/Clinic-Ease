export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

export type ClinicDoctor = {
  id: string
  name: string
  specialty: string
  initials: string
  bio: string
  photoUrl: string
  availableDays: DayKey[]
  capacityPerHour: number
  feeInr: number
  active: boolean
}

export type DayAvailability = {
  enabled: boolean
  start: string
  end: string
  breakStart: string
  breakEnd: string
  onLeave: boolean
}

export type AppointmentStatus =
  | 'upcoming'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'in_progress'

export type ClinicAppointment = {
  id: string
  doctorId: string
  patientName: string
  patientPhone: string
  dependentId: string | null
  date: string
  blockStart: string
  blockEnd: string
  token: number
  etaStart: string
  etaEnd: string
  status: AppointmentStatus
  intake: string
  paid: boolean
  payAtClinic: boolean
  durationMin?: number
  createdBy: 'patient' | 'admin'
}

export type WaitlistEntry = {
  id: string
  doctorId: string
  date: string
  blockStart: string
  blockEnd: string
  patientName: string
  position: number
  status: 'waiting' | 'offered' | 'expired' | 'claimed'
  offerExpiresAt?: string
}

export type Dependent = {
  id: string
  name: string
  relation: 'parent' | 'spouse' | 'child'
  age: number
}

export type NotificationItem = {
  id: string
  title: string
  body: string
  time: string
  read: boolean
  kind: 'reminder' | 'eta' | 'confirm' | 'waitlist' | 'whatsapp'
}

export type PaymentRow = {
  id: string
  patient: string
  doctorId: string
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

export const CANCEL_POLICY_HOURS = 2

export function todayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export function weekdayKey(dateISO: string): DayKey {
  const d = new Date(dateISO + 'T12:00:00')
  return (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const)[d.getDay()] as DayKey
}

export function etaWindow(blockStart: string, token: number, avgMin = 5, delayMin = 0) {
  const [h, m] = blockStart.split(':').map(Number)
  const startMin = h * 60 + m + (token - 1) * avgMin + delayMin
  const endMin = startMin + avgMin
  const fmt = (mins: number) => {
    const total = ((mins % (24 * 60)) + 24 * 60) % (24 * 60)
    const hh = Math.floor(total / 60)
    const mm = total % 60
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }
  return { etaStart: fmt(startMin), etaEnd: fmt(endMin) }
}

export function minutesUntilEta(date: string, etaStart: string) {
  const [h, m] = etaStart.split(':').map(Number)
  const target = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
  return (target.getTime() - Date.now()) / 60000
}

export const DEFAULT_DOCTORS: ClinicDoctor[] = [
  {
    id: 'dr-mehta',
    name: 'Dr. Ananya Mehta',
    specialty: 'General physician',
    initials: 'AM',
    bio: 'Everyday illnesses, fever, and preventive checkups with a calm, thorough style.',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    capacityPerHour: 12,
    feeInr: 500,
    active: true,
  },
  {
    id: 'dr-iyer',
    name: 'Dr. Rohan Iyer',
    specialty: 'Pediatrics',
    initials: 'RI',
    bio: 'Child-friendly consults. Family accounts can book on a child’s behalf.',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    capacityPerHour: 10,
    feeInr: 600,
    active: true,
  },
  {
    id: 'dr-khan',
    name: 'Dr. Sara Khan',
    specialty: 'Dermatology',
    initials: 'SK',
    bio: 'Skin, hair, and allergy-related concerns with clear follow-up guidance.',
    photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80',
    availableDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    capacityPerHour: 8,
    feeInr: 700,
    active: true,
  },
  {
    id: 'dr-desai',
    name: 'Dr. Vikram Desai',
    specialty: 'Orthopedics',
    initials: 'VD',
    bio: 'Joint pain, sports injuries, and mobility — realistic visit windows.',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    capacityPerHour: 8,
    feeInr: 800,
    active: true,
  },
  {
    id: 'dr-rao',
    name: 'Dr. Nisha Rao',
    specialty: 'Gynecology',
    initials: 'NR',
    bio: 'Confidential women’s health visits with respectful, unhurried consults.',
    photoUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80',
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    capacityPerHour: 8,
    feeInr: 700,
    active: true,
  },
  {
    id: 'dr-patel',
    name: 'Dr. Kabir Patel',
    specialty: 'General physician',
    initials: 'KP',
    bio: 'Same-day capacity focused physician for busy weekday evenings.',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    capacityPerHour: 12,
    feeInr: 450,
    active: false,
  },
]

export function defaultWeek(): Record<DayKey, DayAvailability> {
  const work = (enabled: boolean, end = '17:00'): DayAvailability => ({
    enabled,
    start: '09:00',
    end,
    breakStart: enabled && end === '17:00' ? '13:00' : '',
    breakEnd: enabled && end === '17:00' ? '14:00' : '',
    onLeave: false,
  })
  return {
    Mon: work(true),
    Tue: work(true),
    Wed: work(true),
    Thu: work(true),
    Fri: work(true),
    Sat: work(true, '13:00'),
    Sun: work(false),
  }
}

export function blockFillKey(doctorId: string, date: string, blockStart: string) {
  return `${doctorId}|${date}|${blockStart}`
}
