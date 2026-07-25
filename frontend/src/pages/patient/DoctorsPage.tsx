import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IconSearch, IconSparkles } from '@tabler/icons-react'
import {
  Banner,
  Button,
  Card,
  ChipSelect,
  Input,
  StatusPill,
} from '@/components/ui'
import { SYMPTOM_MAP, type Specialty } from '@/api/mocks/patientData'
import { useClinic } from '@/clinic/ApiClinicProvider'
import { staggerContainer, staggerItem } from '@/motion/variants'

export function DoctorsPage() {
  // Must use ApiClinicProvider — mock ClinicEngineContext is not mounted in production.
  const clinic = useClinic()
  const doctors = clinic.doctors ?? []
  const [query, setQuery] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [specialty, setSpecialty] = useState<Specialty | 'All'>('All')

  const active = doctors.filter((d) => d.active)

  const suggested = useMemo(() => {
    if (!symptoms.length) return [] as Specialty[]
    const set = new Set<Specialty>()
    symptoms.forEach((id) => {
      SYMPTOM_MAP.find((s) => s.id === id)?.specialties.forEach((sp) => set.add(sp))
    })
    return [...set]
  }, [symptoms])

  const filtered = active.filter((d) => {
    const q = query.trim().toLowerCase()
    const matchesQ =
      !q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)
    const matchesSp = specialty === 'All' || d.specialty === specialty
    const matchesSym = !suggested.length || suggested.includes(d.specialty as Specialty)
    return matchesQ && matchesSp && matchesSym
  })

  return (
    <div className="flex flex-col gap-8">
      <Card padding="lg" tint="care">
        <div className="flex items-start gap-3">
          <div className="bg-surface text-primary flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] shadow-[var(--shadow-soft)]">
            <IconSparkles size={20} stroke={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-medium">Not sure who to see?</h2>
            <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">
              Tell us what you&apos;re feeling for a specialty suggestion. This is guidance —
              not a diagnosis. For urgent symptoms, call the clinic or emergency care.
            </p>
            <ChipSelect
              className="mt-4"
              options={SYMPTOM_MAP.map((s) => ({ id: s.id, label: s.label }))}
              value={symptoms}
              onChange={setSymptoms}
            />
            {suggested.length ? (
              <p className="text-primary mt-3 text-sm font-medium">
                You may want to see: {suggested.join(', ')}
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <IconSearch
            size={18}
            stroke={1.5}
            className="text-text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            className="pl-10"
            placeholder="Search doctors or specialties"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search doctors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', ...Array.from(new Set(active.map((d) => d.specialty)))] as Array<
            Specialty | 'All' | string
          >).map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => setSpecialty(sp as Specialty | 'All')}
              className={
                specialty === sp
                  ? 'bg-primary-tint text-primary border-primary/30 rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-medium'
                  : 'border-border text-text-secondary hover:border-primary/30 rounded-[var(--radius-pill)] border bg-surface px-3 py-1.5 text-xs'
              }
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {filtered.map((d) => (
          <motion.div key={d.id} variants={staggerItem}>
            <Card interactive padding="md" className="flex h-full flex-col">
              <div className="flex items-start gap-3">
                <img
                  src={d.photoUrl || undefined}
                  alt=""
                  className="bg-primary-tint size-12 shrink-0 rounded-2xl object-cover"
                />
                <div className="min-w-0">
                  <h3 className="font-display truncate text-[15px] font-medium">{d.name}</h3>
                  <p className="text-primary text-sm">{d.specialty}</p>
                </div>
              </div>
              <p className="text-text-secondary mt-3 flex-1 text-sm leading-relaxed">{d.bio}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <StatusPill tone="neutral">{(d.availableDays ?? []).join(' · ') || 'Days TBA'}</StatusPill>
                <Link to={`/patient/book/${d.id}`} className="no-underline">
                  <Button size="sm">Book</Button>
                </Link>
              </div>
              <Link
                to={`/patient/doctors/${d.id}`}
                className="text-primary mt-3 text-xs font-medium no-underline"
              >
                View profile
              </Link>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {!filtered.length ? (
        <Banner tone="info">No doctors match those filters. Clear symptoms or search again.</Banner>
      ) : null}
    </div>
  )
}
