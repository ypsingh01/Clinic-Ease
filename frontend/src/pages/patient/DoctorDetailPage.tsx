import { Link, Navigate, useParams } from 'react-router-dom'
import { IconArrowLeft, IconCurrencyRupee } from '@tabler/icons-react'
import { Button, Card, StatusPill } from '@/components/ui'
import { useClinic } from '@/clinic/ApiClinicProvider'

export function DoctorDetailPage() {
  const { doctorId } = useParams()
  const { getDoctor } = useClinic()
  const doctor = doctorId ? getDoctor(doctorId) : undefined
  if (!doctor) return <Navigate to="/patient/doctors" replace />

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        to="/patient/doctors"
        className="text-text-secondary hover:text-primary inline-flex items-center gap-1 text-sm no-underline"
      >
        <IconArrowLeft size={16} stroke={1.5} /> Back to doctors
      </Link>

      <Card padding="lg" className="overflow-hidden">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <img
            src={doctor.photoUrl}
            alt=""
            className="size-20 shrink-0 rounded-[var(--radius-card)] object-cover shadow-[var(--shadow-soft)]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-medium">{doctor.name}</h2>
                <p className="text-primary mt-1">{doctor.specialty}</p>
              </div>
              <StatusPill tone="info">{doctor.capacityPerHour}/hour capacity</StatusPill>
            </div>
            <p className="text-text-secondary mt-4 text-sm leading-relaxed">{doctor.bio}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {doctor.availableDays.map((d) => (
                <StatusPill key={d} tone="neutral">
                  {d}
                </StatusPill>
              ))}
            </div>
            <p className="text-text-muted mt-4 inline-flex items-center gap-1 text-sm">
              <IconCurrencyRupee size={16} stroke={1.5} />
              Consultation fee ₹{doctor.feeInr}
            </p>
            <div className="mt-6">
              <Link to={`/patient/book/${doctor.id}`} className="no-underline">
                <Button>Book appointment</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
