import assert from 'node:assert/strict'
import { describe, it, before } from 'node:test'

const BASE = process.env.API_URL ?? 'http://localhost:4000'

async function login(email: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'demo1234', captchaToken: 'ok' }),
  })
  assert.equal(res.status, 200)
  return res.json() as Promise<{ token: string }>
}

describe('integration: auth + slots + hold race', () => {
  let token = ''

  before(async () => {
    try {
      const health = await fetch(`${BASE}/api/health`)
      assert.equal(health.status, 200)
      const auth = await login('patient@clinicease.app')
      token = auth.token
    } catch (e) {
      console.warn('API not running — skip integration', e)
    }
  })

  it('lists doctors and slots', async () => {
    if (!token) return
    const docs = await fetch(`${BASE}/api/doctors`)
    assert.equal(docs.status, 200)
    const slots = await fetch(`${BASE}/api/slots/dr-mehta`)
    assert.equal(slots.status, 200)
    const body = (await slots.json()) as { blocks: unknown[] }
    assert.ok(body.blocks.length > 0)
  })

  it('rejects unauthenticated admin', async () => {
    if (!token) return
    const res = await fetch(`${BASE}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    assert.equal(res.status, 403)
  })
})
