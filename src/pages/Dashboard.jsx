import { Link } from 'react-router-dom'
import { useStore } from '../data/store'
import { StatCard, Empty } from '../components/ui'
import { todayStr, fmtMoney, fmtDate, waLink, fillTemplate } from '../data/helpers'

export default function Dashboard() {
  const store = useStore()
  const { patients, visits, medicines, txns, settings } = store
  const today = todayStr()
  const month = today.slice(0, 7)

  const todaysVisits = visits.filter((v) => v.date === today)
  const todayIncome = txns.filter((t) => t.type === 'income' && t.date === today).reduce((s, t) => s + Number(t.amount), 0)
  const monthIncome = txns.filter((t) => t.type === 'income' && t.date.startsWith(month)).reduce((s, t) => s + Number(t.amount), 0)
  const lowStock = medicines.filter((m) => Number(m.stock) <= Number(m.minStock))
  // A follow-up counts as due only from the patient's most recent visit —
  // if they already came back, the older reminder is obsolete.
  const latestVisit = {}
  for (const v of visits) {
    if (!latestVisit[v.patientId] || v.date > latestVisit[v.patientId].date) latestVisit[v.patientId] = v
  }
  const followUps = Object.values(latestVisit)
    .filter((v) => v.followUpDate && v.followUpDate <= today)
    .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))

  const patientOf = (v) => patients.find((p) => p.id === v.patientId)
  const money = (n) => fmtMoney(n, settings.currency)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = (settings.doctorName || 'Doctor').replace(/^Dr\.?\s*/i, '').split(' ')[0]

  const isEmpty = patients.length === 0 && medicines.length === 0

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{greeting}, Dr. {firstName} 🌿</h1>
          <div className="sub">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <Link to="/patients" className="btn">+ New Patient</Link>
      </div>

      {isEmpty && (
        <div className="card">
          <h2>Welcome to your clinic dashboard! 🙏</h2>
          <p>
            Everything is ready. You can start by adding your first patient, or load some
            sample data to explore how the app works (you can clear it anytime from Settings).
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <Link to="/patients" className="btn">Add first patient</Link>
            <button className="btn secondary" onClick={store.loadSample}>Load sample data</button>
          </div>
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="Patients today" value={todaysVisits.length} tone="green" />
        <StatCard label="Collected today" value={money(todayIncome)} tone="green" />
        <StatCard label="Collected this month" value={money(monthIncome)} />
        <StatCard label="Medicines to buy" value={lowStock.length} tone={lowStock.length ? 'amber' : undefined} sub={lowStock.length ? 'running low' : 'all stocked'} />
        <StatCard label="Follow-ups due" value={followUps.length} tone={followUps.length ? 'red' : undefined} />
      </div>

      <div className="two-col">
        <div className="card">
          <h2>Today's patients</h2>
          {todaysVisits.length === 0 ? (
            <Empty icon="🗓️" text="No visits recorded today yet." />
          ) : (
            <ul className="list-plain">
              {todaysVisits.map((v) => {
                const p = patientOf(v)
                return (
                  <li key={v.id}>
                    <span>
                      <Link to={p ? `/patients/${p.id}` : '/patients'}><b>{p?.name || 'Unknown'}</b></Link>
                      <span className="muted"> — {v.remedy || v.symptoms}</span>
                    </span>
                    <b>{money(v.fee)}</b>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Follow-ups due 🔔</h2>
          {followUps.length === 0 ? (
            <Empty icon="✅" text="No pending follow-ups. Great!" />
          ) : (
            <ul className="list-plain">
              {followUps.slice(0, 8).map((v) => {
                const p = patientOf(v)
                if (!p) return null
                const msg = fillTemplate(
                  'Namaste {name} 🙏 This is a reminder from {clinic} — your follow-up visit is due. Please call or WhatsApp us to book a time. — {doctor}',
                  p, settings,
                )
                return (
                  <li key={v.id}>
                    <span>
                      <Link to={`/patients/${p.id}`}><b>{p.name}</b></Link>
                      <span className="muted"> — due {fmtDate(v.followUpDate)}</span>
                    </span>
                    {p.phone && (
                      <a className="btn wa small" href={waLink(p.phone, msg)} target="_blank" rel="noreferrer">Remind</a>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="card">
          <h2>Medicines running low ⚠️</h2>
          <ul className="list-plain">
            {lowStock.slice(0, 8).map((m) => (
              <li key={m.id}>
                <span><b>{m.name} {m.potency}</b> <span className="muted">({m.form})</span></span>
                <span className={'badge ' + (Number(m.stock) === 0 ? 'out' : 'low')}>
                  {Number(m.stock) === 0 ? 'Out of stock' : `Only ${m.stock} left`}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/inventory" className="btn secondary" style={{ marginTop: 10 }}>Open to-buy list</Link>
        </div>
      )}
    </div>
  )
}
