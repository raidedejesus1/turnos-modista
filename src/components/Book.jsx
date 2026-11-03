import { useRef, useState } from 'react'
import { CFG } from '../config.js'
import { addBooking, bizDays, fd, free, hm, moveBooking, svc } from '../lib/availability.js'
import { waText, waUrl } from '../lib/whatsapp.js'
import { Banner, Field, btn, btnL, btnP, h2 } from './ui.jsx'

const EMPTY = { name: '', phone: '', email: '', piece: '', notes: '' }

export default function Book({ db, setDb, flow, onLeave }) {
  const booking = flow?.type === 'move' ? db.b.find((x) => x.id === flow.id) : null
  const first = booking ? 2 : 1
  const [step, setStep] = useState(first)
  const [sv, setSv] = useState(booking?.sv ?? null)
  const [date, setDate] = useState(null)
  const [start, setStart] = useState(null)
  const [f, setF] = useState(EMPTY)
  const [er, setEr] = useState({})
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(null)
  const formRef = useRef(null)

  if (flow?.type === 'move' && !booking && !done) {
    return (
      <section>
        <h2 className={h2}>Ese turno ya no existe</h2>
        <p className="text-mute mb-3">Puede que se haya cancelado desde otra pestaña.</p>
        <button className={btnP} onClick={() => onLeave(flow.back)}>Volver</button>
      </section>
    )
  }

  const back = () => {
    setMsg('')
    if (step <= first) onLeave(flow.back, booking?.id)
    else setStep(step - 1)
  }
  const reset = () => { setDone(null); setStep(1); setSv(null); setDate(null); setStart(null); setF(EMPTY); setEr({}); setMsg('') }

  const pickTime = (s) => {
    setMsg('')
    if (booking) {
      const next = moveBooking(db, booking.id, date, s)
      if (next) { setDb(next); setDone({ b: { ...booking, date, start: s }, moved: true }) }
      else { setMsg('Ese horario se ocupó recién. Elegí otro.'); setStep(2) }
    } else { setStart(s); setStep(4) }
  }

  const submit = (e) => {
    e.preventDefault()
    const x = {}
    if (!f.name.trim()) x.name = 'Contanos tu nombre.'
    if (f.phone.replace(/\D/g, '').length < 8) x.phone = 'Ingresá un teléfono válido, con característica.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) x.email = 'Ingresá un email válido.'
    if (!f.piece.trim()) x.piece = 'Decinos qué prenda o evento es.'
    setEr(x)
    if (Object.keys(x).length) {
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    const r = addBooking(db, { sv, date, start, name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim(), piece: f.piece.trim(), notes: f.notes.trim() })
    if (r) { setDb(r.db); setDone({ b: r.booking }) }
    else { setMsg('Ese horario se ocupó recién. Elegí otro.'); setStep(3) }
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  if (done) {
    const b = done.b
    const s = svc(b.sv)
    return (
      <section className="my-4 p-4 rounded-2xl border border-line bg-card">
        <h2 className={`${h2} mt-0`}>{done.moved ? '¡Listo, movimos tu turno!' : '¡Turno reservado!'}</h2>
        <p><b>{fd(b.date)}</b> a las <b>{hm(b.start)}</b> ({s.name}, {s.min} min).</p>
        <p className="my-2">Código de reserva: <span className="font-serif text-2xl font-semibold tracking-wider text-terra">{b.code}</span></p>
        <p className="text-mute">Guardalo: con el código y tu email podés mover o cancelar el turno en “Mi reserva”.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <a className={btnP} href={waUrl(waText(b, done.moved))} target="_blank" rel="noopener noreferrer">Enviar resumen por WhatsApp</a>
          <button className={btn} onClick={() => onLeave('/mi-reserva', b.id)}>Ver mi reserva</button>
          {flow ? (
            <button className={btnL} onClick={() => onLeave(flow.back, b.id)}>{flow.back === '/admin' ? 'Volver al panel' : 'Volver'}</button>
          ) : (
            <button className={btnL} onClick={reset}>Reservar otro turno</button>
          )}
        </div>
      </section>
    )
  }

  const Back = () => (flow || step > 1 ? <button className={btnL} onClick={back}>← Volver</button> : null)
  const times = step === 3 ? free(db, sv, date, booking?.id) : []

  return (
    <section>
      {msg && <Banner>{msg}</Banner>}
      {step === 1 && (
        <>
          <Back />
          <h2 className={h2}>¿Qué necesitás arreglar?</h2>
          <p className="text-mute mb-3">Elegí una opción y te mostramos los horarios libres de verdad, sin llamar.</p>
          {CFG.SERVICES.map((x) => (
            <button key={x.id} onClick={() => { setSv(x.id); setStep(2) }} className="grid grid-cols-[1fr_auto] gap-x-3 w-full text-left my-2.5 p-4 rounded-2xl border border-line bg-card hover:border-terra">
              <div><b className="font-serif text-lg">{x.name}</b><span className="block text-mute">{x.sub}</span></div>
              <i className="not-italic font-semibold text-teal">{x.min} min</i>
              <small className="col-span-2 mt-1 text-mute">{x.txt}</small>
            </button>
          ))}
        </>
      )}
      {step === 2 && (
        <>
          <Back />
          <h2 className={h2}>{booking ? '¿A qué día lo movemos?' : '¿Qué día te queda bien?'}</h2>
          <p className="text-mute mb-3">{svc(sv).name} · {svc(sv).min} min</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
            {bizDays().map((d) => {
              const n = free(db, sv, d, booking?.id).length
              return (
                <button key={d} disabled={!n} onClick={() => { setDate(d); setStep(3) }} className="flex flex-col items-center min-h-12 p-1.5 rounded-xl border border-teal bg-card leading-tight hover:bg-surf disabled:border-dashed disabled:border-line disabled:opacity-60 disabled:bg-transparent">
                  <span>{fd(d, { weekday: 'short' })}</span>
                  <b className="font-serif text-xl">{+d.slice(8)}</b>
                  <small className="text-xs text-mute">{fd(d, { month: 'short' })}</small>
                  <em className="not-italic text-xs">{n ? `${n} libres` : 'Completo'}</em>
                </button>
              )
            })}
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <Back />
          <h2 className={h2}>¿A qué hora?</h2>
          <p className="text-mute mb-3">{fd(date)} · {svc(sv).name}</p>
          {times.length ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
              {times.map((s) => (
                <button key={s} onClick={() => pickTime(s)} className="min-h-12 rounded-xl border border-teal bg-card font-medium hover:bg-surf">{hm(s)}</button>
              ))}
            </div>
          ) : <p>Ese día ya no quedan horarios. Probá con otro.</p>}
        </>
      )}
      {step === 4 && (
        <>
          <Back />
          <h2 className={h2}>Tus datos</h2>
          <p className="text-mute mb-3">{svc(sv).name} · {fd(date)} a las {hm(start)}</p>
          <form ref={formRef} onSubmit={submit} noValidate>
            <Field label="Nombre y apellido" name="name" autoComplete="name" value={f.name} onChange={set('name')} error={er.name} />
            <Field label="Teléfono" name="phone" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} error={er.phone} />
            <Field label="Email" name="email" type="email" autoComplete="email" value={f.email} onChange={set('email')} error={er.email} />
            <Field label="¿Qué prenda o evento es?" name="piece" value={f.piece} onChange={set('piece')} error={er.piece} />
            <Field label="Algo más que quieras contarnos" optional name="notes" value={f.notes} onChange={set('notes')} />
            <button type="submit" className={btnP}>Confirmar turno</button>
          </form>
        </>
      )}
    </section>
  )
}
