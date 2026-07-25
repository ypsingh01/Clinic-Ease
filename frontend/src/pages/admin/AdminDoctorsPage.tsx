import { useState, type FormEvent } from 'react'
import {
  Button,
  Card,
  Drawer,
  FormField,
  Input,
  StatusPill,
  useToast,
} from '@/components/ui'
import { useAdminData } from '@/admin/AdminDataContext'
import type { AdminDoctor } from '@/api/mocks/adminData'

export function AdminDoctorsPage() {
  const { doctors, toggleDoctor, setCapacity, addDoctor, updateDoctor } = useAdminData()
  const toast = useToast()
  const [selected, setSelected] = useState<AdminDoctor | null>(null)
  const [editName, setEditName] = useState('')
  const [editSpecialty, setEditSpecialty] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('General physician')
  const [capacity, setCap] = useState('10')

  const openDoctor = (d: AdminDoctor) => {
    setSelected(d)
    setEditName(d.name)
    setEditSpecialty(d.specialty)
  }

  const onAdd = (e: FormEvent) => {
    e.preventDefault()
    const initials = name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    addDoctor({
      name: name.startsWith('Dr') ? name : `Dr. ${name}`,
      specialty,
      initials: initials || 'DR',
      capacity: Number(capacity) || 10,
    })
    toast.push({ tone: 'success', title: 'Doctor added to roster' })
    setOpenAdd(false)
    setName('')
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-text-secondary max-w-xl text-sm leading-relaxed">
          Fixed roster of 5–6 doctors. Deactivate instead of deleting — bookings stay intact.
        </p>
        <Button onClick={() => setOpenAdd(true)}>Add doctor</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {doctors.map((d) => (
          <Card
            key={d.id}
            interactive
            padding="md"
            className={!d.active ? 'opacity-70' : ''}
            onClick={() => openDoctor(d)}
          >
            <div className="flex items-start gap-3">
              <div className="bg-primary-tint text-primary font-display flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-card)] text-sm font-medium">
                {d.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-display text-[15px] font-medium">{d.name}</h3>
                  <StatusPill tone={d.active ? 'success' : 'neutral'}>
                    {d.active ? 'Active' : 'Inactive'}
                  </StatusPill>
                </div>
                <p className="text-primary text-sm">{d.specialty}</p>
                <p className="text-text-muted mt-2 text-xs">
                  {d.capacity}/hr capacity · {d.tokensToday} tokens today
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Doctor'}
        footer={
          selected ? (
            <div className="flex w-full gap-2">
              <Button
                className="flex-1"
                variant="ghost"
                onClick={() => {
                  toggleDoctor(selected.id)
                  toast.push({
                    tone: 'info',
                    title: selected.active ? 'Doctor deactivated' : 'Doctor activated',
                  })
                  setSelected(null)
                }}
              >
                {selected.active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button className="flex-1" onClick={() => setSelected(null)}>
                Done
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="flex flex-col gap-4">
            <FormField label="Display name" htmlFor="edit-name">
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </FormField>
            <FormField label="Specialty" htmlFor="edit-sp">
              <Input
                id="edit-sp"
                value={editSpecialty}
                onChange={(e) => setEditSpecialty(e.target.value)}
              />
            </FormField>
            <Button
              size="sm"
              onClick={() => {
                updateDoctor(selected.id, {
                  name: editName.trim() || selected.name,
                  specialty: editSpecialty.trim() || selected.specialty,
                  initials: (editName.trim() || selected.name)
                    .replace(/^Dr\.?\s*/i, '')
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase(),
                })
                toast.push({ tone: 'success', title: 'Doctor profile updated' })
                setSelected({
                  ...selected,
                  name: editName.trim() || selected.name,
                  specialty: editSpecialty.trim() || selected.specialty,
                })
              }}
            >
              Save profile
            </Button>
            <FormField label="Hourly capacity override" htmlFor="cap-ov">
              <Input
                id="cap-ov"
                type="number"
                min={1}
                max={20}
                value={selected.capacity}
                onChange={(e) => {
                  const n = Number(e.target.value) || 1
                  setCapacity(selected.id, n)
                  setSelected({ ...selected, capacity: n })
                }}
              />
            </FormField>
            <p className="text-text-muted text-xs leading-relaxed">
              Edits sync to patient booking and the live schedule grid immediately.
            </p>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Add doctor"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenAdd(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-doc">
              Save to roster
            </Button>
          </>
        }
      >
        <form id="add-doc" className="flex flex-col gap-4" onSubmit={onAdd}>
          <FormField label="Name" htmlFor="dn">
            <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} required />
          </FormField>
          <FormField label="Specialty" htmlFor="ds">
            <Input
              id="ds"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Default capacity / hour" htmlFor="dc">
            <Input
              id="dc"
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(e) => setCap(e.target.value)}
            />
          </FormField>
        </form>
      </Drawer>
    </div>
  )
}
