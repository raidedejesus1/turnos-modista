import { useState } from 'react'
import { cancelBooking, fd } from '../lib/availability.js'
import BookingCard from './BookingCard.jsx'
import { Banner, Field, btn, btnL, btnP, h2 } from './ui.jsx'

export default function Mine({ db, setDb, look, setLook, onMove }) {
  const [f, setF] = useState({ code: '', email: '' })
  const [er, setEr] = useState('')
  const [ask, setAsk] = useState(false)
  const [msg, setMsg] = useState('')
  const b = look && db.b.find((x) => x.id === look)

  const find = (e) => {
    e.preventDefault()
    const c = f.code.trim().toUpperCase()
    const m = f.email.trim().toLowerCase()
    const r = db.b.find((x) => x.code === c && x.email.toLowerCase() === m)
    if (r) { setLook(r.id); setEr(''); setMsg('') }
    else setEr('No encontramos un turno con esos datos. Revisá el código y el email.')
  }
  const cancel = () => { setDb(cancelBooking(db, b.id)); setLook(null); setAsk(false); setMsg('Turno cancelado. La franja quedó libre.') }

  return (
    <section>
      {msg && <Banner>{msg}</Banner>}
      {!b ? (
        <>
          <h2 className={h2}>Mi reserva</h2>
          <p className="text-mute mb-3">Ingresá el código que te dimos y tu email.</p>
          <form onSubmit={find} noValidate>
            <Field label="Código (ej. TUR-4F7K)" name="code" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} error={er} />
            <Field label="Email" name="email" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            <button type="submit" className={btnP}>Buscar mi turno</button>
          </form>
        </>
      ) : (
        <>
          <h2 className={h2}>Tu turno</h2>
          <p className="text-mute">{fd(b.date)}</p>
          <BookingCard b={b}>
            {ask ? (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span>¿Cancelamos este turno?</span>
                <button className={btnP} onClick={cancel}>Sí, cancelar</button>
                <button className={btn} onClick={() => setAsk(false)}>No</button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                <button className={btn} onClick={() => onMove(b.id)}>Mover</button>
                <button className={btn} onClick={() => setAsk(true)}>Cancelar</button>
              </div>
            )}
          </BookingCard>
          <button className={btnL} onClick={() => setLook(null)}>Buscar otro</button>
        </>
      )}
    </section>
  )
}
