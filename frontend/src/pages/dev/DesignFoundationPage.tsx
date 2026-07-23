import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  IconCalendarEvent,
  IconHeartbeat,
  IconBell,
  IconUsers,
  IconStethoscope,
} from '@tabler/icons-react'
import {
  Banner,
  Button,
  Calendar,
  Card,
  ChipSelect,
  Drawer,
  EmptyState,
  FormField,
  Heatmap,
  HourBlockPicker,
  Input,
  Modal,
  ProgressBar,
  SplashLoader,
  StatusPill,
  Table,
  TokenQueueRow,
  TrendChart,
  useToast,
} from '@/components/ui'
import { SkipLink } from '@/a11y'
import { fadeUp, staggerContainer, staggerItem } from '@/motion/variants'

const tokens = [
  { name: 'Primary', hex: '#0F6E56', className: 'bg-primary' },
  { name: 'Primary light', hex: '#5DCAA5', className: 'bg-primary-light' },
  { name: 'Accent CTA', hex: '#D85A30', className: 'bg-accent' },
  { name: 'Page bg', hex: '#FDFBF7', className: 'bg-bg border border-border' },
  { name: 'Tint', hex: '#E1F5EE', className: 'bg-primary-tint' },
  { name: 'Accent tint', hex: '#FAECE7', className: 'bg-accent-tint' },
]

const symptomOptions = [
  { id: 'fever', label: 'Fever' },
  { id: 'cough', label: 'Cough' },
  { id: 'skin', label: 'Skin rash' },
  { id: 'joint', label: 'Joint pain' },
  { id: 'stomach', label: 'Stomach pain' },
]

const hourBlocks = [
  { id: 'b1', startLabel: '09:00', endLabel: '10:00', capacity: 12, booked: 4 },
  { id: 'b2', startLabel: '10:00', endLabel: '11:00', capacity: 12, booked: 9 },
  { id: 'b3', startLabel: '11:00', endLabel: '12:00', capacity: 12, booked: 12, state: 'full' as const },
  { id: 'b4', startLabel: '12:00', endLabel: '13:00', capacity: 12, booked: 12, state: 'waitlist' as const },
]

const trendData = [
  { label: 'Mon', value: 18 },
  { label: 'Tue', value: 24 },
  { label: 'Wed', value: 21 },
  { label: 'Thu', value: 29 },
  { label: 'Fri', value: 26 },
  { label: 'Sat', value: 14 },
  { label: 'Sun', value: 8 },
]

const heatHours = ['9', '10', '11', '12', '2', '3', '4']
const heatValues = [
  [2, 5, 8, 6, 4, 7, 3],
  [3, 6, 9, 7, 5, 8, 4],
  [1, 4, 7, 5, 3, 6, 2],
  [4, 7, 10, 8, 6, 9, 5],
  [2, 5, 6, 4, 3, 5, 2],
  [1, 2, 3, 2, 1, 2, 1],
  [0, 1, 2, 1, 0, 1, 0],
]

type Tx = { id: string; patient: string; amount: string; status: string }

export function DesignFoundationPage() {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [date, setDate] = useState<Date | null>(new Date())
  const [blockId, setBlockId] = useState<string | null>('b2')
  const [symptoms, setSymptoms] = useState<string[]>(['fever'])

  const rows: Tx[] = useMemo(
    () => [
      { id: '1', patient: 'Asha Verma', amount: '₹500', status: 'Paid' },
      { id: '2', patient: 'Rohan Mehta', amount: '₹500', status: 'Paid' },
      { id: '3', patient: 'Walk-in · Kavya', amount: '—', status: 'At clinic' },
    ],
    [],
  )

  return (
    <>
      <SkipLink />
      <div id="main-content" className="mx-auto max-w-[1200px] px-6 py-10 md:px-8 md:py-14">
        <motion.header
          className="mb-12 md:mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <p className="text-primary mb-3 text-sm font-medium tracking-wide">
            Phase 2 · Component library
          </p>
          <h1 className="font-display max-w-2xl text-[1.75rem] leading-tight md:text-[2rem]">
            ClinicEase design language
          </h1>
          <p className="text-text-secondary mt-3 max-w-xl text-[15px] leading-relaxed md:text-base">
            Living gallery for tokens and primitives. Portals will only compose what you see
            here.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button leftIcon={<IconCalendarEvent size={18} stroke={1.5} />}>
              Book appointment
            </Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Open drawer
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                toast.push({
                  tone: 'success',
                  title: 'Token confirmed',
                  description: 'Token #11 · estimated window 10:40–10:55',
                })
              }
            >
              Show toast
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
          </div>
        </motion.header>

        <Banner
          className="mb-10"
          tone="accent"
          icon={<IconBell size={20} stroke={1.5} className="text-accent" />}
        >
          Design system expanding — table, calendar, hour blocks, queue rows, charts, drawer,
          toast.
        </Banner>

        <motion.section
          className="mb-14"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <h2 className="font-display mb-4 text-xl">Color tokens</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {tokens.map((t) => (
              <motion.div key={t.name} variants={staggerItem}>
                <div className={`aspect-[4/3] w-full rounded-[12px] ${t.className}`} />
                <p className="mt-2 text-sm font-medium">{t.name}</p>
                <p className="text-text-muted font-mono text-xs">{t.hex}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <section className="mb-14 grid gap-4 md:grid-cols-3">
          <Card interactive className="md:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <StatusPill tone="info" icon={<IconHeartbeat size={14} />}>
                  Currently serving token #7
                </StatusPill>
                <h3 className="font-display mt-4 text-lg">Your visit with Dr. Mehta</h3>
                <p className="text-text-secondary mt-1 text-sm">
                  Estimated window 10:40–10:55 · Token #11 · 4 of 12 spots filled this hour
                </p>
              </div>
              <StatusPill tone="accent">Upcoming</StatusPill>
            </div>
            <ProgressBar className="mt-6" value={7} max={12} label="Queue progress" />
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="sm">Check in</Button>
              <Button size="sm" variant="ghost">
                Reschedule
              </Button>
            </div>
          </Card>
          <Card tint="primary" className="flex flex-col justify-between">
            <div>
              <IconStethoscope className="text-primary mb-3" size={24} stroke={1.5} />
              <h3 className="font-display text-lg">Guided care</h3>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                Capacity blocks, live tokens, calm ETA language — never false precision.
              </p>
            </div>
            <p className="text-primary mt-6 text-xs font-medium">Metaphor · Care journey</p>
          </Card>
        </section>

        <section className="mb-14 grid gap-4 lg:grid-cols-2">
          <div>
            <h2 className="font-display mb-3 text-xl">Calendar & hour blocks</h2>
            <div className="flex flex-col gap-4">
              <Calendar value={date} onChange={setDate} minDate={new Date()} />
              <HourBlockPicker blocks={hourBlocks} value={blockId} onChange={setBlockId} />
            </div>
          </div>
          <div>
            <h2 className="font-display mb-3 text-xl">Token queue</h2>
            <div className="flex flex-col gap-2">
              <TokenQueueRow
                token={7}
                name="Priya Nair"
                eta="now"
                meta="In room"
                status="in_progress"
                active
                onClick={() => setDrawerOpen(true)}
              />
              <TokenQueueRow
                token={8}
                name="Aman Shah (child)"
                eta="~10:35"
                meta="Dependent"
                status="waiting"
              />
              <TokenQueueRow
                token={9}
                name="Neha Kapoor"
                eta="~10:42"
                status="waiting"
              />
            </div>
            <h2 className="font-display mt-8 mb-3 text-xl">Symptom chips</h2>
            <ChipSelect options={symptomOptions} value={symptoms} onChange={setSymptoms} />
            <p className="text-text-muted mt-2 text-xs">
              Based on what you&apos;ve described, you may want to see a physician — guidance,
              not a diagnosis.
            </p>
          </div>
        </section>

        <section className="mb-14 grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="font-display mb-1 text-xl">Bookings this week</h2>
            <p className="text-text-secondary mb-4 text-sm">Trend chart · brand-skinned</p>
            <TrendChart data={trendData} />
          </Card>
          <Card>
            <h2 className="font-display mb-1 text-xl">Busiest hours</h2>
            <p className="text-text-secondary mb-4 text-sm">Heatmap · admin analytics</p>
            <Heatmap values={heatValues} hours={heatHours} />
          </Card>
        </section>

        <section className="mb-14">
          <h2 className="font-display mb-3 text-xl">Ledger inside a cockpit</h2>
          <Table
            rows={rows}
            rowKey={(r) => r.id}
            columns={[
              { key: 'patient', header: 'Patient', render: (r) => r.patient },
              { key: 'amount', header: 'Amount', align: 'right', render: (r) => r.amount },
              {
                key: 'status',
                header: 'Status',
                render: (r) => (
                  <StatusPill tone={r.status === 'Paid' ? 'success' : 'neutral'}>
                    {r.status}
                  </StatusPill>
                ),
              },
            ]}
          />
        </section>

        <section className="mb-14 grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="font-display mb-4 text-xl">Form controls</h2>
            <div className="flex flex-col gap-4">
              <FormField label="Email" htmlFor="demo-email" hint="Used for confirmations">
                <Input id="demo-email" type="email" placeholder="you@example.com" />
              </FormField>
              <FormField label="Phone" htmlFor="demo-phone" error="Enter a valid mobile number">
                <Input id="demo-phone" type="tel" placeholder="+91 98765 43210" aria-invalid />
              </FormField>
            </div>
          </Card>
          <EmptyState
            icon={<IconUsers size={22} stroke={1.5} />}
            title="No dependents yet"
            description="Add a family member to book visits on their behalf — parent, spouse, or child."
            actionLabel="Add dependent"
            onAction={() => toast.push({ tone: 'info', title: 'Add dependent flow coming next' })}
          />
        </section>

        <section className="border-border bg-surface/70 mb-8 rounded-[var(--radius-lg)] border p-6 md:p-8">
          <h2 className="font-display mb-2 text-xl">Motion & loaders</h2>
          <p className="text-text-secondary mb-6 max-w-lg text-sm">
            Splash pulse respects reduced motion. Buttons press. Lists stagger.
          </p>
          <SplashLoader />
        </section>

        <footer className="text-text-muted border-border flex flex-col gap-2 border-t pt-8 text-sm md:flex-row md:items-center md:justify-between">
          <p>
            See <code className="font-mono text-xs">DESIGN.md</code> for the language lock.
          </p>
          <p className="font-display text-primary text-base font-medium">
            ClinicEase · Your care, simplified
          </p>
        </footer>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm hold"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Confirm & pay</Button>
          </>
        }
      >
        <p className="text-text-secondary text-sm leading-relaxed">
          Token held for 5 minutes. Estimated window 10:40–10:55. This is an estimate, not a
          guarantee.
        </p>
      </Modal>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Patient details"
        footer={
          <Button fullWidth onClick={() => setDrawerOpen(false)}>
            Mark in progress
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-text-muted text-xs">Token</p>
            <p className="font-mono text-lg font-medium">#7</p>
          </div>
          <div>
            <p className="text-text-muted text-xs">Name</p>
            <p className="text-sm font-medium">Priya Nair</p>
          </div>
          <div>
            <p className="text-text-muted text-xs">Intake</p>
            <p className="text-text-secondary text-sm leading-relaxed">
              Mild fever since yesterday. No known allergies. Prefers morning slots.
            </p>
          </div>
        </div>
      </Drawer>
    </>
  )
}
