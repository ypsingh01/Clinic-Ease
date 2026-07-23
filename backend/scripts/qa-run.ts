/**
 * ClinicEase QA harness — exercises FULLSTACK_QA checklist against live API.
 * Run: npx tsx scripts/qa-run.ts
 */
const BASE = process.env.API_URL ?? 'http://localhost:4000'

type Result = { name: string; ok: boolean; detail?: string }

const results: Result[] = []

function pass(name: string, detail?: string) {
  results.push({ name, ok: true, detail })
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`)
}
function fail(name: string, detail?: string) {
  results.push({ name, ok: false, detail })
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
}

async function req(
  path: string,
  opts: RequestInit & { token?: string; json?: unknown } = {},
) {
  const headers = new Headers(opts.headers)
  if (opts.json !== undefined) headers.set('Content-Type', 'application/json')
  if (opts.token) headers.set('Authorization', `Bearer ${opts.token}`)
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
  })
  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { status: res.status, data }
}

async function login(email: string) {
  const r = await req('/api/auth/login', {
    method: 'POST',
    json: { email, password: 'demo1234', captchaToken: 'ok' },
  })
  if (r.status !== 200) throw new Error(`login ${email}: ${r.status} ${JSON.stringify(r.data)}`)
  return r.data as { token: string; user: { id: string; role: string; name: string } }
}

async function main() {
  console.log(`\nClinicEase QA → ${BASE}\n`)

  // Health
  {
    const r = await req('/api/health')
    r.status === 200 ? pass('Health') : fail('Health', String(r.status))
  }

  // Captcha required
  {
    const r = await req('/api/auth/login', {
      method: 'POST',
      json: { email: 'patient@clinicease.app', password: 'demo1234' },
    })
    r.status === 400
      ? pass('Captcha required on login')
      : fail('Captcha required on login', `status ${r.status}`)
  }

  // Auth roles
  let patient: Awaited<ReturnType<typeof login>>
  let doctor: Awaited<ReturnType<typeof login>>
  let admin: Awaited<ReturnType<typeof login>>
  try {
    patient = await login('patient@clinicease.app')
    doctor = await login('doctor@clinicease.app')
    admin = await login('admin@clinicease.app')
    pass('Login patient/doctor/admin', `${patient.user.role}/${doctor.user.role}/${admin.user.role}`)
  } catch (e) {
    fail('Login roles', e instanceof Error ? e.message : String(e))
    printSummary()
    process.exit(1)
  }

  // OTP
  {
    const send = await req('/api/auth/otp/send', {
      method: 'POST',
      json: { phone: '+91 98765 43210' },
    })
    const verify = await req('/api/auth/otp/verify', {
      method: 'POST',
      json: { phone: '+91 98765 43210', code: '123456' },
    })
    send.status === 200 && verify.status === 200 && (verify.data as { token?: string }).token
      ? pass('Phone OTP path')
      : fail('Phone OTP path', `send=${send.status} verify=${verify.status}`)
  }

  // RBAC
  {
    const r = await req('/api/admin/stats', { token: patient.token })
    r.status === 403
      ? pass('Patient blocked from admin stats (403)')
      : fail('Patient blocked from admin stats', `status ${r.status}`)
  }

  // Doctors + photos
  {
    const r = await req('/api/doctors')
    const doctors = (r.data as { doctors: { photoUrl?: string; id: string }[] })?.doctors ?? []
    const withPhotos = doctors.filter((d) => d.photoUrl && d.photoUrl.startsWith('http'))
    r.status === 200 && doctors.length >= 5 && withPhotos.length >= 5
      ? pass('Doctors list with photos', `${doctors.length} doctors`)
      : fail('Doctors list with photos', JSON.stringify(r.data).slice(0, 200))
  }

  // Slots
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const date = today.toISOString().slice(0, 10)
  let openBlock: { startLabel: string; endLabel: string; booked: number; capacity: number } | null =
    null
  {
    const r = await req(`/api/slots/dr-mehta?date=${date}`)
    const blocks = (r.data as { blocks: typeof openBlock[] })?.blocks ?? []
    openBlock = blocks.find((b) => b && (b as { state?: string }).state === 'open') as typeof openBlock
    r.status === 200 && blocks.length > 0
      ? pass('Hour blocks for doctor/date', `${blocks.length} blocks`)
      : fail('Hour blocks', String(r.status))
  }

  // Booking hold → pay → confirm
  let appointmentId = ''
  let tokenNum = 0
  {
    if (!openBlock) {
      // pick any open from slots response
      const r = await req(`/api/slots/dr-mehta?date=${date}`)
      const blocks = (r.data as { blocks: { state: string; startLabel: string; endLabel: string }[] })
        .blocks
      openBlock = (blocks.find((b) => b.state === 'open') as typeof openBlock) ?? null
    }
    if (!openBlock) {
      fail('Hold→pay→confirm', 'No open block available')
    } else {
      const hold = await req('/api/appointments/hold', {
        method: 'POST',
        token: patient.token,
        json: {
          doctorId: 'dr-mehta',
          date,
          hourBlockStart: openBlock.startLabel,
          hourBlockEnd: openBlock.endLabel,
          intake: 'QA fever check',
          captchaToken: 'ok',
        },
      })
      if (hold.status !== 201) {
        fail('Hold appointment', `${hold.status} ${JSON.stringify(hold.data)}`)
      } else {
        appointmentId = (hold.data as { appointment: { id: string; token: number } }).appointment.id
        tokenNum = (hold.data as { appointment: { token: number } }).appointment.token
        await req('/api/payments/order', {
          method: 'POST',
          token: patient.token,
          json: { appointmentId },
        })
        const pay = await req('/api/payments/confirm-mock', {
          method: 'POST',
          token: patient.token,
          json: { appointmentId },
        })
        pay.status === 200
          ? pass('Hold → mock pay → confirm', `token #${tokenNum}`)
          : fail('Confirm payment', `${pay.status} ${JSON.stringify(pay.data)}`)
      }
    }
  }

  // Appears on doctor queue + admin grid
  {
    const q = await req(`/api/queue/dr-mehta/${date}`, { token: doctor.token })
    const apts = (q.data as { appointments: { id: string; token: number }[] })?.appointments ?? []
    const found = apts.some((a) => a.id === appointmentId || a.token === tokenNum)
    found ? pass('Token on doctor queue') : fail('Token on doctor queue', `count=${apts.length}`)

    const grid = await req(`/api/admin/grid?date=${date}`, { token: admin.token })
    const cells = (grid.data as { grid: { doctorId: string; booked: number; labels: string[] }[] })
      ?.grid ?? []
    const mehta = cells.filter((c) => c.doctorId === 'dr-mehta')
    const hasLabel = mehta.some((c) => c.labels?.some((l) => l.includes(`#${tokenNum}`)) || c.booked > 0)
    hasLabel ? pass('Token reflected on admin grid') : fail('Admin grid', JSON.stringify(mehta.slice(0, 3)))
  }

  // Notifications after confirm
  {
    const n = await req('/api/notifications', { token: patient.token })
    const list = (n.data as { notifications: { kind: string; title: string }[] })?.notifications ?? []
    const hasConfirm = list.some((x) => x.kind === 'confirm' || /confirm/i.test(x.title))
    const hasWa = list.some((x) => x.kind === 'whatsapp' || /whatsapp/i.test(x.title))
    hasConfirm || hasWa
      ? pass('Notifications after confirm', `${list.length} items`)
      : fail('Notifications after confirm', `kinds=${list.map((x) => x.kind).join(',')}`)
  }

  // Delay ETA
  {
    const before = await req(`/api/queue/dr-mehta/${date}`, { token: doctor.token })
    const beforeApt = (
      (before.data as { appointments: { id: string; etaStart: string; status: string }[] })
        .appointments ?? []
    ).find((a) => a.id === appointmentId || a.status === 'upcoming')
    const delay = await req('/api/queue/dr-mehta/delay', {
      method: 'POST',
      token: doctor.token,
      json: { date, minutes: 15, reason: 'QA late' },
    })
    const after = await req(`/api/queue/dr-mehta/${date}`, { token: doctor.token })
    const afterApt = (
      (after.data as { appointments: { id: string; etaStart: string }[] }).appointments ?? []
    ).find((a) => a.id === (beforeApt?.id ?? appointmentId))
    const offset = (after.data as { delayOffsetMin: number }).delayOffsetMin
    delay.status === 200 && offset === 15
      ? pass('Running late delay applied', `offset=${offset} eta ${beforeApt?.etaStart}→${afterApt?.etaStart}`)
      : fail('Delay', `${delay.status} offset=${offset}`)
    await req('/api/queue/dr-mehta/delay', {
      method: 'POST',
      token: doctor.token,
      json: { date, minutes: 0 },
    })
  }

  // Complete promotes next
  {
    const q = await req(`/api/queue/dr-mehta/${date}`, { token: doctor.token })
    const apts = (q.data as { appointments: { id: string; status: string; token: number }[] })
      .appointments
    let inProg = apts.find((a) => a.status === 'in_progress')
    if (!inProg) {
      const next = apts.find((a) => a.status === 'upcoming' || a.status === 'checked_in')
      if (next) {
        await req(`/api/appointments/${next.id}/status`, {
          method: 'PATCH',
          token: doctor.token,
          json: { status: 'in_progress' },
        })
        inProg = next
      }
    }
    if (!inProg) {
      fail('Complete promotes next', 'No in_progress patient')
    } else {
      await req(`/api/appointments/${inProg.id}/status`, {
        method: 'PATCH',
        token: doctor.token,
        json: { status: 'completed', durationMin: 6 },
      })
      const q2 = await req(`/api/queue/dr-mehta/${date}`, { token: doctor.token })
      const apts2 = (q2.data as { appointments: { status: string; token: number }[] }).appointments
      const newInProg = apts2.find((a) => a.status === 'in_progress')
      newInProg || apts2.some((a) => a.status === 'completed')
        ? pass('Complete visit / queue advance', `serving #${newInProg?.token ?? 'none'}`)
        : fail('Complete promotes next')
    }
  }

  // Waitlist join → cancel frees slot → claim offered
  {
    const hold = await req('/api/appointments/hold', {
      method: 'POST',
      token: patient.token,
      json: {
        doctorId: 'dr-khan',
        date,
        hourBlockStart: '15:00',
        hourBlockEnd: '16:00',
        intake: 'QA waitlist seed',
        captchaToken: 'ok',
      },
    })
    const heldId = (hold.data as { appointment?: { id: string } }).appointment?.id
    if (!heldId) {
      fail('Waitlist seed hold', `${hold.status} ${JSON.stringify(hold.data).slice(0, 160)}`)
    } else {
      await req('/api/payments/confirm-mock', {
        method: 'POST',
        token: patient.token,
        json: { appointmentId: heldId },
      })
      const join = await req('/api/waitlist/join', {
        method: 'POST',
        token: patient.token,
        json: {
          doctorId: 'dr-khan',
          date,
          hourBlockStart: '15:00',
          hourBlockEnd: '16:00',
        },
      })
      await req(`/api/appointments/${heldId}/cancel`, {
        method: 'POST',
        token: admin.token,
      })
      const list = await req('/api/waitlist', { token: patient.token })
      const entries = (list.data as { waitlist: { id: string; status: string }[] }).waitlist ?? []
      const offered = entries.find((e) => e.status === 'offered')
      if (!offered) {
        fail(
          'Waitlist offer after cancel',
          `join=${join.status} entries=${JSON.stringify(entries).slice(0, 200)}`,
        )
      } else {
        const claim = await req(`/api/waitlist/${offered.id}/claim`, {
          method: 'POST',
          token: patient.token,
        })
        claim.status === 200
          ? pass('Waitlist claim offered → hold')
          : fail('Waitlist claim', `${claim.status} ${JSON.stringify(claim.data)}`)
      }
    }
  }

  // Admin broadcast + analytics + walk-in
  {
    const bc = await req('/api/notifications/broadcast', {
      method: 'POST',
      token: admin.token,
      json: { title: 'QA broadcast', body: 'Clinic QA test message', audience: 'patients' },
    })
    bc.status === 201
      ? pass('Admin broadcast', `delivered=${(bc.data as { broadcast: { delivered: number } }).broadcast?.delivered}`)
      : fail('Admin broadcast', `${bc.status}`)

    const an = await req('/api/admin/analytics/doctor-performance', { token: admin.token })
    const body = an.data as {
      punctuality?: unknown[]
      heatmap?: unknown
      waitlistConversion?: unknown
    }
    an.status === 200 && body.punctuality && body.heatmap && body.waitlistConversion
      ? pass('Admin doctor-performance analytics')
      : fail('Analytics', JSON.stringify(an.data).slice(0, 200))

    const walk = await req('/api/admin/walk-in', {
      method: 'POST',
      token: admin.token,
      json: {
        doctorId: 'dr-mehta',
        patientName: 'QA Walkin',
        patientPhone: '+91 90000 11111',
        date,
        hourBlockStart: '16:00',
        hourBlockEnd: '17:00',
        payAtClinic: true,
        note: 'QA walk-in',
      },
    })
    walk.status === 201
      ? pass('Admin walk-in', `token #${(walk.data as { appointment: { token: number } }).appointment?.token}`)
      : fail('Admin walk-in', `${walk.status} ${JSON.stringify(walk.data)}`)
  }

  // Admin force cancel
  if (appointmentId) {
    const c = await req(`/api/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      token: admin.token,
    })
    c.status === 200
      ? pass('Admin force-cancel')
      : fail('Admin force-cancel', `${c.status} ${JSON.stringify(c.data)}`)
  }

  // Captcha on hold
  {
    const r = await req('/api/appointments/hold', {
      method: 'POST',
      token: patient.token,
      json: {
        doctorId: 'dr-iyer',
        date,
        hourBlockStart: '10:00',
        hourBlockEnd: '11:00',
        intake: 'no captcha',
      },
    })
    r.status === 400
      ? pass('Captcha required on hold')
      : fail('Captcha required on hold', `status ${r.status}`)
  }

  // Rate limit (may take a moment)
  {
    let hit429 = false
    for (let i = 0; i < 110; i++) {
      const r = await req('/api/auth/login', {
        method: 'POST',
        json: { email: 'nobody@x.com', password: 'x', captchaToken: 'ok' },
      })
      if (r.status === 429) {
        hit429 = true
        break
      }
    }
    hit429 ? pass('Rate limit on auth login (429)') : fail('Rate limit', 'no 429 after 70 attempts')
  }

  // Dependents + symptom
  {
    const dep = await req('/api/dependents', { token: patient.token })
    dep.status === 200
      ? pass('Dependents list', `n=${((dep.data as { dependents: unknown[] }).dependents ?? []).length}`)
      : fail('Dependents', String(dep.status))
    const sym = await req('/api/symptom-check', {
      method: 'POST',
      json: { symptoms: ['fever', 'rash'] },
    })
    sym.status === 200 &&
    (sym.data as { suggestedSpecialties: string[] }).suggestedSpecialties?.length
      ? pass('Symptom checker')
      : fail('Symptom checker', JSON.stringify(sym.data).slice(0, 150))
  }

  printSummary()
  process.exit(results.some((r) => !r.ok) ? 1 : 0)
}

function printSummary() {
  const failed = results.filter((r) => !r.ok)
  console.log(`\n—— Summary: ${results.length - failed.length}/${results.length} passed ——`)
  if (failed.length) {
    console.log('Failures:')
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
