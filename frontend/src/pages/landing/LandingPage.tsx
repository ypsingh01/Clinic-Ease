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
      className="relative overflow-hidden px-5 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-12 lg:pb-28"
      onMouseMove={(e) => {
        if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return
        if (window.matchMedia('(max-width: 1023px)').matches) return
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1)
        my.set(((e.clientY - r.top) / r.height) * 2 - 1)
      }}
    >
      <motion.div
        aria-hidden
        className="bg-primary/15 pointer-events-none absolute -top-24 -left-16 size-[220px] rounded-full blur-3xl max-lg:mobile-pause-blobs sm:size-[280px] lg:size-[320px]"
        style={reduceMotion ? undefined : { x: blobX, y: blobY }}
      />
      <motion.div
        aria-hidden
        className="bg-accent/15 pointer-events-none absolute top-24 -right-16 size-[180px] rounded-full blur-3xl max-lg:mobile-pause-blobs sm:size-[240px] lg:top-32 lg:-right-20 lg:size-[280px]"
        style={reduceMotion ? undefined : { x: blob2X, y: blob2Y }}
      />

      <div className="relative mx-auto flex max-w-[var(--content-max)] flex-col gap-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
        {/* Photo first on mobile */}
        <motion.div
          className="relative order-1 mx-auto w-full max-w-lg lg:order-2"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <div className="border-border relative overflow-hidden rounded-[24px] border bg-surface shadow-[var(--shadow-lift)] sm:rounded-[28px]">
            <img
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1200&q=80"
              alt="Doctor consulting with a patient in a calm clinic"
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/6]"
            />
            <div className="from-primary-deep/50 absolute inset-0 bg-gradient-to-t to-transparent via-transparent" />
          </div>
          <motion.div
            className="border-border bg-surface absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-[var(--radius-pill)] border px-3.5 py-2.5 shadow-[var(--shadow-soft)] sm:left-6 sm:translate-x-0 lg:-bottom-4"
            animate={
              reduceMotion
                ? undefined
                : { opacity: [1, 0.85, 1], scale: [1, 1.02, 1] }
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="relative flex size-2.5">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 max-lg:animate-none" />
              <span className="bg-primary relative inline-flex size-2.5 rounded-full" />
            </span>
            <span className="text-text text-xs font-medium sm:text-sm">
              Now serving Token <span className="font-mono">#14</span>
            </span>
          </motion.div>
        </motion.div>

        <div className="order-2 lg:order-1">
          <motion.p
            className="text-primary text-sm font-medium tracking-wide"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Digital clinic booking
          </motion.p>
          <motion.p
            className="font-display text-primary mt-3 text-[2rem] font-semibold tracking-tight sm:mt-4 sm:text-4xl lg:text-5xl"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            Clinic<span className="text-accent">Ease</span>
          </motion.p>
          <motion.h1
            className="font-marketing text-text mt-2 text-[2.1rem] leading-[1.1] font-medium sm:mt-3 sm:text-[2.35rem] lg:text-[3.1rem] lg:leading-[1.08]"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            Your care, simplified
          </motion.h1>
          <motion.p
            className="text-text-secondary mt-4 max-w-md text-[15px] leading-relaxed sm:mt-5 sm:text-base lg:text-lg"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            Book into real hour blocks, get a token and estimated window, and follow the live
            queue — without the phone tag.
          </motion.p>
          <motion.div
            className="mt-7 flex flex-col gap-3 sm:mt-8 lg:flex-row lg:flex-wrap lg:items-center lg:gap-5"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
          >
            <Link to={bookTo} className="w-full no-underline lg:w-auto">
              <Button
                size="lg"
                fullWidth
                className="min-h-12 transition-[transform,box-shadow] duration-200 active:scale-[0.98] lg:w-auto lg:hover:-translate-y-0.5 lg:hover:shadow-[var(--shadow-lift)] lg:hover:scale-[1.02]"
                rightIcon={<IconArrowRight size={18} stroke={1.5} />}
              >
                Book appointment
              </Button>
            </Link>
            <a
              href="#doctors"
              className="text-primary inline-flex min-h-11 items-center justify-center gap-1.5 text-sm font-medium no-underline lg:justify-start"
            >
              Meet our doctors
              <IconArrowRight size={16} stroke={1.5} />
            </a>
          </motion.div>
        </div>
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
  const inView = useInView(ref, { once: true, amount: 0.35 })
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
    <section className="mx-auto max-w-[var(--content-max)] px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20" aria-label="Highlights">
      <motion.div
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {STATS.map((s) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              variants={reveal}
              className="border-border bg-care/60 rounded-[var(--radius-card)] border px-4 py-5 shadow-[var(--shadow-soft)] sm:px-5 sm:py-6"
            >
              <Icon size={20} stroke={1.5} className="text-primary mb-3" />
              <CountUp
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                display={'display' in s ? s.display : undefined}
              />
              <p className="text-text-secondary mt-1 text-xs leading-snug sm:text-sm">{s.label}</p>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}

function ServicesSection() {
  return (
    <section id="services" className="mx-auto max-w-[var(--content-max)] px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <SectionIntro
        eyebrow="Services"
        title="Care across the specialties you need"
        body="One clinic, six doctors, clear capacity — so you book the right visit the first time."
      />
      <motion.div
        className="mt-10 flex flex-col gap-4 sm:mt-12 lg:grid lg:grid-cols-6 lg:gap-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
      >
        {SPECIALTIES.map((s) => (
          <motion.div
            key={s.title}
            variants={staggerItem}
            className={cn(s.featured ? 'lg:col-span-3' : 'lg:col-span-2')}
          >
            <div
              className={cn(
                'border-border group h-full rounded-[var(--radius-card)] border bg-surface px-5 py-6 transition-[transform,border-color,box-shadow] duration-200 ease-out active:scale-[0.99] lg:hover:-translate-y-1 lg:hover:border-primary/40 lg:hover:shadow-[var(--shadow-lift)]',
                s.featured && 'bg-care/40 lg:min-h-[180px] lg:px-7 lg:py-8',
              )}
            >
              <div
                className={cn(
                  'bg-primary-tint text-primary mb-4 flex size-11 items-center justify-center rounded-[var(--radius-control)] transition-transform duration-200 lg:size-10 lg:group-hover:-translate-y-0.5',
                  s.featured && 'lg:size-12',
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
    <section id="doctors" className="bg-primary/[0.035] py-14 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-[var(--content-max)] px-5 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Doctors"
          title="A fixed roster you can trust"
          body="Specialties and available days — then real-time hour blocks when you book."
        />
        <motion.div
          className="-mx-5 mt-10 flex snap-x-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:-mx-6 sm:mt-12 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
        >
          {DOCTORS.map((d) => (
            <motion.div
              key={d.name}
              variants={staggerItem}
              className="border-border group relative w-[82%] shrink-0 snap-center-card rounded-[var(--radius-card)] border bg-surface p-5 shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-200 active:scale-[0.99] sm:w-[58%] lg:w-auto lg:hover:-translate-y-1 lg:hover:shadow-[var(--shadow-lift)]"
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
              {/* Always visible on mobile (no hover); desktop keeps hover reveal */}
              <div className="mt-4 max-lg:max-h-none max-lg:opacity-100 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-200 lg:group-hover:max-h-12 lg:group-hover:opacity-100">
                <Link to={bookTo} className="no-underline">
                  <Button size="sm" fullWidth variant="secondary" className="min-h-11">
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

const STEP_FEATURES = [
  {
    icon: IconTicket,
    title: 'Token + ETA window',
    body: 'Know your place without false precision.',
    tint: 'care' as const,
  },
  {
    icon: IconClockHour4,
    title: 'Live queue',
    body: 'See who is being served right now.',
    tint: undefined,
  },
  {
    icon: IconBrandWhatsapp,
    title: 'WhatsApp updates',
    body: 'Reminders and ETA shifts when the queue moves.',
    tint: 'accent' as const,
  },
]

function HowItWorks() {
  const trackRef = useRef(null)
  const inView = useInView(trackRef, { once: true, amount: 0.3 })
  const reduceMotion = useReducedMotion()

  return (
    <section id="about" className="mx-auto max-w-[var(--content-max)] px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <SectionIntro
        eyebrow="How it works"
        title="Three calm steps to your token"
        body="Built around hourly capacity — not exclusive single-patient slots that fight reality."
      />

      {/* Mobile: vertical steps + feature under each */}
      <div ref={trackRef} className="relative mt-12 lg:hidden">
        <div className="bg-primary-light/30 absolute top-2 bottom-2 left-[1.15rem] w-0.5 overflow-hidden" aria-hidden>
          <motion.div
            className="bg-primary-light h-full w-full origin-top"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: inView ? 1 : 0 }}
            transition={reduceMotion ? { duration: 0.2 } : { duration: 0.9, ease: 'easeOut' }}
          />
        </div>
        <div className="flex flex-col gap-10">
          {STEPS.map((step, i) => {
            const feat = STEP_FEATURES[i]
            const FeatIcon = feat.icon
            return (
              <motion.div
                key={step.n}
                className="relative pl-12"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: reduceMotion ? 0 : i * 0.06 }}
              >
                <span className="bg-surface text-primary border-primary/20 absolute top-1 left-0 flex size-9 items-center justify-center rounded-full border text-xs font-semibold">
                  {step.n}
                </span>
                <h3 className="font-display text-lg font-medium">{step.title}</h3>
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">{step.body}</p>
                <div
                  className={cn(
                    'border-border mt-4 flex gap-3 rounded-[var(--radius-card)] border px-4 py-4',
                    feat.tint === 'care' && 'bg-care/40',
                    feat.tint === 'accent' && 'bg-accent-tint/40',
                    !feat.tint && 'bg-surface',
                  )}
                >
                  <div className="bg-primary-tint text-primary flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)]">
                    <FeatIcon size={20} stroke={1.5} />
                  </div>
                  <div>
                    <p className="font-display text-[15px] font-medium">{feat.title}</p>
                    <p className="text-text-secondary mt-1 text-sm leading-relaxed">{feat.body}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Desktop (locked): original 3-col + feature strip */}
      <div className="relative mt-14 hidden lg:block">
        <motion.div
          className="grid gap-10 md:grid-cols-3 md:gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {STEPS.map((step) => (
            <motion.div key={step.n} variants={staggerItem} className="relative pl-0 text-center">
              <p className="font-display text-primary-light text-5xl font-medium">{step.n}</p>
              <h3 className="font-display mt-3 text-lg font-medium">{step.title}</h3>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </motion.div>
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
      </div>
    </section>
  )
}

function Testimonials() {
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState<number | null>(null)
  const [entered, setEntered] = useState(false)
  const [active, setActive] = useState(0)
  const clusterRef = useRef<HTMLDivElement>(null)
  const inView = useInView(clusterRef, { once: true, amount: 0.2 })

  useEffect(() => {
    if (!inView || entered) return
    const total = QUOTES.length * 80 + 450
    const t = window.setTimeout(() => setEntered(true), total)
    return () => window.clearTimeout(t)
  }, [inView, entered])

  return (
    <section className="bg-care/40 py-14 sm:py-16 lg:py-24" aria-label="Patient stories">
      <div className="mx-auto max-w-[var(--content-max)] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-primary text-sm font-medium tracking-wide">From patients</p>
          <h2 className="font-marketing text-text mt-2 text-3xl font-medium md:text-[2.15rem]">
            Trust, in their words
          </h2>
          <p className="text-text-secondary mt-3 text-[15px] leading-relaxed">
            Real visits, honest ETAs, fewer waiting-room surprises.
          </p>
        </div>

        {/* Mobile: swipeable single card */}
        <div className="mt-10 lg:hidden">
          <motion.article
            key={QUOTES[active].name}
            className="border-border relative overflow-hidden rounded-[var(--radius-card)] border bg-surface px-6 pt-8 pb-6 shadow-[var(--shadow-soft)]"
            drag={reduceMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) setActive((v) => Math.min(QUOTES.length - 1, v + 1))
              else if (info.offset.x > 60) setActive((v) => Math.max(0, v - 1))
            }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            whileDrag={reduceMotion ? undefined : { scale: 1.02, rotate: 2 }}
          >
            <span
              aria-hidden
              className="font-marketing text-primary/12 pointer-events-none absolute -top-3 left-3 select-none text-[7.5rem] leading-none"
            >
              “
            </span>
            <blockquote className="font-marketing text-text relative text-[1.15rem] leading-snug font-medium italic">
              {QUOTES[active].quote}
            </blockquote>
            <div className="relative mt-6 flex items-center gap-3">
              <div className="relative size-10 shrink-0">
                <div className="from-primary via-primary-light to-accent absolute inset-0 rounded-full bg-gradient-to-br opacity-90 blur-[1px]" />
                <div className="bg-primary-tint text-primary font-display absolute inset-[2px] flex items-center justify-center rounded-full text-xs font-medium">
                  {QUOTES[active].initials}
                </div>
              </div>
              <div>
                <p className="text-text text-sm font-medium">{QUOTES[active].name}</p>
                <p className="text-text-muted text-xs">{QUOTES[active].role}</p>
              </div>
            </div>
          </motion.article>
          <div className="mt-5 flex justify-center gap-2">
            {QUOTES.map((q, idx) => (
              <button
                key={q.name}
                type="button"
                aria-label={`Quote ${idx + 1}`}
                className={cn(
                  'touch-target flex items-center justify-center rounded-full p-2',
                )}
                onClick={() => setActive(idx)}
              >
                <span
                  className={cn(
                    'block size-2 rounded-full transition-colors',
                    idx === active ? 'bg-primary' : 'bg-border',
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Desktop cluster (locked) */}
        <div
          ref={clusterRef}
          className="mt-12 hidden flex-wrap justify-center gap-x-0 gap-y-8 md:mt-14 md:gap-y-10 lg:flex"
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

      <div ref={gridRef} className="mt-10 grid grid-cols-1 gap-3.5 sm:mt-12 sm:gap-4 lg:grid-cols-2 lg:gap-5">
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
                className="flex min-h-[52px] w-full items-start gap-3.5 px-5 py-5 text-left active:opacity-90"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : idx)}
              >
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] transition-[background-color,color] duration-200 sm:size-10',
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
      <div className="bg-primary relative pt-8 pb-16 text-white sm:pb-20 lg:pt-10 lg:pb-24">
        <div
          className="pointer-events-none absolute -top-20 left-1/2 size-[320px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(93,202,165,0.35),transparent_65%)] max-lg:opacity-70 lg:size-[480px]"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-[var(--content-max)] flex-col gap-8 px-5 sm:gap-10 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="order-1 lg:order-2">
            <ClinicMapArt />
          </div>
          <div className="order-2 lg:order-1">
            <p className="text-primary-light text-sm font-medium tracking-wide">Visit us</p>
            <h2 className="font-marketing mt-3 text-[1.75rem] font-medium sm:text-3xl lg:text-4xl">
              One clinic. Clear hours. Easy to find.
            </h2>
            <ul className="mt-8 space-y-5 text-[15px] leading-relaxed text-white/85">
              <li className="flex gap-3">
                <IconMapPin size={22} stroke={1.5} className="text-primary-light mt-0.5 shrink-0" />
                <span>
                  12 Care Lane, Near City Park
                  <br />
                  Your City, 560001
                </span>
              </li>
              <li className="flex gap-3">
                <IconPhone size={22} stroke={1.5} className="text-primary-light mt-0.5 shrink-0" />
                <span>+91 80 4000 1200 · Reception 8:00–20:00</span>
              </li>
              <li className="flex gap-3">
                <IconClockHour4 size={22} stroke={1.5} className="text-primary-light mt-0.5 shrink-0" />
                <span>Doctors by roster · Booked visits preferred</span>
              </li>
            </ul>
            <div className="mt-8">
              <Link to={bookTo} className="block no-underline lg:inline-block">
                <Button size="lg" fullWidth className="bg-accent min-h-12 active:scale-[0.98] hover:brightness-105 lg:w-auto">
                  Book from the portal
                </Button>
              </Link>
            </div>
          </div>
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
      <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-10 px-5 py-12 sm:px-6 sm:py-14 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div>
          <Logo />
          <p className="text-text-secondary mt-3 max-w-xs text-sm leading-relaxed">
            Your care, simplified — tokens, live ETAs, and fewer phone calls for a single-clinic
            practice.
          </p>
          <form
            className="mt-5 flex max-w-sm flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Clinic updates"
          >
            <input
              type="email"
              required
              placeholder="Email for clinic updates"
              className="border-border bg-surface focus:border-primary min-h-12 flex-1 rounded-[var(--radius-control)] border px-3 text-sm outline-none focus:shadow-[var(--focus-ring)]"
            />
            <Button type="submit" size="sm" variant="secondary" className="min-h-12 sm:min-h-11">
              Join
            </Button>
          </form>
        </div>
        {/* Mobile: single stacked list; desktop: 3 columns */}
        <div className="flex flex-col gap-6 lg:hidden">
          {[
            {
              title: 'Product',
              links: [
                { label: 'Book', to: bookTo },
                { label: 'Sign in', to: '/login' },
              ],
            },
            {
              title: 'Clinic',
              links: [
                { label: 'Doctors', to: '#doctors' },
                { label: 'Services', to: '#services' },
                { label: 'Contact', to: '#contact' },
              ],
            },
            {
              title: 'Roles',
              links: [
                { label: 'Patient', to: '/login' },
                { label: 'Doctor', to: '/login' },
                { label: 'Admin', to: '/login' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-text text-sm font-medium">{col.title}</p>
              <ul className="mt-2 space-y-1">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to.startsWith('#') ? (
                      <a href={l.to} className="text-text-secondary flex min-h-11 items-center text-sm no-underline">
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.to} className="text-text-secondary flex min-h-11 items-center text-sm no-underline">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="hidden grid-cols-2 gap-8 sm:grid-cols-3 lg:grid">
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
      <div className="border-border text-text-muted border-t px-5 py-4 text-center text-xs sm:px-6 lg:px-8">
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
