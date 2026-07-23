import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { logger } from '../lib/logger.js'

const DOCTORS = [
  {
    id: 'dr-mehta',
    name: 'Dr. Ananya Mehta',
    specialty: 'General physician',
    initials: 'AM',
    bio: 'Everyday illnesses, fever, and preventive checkups with a calm, thorough style.',
    photoUrl:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    fee: 500,
    capacity: 12,
    days: [1, 2, 3, 4, 5, 6],
    active: true,
  },
  {
    id: 'dr-iyer',
    name: 'Dr. Rohan Iyer',
    specialty: 'Pediatrics',
    initials: 'RI',
    bio: 'Child-friendly consults. Family accounts can book on a child’s behalf.',
    photoUrl:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    fee: 600,
    capacity: 10,
    days: [1, 2, 3, 4, 5],
    active: true,
  },
  {
    id: 'dr-khan',
    name: 'Dr. Sara Khan',
    specialty: 'Dermatology',
    initials: 'SK',
    bio: 'Skin, hair, and allergy-related concerns with clear follow-up guidance.',
    photoUrl:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80',
    fee: 700,
    capacity: 8,
    days: [2, 3, 4, 5, 6],
    active: true,
  },
  {
    id: 'dr-desai',
    name: 'Dr. Vikram Desai',
    specialty: 'Orthopedics',
    initials: 'VD',
    bio: 'Joint pain, sports injuries, and mobility — realistic visit windows.',
    photoUrl:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    fee: 800,
    capacity: 8,
    days: [1, 2, 3, 4],
    active: true,
  },
  {
    id: 'dr-rao',
    name: 'Dr. Nisha Rao',
    specialty: 'Gynecology',
    initials: 'NR',
    bio: 'Confidential women’s health visits with respectful, unhurried consults.',
    photoUrl:
      'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80',
    fee: 700,
    capacity: 8,
    days: [1, 3, 5, 6],
    active: true,
  },
  {
    id: 'dr-patel',
    name: 'Dr. Kabir Patel',
    specialty: 'General physician',
    initials: 'KP',
    bio: 'Same-day capacity focused physician for busy weekday evenings.',
    photoUrl:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    fee: 450,
    capacity: 12,
    days: [1, 2, 3, 4, 5],
    active: false,
  },
]

const SYMPTOMS = [
  { symptomKeyword: 'fever', specialty: 'General physician', label: 'Fever' },
  { symptomKeyword: 'cough', specialty: 'General physician', label: 'Cough / cold' },
  { symptomKeyword: 'fatigue', specialty: 'General physician', label: 'Fatigue' },
  { symptomKeyword: 'child_fever', specialty: 'Pediatrics', label: 'Child fever' },
  { symptomKeyword: 'rash', specialty: 'Dermatology', label: 'Skin rash' },
  { symptomKeyword: 'acne', specialty: 'Dermatology', label: 'Acne' },
  { symptomKeyword: 'joint_pain', specialty: 'Orthopedics', label: 'Joint / back pain' },
  { symptomKeyword: 'sports_injury', specialty: 'Orthopedics', label: 'Sports injury' },
  { symptomKeyword: 'pregnancy', specialty: 'Gynecology', label: 'Pregnancy related' },
  { symptomKeyword: 'womens_health', specialty: 'Gynecology', label: "Women's health" },
]

/** Full clinic seed. Wipes existing users/appointments/doctors. */
export async function seedDatabase(opts?: { demoUsers?: boolean }) {
  const seedDemo =
    opts?.demoUsers ??
    (process.env.SEED_DEMO_USERS === 'true' || process.env.FREE_TIER === 'true')
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim()
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim()

  if (!seedDemo && (!bootstrapEmail || !bootstrapPassword || bootstrapPassword.length < 12)) {
    throw new Error(
      'Set SEED_DEMO_USERS=true for demo data, or ADMIN_BOOTSTRAP_EMAIL + ADMIN_BOOTSTRAP_PASSWORD (>=12 chars)',
    )
  }

  await prisma.auditEvent.deleteMany()
  await prisma.broadcast.deleteMany()
  await prisma.otpCode.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.waitlistEntry.deleteMany()
  await prisma.queueDelayOffset.deleteMany()
  await prisma.dependent.deleteMany()
  await prisma.doctorLeave.deleteMany()
  await prisma.doctorAvailability.deleteMany()
  await prisma.symptomSpecialtyMap.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.user.deleteMany()

  let admin: { id: string; email: string }
  let patient: { id: string; email: string }
  let doctorUser: { id: string; email: string }

  if (seedDemo) {
    const passwordHash = await bcrypt.hash('demo1234', 10)
    admin = await prisma.user.create({
      data: {
        name: 'Clinic Admin',
        email: 'admin@clinicease.app',
        phone: '+91 98765 40000',
        passwordHash,
        role: 'admin',
        whatsappLinked: true,
      },
    })
    patient = await prisma.user.create({
      data: {
        name: 'Asha Verma',
        email: 'patient@clinicease.app',
        phone: '+91 98765 43210',
        passwordHash,
        role: 'patient',
        whatsappLinked: true,
      },
    })
    doctorUser = await prisma.user.create({
      data: {
        name: 'Dr. Ananya Mehta',
        email: 'doctor@clinicease.app',
        phone: '+91 98765 40001',
        passwordHash,
        role: 'doctor',
        whatsappLinked: true,
      },
    })
  } else {
    admin = await prisma.user.create({
      data: {
        name: process.env.ADMIN_BOOTSTRAP_NAME || 'Clinic Admin',
        email: bootstrapEmail!.toLowerCase(),
        phone: process.env.ADMIN_BOOTSTRAP_PHONE || '+91 90000 00000',
        passwordHash: await bcrypt.hash(bootstrapPassword!, 12),
        role: 'admin',
        whatsappLinked: true,
      },
    })
    patient = admin
    doctorUser = admin
  }

  for (const d of DOCTORS) {
    await prisma.doctor.create({
      data: {
        id: d.id,
        userId: seedDemo && d.id === 'dr-mehta' ? doctorUser.id : null,
        name: d.name,
        specialty: d.specialty,
        initials: d.initials,
        bio: d.bio,
        photoUrl: d.photoUrl,
        consultationFeeInr: d.fee,
        avgConsultationMinutes: 5,
        hourlyCapacityOverride: d.capacity,
        active: d.active,
        availability: {
          create: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
            const enabled = d.days.includes(dayOfWeek)
            const isSat = dayOfWeek === 6
            return {
              dayOfWeek,
              enabled,
              startTime: '09:00',
              endTime: enabled && isSat ? '13:00' : '17:00',
              breakStart: enabled && !isSat ? '13:00' : '',
              breakEnd: enabled && !isSat ? '14:00' : '',
              hourlyCapacity: d.capacity,
            }
          }),
        },
      },
    })
  }

  for (const s of SYMPTOMS) {
    await prisma.symptomSpecialtyMap.create({ data: s })
  }

  if (!seedDemo) {
    logger.info({ admin: admin.email }, 'seed:bootstrap-admin')
    return { mode: 'bootstrap' as const, admin: admin.email, doctors: DOCTORS.length }
  }

  const passwordHash = await bcrypt.hash('demo1234', 10)

  await prisma.dependent.create({
    data: {
      patientUserId: patient.id,
      name: 'Aarav Verma',
      relation: 'child',
      age: 8,
    },
  })

  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const date = today.toISOString().slice(0, 10)

  const seedApts = [
    {
      queuePosition: 7,
      estimatedStart: '10:30',
      estimatedEnd: '10:35',
      status: 'in_progress',
      intake: 'Mild fever since yesterday. Prefers morning slots.',
      patientName: 'Priya Nair',
      phone: '+91 98765 11101',
    },
    {
      queuePosition: 8,
      estimatedStart: '10:35',
      estimatedEnd: '10:40',
      status: 'booked',
      intake: 'Sore throat for 2 days. Child visit.',
      patientName: 'Aman Shah',
      phone: '+91 98765 11102',
    },
    {
      queuePosition: 11,
      estimatedStart: '10:50',
      estimatedEnd: '10:55',
      status: 'booked',
      intake: 'Mild fever since yesterday. No known allergies.',
      patientName: 'Asha Verma',
      phone: '+91 98765 43210',
      useDemoPatient: true as boolean | undefined,
    },
  ]

  for (const a of seedApts) {
    const p =
      a.useDemoPatient
        ? patient
        : await prisma.user.create({
            data: {
              name: a.patientName,
              email: `${a.phone.replace(/\D/g, '')}@seed.clinicease.app`,
              phone: a.phone,
              passwordHash,
              role: 'patient',
              whatsappLinked: true,
            },
          })

    await prisma.appointment.create({
      data: {
        patientId: p.id,
        doctorId: 'dr-mehta',
        date,
        hourBlockStart: '10:00',
        hourBlockEnd: '11:00',
        queuePosition: a.queuePosition,
        estimatedStart: a.estimatedStart,
        estimatedEnd: a.estimatedEnd,
        status: a.status,
        intake: a.intake,
        payment: {
          create: {
            amountInr: 500,
            method: 'razorpay',
            status: 'paid',
            razorpayOrderId: `order_seed_${a.queuePosition}`,
            razorpayPaymentId: `pay_seed_${a.queuePosition}`,
          },
        },
      },
    })
  }

  await prisma.waitlistEntry.create({
    data: {
      patientId: patient.id,
      doctorId: 'dr-khan',
      date,
      hourBlockStart: '11:00',
      hourBlockEnd: '12:00',
      position: 1,
      status: 'notified',
      offerExpiresAt: new Date(Date.now() + 8 * 60 * 1000),
    },
  })

  logger.info(
    { admin: admin.email, patient: patient.email, doctor: doctorUser.email },
    'seed:demo-users',
  )
  return {
    mode: 'demo' as const,
    admin: admin.email,
    patient: patient.email,
    doctor: doctorUser.email,
    doctors: DOCTORS.length,
  }
}

/** Seed only when catalog is empty (free-tier boot helper). */
export async function seedIfEmpty() {
  const count = await prisma.doctor.count()
  if (count > 0) return { seeded: false, doctors: count }
  const result = await seedDatabase({ demoUsers: true })
  return { seeded: true, ...result }
}
