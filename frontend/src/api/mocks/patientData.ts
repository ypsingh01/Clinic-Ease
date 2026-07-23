export type Specialty =
  | 'General physician'
  | 'Pediatrics'
  | 'Dermatology'
  | 'Orthopedics'
  | 'Gynecology'

export type Doctor = {
  id: string
  name: string
  specialty: Specialty
  initials: string
  bio: string
  availableDays: string[]
  capacityPerHour: number
  feeInr: number
}

export type Dependent = {
  id: string
  name: string
  relation: 'parent' | 'spouse' | 'child'
  age: number
}

export type AppointmentStatus =
  | 'upcoming'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type Appointment = {
  id: string
  doctorId: string
  date: string
  blockStart: string
  blockEnd: string
  token: number
  etaStart: string
  etaEnd: string
  status: AppointmentStatus
  dependentId: string | null
  forName: string
  intake: string
  servingToken: number
  paid: boolean
}

export type WaitlistEntry = {
  id: string
  doctorId: string
  date: string
  blockStart: string
  blockEnd: string
  position: number
  status: 'waiting' | 'offered' | 'expired' | 'claimed'
  offerExpiresAt?: string
}

export type NotificationItem = {
  id: string
  title: string
  body: string
  time: string
  read: boolean
  kind: 'reminder' | 'eta' | 'confirm' | 'waitlist'
}

export const DOCTORS: Doctor[] = [
  {
    id: 'dr-mehta',
    name: 'Dr. Ananya Mehta',
    specialty: 'General physician',
    initials: 'AM',
    bio: 'Everyday illnesses, fever, and preventive checkups with a calm, thorough style.',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    capacityPerHour: 12,
    feeInr: 500,
  },
  {
    id: 'dr-iyer',
    name: 'Dr. Rohan Iyer',
    specialty: 'Pediatrics',
    initials: 'RI',
    bio: 'Child-friendly consults. Family accounts can book on a child’s behalf.',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    capacityPerHour: 10,
    feeInr: 600,
  },
  {
    id: 'dr-khan',
    name: 'Dr. Sara Khan',
    specialty: 'Dermatology',
    initials: 'SK',
    bio: 'Skin, hair, and allergy-related concerns with clear follow-up guidance.',
    availableDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    capacityPerHour: 8,
    feeInr: 700,
  },
  {
    id: 'dr-desai',
    name: 'Dr. Vikram Desai',
    specialty: 'Orthopedics',
    initials: 'VD',
    bio: 'Joint pain, sports injuries, and mobility — realistic visit windows.',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    capacityPerHour: 8,
    feeInr: 800,
  },
  {
    id: 'dr-rao',
    name: 'Dr. Nisha Rao',
    specialty: 'Gynecology',
    initials: 'NR',
    bio: 'Confidential women’s health visits with respectful, unhurried consults.',
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    capacityPerHour: 8,
    feeInr: 700,
  },
  {
    id: 'dr-patel',
    name: 'Dr. Kabir Patel',
    specialty: 'General physician',
    initials: 'KP',
    bio: 'Same-day capacity focused physician for busy weekday evenings.',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    capacityPerHour: 12,
    feeInr: 450,
  },
]

export const SYMPTOM_MAP: { id: string; label: string; specialties: Specialty[] }[] = [
  { id: 'fever', label: 'Fever', specialties: ['General physician', 'Pediatrics'] },
  { id: 'cough', label: 'Cough / cold', specialties: ['General physician', 'Pediatrics'] },
  { id: 'skin', label: 'Skin rash', specialties: ['Dermatology'] },
  { id: 'joint', label: 'Joint pain', specialties: ['Orthopedics'] },
  { id: 'child', label: 'Child unwell', specialties: ['Pediatrics'] },
  { id: 'women', label: 'Women’s health', specialties: ['Gynecology'] },
  { id: 'stomach', label: 'Stomach pain', specialties: ['General physician'] },
]

export function getDoctor(id: string) {
  return DOCTORS.find((d) => d.id === id)
}

export function makeHourBlocks(capacity: number) {
  const starts = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
  return starts.map((start, i) => {
    const endHour = Number(start.slice(0, 2)) + 1
    const end = `${String(endHour).padStart(2, '0')}:00`
    // Deterministic mock fill
    const booked = [4, 9, 12, 7, 3, 11, 5, 2][i] ?? 4
    const capped = Math.min(booked, capacity)
    const full = capped >= capacity
    return {
      id: `block-${start}`,
      startLabel: start,
      endLabel: end,
      capacity,
      booked: capped,
      state: full ? (i % 2 === 0 ? ('full' as const) : ('waitlist' as const)) : ('open' as const),
    }
  })
}

export function etaWindow(blockStart: string, token: number, avgMin = 5) {
  const [h, m] = blockStart.split(':').map(Number)
  const startMin = h * 60 + m + (token - 1) * avgMin
  const endMin = startMin + avgMin
  const fmt = (mins: number) => {
    const hh = Math.floor(mins / 60) % 24
    const mm = mins % 60
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }
  return { etaStart: fmt(startMin), etaEnd: fmt(endMin) }
}

export function todayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}
