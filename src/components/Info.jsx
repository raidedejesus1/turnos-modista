import { INFO } from '../config.js'
import { btnP, h2 } from './ui.jsx'

const sec = 'mt-6 pt-4 border-t-2 border-dashed border-line'

export default function Info({ go }) {
  return (
    <section>
      <h2 className={h2}>El taller</h2>
      <p className="text-mute">Un taller chico, de trato cercano: te probamos, charlamos y la prenda sale como la imaginaste.</p>

      <div className={sec}>
        <h3 className="font-serif text-xl font-semibold">Qué ofrecemos</h3>
        <ul className="mt-2 space-y-2">
          {INFO.offers.map((o) => (
            <li key={o.title} className="p-3 rounded-xl border border-line bg-card"><b className="font-serif">{o.title}</b><p className="text-mute">{o.text}</p></li>
          ))}
        </ul>
      </div>

      <div className={sec}>
        <h3 className="font-serif text-xl font-semibold">Cómo llegar</h3>
        <p className="mt-2"><b>{INFO.address}</b></p>
        <p className="text-mute">{INFO.directions}</p>
        <a className="inline-flex items-center min-h-11 mt-1 font-semibold text-teal underline" href={INFO.mapsUrl} target="_blank" rel="noopener noreferrer">Abrir en Google Maps</a>
      </div>

      <div className={sec}>
        <h3 className="font-serif text-xl font-semibold">Horarios de atención</h3>
        <dl className="mt-2">
          {INFO.hours.map(([d, h]) => (
            <div key={d} className="flex flex-wrap justify-between gap-x-4 py-1.5 border-b border-line"><dt className="font-medium">{d}</dt><dd>{h}</dd></div>
          ))}
        </dl>
        <p className="mt-2 text-mute">{INFO.hoursNote}</p>
      </div>

      <div className={sec}>
        <h3 className="font-serif text-xl font-semibold">Redes sociales</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {INFO.social.map((s) => (
            <li key={s.label}><a className="inline-flex flex-col justify-center min-h-11 px-4 rounded-xl border border-line bg-card no-underline text-ink" href={s.url} target="_blank" rel="noopener noreferrer"><b>{s.label}</b><span className="text-sm text-mute">{s.handle}</span></a></li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <a href="/" onClick={(e) => { e.preventDefault(); go('/') }} className={btnP}>Reservar un turno de prueba</a>
      </div>
    </section>
  )
}
