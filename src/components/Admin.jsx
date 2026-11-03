import { useState } from 'react'
import { CFG } from '../config.js'
import { bizDays, blockSlots, cancelBooking, fd, hm, slotStarts, slotState, unblock, unblockDay, ymd } from '../lib/availability.js'
import { seedDb } from '../lib/store.js'
import BookingCard from './BookingCard.jsx'
import { Field, btn, btnL, btnP, h2 } from './ui.jsx'

function Login({ onOk }) {
  const [pw, setPw] = useState('')
  const [er, setEr] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (pw === CFG.ADMIN_PASSWORD) onOk()
    else setEr('La clave no es correcta.')
  }
  return (
    <section>
      <h2 className={h2}>Panel del taller</h2>
      <p className="text-mute mb-3">Ingresá la clave para ver las reservas.</p>
      <form onSubmit={submit} noValidate>
        <Field label="Clave" name="pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} error={er} />
        <button type="submit" className={btnP}>Entrar</button>
      </form>
    </section>
  )
}

function Panel({ db, setDb, setAdm, onNew, onMove }) {
  const days = bizDays()
  const [date, setDate] = useState(days[0])
  const [note, setNote] = useState('')
  const [del, setDel] = useState(null)
  const t = ymd(new Date())
  const w = ymd(new Date(Date.now() + 7 * 864e5))
  const up = db.b.filter((b) => b.date >= t).sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)
  const dayBlocks = db.k.filter((k) => k.date === date).length
  const groups = up.reduce((g, b) => ((g[b.date] ||= []).push(b), g), {})
  const cell = 'min-h-12 rounded-xl border p-1.5 text-center text-sm leading-tight'

  return (
    <section>
      <h2 className={h2}>Agenda del taller</h2>
      <div className="grid grid-cols-3 gap-2 my-3 text-center">
        {[[up.filter((b) => b.date === t).length, 'Hoy'], [up.filter((b) => b.date <= w).length, 'Próx. 7 días'], [up.length, 'Futuros']].map(([n, l]) => (
          <div key={l} className="p-2.5 rounded-xl bg-surf"><b className="block font-serif text-2xl text-teal">{n}</b><span className="text-xs text-mute">{l}</span></div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={btnP} onClick={onNew}>+ Reserva por teléfono</button>
        <button className={btn} onClick={() => setAdm(false)}>Salir</button>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-dashed border-line">
        <h3 className="font-serif text-xl font-semibold">Bloquear horas</h3>
        <p className="text-mute">Tocá una franja libre para reservarla sin clienta: deja de ofrecerse en la disponibilidad. Tocá una bloqueada para liberarla.</p>
        <label className="block my-3 font-medium">Día
          <select className="block w-full min-h-12 mt-1 px-3 rounded-lg border border-line bg-card text-ink font-normal" value={date} onChange={(e) => setDate(e.target.value)}>
            {days.map((d) => <option key={d} value={d}>{fd(d)}</option>)}
          </select>
        </label>
        <label className="block my-3 font-medium">Motivo <i className="not-italic font-normal text-mute">(opcional)</i>
          <input className="block w-full min-h-12 mt-1 px-3 rounded-lg border border-line bg-card text-ink font-normal" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej.: entrega de vestidos" />
        </label>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2">
          {slotStarts().map((s) => {
            const st = slotState(db, date, s)
            if (st.kind === 'booked') return <div key={s} className={`${cell} border-line bg-surf text-mute`} title={`${st.bk.name} (reserva)`}><b className="block">{hm(s)}</b>{st.bk.name.split(' ')[0]}</div>
            if (st.kind === 'blocked') return <button key={s} aria-pressed="true" title={st.k.note || 'Bloqueada'} onClick={() => setDb(unblock(db, st.k.id))} className={`${cell} border-terra text-ink bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,var(--line)_6px,var(--line)_12px)]`}><b className="block">{hm(s)}</b>Bloqueada</button>
            return <button key={s} aria-pressed="false" onClick={() => setDb(blockSlots(db, date, [s], note.trim()))} className={`${cell} border-teal bg-card hover:bg-surf`}><b className="block">{hm(s)}</b>Libre</button>
          })}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button className={btn} onClick={() => setDb(blockSlots(db, date, slotStarts(), note.trim()))}>Bloquear todo el día</button>
          <button className={btn} disabled={!dayBlocks} onClick={() => setDb(unblockDay(db, date))}>Liberar bloqueos del día{dayBlocks ? ` (${dayBlocks})` : ''}</button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-dashed border-line">
        <h3 className="font-serif text-xl font-semibold">Próximas reservas</h3>
        {!up.length && <p className="text-mute">No hay reservas futuras.</p>}
        {Object.entries(groups).map(([d, list]) => (
          <div key={d}>
            <h4 className="mt-4 font-serif font-semibold capitalize">{fd(d)}</h4>
            {list.map((b) => (
              <BookingCard key={b.id} b={b} admin>
                {del === b.id ? (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span>¿Cancelamos este turno?</span>
                    <button className={btnP} onClick={() => { setDb(cancelBooking(db, b.id)); setDel(null) }}>Sí, cancelar</button>
                    <button className={btn} onClick={() => setDel(null)}>No</button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button className={btn} onClick={() => onMove(b.id)}>Mover</button>
                    <button className={btn} onClick={() => setDel(b.id)}>Cancelar</button>
                  </div>
                )}
              </BookingCard>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-6"><button className={btnL} onClick={() => setDb(seedDb())}>Restablecer datos de ejemplo</button></div>
    </section>
  )
}

export default function Admin({ db, setDb, adm, setAdm, onNew, onMove }) {
  // Sin clave no se renderiza ninguna reserva.
  if (!adm) return <Login onOk={() => setAdm(true)} />
  return <Panel db={db} setDb={setDb} setAdm={setAdm} onNew={onNew} onMove={onMove} />
}
