import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { IconUsers } from '@tabler/icons-react'
import {
  Button,
  Card,
  EmptyState,
  FormField,
  Input,
  Modal,
  StatusPill,
  useToast,
} from '@/components/ui'
import { usePatientData } from '@/patient/PatientDataContext'

export function DependentsPage() {
  const { dependents, addDependent, removeDependent, doctors } = usePatientData()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [bookFor, setBookFor] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [relation, setRelation] = useState<'parent' | 'spouse' | 'child'>('child')
  const [age, setAge] = useState('8')

  const onAdd = (e: FormEvent) => {
    e.preventDefault()
    addDependent({ name, relation, age: Number(age) || 0 })
    toast.push({ tone: 'success', title: 'Dependent added' })
    setOpen(false)
    setName('')
  }

  const activeDoctors = doctors.filter((d) => d.active)

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-text-secondary max-w-xl text-sm leading-relaxed">
          Book visits for family members. Clinicians see the patient name and relation —
          notifications stay on your phone.
        </p>
        <Button onClick={() => setOpen(true)}>Add dependent</Button>
      </div>

      {!dependents.length ? (
        <EmptyState
          icon={<IconUsers size={22} stroke={1.5} />}
          title="No family profiles yet"
          description="Add a parent, spouse, or child to book on their behalf."
          actionLabel="Add dependent"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dependents.map((d) => (
            <Card key={d.id} padding="md" className="flex flex-col">
              <StatusPill tone="info">{d.relation}</StatusPill>
              <h3 className="font-display mt-3 text-lg font-medium">{d.name}</h3>
              <p className="text-text-muted text-sm">Age {d.age}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setBookFor(d.id)}>
                  Book for them
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    removeDependent(d.id)
                    toast.push({ tone: 'info', title: 'Dependent removed' })
                  }}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add dependent"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="dep-form">
              Save
            </Button>
          </>
        }
      >
        <form id="dep-form" className="flex flex-col gap-4" onSubmit={onAdd}>
          <FormField label="Full name" htmlFor="dep-name">
            <Input
              id="dep-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Relation" htmlFor="dep-rel">
            <select
              id="dep-rel"
              className="border-border bg-surface focus:border-primary min-h-[44px] w-full rounded-[var(--radius-control)] border px-3.5 text-[15px] focus:shadow-[var(--focus-ring)] focus:outline-none"
              value={relation}
              onChange={(e) => setRelation(e.target.value as typeof relation)}
            >
              <option value="child">Child</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
            </select>
          </FormField>
          <FormField label="Age" htmlFor="dep-age">
            <Input
              id="dep-age"
              type="number"
              min={0}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </FormField>
        </form>
      </Modal>

      <Modal
        open={Boolean(bookFor)}
        onClose={() => setBookFor(null)}
        title="Choose a doctor"
        footer={
          <Button variant="ghost" onClick={() => setBookFor(null)}>
            Cancel
          </Button>
        }
      >
        <p className="text-text-secondary mb-4 text-sm">
          Pick who this dependent should see. You&apos;ll continue into the normal booking flow.
        </p>
        <div className="flex flex-col gap-2">
          {activeDoctors.map((d) => (
            <Link
              key={d.id}
              to={`/patient/book/${d.id}?dependent=${bookFor}`}
              className="no-underline"
              onClick={() => setBookFor(null)}
            >
              <Card interactive padding="sm" className="flex items-center gap-3">
                <img src={d.photoUrl} alt="" className="size-10 rounded-[var(--radius-control)] object-cover" />
                <div>
                  <p className="font-display text-sm font-medium">{d.name}</p>
                  <p className="text-primary text-xs">{d.specialty}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Modal>
    </div>
  )
}
