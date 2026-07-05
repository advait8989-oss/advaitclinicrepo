export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' modal-wide' : '')}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

export function StatCard({ label, value, sub, tone }) {
  return (
    <div className={'stat-card' + (tone ? ' tone-' + tone : '')}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export function Empty({ icon, text, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <p>{text}</p>
      {children}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      className="search-input"
      type="search"
      value={value}
      placeholder={placeholder || 'Search…'}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
