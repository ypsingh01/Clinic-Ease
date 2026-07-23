import { Button, Card, FormField, Input, StatusPill, useToast } from '@/components/ui'
import { useDoctorData } from '@/doctor/DoctorDataContext'

export function DoctorSettingsPage() {
  const { settings, updateSettings } = useDoctorData()
  const toast = useToast()

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <Card padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl">Profile</h2>
          <StatusPill tone="info">{settings.specialty}</StatusPill>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label="Display name" htmlFor="dn">
            <Input
              id="dn"
              value={settings.displayName}
              onChange={(e) => updateSettings({ displayName: e.target.value })}
            />
          </FormField>
          <FormField label="Specialty" htmlFor="sp">
            <Input
              id="sp"
              value={settings.specialty}
              onChange={(e) => updateSettings({ specialty: e.target.value })}
            />
          </FormField>
          <FormField
            label="Default capacity (patients/hour)"
            htmlFor="dc"
            hint="Used when painting new availability"
          >
            <Input
              id="dc"
              type="number"
              min={1}
              max={20}
              value={settings.defaultCapacity}
              onChange={(e) =>
                updateSettings({ defaultCapacity: Number(e.target.value) || 1 })
              }
            />
          </FormField>
          <FormField
            label="Running-late shortcut (minutes)"
            htmlFor="dl"
            hint="One-tap delay on the queue screen"
          >
            <Input
              id="dl"
              type="number"
              min={5}
              max={60}
              step={5}
              value={settings.delayMinutes}
              onChange={(e) =>
                updateSettings({ delayMinutes: Number(e.target.value) || 15 })
              }
            />
          </FormField>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="font-display text-xl">Notifications</h2>
        <p className="text-text-secondary mt-1 text-sm">
          In-app alerts for clinic operations. WhatsApp patient messages stay on the patient side.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <ToggleRow
            label="Alert me on no-shows"
            checked={settings.notifyOnNoShow}
            onChange={(v) => updateSettings({ notifyOnNoShow: v })}
          />
          <ToggleRow
            label="Alert when waitlist claims a freed token"
            checked={settings.notifyOnWaitlistClaim}
            onChange={(v) => updateSettings({ notifyOnWaitlistClaim: v })}
          />
        </div>
        <Button
          className="mt-6"
          onClick={() =>
            toast.push({ tone: 'success', title: 'Settings saved', description: 'Mock persistence.' })
          }
        >
          Save settings
        </Button>
      </Card>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="border-border flex min-h-[44px] items-center justify-between rounded-[12px] border px-4 text-left"
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}
        aria-hidden
      >
        <span
          className={`bg-surface absolute top-0.5 size-5 rounded-full transition-transform ${checked ? 'left-5' : 'left-0.5'}`}
        />
      </span>
    </button>
  )
}
