export const btn = 'inline-flex items-center justify-center min-h-11 px-5 rounded-xl border border-line bg-card text-ink font-semibold no-underline'
export const btnP = 'inline-flex items-center justify-center min-h-11 px-5 rounded-xl border border-terra bg-terra text-onterra font-semibold no-underline'
export const btnL = 'min-h-11 px-1 bg-transparent text-teal font-semibold'
export const h2 = 'font-serif text-2xl font-semibold mt-5 mb-1'

export function Field({ label, optional, error, ...rest }) {
  const id = `f-${rest.name}`
  return (
    <label className="block my-3 font-medium" htmlFor={id}>
      {label} {optional && <i className="not-italic font-normal text-mute">(opcional)</i>}
      <input
        id={id}
        className="block w-full min-h-12 mt-1 px-3 py-2 rounded-lg border border-line bg-card text-ink font-normal aria-[invalid=true]:border-err"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-e` : undefined}
        {...rest}
      />
      <span id={`${id}-e`} className="block text-sm text-err">{error}</span>
    </label>
  )
}

export function Banner({ children, role = 'status' }) {
  return <div role={role} className="my-3 px-4 py-2.5 rounded-lg border-l-4 border-terra bg-surf">{children}</div>
}
