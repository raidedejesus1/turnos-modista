// Lógica de disponibilidad: funciones puras, sin React ni navegador. db = { b: reservas, k: bloqueos }.
import { CFG } from '../config.js'

const p = (n) => String(n).padStart(2, '0')
export const ymd = (d) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
export const hm = (m) => `${p(Math.floor(m / 60))}:${p(m % 60)}`
export const svc = (id) => CFG.SERVICES.find((s) => s.id === id)
export const dayOf = (date) => new Date(`${date}T00:00`)
export const fd = (date, o) => dayOf(date).toLocaleDateString('es-AR', o || { weekday: 'long', day: 'numeric', month: 'long' })
const uid = () => Math.random().toString(36).slice(2, 9)

export function mkcode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let r = ''
  for (let i = 0; i < 4; i++) r += c[Math.floor(Math.random() * c.length)]
  return `TUR-${r}`
}

export function bizDays(n = CFG.HORIZON, from = new Date()) {
  const out = []
  for (let i = 0; i < n; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    if (CFG.DAYS.includes(d.getDay())) out.push(ymd(d))
  }
  return out
}

// Inicio (en minutos) de todas las franjas del día, sin importar el servicio.
export function slotStarts() {
  const out = []
  for (const [a, b] of CFG.BLOCKS) for (let s = a; s + CFG.STEP <= b; s += CFG.STEP) out.push(s)
  return out
}

function busy(db, date, ign) {
  return [
    ...db.b.filter((x) => x.date === date && x.id !== ign).map((x) => [x.start, x.start + svc(x.sv).min]),
    ...db.k.filter((x) => x.date === date).map((x) => [x.start, x.end]),
  ]
}

// Horas de inicio disponibles para un servicio en una fecha. Regla central: nada se solapa
// con otra reserva ni con un bloqueo, y un turno no cruza el corte del mediodía ni el cierre.
export function free(db, sv, date, ign = null, now = new Date()) {
  if (!CFG.DAYS.includes(dayOf(date).getDay()) || date < ymd(now)) return []
  const dur = svc(sv).min
  const today = date === ymd(now)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const taken = busy(db, date, ign)
  const out = []
  for (const [a, b] of CFG.BLOCKS) {
    for (let s = a; s + dur <= b; s += CFG.STEP) {
      if (today && s <= nowMin) continue
      if (!taken.some(([x, y]) => s < y && x < s + dur)) out.push(s)
    }
  }
  return out
}

export function slotState(db, date, s) {
  const bk = db.b.find((x) => x.date === date && x.start <= s && s < x.start + svc(x.sv).min)
  if (bk) return { kind: 'booked', bk }
  const k = db.k.find((x) => x.date === date && x.start <= s && s < x.end)
  if (k) return { kind: 'blocked', k }
  return { kind: 'free' }
}

export function addBooking(db, o, now = new Date()) {
  if (!free(db, o.sv, o.date, null, now).includes(o.start)) return null
  const booking = { ...o, id: uid(), code: mkcode() }
  return { db: { ...db, b: [...db.b, booking] }, booking }
}

export function moveBooking(db, id, date, start, now = new Date()) {
  const b = db.b.find((x) => x.id === id)
  if (!b || !free(db, b.sv, date, id, now).includes(start)) return null
  return { ...db, b: db.b.map((x) => (x.id === id ? { ...x, date, start } : x)) }
}

export const cancelBooking = (db, id) => ({ ...db, b: db.b.filter((x) => x.id !== id) })

// Bloquea franjas libres (el taller las reserva sin clienta). Las ocupadas se ignoran.
export function blockSlots(db, date, starts, note = '') {
  const add = []
  for (const s of starts) {
    if (slotState({ b: db.b, k: [...db.k, ...add] }, date, s).kind === 'free') add.push({ id: uid(), date, start: s, end: s + CFG.STEP, note })
  }
  return { ...db, k: [...db.k, ...add] }
}
export const unblock = (db, id) => ({ ...db, k: db.k.filter((x) => x.id !== id) })
export const unblockDay = (db, date) => ({ ...db, k: db.k.filter((x) => x.date !== date) })
