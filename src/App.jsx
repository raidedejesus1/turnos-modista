import { useCallback, useEffect, useState } from 'react'
import { INFO } from './config.js'
import Admin from './components/Admin.jsx'
import Book from './components/Book.jsx'
import Info from './components/Info.jsx'
import Mine from './components/Mine.jsx'
import { Banner } from './components/ui.jsx'
import { KEY, loadDb, saveDb, seedDb, storageOk } from './lib/store.js'

const ROUTES = { '/': 'book', '/mi-reserva': 'mine', '/el-taller': 'info', '/admin': 'admin' }
const TABS = [['/', 'Reservar'], ['/mi-reserva', 'Mi reserva'], ['/el-taller', 'El taller'], ['/admin', 'Panel']]
const norm = (p) => p.replace(/\/+$/, '') || '/'

function usePath() {
  const [path, setPath] = useState(() => norm(window.location.pathname))
  useEffect(() => {
    const f = () => setPath(norm(window.location.pathname))
    window.addEventListener('popstate', f)
    return () => window.removeEventListener('popstate', f)
  }, [])
  const go = useCallback((to) => {
    window.history.pushState(null, '', to)
    setPath(norm(to))
    window.scrollTo(0, 0)
  }, [])
  return [path, go]
}

const Logo = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
    <circle cx="22" cy="22" r="19" fill="none" stroke="var(--terra)" strokeWidth="3" />
    <circle cx="22" cy="22" r="14" fill="none" stroke="var(--terra)" strokeWidth="1.5" strokeDasharray="3 3" />
    <g fill="var(--teal)"><circle cx="17" cy="18" r="2" /><circle cx="27" cy="18" r="2" /><circle cx="17" cy="26" r="2" /><circle cx="27" cy="26" r="2" /></g>
    <path d="M17 18L27 26M27 18L17 26" stroke="var(--teal)" strokeWidth="1.2" />
  </svg>
)

export default function App() {
  const [path, go] = usePath()
  const [canStore] = useState(storageOk)
  const [saveFail, setSaveFail] = useState(false)
  const [db, setDbState] = useState(() => (canStore && loadDb()) || seedDb())
  const [adm, setAdmState] = useState(() => { try { return sessionStorage.getItem('adm') === '1' } catch { return false } })
  const [flow, setFlow] = useState(null)
  const [look, setLook] = useState(null)

  const setDb = useCallback((next) => {
    setDbState(next)
    if (canStore && !saveDb(next)) setSaveFail(true)
  }, [canStore])

  const setAdm = (v) => {
    setAdmState(v)
    try { v ? sessionStorage.setItem('adm', '1') : sessionStorage.removeItem('adm') } catch { /* sin sessionStorage */ }
  }

  useEffect(() => { if (canStore && !loadDb()) saveDb(db) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const f = (e) => { if (e.key === KEY) { const d = loadDb(); if (d) setDbState(d) } }
    window.addEventListener('storage', f)
    return () => window.removeEventListener('storage', f)
  }, [])

  const nav = (to) => { setFlow(null); go(to) }
  const startFlow = (fl) => { setFlow({ ...fl, key: Date.now() }); go('/') }
  const leave = (to, id) => { setFlow(null); if (id) setLook(id); go(to) }
  const route = ROUTES[path] || 'book'

  return (
    <div className="max-w-[720px] mx-auto px-4 pt-3 pb-10">
      <header className="pb-3 border-b-2 border-dashed border-line">
        <a href="/" onClick={(e) => { e.preventDefault(); nav('/') }} className="flex items-center gap-3 pt-2 no-underline text-ink">
          <Logo />
          <div>
            <h1 className="font-serif text-2xl font-semibold leading-tight">{INFO.name}</h1>
            <p className="text-sm text-mute">Taller de costura · turnos de prueba</p>
          </div>
        </a>
        <nav aria-label="Secciones" className="flex gap-1.5 mt-3 overflow-x-auto">
          {TABS.map(([to, label]) => (
            <a key={to} href={to} onClick={(e) => { e.preventDefault(); nav(to) }} aria-current={route === ROUTES[to] ? 'page' : undefined}
              className="flex-none inline-flex items-center min-h-11 px-4 rounded-full border border-line text-sm font-medium no-underline text-ink aria-[current=page]:bg-teal aria-[current=page]:border-teal aria-[current=page]:text-bg">
              {label}
            </a>
          ))}
        </nav>
      </header>

      {!canStore && (
        <Banner role="alert">Tu navegador tiene bloqueado el almacenamiento local (por ejemplo, en modo privado) o no lo admite. Podés usar la agenda igual, pero las reservas se perderán al recargar o cerrar la pestaña.</Banner>
      )}
      {canStore && saveFail && (
        <Banner role="alert">No pudimos guardar el último cambio en este navegador (almacenamiento lleno o bloqueado). Puede que se pierda al recargar.</Banner>
      )}

      <main>
        {route === 'book' && <Book key={flow?.key ?? 'new'} db={db} setDb={setDb} flow={flow} onLeave={leave} />}
        {route === 'mine' && <Mine db={db} setDb={setDb} look={look} setLook={setLook} onMove={(id) => startFlow({ type: 'move', id, back: '/mi-reserva' })} />}
        {route === 'info' && <Info go={nav} />}
        {route === 'admin' && <Admin db={db} setDb={setDb} adm={adm} setAdm={setAdm} onNew={() => startFlow({ type: 'new', back: '/admin' })} onMove={(id) => startFlow({ type: 'move', id, back: '/admin' })} />}
      </main>
    </div>
  )
}
