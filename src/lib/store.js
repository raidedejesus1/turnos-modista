import { addBooking, bizDays, blockSlots } from './availability.js'

export const KEY = 'taller-modista:v1'

// Detecta si localStorage está bloqueado (modo privado, cookies desactivadas) o no existe.
export function storageOk() {
  try {
    const k = '__taller_test__'
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

export function loadDb() {
  try {
    const d = JSON.parse(window.localStorage.getItem(KEY))
    if (d && Array.isArray(d.b)) return { b: d.b, k: Array.isArray(d.k) ? d.k : [] }
  } catch {
    /* JSON corrupto o sin acceso: se usan datos de ejemplo */
  }
  return null
}

export function saveDb(db) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db))
    return true
  } catch {
    return false
  }
}

// Datos de ejemplo, generados relativos a hoy (siempre caen en días hábiles futuros).
const SEED = [
  [1, 's', 560, 'Marta Gutiérrez', 'Dobladillo de pantalón de vestir'],
  [1, 'a', 600, 'Lucía Benítez', 'Vestido de fiesta para casamiento'],
  [1, 'm', 840, 'Carolina Peralta', 'Primera prueba de traje a medida'],
  [2, 's', 540, 'Julieta Domínguez', 'Cambio de botones del tapado'],
  [2, 'a', 660, 'Sofía Arregui', 'Ajuste de blazer'],
  [3, 'm', 900, 'Valentina Ortiz', 'Vestido de egresada a medida'],
  [3, 's', 1000, 'Nicolás Ferreyra', 'Bastilla de pantalón'],
  [4, 'a', 560, 'Camila Rossi', 'Pollera para fiesta de 15'],
  [5, 'a', 960, 'Florencia Molina', 'Vestido de madrina'],
]

export function seedDb(now = new Date()) {
  let db = { b: [], k: [] }
  const d = bizDays(10, now)
  SEED.forEach(([i, sv, start, name, piece], n) => {
    const email = `${name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@ejemplo.com`
    const r = addBooking(db, { sv, date: d[i], start, name, phone: `11 5550-01${String(n + 10)}`, email, piece, notes: '', demo: true }, now)
    if (r) db = { ...r.db, b: r.db.b.map((x) => (x.id === r.booking.id ? { ...x, demo: true } : x)) }
  })
  db = blockSlots(db, d[2], [1020, 1040, 1060], 'Entrega de vestidos (ejemplo)')
  return { ...db, k: db.k.map((x) => ({ ...x, demo: true })) }
}
