import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconClockHour4,
  IconMapPin,
  IconPhone,
  IconTicket,
} from '@tabler/icons-react'
import { Logo } from '@/components/brand/Logo'
import { MarketingNavbar } from '@/components/brand/MarketingNavbar'
import { Button, Card, StatusPill } from '@/components/ui'
import { SkipLink } from '@/a11y'
import { homePathForRole, useAuth } from '@/auth/AuthContext'
import { fadeUp, staggerContainer, staggerItem, transitions } from '@/motion/variants'

const SPECIALTIES = [
  { title: 'General physician', body: 'Fever, fatigue, routine checkups, and everyday care.' },
  { title: 'Pediatrics', body: 'Gentle visits for children with family booking support.' },
  { title: 'Dermatology', body: 'Skin concerns with clear capacity and wait transparency.' },
  { title: 'Orthopedics', body: 'Joint and mobility care with realistic visit windows.' },
  { title: 'Gynecology', body: 'Confidential visits booked online without phone tag.' },
  { title: 'Diagnostics liaison', body: 'Guidance on who to see — never a diagnosis itself.' },
]

const DOCTORS = [
  {
    name: 'Dr. Ananya Mehta',
    specialty: 'General physician',
    days: 'Mon–Sat',
    initials: 'AM',
  },
  {
    name: 'Dr. Rohan Iyer',
    specialty: 'Pediatrics',
    days: 'Mon–Fri',
    initials: 'RI',
  },
  {
    name: 'Dr. Sara Khan',
    specialty: 'Dermatology',
    days: 'Tue–Sat',
    initials: 'SK',
  },
  {
    name: 'Dr. Vikram Desai',
    specialty: 'Orthopedics',
    days: 'Mon–Thu',
    initials: 'VD',
  },
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

const TRUST = [
  { value: '6', label: 'Specialist doctors' },
  { value: '<3 min', label: 'Typical book time' },
  { value: 'Live', label: 'Token & ETA updates' },
  { value: '24h / 1h', label: 'Smart reminders' },
]

export function LandingPage() {
  const { user, isAuthenticated } = useAuth()
  const reduceMotion = useReducedMotion()

  const bookTo = isAuthenticated && user ? homePathForRole(user.role) : '/register'

  return (
    <>
      <SkipLink />
      <div className="bg-bg text-text min-h-dvh">
        <MarketingNavbar />

        {/* Hero — full-bleed visual plane, brand-first, no cards/overlays */}
        <section id="home" className="relative min-h-[calc(100dvh-4.5rem)] overflow-hidden">
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                'linear-gradient(105deg, rgba(250,248,244,0.95) 0%, rgba(250,248,244,0.72) 36%, rgba(10,74,58,0.45) 100%), url(https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=2400&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-[var(--content-max)] flex-col justify-center px-6 py-16 md:px-8 md:py-20">
            <motion.div
              className="max-w-xl"
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              variants={fadeUp}
            >
              <p className="font-display text-primary text-4xl font-semibold tracking-tight md:text-5xl">
                ClinicEase
              </p>
              <h1 className="font-marketing text-text mt-5 text-[2.15rem] leading-[1.12] font-medium md:text-[2.75rem]">
                Your care, simplified
              </h1>
              <p className="text-text-secondary mt-5 max-w-md text-base leading-relaxed md:text-lg">
                Book into real hour blocks, get a token and estimated window, and follow the live
                queue — without the phone tag.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={bookTo} className="no-underline">
                  <Button size="lg" rightIcon={<IconArrowRight size={18} stroke={1.5} />}>
                    Book appointment
                  </Button>
                </Link>
                <a href="#doctors" className="no-underline">
                  <Button size="lg" variant="ghost">
                    Meet our doctors
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust */}
        <section className="border-border border-y bg-surface/60" aria-label="Clinic highlights">
          <motion.div
            className="mx-auto grid max-w-[1200px] grid-cols-2 gap-px md:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            {TRUST.map((t) => (
              <motion.div
                key={t.label}
                variants={staggerItem}
                className="bg-bg px-6 py-8 md:px-8"
              >
                <p className="font-display text-primary text-2xl font-medium md:text-3xl">
                  {t.value}
                </p>
                <p className="text-text-secondary mt-1 text-sm">{t.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Services / specialties */}
        <section id="services" className="mx-auto max-w-[1200px] px-6 py-20 md:px-8 md:py-24">
          <SectionIntro
            eyebrow="Services"
            title="Care across the specialties you need"
            body="One clinic, six doctors, clear capacity — so you book the right visit the first time."
          />
          <motion.div
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {SPECIALTIES.map((s) => (
              <motion.div key={s.title} variants={staggerItem}>
                <div className="border-border h-full rounded-[var(--radius-card)] border border-l-[3px] border-l-primary bg-surface/80 px-5 py-5">
                  <h3 className="font-display text-lg font-medium">{s.title}</h3>
                  <p className="text-text-secondary mt-2 text-sm leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Doctors */}
        <section id="doctors" className="bg-primary/[0.03] py-20 md:py-24">
          <div className="mx-auto max-w-[1200px] px-6 md:px-8">
            <SectionIntro
              eyebrow="Doctors"
              title="A fixed roster you can trust"
              body="Photos, specialties, and available days — then real-time hour blocks when you book."
            />
            <motion.div
              className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {DOCTORS.map((d) => (
                <motion.div key={d.name} variants={staggerItem}>
                  <Card interactive padding="md" className="h-full">
                    <div className="bg-primary-tint text-primary font-display flex size-14 items-center justify-center rounded-[var(--radius-card)] text-lg font-medium">
                      {d.initials}
                    </div>
                    <h3 className="font-display mt-4 text-[15px] font-medium">{d.name}</h3>
                    <p className="text-primary mt-1 text-sm">{d.specialty}</p>
                    <p className="text-text-muted mt-3 text-xs">{d.days}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-8">
              <Link to={bookTo} className="no-underline">
                <Button variant="secondary">Book with a doctor</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="about" className="mx-auto max-w-[1200px] px-6 py-20 md:px-8 md:py-24">
          <SectionIntro
            eyebrow="How it works"
            title="Three calm steps to your token"
            body="Built around hourly capacity — not exclusive single-patient slots that fight reality."
          />
          <motion.div
            className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            {STEPS.map((step) => (
              <motion.div key={step.n} variants={staggerItem} className="relative">
                <p className="font-display text-primary-light text-4xl font-medium">{step.n}</p>
                <h3 className="font-display mt-3 text-lg font-medium">{step.title}</h3>
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="border-border mt-14 grid gap-4 overflow-hidden rounded-[var(--radius-lg)] border bg-surface md:grid-cols-3"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={transitions.slow}
          >
            <FeatureStrip
              icon={<IconTicket size={22} stroke={1.5} />}
              title="Token + ETA window"
              body="Know your place without false precision."
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
            />
          </motion.div>
        </section>

        {/* Contact / location */}
        <section id="contact" className="bg-primary py-20 text-white md:py-24">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-6 md:grid-cols-2 md:items-center md:px-8">
            <div>
              <p className="text-primary-light text-sm font-medium tracking-wide">Visit us</p>
              <h2 className="font-display mt-3 text-2xl font-medium md:text-3xl">
                One clinic. Clear hours. Easy to find.
              </h2>
              <ul className="mt-8 space-y-4 text-sm text-white/85">
                <li className="flex gap-3">
                  <IconMapPin size={20} stroke={1.5} className="mt-0.5 shrink-0 text-primary-light" />
                  <span>
                    12 Care Lane, Near City Park
                    <br />
                    Your City, 560001
                  </span>
                </li>
                <li className="flex gap-3">
                  <IconPhone size={20} stroke={1.5} className="mt-0.5 shrink-0 text-primary-light" />
                  <span>+91 80 4000 1200 · Reception 8:00–8:00</span>
                </li>
                <li className="flex gap-3">
                  <IconClockHour4 size={20} stroke={1.5} className="mt-0.5 shrink-0 text-primary-light" />
                  <span>Doctors by roster · Booked visits preferred</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link to={bookTo} className="no-underline">
                  <Button size="lg" variant="secondary">
                    Book from the portal
                  </Button>
                </Link>
              </div>
            </div>
            <div
              className="relative min-h-[280px] overflow-hidden rounded-[var(--radius-lg)] md:min-h-[340px]"
              aria-label="Clinic neighborhood map placeholder"
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(160deg, rgba(15,110,86,0.45), rgba(44,44,42,0.35)), url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute right-4 bottom-4 left-4">
                <StatusPill tone="info" className="bg-surface/95">
                  Map preview · pin your clinic address at launch
                </StatusPill>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-border border-t bg-bg">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between md:px-8">
            <div>
              <Logo />
              <p className="text-text-secondary mt-3 max-w-xs text-sm leading-relaxed">
                Your care, simplified — tokens, live ETAs, and fewer phone calls for a
                single-clinic practice.
              </p>
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
      </div>
    </>
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
    <div className="max-w-2xl">
      <p className="text-primary text-sm font-medium tracking-wide">{eyebrow}</p>
      <h2 className="font-display text-text mt-2 text-2xl font-medium md:text-[1.75rem]">{title}</h2>
      <p className="text-text-secondary mt-3 text-[15px] leading-relaxed">{body}</p>
    </div>
  )
}

function FeatureStrip({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <div className="border-border flex gap-3 px-5 py-5 md:border-r md:last:border-r-0">
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
              <a href={l.to} className="text-text-secondary hover:text-primary text-sm no-underline">
                {l.label}
              </a>
            </li>
          ) : (
            <li key={l.label}>
              <Link to={l.to} className="text-text-secondary hover:text-primary text-sm no-underline">
                {l.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  )
}
