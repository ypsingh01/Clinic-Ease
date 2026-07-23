export type QueueStatus = 'waiting' | 'in_progress' | 'completed' | 'no_show'

export type QueuePatient = {
  id: string
  token: number
  name: string
  relation?: string
  blockStart: string
  blockEnd: string
  eta: string
  status: QueueStatus
  intake: string
  phone: string
  durationMin?: number
}

export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

export type DayAvailability = {
  enabled: boolean
  start: string
  end: string
  breakStart: string
  breakEnd: string
  onLeave: boolean
}

export type DoctorSettings = {
  displayName: string
  specialty: string
  defaultCapacity: number
  delayMinutes: number
  notifyOnNoShow: boolean
  notifyOnWaitlistClaim: boolean
}

export const DEFAULT_QUEUE: QueuePatient[] = [
  {
    id: 'q1',
    token: 7,
    name: 'Priya Nair',
    blockStart: '10:00',
    blockEnd: '11:00',
    eta: 'now',
    status: 'in_progress',
    intake: 'Mild fever since yesterday. No known allergies. Prefers morning slots.',
    phone: '+91 98765 11101',
  },
  {
    id: 'q2',
    token: 8,
    name: 'Aman Shah',
    relation: 'Child · dependent of Neha Shah',
    blockStart: '10:00',
    blockEnd: '11:00',
    eta: '~10:35',
    status: 'waiting',
    intake: 'Sore throat for 2 days. Vaccinations up to date.',
    phone: '+91 98765 11102',
  },
  {
    id: 'q3',
    token: 9,
    name: 'Neha Kapoor',
    blockStart: '10:00',
    blockEnd: '11:00',
    eta: '~10:42',
    status: 'waiting',
    intake: 'Follow-up for blood pressure. Bringing home readings.',
    phone: '+91 98765 11103',
  },
  {
    id: 'q4',
    token: 10,
    name: 'Kavya (walk-in)',
    relation: 'Admin added · pay at clinic',
    blockStart: '10:00',
    blockEnd: '11:00',
    eta: '~10:50',
    status: 'waiting',
    intake: 'Sudden knee pain after exercise.',
    phone: '+91 98765 11104',
  },
  {
    id: 'q5',
    token: 11,
    name: 'Asha Verma',
    blockStart: '10:00',
    blockEnd: '11:00',
    eta: '~10:55',
    status: 'waiting',
    intake: 'Mild fever since yesterday. No known allergies.',
    phone: '+91 98765 43210',
  },
  {
    id: 'q6',
    token: 6,
    name: 'Ravi Menon',
    blockStart: '09:00',
    blockEnd: '10:00',
    eta: 'done',
    status: 'completed',
    intake: 'Annual checkup.',
    phone: '+91 98765 11100',
    durationMin: 7,
  },
  {
    id: 'q7',
    token: 5,
    name: 'Imran Qureshi',
    blockStart: '09:00',
    blockEnd: '10:00',
    eta: '—',
    status: 'no_show',
    intake: 'Skin rash — did not arrive.',
    phone: '+91 98765 11099',
  },
]

export const DEFAULT_WEEK: Record<DayKey, DayAvailability> = {
  Mon: { enabled: true, start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00', onLeave: false },
  Tue: { enabled: true, start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00', onLeave: false },
  Wed: { enabled: true, start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00', onLeave: false },
  Thu: { enabled: true, start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00', onLeave: false },
  Fri: { enabled: true, start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00', onLeave: false },
  Sat: { enabled: true, start: '09:00', end: '13:00', breakStart: '', breakEnd: '', onLeave: false },
  Sun: { enabled: false, start: '09:00', end: '13:00', breakStart: '', breakEnd: '', onLeave: false },
}

export const DEFAULT_SETTINGS: DoctorSettings = {
  displayName: 'Dr. Ananya Mehta',
  specialty: 'General physician',
  defaultCapacity: 12,
  delayMinutes: 15,
  notifyOnNoShow: true,
  notifyOnWaitlistClaim: true,
}

export const PUNCTUALITY = [
  { label: 'Mon', value: 4 },
  { label: 'Tue', value: -2 },
  { label: 'Wed', value: 6 },
  { label: 'Thu', value: 1 },
  { label: 'Fri', value: 8 },
  { label: 'Sat', value: 3 },
]

export const LOAD_TREND = [
  { label: 'Mon', value: 22 },
  { label: 'Tue', value: 28 },
  { label: 'Wed', value: 25 },
  { label: 'Thu', value: 31 },
  { label: 'Fri', value: 27 },
  { label: 'Sat', value: 14 },
]
