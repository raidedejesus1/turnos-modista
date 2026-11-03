import { hm, svc } from '../lib/availability.js'

export default function BookingCard({ b, admin, children }) {
  const s = svc(b.sv)
  return (
    <article className="flex gap-3 my-2 p-3 rounded-xl border border-line bg-card">
      <div className="min-w-14 text-center">
        <b className="block font-serif text-lg">{hm(b.start)}</b>
        <small className="text-mute">{hm(b.start + s.min)}</small>
      </div>
      <div className="flex-1 min-w-0 break-words">
        <p>
          <b>{b.name}</b>
          {b.demo && <span className="ml-1.5 align-middle text-[11px] px-1.5 rounded bg-surf text-mute">ejemplo</span>}
        </p>
        <p>{s.name} · {b.piece}</p>
        {admin && <p className="text-mute">{b.phone} · {b.code}</p>}
        {children}
      </div>
    </article>
  )
}
