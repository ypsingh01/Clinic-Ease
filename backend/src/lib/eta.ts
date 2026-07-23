export function todayISO(d = new Date()) {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  return x.toISOString().slice(0, 10)
}

export function weekdayIndex(dateISO: string) {
  return new Date(dateISO + 'T12:00:00').getDay()
}

export function addHourLabel(start: string) {
  const h = Number(start.slice(0, 2)) + 1
  return `${String(h).padStart(2, '0')}:00`
}

export function etaWindow(blockStart: string, token: number, avgMin = 5, delayMin = 0) {
  const [h, m] = blockStart.split(':').map(Number)
  const startMin = h * 60 + m + (token - 1) * avgMin + delayMin
  const endMin = startMin + avgMin
  const fmt = (mins: number) => {
    const total = ((mins % (24 * 60)) + 24 * 60) % (24 * 60)
    const hh = Math.floor(total / 60)
    const mm = total % 60
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }
  return { estimatedStart: fmt(startMin), estimatedEnd: fmt(endMin) }
}

export function minutesUntilEta(date: string, etaStart: string) {
  const [h, m] = etaStart.split(':').map(Number)
  const target = new Date(
    `${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`,
  )
  return (target.getTime() - Date.now()) / 60000
}

export function timeToMin(t: string) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
