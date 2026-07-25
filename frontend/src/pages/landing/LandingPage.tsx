import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  IconArrowRight,
  IconBell,
  IconBrandWhatsapp,
  IconCalendarEvent,
  IconCheck,
  IconChevronDown,
  IconClockHour4,
  IconMapPin,
  IconPhone,
  IconShieldCheck,
  IconStethoscope,
  IconTicket,
  IconUsers,
  type Icon,
} from '@tabler/icons-react'
import { Logo } from '@/components/brand/Logo'
import { MarketingNavbar } from '@/components/brand/MarketingNavbar'
import { Button } from '@/components/ui'
import { SkipLink } from '@/a11y'
import { homePathForRole, useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/cn'
import { staggerContainer, staggerItem } from '@/motion/variants'

const SPECIALTIES = [
  {
    title: 'General physician',
    body: 'Fever, fatigue, routine checkups, and everyday care.',
    featured: true,
  },
  {
    title: 'Pediatrics',
    body: 'Gentle visits for children with family booking support.',
    featured: true,
  },
  { title: 'Dermatology', body: 'Skin concerns with clear capacity and wait transparency.' },
  { title: 'Orthopedics', body: 'Joint and mobility care with realistic visit windows.' },
  { title: 'Gynecology', body: 'Confidential visits booked online without phone tag.' },
  { title: 'Diagnostics liaison', body: 'Guidance on who to see — never a diagnosis itself.' },
]

const DOCTORS = [
  { name: 'Dr. Ananya Mehta', specialty: 'General physician', days: 'Mon–Sat', initials: 'AM' },
  { name: 'Dr. Rohan Iyer', specialty: 'Pediatrics', days: 'Mon–Fri', initials: 'RI' },
  { name: 'Dr. Sara Khan', specialty: 'Dermatology', days: 'Tue–Sat', initials: 'SK' },
  { name: 'Dr. Vikram Desai', specialty: 'Orthopedics', days: 'Mon–Thu', initials: 'VD' },
]

const STEPS = [
  {
    n: '01',
    title: 'Choose your doctor',
    body: 'Browse specialty and available days — or use the symptom guide for a suggestion.',
  },
  {
    n: '02',
    title: 'Pick an hour block',
    body: 'See spots remaining in each hour. Get a token and an estimated visit window.',
  },
  {
    n: '03',
    title: 'Pay and stay updated',
    body: 'Confirm online. Track live “now serving” tokens in-app and on WhatsApp.',
  },
]

const STATS = [
  { value: 6, suffix: '', label: 'Specialist doctors', icon: IconStethoscope },
  { value: 3, prefix: '<', suffix: ' min', label: 'Typical book time', icon: IconClockHour4 },
  { value: 1, display: 'Live', label: 'Token & ETA updates', icon: IconTicket },
  { value: 24, suffix: 'h / 1h', label: 'Smart reminders', icon: IconBell },
]

const TRUST = [
  { label: '500+ patients booked', icon: IconUsers },
  { label: 'DPDP-aware design', icon: IconShieldCheck },
  { label: 'Verified doctor roster', icon: IconCheck },
]

const QUOTES = [
  {
    quote: 'I knew my token and window before I left home — no more guessing in the waiting room.',
    name: 'Asha V.',
    role: 'Patient',
    initials: 'AV',
    rotate: -3.2,
  },
  {
    quote: 'Booking for my kids takes under three minutes. WhatsApp reminders actually help.',
    name: 'Rohan M.',
    role: 'Parent',
    initials: 'RM',
    rotate: 2.8,
  },
  {
    quote: 'The live queue feels honest. Estimates aren’t pretended as exact times.',
    name: 'Kavya S.',
    role: 'Patient',
    initials: 'KS',
    rotate: -2.5,
  },
  {
    quote: 'Rescheduling used to mean three phone calls. Now it’s a couple of taps before I leave work.',
    name: 'Imran Q.',
    role: 'Patient',
    initials: 'IQ',
    rotate: 3.4,
  },
  {
    quote: 'The hour-block view made it clear when the clinic was actually free — no false hope.',
    name: 'Meera P.',
    role: 'Patient',
    initials: 'MP',
    rotate: -2.9,
  },
]

const FAQS: { q: string; a: string; icon: Icon }[] = [
  {
    q: 'What is a token?',
    a: 'Your place in that hour’s queue. You still get an estimated window — not a false exact minute.',
    icon: IconTicket,
  },
  {
    q: 'Can I cancel or reschedule?',
    a: 'Yes, until the clinic’s policy window (typically a few hours before your ETA). After that, changes may be locked.',
    icon: IconCalendarEvent,
  },
  {
    q: 'What if the hour is full?',
    a: 'Join the waitlist. If a spot opens, you get a short claim window to lock it with payment.',
    icon: IconClockHour4,
  },
  {
    q: 'Do I need WhatsApp?',
    a: 'Optional but recommended for reminders and ETA shifts. You can still follow the live queue in-app.',
    icon: IconBrandWhatsapp,
  },
]

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
}

export function LandingPage() {
  const { user, isAuthenticated } = useAuth()
  const reduceMotion = useReducedMotion()
  const bookTo = isAuthenticated && user ? homePathForRole(user.role) : '/register'

  return (
    <>
      <SkipLink />
      <div className="bg-bg text-text min-h-dvh overflow-x-hidden">
        <ScrollProgress />
        <MarketingNavbar />

        <Hero bookTo={bookTo} reduceMotion={!!reduceMotion} />
        <TrustStrip />
        <StatsBand />
        <ServicesSection />
        <DoctorsSection bookTo={bookTo} />
        <HowItWorks />
        <Testimonials />
        <FaqSection />
        <VisitSection bookTo={bookTo} />
        <SiteFooter bookTo={bookTo} />
      </div>
    </>
  )
}

function ScrollProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden>
      <div
        className="bg-primary h-full origin-left transition-[width] duration-150 ease-out"
        style={{ width: `${p * 100}%` }}
      />
    </div>
  )
}

function Hero({ bookTo, reduceMotion }: { bookTo: string; reduceMotion: boolean }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 40, damping: 20 })
  const sy = useSpring(my, { stiffness: 40, damping: 20 })
  const blobX = useTransform(sx, [-1, 1], [-18, 18])
  const blobY = useTransform(sy, [-1, 1], [-12, 12])
  const blob2X = useTransform(sx, [-1, 1], [12, -12])
  const blob2Y = useTransform(sy, [-1, 1], [8, -8])

  return (
    <section
      id="home"
      className="relative overflow-hidden px-6 pt-8 pb-20 md:px-8 md:pt-12 md:pb-28"
      onMouseMove={(e) => {
        if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1)
        my.set(((e.clientY - r.top) / r.height) * 2 - 1)
      }}
    >
      <motion.div
        aria-hidden
        className="bg-primary/15 pointer-events-none absolute -top-24 -left-16 size-[320px] rounded-full blur-3xl"
        style={reduceMotion ? undefined : { x: blobX, y: blobY }}
      />
      <motion.div
        aria-hidden
        className="bg-accent/15 pointer-events-none absolute top-32 -right-20 size-[280px] rounded-full blur-3xl"
        style={reduceMotion ? undefined : { x: blob2X, y: blob2Y }}
      />

      <div className="relative mx-auto grid max-w-[var(--content-max)] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.p
            className="text-primary text-sm font-medium tracking-wide"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Digital clinic booking
          </motion.p>
          <motion.p
            className="font-display text-primary mt-4 text-4xl font-semibold tracking-tight md:text-5xl"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            Clinic<span className="text-accent">Ease</span>
          </motion.p>
          <motion.h1
            className="font-marketing text-text mt-3 text-[2.35rem] leading-[1.08] font-medium md:text-[3.1rem]"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            Your care, simplified
          </motion.h1>
          <motion.p
            className="text-text-secondary mt-5 max-w-md text-base leading-relaxed md:text-lg"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            Book into real hour blocks, get a token and estimated window, and follow the live
            queue — without the phone tag.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-5"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
          >
            <Link to={bookTo} className="no-underline">
              <Button
                size="lg"
                className="transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] hover:scale-[1.02]"
                rightIcon={<IconArrowRight size={18} stroke={1.5} />}
              >
                Book appointment
              </Button>
            </Link>
            <a
              href="#doctors"
              className="group text-primary inline-flex items-center gap-1.5 text-sm font-medium no-underline"
            >
              Meet our doctors
              <IconArrowRight
                size={16}
                stroke={1.5}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </a>
          </motion.div>
        </div>

        <motion.div
          className="relative mx-auto w-full max-w-lg"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.18 }}
        >
          <div className="border-border relative overflow-hidden rounded-[28px] border bg-surface shadow-[var(--shadow-lift)]">
            <img
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1200&q=80"
              alt="Doctor consulting with a patient in a calm clinic"
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/6]"
            />
            <div className="from-primary-deep/50 absolute inset-0 bg-gradient-to-t to-transparent via-transparent" />
          </div>
          <motion.div
            className="border-border bg-surface absolute -bottom-4 left-4 flex items-center gap-2.5 rounded-[var(--radius-pill)] border px-3.5 py-2.5 shadow-[var(--shadow-soft)] sm:left-6"
            animate={
              reduceMotion
                ? undefined
                : { opacity: [1, 0.85, 1], scale: [1, 1.02, 1] }
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="relative flex size-2.5">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-40" />
              <span className="bg-primary relative inline-flex size-2.5 rounded-full" />
            </span>
            <span className="text-text text-xs font-medium sm:text-sm">
              Now serving Token <span className="font-mono">#14</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function TrustStrip() {
  return (
    <section className="border-border border-y bg-surface/70" aria-label="Trust">
      <motion.div
        className="mx-auto flex max-w-[var(--content-max)] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-4 md:px-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
      >
        {TRUST.map((t) => {
          const Icon = t.icon
          return (
            <motion.div
              key={t.label}
              variants={staggerItem}
              className="text-text-secondary flex items-center gap-2 text-sm"
            >
              <Icon size={16} stroke={1.5} className="text-primary" />
              {t.label}
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}

function CountUp({
  value,
  prefix = '',
  suffix = '',
  display,
}: {
  value: number
  prefix?: string
  suffix?: string
  display?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.8 })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView || display) return
    let frame = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, display])
  return (
    <span ref={ref} className="font-display text-primary text-3xl font-medium md:text-4xl">
      {display ?? `${prefix}${n}${suffix}`}
    </span>
  )
}

function StatsBand() {
  return (
    <section className="mx-auto max-w-[var(--content-max)] px-6 py-16 md:px-8 md:py-20" aria-label="Highlights">
      <motion.div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {STATS.map((s) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              variants={reveal}
              className="border-border bg-care/60 rounded-[var(--radius-card)] border px-5 py-6 shadow-[var(--shadow-soft)]"
            >
              <Icon size={20} stroke={1.5} className="text-primary mb-3" />
              <CountUp
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                display={'display' in s ? s.display : undefined}
              />
              <p className="text-text-secondary mt-1 text-sm">{s.label}</p>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}

function ServicesSection() {
  return (
    <section id="services" className="mx-auto max-w-[var(--content-max)] px-6 py-16 md:px-8 md:py-24">
      <SectionIntro
        eyebrow="Services"
        title="Care across the specialties you need"
        body="One clinic, six doctors, clear capacity — so you book the right visit the first time."
      />
      <motion.div
        className="mt-12 grid gap-4 md:grid-cols-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {SPECIALTIES.map((s, i) => (
          <motion.div
            key={s.title}
            variants={staggerItem}
            className={cn(s.featured ? 'md:col-span-3' : 'md:col-span-2')}
          >
            <div
              className={cn(
                'border-border group h-full rounded-[var(--radius-card)] border bg-surface px-5 py-6 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-lift)]',
                s.featured && 'bg-care/40 md:min-h-[180px] md:px-7 md:py-8',
              )}
            >
              <div
                className={cn(
                  'bg-primary-tint text-primary mb-4 flex size-10 items-center justify-center rounded-[var(--radius-control)] transition-transform duration-200 group-hover:-translate-y-0.5',
                  s.featured && 'size-12',
                )}
              >
                <IconStethoscope size={s.featured ? 22 : 18} stroke={1.5} />
              </div>
              <h3 className={cn('font-display font-medium', s.featured ? 'text-xl' : 'text-lg')}>
                {s.title}
              </h3>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">{s.body}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

function DoctorsSection({ bookTo }: { bookTo: string }) {
  return (
    <section id="doctors" className="bg-primary/[0.035] py-16 md:py-24">
      <div className="mx-auto max-w-[var(--content-max)] px-6 md:px-8">
        <SectionIntro
          eyebrow="Doctors"
          title="A fixed roster you can trust"
          body="Specialties and available days — then real-time hour blocks when you book."
        />
        <motion.div
          className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {DOCTORS.map((d) => (
            <motion.div
              key={d.name}
              variants={staggerItem}
              className="border-border group relative w-[78%] shrink-0 snap-center rounded-[var(--radius-card)] border bg-surface p-5 shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:w-[45%] md:w-auto"
            >
              <div className="relative mx-auto size-16">
                <div className="from-primary via-primary-light to-accent absolute inset-0 rounded-full bg-gradient-to-br opacity-90 blur-[1px]" />
                <div className="bg-primary-tint text-primary font-display absolute inset-[3px] flex items-center justify-center rounded-full text-lg font-medium shadow-[var(--shadow-soft)]">
                  {d.initials}
                </div>
              </div>
              <h3 className="font-display mt-4 text-center text-[15px] font-medium">{d.name}</h3>
              <p className="text-primary mt-1 text-center text-sm">{d.specialty}</p>
              <p className="text-text-muted mt-2 text-center text-xs">{d.days}</p>
              <div className="mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-h-12 group-hover:opacity-100">
                <Link to={bookTo} className="no-underline">
                  <Button size="sm" fullWidth variant="secondary">
                    Book with {d.name.replace('Dr. ', '')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="about" className="mx-auto max-w-[var(--content-max)] px-6 py-16 md:px-8 md:py-24">
      <SectionIntro
        eyebrow="How it works"
        title="Three calm steps to your token"
        body="Built around hourly capacity — not exclusive single-patient slots that fight reality."
      />
      <div className="relative mt-14">
        <div className="bg-primary-light/40 absolute top-0 bottom-0 left-5 w-0.5 md:hidden" aria-hidden />
        <motion.div
          className="grid gap-10 md:grid-cols-3 md:gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {STEPS.map((step) => (
            <motion.div key={step.n} variants={staggerItem} className="relative pl-10 md:pl-0 md:text-center">
              <p className="font-display text-primary-light text-4xl font-medium md:text-5xl">{step.n}</p>
              <h3 className="font-display mt-3 text-lg font-medium">{step.title}</h3>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <motion.div
        className="border-border mt-14 grid gap-4 overflow-hidden rounded-[var(--radius-lg)] border bg-surface md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={reveal}
      >
        <FeatureStrip
          icon={<IconTicket size={22} stroke={1.5} />}
          title="Token + ETA window"
          body="Know your place without false precision."
          tint="care"
        />
        <FeatureStrip
          icon={<IconClockHour4 size={22} stroke={1.5} />}
          title="Live queue"
          body="See who is being served right now."
        />
        <FeatureStrip
          icon={<IconBrandWhatsapp size={22} stroke={1.5} />}
          title="WhatsApp updates"
          body="Reminders and ETA shifts when the queue moves."
          tint="accent"
        />
      </motion.div>
    </section>
  )
}

function Testimonials() {
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState<number | null>(null)
  const [entered, setEntered] = useState(false)
  const clusterRef = useRef<HTMLDivElement>(null)
  const inView = useInView(clusterRef, { once: true, amount: 0.2 })

  useEffect(() => {
    if (!inView || entered) return
    const total = QUOTES.length * 80 + 450
    const t = window.setTimeout(() => setEntered(true), total)
    return () => window.clearTimeout(t)
  }, [inView, entered])

  return (
    <section className="bg-care/40 py-16 md:py-24" aria-label="Patient stories">
      <div className="mx-auto max-w-[var(--content-max)] px-6 md:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-primary text-sm font-medium tracking-wide">From patients</p>
          <h2 className="font-marketing text-text mt-2 text-3xl font-medium md:text-[2.15rem]">
            Trust, in their words
          </h2>
          <p className="text-text-secondary mt-3 text-[15px] leading-relaxed">
            Real visits, honest ETAs, fewer waiting-room surprises.
          </p>
        </div>

        <div
          ref={clusterRef}
          className="mt-12 flex flex-wrap justify-center gap-x-0 gap-y-8 md:mt-14 md:gap-y-10"
          onMouseLeave={() => setHovered(null)}
        >
          {QUOTES.map((q, idx) => {
            const isHovered = hovered === idx
            const dimOthers = hovered !== null && !isHovered
            const restRotate = reduceMotion ? 0 : q.rotate
            const targetRotate = reduceMotion ? 0 : isHovered ? 0 : restRotate
            const entranceDelay = entered || reduceMotion ? 0 : idx * 0.08

            return (
              <motion.article
                key={q.name}
                className={cn(
                  'border-border relative w-full max-w-[320px] cursor-default overflow-hidden rounded-[var(--radius-card)] border bg-surface px-7 pt-8 pb-6 sm:w-[min(100%,300px)]',
                  idx === 0 && 'md:mt-8 md:-mr-3',
                  idx === 1 && 'md:-mt-1 md:z-[2] md:-mx-2',
                  idx === 2 && 'md:mt-10 md:-ml-3',
                  idx === 3 && 'md:-mt-2 md:mr-2 md:-ml-1',
                  idx === 4 && 'md:mt-6 md:-ml-4',
                )}
                style={{ zIndex: isHovered ? 8 : idx === 1 ? 3 : 1 }}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 28, rotate: restRotate * 0.35 }
                }
                animate={
                  inView
                    ? {
                        opacity: dimOthers ? 0.72 : 1,
                        y: 0,
                        rotate: targetRotate,
                        scale: reduceMotion ? 1 : isHovered ? 1.02 : dimOthers ? 0.97 : 1,
                        boxShadow: isHovered
                          ? 'var(--shadow-lift)'
                          : 'var(--shadow-soft)',
                      }
                    : reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 28, rotate: restRotate * 0.35 }
                }
                transition={{
                  duration: reduceMotion ? 0.25 : entered ? 0.2 : 0.45,
                  ease: 'easeOut',
                  delay: entranceDelay,
                }}
                onMouseEnter={() => setHovered(idx)}
                onFocus={() => setHovered(idx)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
              >
                <span
                  aria-hidden
                  className="font-marketing text-primary/12 pointer-events-none absolute -top-3 left-3 select-none text-[7.5rem] leading-none"
                >
                  “
                </span>
                <blockquote className="font-marketing text-text relative text-[1.15rem] leading-snug font-medium italic md:text-[1.2rem]">
                  {q.quote}
                </blockquote>
                <div className="relative mt-6 flex items-center gap-3">
                  <div className="relative size-10 shrink-0">
                    <div className="from-primary via-primary-light to-accent absolute inset-0 rounded-full bg-gradient-to-br opacity-90 blur-[1px]" />
                    <div className="bg-primary-tint text-primary font-display absolute inset-[2px] flex items-center justify-center rounded-full text-xs font-medium">
                      {q.initials}
                    </div>
                  </div>
                  <div>
                    <p className="text-text text-sm font-medium">{q.name}</p>
                    <p className="text-text-muted text-xs">{q.role}</p>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState<number | null>(0)
  const gridRef = useRef<HTMLDivElement>(null)
  const inView = useInView(gridRef, { once: true, amount: 0.2 })

  return (
    <section
      className="mx-auto max-w-[var(--content-max)] px-6 py-16 md:px-8 md:py-24"
      aria-label="FAQ"
    >
      <div className="max-w-2xl">
        <p className="text-primary text-sm font-medium tracking-wide">FAQ</p>
        <h2 className="font-marketing text-text mt-2 text-3xl font-medium md:text-[2.15rem]">
          Common questions
        </h2>
        <p className="text-text-secondary mt-3 text-[15px] leading-relaxed">
          Short answers about tokens, cancellations, and the waitlist — tap a card to expand.
        </p>
      </div>

      <div ref={gridRef} className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-2">
        {FAQS.map((f, idx) => {
          const isOpen = open === idx
          const IconCmp = f.icon
          return (
            <motion.div
              key={f.q}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={
                inView
                  ? { opacity: 1, y: 0 }
                  : reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 24 }
              }
              transition={{
                duration: reduceMotion ? 0.25 : 0.45,
                ease: 'easeOut',
                delay: reduceMotion ? 0 : idx * 0.08,
              }}
              className={cn(
                'border-border overflow-hidden rounded-[var(--radius-card)] border bg-surface shadow-[var(--shadow-soft)] transition-[background-color,border-color,box-shadow] duration-200',
                isOpen &&
                  'border-primary/30 bg-care/55 shadow-[var(--shadow-lift)] border-l-[3px] border-l-primary',
              )}
            >
              <button
                type="button"
                className="flex w-full items-start gap-3.5 px-5 py-5 text-left"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : idx)}
              >
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] transition-[background-color,color] duration-200',
                    isOpen
                      ? 'bg-primary text-white'
                      : 'bg-primary-tint text-primary',
                  )}
                >
                  <IconCmp size={20} stroke={1.5} />
                </span>
                <span className="min-w-0 flex-1 pt-1.5">
                  <span className="font-display text-text flex items-start justify-between gap-2 text-[15px] leading-snug font-medium">
                    {f.q}
                    <IconChevronDown
                      size={18}
                      className={cn(
                        'text-primary mt-0.5 shrink-0 transition-transform duration-[250ms] ease-in-out',
                        isOpen && 'rotate-180',
                        reduceMotion && 'transition-none',
                      )}
                    />
                  </span>
                </span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0.15, ease: 'easeOut' }
                    : { duration: 0.25, ease: 'easeInOut' }
                }
                className="overflow-hidden"
              >
                <p className="text-text-secondary pr-5 pb-5 pl-[4.25rem] text-sm leading-relaxed">
                  {f.a}
                </p>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function VisitSection({ bookTo }: { bookTo: string }) {
  return (
    <section id="contact" className="relative overflow-hidden">
      <div
        className="from-bg pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent"
        aria-hidden
      />
      <div className="bg-primary relative pt-8 pb-20 text-white md:pt-10 md:pb-24">
        <div
          className="pointer-events-none absolute -top-20 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(93,202,165,0.35),transparent_65%)]"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-[var(--content-max)] gap-10 px-6 md:grid-cols-2 md:items-center md:px-8">
          <div>
            <p className="text-primary-light text-sm font-medium tracking-wide">Visit us</p>
            <h2 className="font-marketing mt-3 text-3xl font-medium md:text-4xl">
              One clinic. Clear hours. Easy to find.
            </h2>
            <ul className="mt-8 space-y-4 text-sm text-white/85">
              <li className="flex gap-3">
                <IconMapPin size={20} stroke={1.5} className="text-primary-light mt-0.5 shrink-0" />
                <span>
                  12 Care Lane, Near City Park
                  <br />
                  Your City, 560001
                </span>
              </li>
              <li className="flex gap-3">
                <IconPhone size={20} stroke={1.5} className="text-primary-light mt-0.5 shrink-0" />
                <span>+91 80 4000 1200 · Reception 8:00–20:00</span>
              </li>
              <li className="flex gap-3">
                <IconClockHour4 size={20} stroke={1.5} className="text-primary-light mt-0.5 shrink-0" />
                <span>Doctors by roster · Booked visits preferred</span>
              </li>
            </ul>
            <div className="mt-8">
              <Link to={bookTo} className="no-underline">
                <Button size="lg" className="bg-accent hover:brightness-105">
                  Book from the portal
                </Button>
              </Link>
            </div>
          </div>
          <ClinicMapArt />
        </div>
      </div>
    </section>
  )
}

/** Intentional brand location graphic — not a generic world-map placeholder */
function ClinicMapArt() {
  return (
    <div
      className="relative min-h-[280px] overflow-hidden rounded-[var(--radius-lg)] border border-white/15 bg-[#0a4a3a] md:min-h-[340px]"
      aria-label="Clinic neighborhood illustration"
    >
      <svg viewBox="0 0 400 340" className="absolute inset-0 size-full" aria-hidden>
        <rect width="400" height="340" fill="#0a4a3a" />
        <path d="M0 80 H400" stroke="rgba(225,245,238,0.12)" strokeWidth="8" />
        <path d="M0 180 H400" stroke="rgba(225,245,238,0.1)" strokeWidth="10" />
        <path d="M0 260 H400" stroke="rgba(225,245,238,0.08)" strokeWidth="6" />
        <path d="M90 0 V340" stroke="rgba(225,245,238,0.1)" strokeWidth="8" />
        <path d="M220 0 V340" stroke="rgba(225,245,238,0.12)" strokeWidth="12" />
        <path d="M320 0 V340" stroke="rgba(225,245,238,0.08)" strokeWidth="6" />
        <rect x="40" y="100" width="70" height="50" rx="4" fill="rgba(15,110,86,0.55)" />
        <rect x="130" y="40" width="55" height="90" rx="4" fill="rgba(93,202,165,0.25)" />
        <rect x="250" y="120" width="90" height="70" rx="4" fill="rgba(15,110,86,0.45)" />
        <rect x="50" y="200" width="100" height="45" rx="4" fill="rgba(93,202,165,0.2)" />
        <circle cx="210" cy="175" r="18" fill="#D85A30" />
        <circle cx="210" cy="175" r="8" fill="#FDFBF7" />
      </svg>
      <div className="absolute right-4 bottom-4 left-4">
        <div className="bg-surface/95 text-text rounded-[var(--radius-control)] px-3 py-2 text-xs font-medium shadow-[var(--shadow-soft)]">
          ClinicEase · Care Lane · coral pin marks the entrance
        </div>
      </div>
    </div>
  )
}

function SiteFooter({ bookTo }: { bookTo: string }) {
  return (
    <footer className="border-border from-primary/10 border-t bg-gradient-to-b to-bg">
      <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-10 px-6 py-14 md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <Logo />
          <p className="text-text-secondary mt-3 max-w-xs text-sm leading-relaxed">
            Your care, simplified — tokens, live ETAs, and fewer phone calls for a single-clinic
            practice.
          </p>
          <form
            className="mt-5 flex max-w-sm gap-2"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Clinic updates"
          >
            <input
              type="email"
              required
              placeholder="Email for clinic updates"
              className="border-border bg-surface focus:border-primary min-h-11 flex-1 rounded-[var(--radius-control)] border px-3 text-sm outline-none focus:shadow-[var(--focus-ring)]"
            />
            <Button type="submit" size="sm" variant="secondary">
              Join
            </Button>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <FooterCol
            title="Product"
            links={[
              { label: 'Book', to: bookTo },
              { label: 'Sign in', to: '/login' },
              { label: 'Design system', to: '/dev/ui' },
            ]}
          />
          <FooterCol
            title="Clinic"
            links={[
              { label: 'Doctors', to: '#doctors' },
              { label: 'Services', to: '#services' },
              { label: 'Contact', to: '#contact' },
            ]}
          />
          <FooterCol
            title="Roles"
            links={[
              { label: 'Patient', to: '/login' },
              { label: 'Doctor', to: '/login' },
              { label: 'Admin', to: '/login' },
            ]}
          />
        </div>
      </div>
      <div className="border-border text-text-muted border-t px-6 py-4 text-center text-xs md:px-8">
        © {new Date().getFullYear()} ClinicEase · Built with care for local clinics
      </div>
    </footer>
  )
}

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <motion.div
      className="max-w-2xl"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={reveal}
    >
      <p className="text-primary text-sm font-medium tracking-wide">{eyebrow}</p>
      <h2 className="font-marketing text-text mt-2 text-3xl font-medium md:text-[2.15rem]">{title}</h2>
      <p className="text-text-secondary mt-3 text-[15px] leading-relaxed">{body}</p>
    </motion.div>
  )
}

function FeatureStrip({
  icon,
  title,
  body,
  tint,
}: {
  icon: ReactNode
  title: string
  body: string
  tint?: 'care' | 'accent'
}) {
  return (
    <div
      className={cn(
        'border-border flex gap-3 px-5 py-5 md:border-r md:last:border-r-0',
        tint === 'care' && 'bg-care/40',
        tint === 'accent' && 'bg-accent-tint/40',
      )}
    >
      <div className="bg-primary-tint text-primary flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)]">
        {icon}
      </div>
      <div>
        <p className="font-display text-[15px] font-medium">{title}</p>
        <p className="text-text-secondary mt-1 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; to: string }[]
}) {
  return (
    <div>
      <p className="text-text text-sm font-medium">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) =>
          l.to.startsWith('#') ? (
            <li key={l.label}>
              <a
                href={l.to}
                className="group text-text-secondary hover:text-primary relative text-sm no-underline transition-colors duration-200"
              >
                {l.label}
                <span className="bg-primary absolute inset-x-0 -bottom-0.5 mx-auto h-px w-0 transition-[width] duration-200 group-hover:w-full" />
              </a>
            </li>
          ) : (
            <li key={l.label}>
              <Link
                to={l.to}
                className="group text-text-secondary hover:text-primary relative text-sm no-underline transition-colors duration-200"
              >
                {l.label}
                <span className="bg-primary absolute inset-x-0 -bottom-0.5 mx-auto h-px w-0 transition-[width] duration-200 group-hover:w-full" />
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  )
}
