import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { etaWindow, minutesUntilEta, addHourLabel } from '../src/lib/eta.js'

describe('eta math', () => {
  it('computes token ETA windows', () => {
    const { estimatedStart, estimatedEnd } = etaWindow('10:00', 3, 5, 0)
    assert.equal(estimatedStart, '10:10')
    assert.equal(estimatedEnd, '10:15')
  })

  it('applies delay offset', () => {
    const { estimatedStart } = etaWindow('10:00', 1, 5, 15)
    assert.equal(estimatedStart, '10:15')
  })

  it('adds hour labels', () => {
    assert.equal(addHourLabel('09:00'), '10:00')
  })

  it('minutesUntilEta is finite', () => {
    const mins = minutesUntilEta('2099-01-01', '10:00')
    assert.ok(Number.isFinite(mins))
    assert.ok(mins > 0)
  })
})
