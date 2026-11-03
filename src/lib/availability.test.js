import test from 'node:test'
import assert from 'node:assert/strict'
import { addBooking, blockSlots, bizDays, free, moveBooking, slotStarts, unblockDay } from './availability.js'
import { waText, waUrl } from './whatsapp.js'

const now = new Date(2026, 10, 2, 8, 0) // lunes 2/11/2026 08:00
const D = '2026-11-04' // miércoles
const empty = () => ({ b: [], k: [] })
const mk = (sv, start, date = D) => ({ sv, date, start, name: 'Ana', phone: '1', email: 'a@b.c', piece: 'x' })

test('franjas de 20 min, 9-13 y 14-18', () => {
  const s = slotStarts()
  assert.equal(s.length, 24)
  assert.equal(s[0], 540)
  assert.equal(s.at(-1), 1060)
  assert.ok(!s.includes(780))
})

test('un turno ocupa la franja y no se ofrece de nuevo', () => {
  const r = addBooking(empty(), mk('s', 600), now)
  assert.ok(r)
  assert.ok(!free(r.db, 's', D, null, now).includes(600))
  assert.equal(addBooking(r.db, mk('s', 600), now), null)
})

test('no se solapa ni parcialmente (40 y 60 min)', () => {
  const r = addBooking(empty(), mk('a', 600), now) // 10:00-10:40
  const f = free(r.db, 'a', D, null, now)
  assert.ok(!f.includes(580) && !f.includes(600) && !f.includes(620))
  assert.ok(f.includes(560) && f.includes(640))
  const g = free(r.db, 'm', D, null, now) // 60 min
  for (const x of [560, 580, 600, 620]) assert.ok(!g.includes(x))
  assert.ok(g.includes(540) && g.includes(640))
})

test('no cruza el mediodía ni pasa de las 18:00', () => {
  const m = free(empty(), 'm', D, null, now)
  assert.equal(Math.max(...m.filter((s) => s < 780)), 720)
  assert.ok(!m.includes(740))
  assert.equal(Math.max(...m), 1020)
})

test('fines de semana y fechas pasadas no tienen turnos', () => {
  assert.deepEqual(free(empty(), 's', '2026-11-07', null, now), [])
  assert.deepEqual(free(empty(), 's', '2026-10-30', null, now), [])
})

test('hoy no se ofrecen horas que ya pasaron', () => {
  const f = free(empty(), 's', '2026-11-02', null, new Date(2026, 10, 2, 10, 5))
  assert.equal(Math.min(...f), 620)
})

test('las horas bloqueadas no se ofrecen y no se bloquea lo reservado', () => {
  let db = addBooking(empty(), mk('s', 540), now).db
  db = blockSlots(db, D, [540, 560, 580], 'Taller')
  assert.equal(db.k.length, 2)
  const f = free(db, 'a', D, null, now) // 40 min: no puede pisar 560-600
  assert.ok(!f.includes(540) && !f.includes(560) && !f.includes(580))
  assert.ok(f.includes(600))
  assert.ok(!free(db, 's', D, null, now).includes(560))
  db = unblockDay(db, D)
  assert.ok(free(db, 's', D, null, now).includes(560))
})

test('mover una reserva respeta las reglas', () => {
  let { db, booking } = addBooking(empty(), mk('s', 600), now)
  db = addBooking(db, mk('s', 620), now).db
  assert.equal(moveBooking(db, booking.id, D, 620, now), null)
  const moved = moveBooking(db, booking.id, D, 640, now)
  assert.equal(moved.b.find((x) => x.id === booking.id).start, 640)
  assert.ok(moveBooking(db, booking.id, D, 600, now)) // puede quedarse donde está
})

test('bizDays solo devuelve días hábiles', () => {
  assert.ok(bizDays(14, now).every((d) => new Date(`${d}T00:00`).getDay() % 6 !== 0))
})

test('texto de WhatsApp con resumen', () => {
  const { booking } = addBooking(empty(), mk('a', 600), now)
  const t = waText(booking)
  assert.match(t, /Hola, soy Ana/)
  assert.match(t, /10:00 a 10:40/)
  assert.match(t, new RegExp(booking.code))
  assert.ok(waUrl(t).startsWith('https://wa.me/?text='))
})
