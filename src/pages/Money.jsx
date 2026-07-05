import { useState } from 'react'
import { useStore } from '../data/store'
import { Modal, Field, Empty, StatCard } from '../components/ui'
import CollectPayment from '../components/CollectPayment'
import { todayStr, addDays, fmtDate, fmtMoney, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/helpers'

function TxnForm({ onClose }) {
  const { add, settings } = useStore()
  const [f, setF] = useState({ type: 'expense', category: 'Salary', amount: '', date: todayStr(), note: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const cats = f.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const submit = (e) => {
    e.preventDefault()
    if (!Number(f.amount)) return
    add('txns', { ...f, amount: Number(f.amount) })
    onClose()
  }

  return (
    <Modal title="Add money entry" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="pill-row">
          <button type="button" className={'pill' + (f.type === 'expense' ? ' active' : '')}
            onClick={() => setF({ ...f, type: 'expense', category: EXPENSE_CATEGORIES[0] })}>Money out (expense)</button>
          <button type="button" className={'pill' + (f.type === 'income' ? ' active' : '')}
            onClick={() => setF({ ...f, type: 'income', category: INCOME_CATEGORIES[0] })}>Money in (income)</button>
        </div>
        <div className="form-row">
          <Field label="Category">
            <select value={f.category} onChange={set('category')}>{cats.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label={`Amount (${settings.currency})`}><input type="number" min="0" required value={f.amount} onChange={set('amount')} /></Field>
        </div>
        <div className="form-row">
          <Field label="Date"><input type="date" value={f.date} onChange={set('date')} /></Field>
          <Field label="Note"><input value={f.note} onChange={set('note')} placeholder="e.g. Receptionist salary — July" /></Field>
        </div>
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>Save entry</button>
      </form>
    </Modal>
  )
}

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Last 7 days' },
  { key: 'month', label: 'This month' },
  { key: 'all', label: 'All time' },
]

export default function Money() {
  const { txns, visits, patients, add, update, remove, settings } = useStore()
  const [period, setPeriod] = useState('today')
  const [adding, setAdding] = useState(false)
  const [collecting, setCollecting] = useState(false)
  const today = todayStr()

  const from =
    period === 'today' ? today :
    period === 'week' ? addDays(today, -6) :
    period === 'month' ? today.slice(0, 7) + '-01' : '0000'

  const inPeriod = txns.filter((t) => t.date >= from).sort((a, b) => b.date.localeCompare(a.date))
  const income = inPeriod.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = inPeriod.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const money = (n) => fmtMoney(n, settings.currency)

  // Daily collections for the last 14 days (income only).
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13))
  const daily = days.map((d) => ({
    date: d,
    total: txns.filter((t) => t.type === 'income' && t.date === d).reduce((s, t) => s + Number(t.amount), 0),
  }))
  const maxDaily = Math.max(...daily.map((d) => d.total), 1)

  // Visits saved as "unpaid" — collect them here when the patient settles up.
  const unpaid = visits
    .filter((v) => !v.paid && Number(v.fee) > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
  const nameOf = (pid) => patients.find((p) => p.id === pid)?.name || 'Unknown patient'

  const markPaid = (v) => {
    update('visits', v.id, { paid: true })
    add('txns', {
      type: 'income', category: 'Consultation', amount: Number(v.fee),
      date: today, note: nameOf(v.patientId) + ` (due from ${fmtDate(v.date)})`,
      patientId: v.patientId, visitId: v.id,
    })
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Money</h1>
          <div className="sub">Collections, expenses and salaries</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn secondary" onClick={() => setCollecting(true)}>📱 Collect via UPI</button>
          <button className="btn" onClick={() => setAdding(true)}>+ Add Entry</button>
        </div>
      </div>

      <div className="pill-row">
        {PERIODS.map((p) => (
          <button key={p.key} className={'pill' + (period === p.key ? ' active' : '')} onClick={() => setPeriod(p.key)}>{p.label}</button>
        ))}
      </div>

      <div className="stat-grid">
        <StatCard label="Money in" value={money(income)} tone="green" />
        <StatCard label="Money out" value={money(expense)} tone="red" />
        <StatCard label="Net" value={money(income - expense)} tone={income - expense >= 0 ? 'green' : 'red'} />
      </div>

      {unpaid.length > 0 && (
        <div className="card">
          <h2>⏳ Pending payments</h2>
          <ul className="list-plain">
            {unpaid.map((v) => (
              <li key={v.id}>
                <span><b>{nameOf(v.patientId)}</b> <span className="muted">— visit on {fmtDate(v.date)}</span></span>
                <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                  <b>{money(v.fee)}</b>
                  <button className="btn small" onClick={() => markPaid(v)}>✓ Received</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h2>Daily collections — last 14 days</h2>
        <div className="bars">
          {daily.map((d) => (
            <div className="bar-col" key={d.date} title={`${fmtDate(d.date)}: ${money(d.total)}`}>
              <div className="bar" style={{ height: `${(d.total / maxDaily) * 100}%` }} />
              <div className="bar-label">{d.date.slice(8)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Entries — {PERIODS.find((p) => p.key === period).label.toLowerCase()}</h2>
        {inPeriod.length === 0 ? (
          <Empty icon="🧾" text="No entries in this period." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Date</th><th>Type</th><th>Category</th><th>Note</th><th className="num">Amount</th><th></th></tr>
              </thead>
              <tbody>
                {inPeriod.map((t) => (
                  <tr key={t.id}>
                    <td>{fmtDate(t.date)}</td>
                    <td><span className={'badge ' + t.type}>{t.type === 'income' ? 'In' : 'Out'}</span></td>
                    <td>{t.category}</td>
                    <td className="muted">{t.note}</td>
                    <td className="num"><b>{t.type === 'expense' ? '−' : ''}{money(t.amount)}</b></td>
                    <td>
                      <button className="icon-btn" title="Delete" onClick={() => confirm('Delete this entry?') && remove('txns', t.id)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adding && <TxnForm onClose={() => setAdding(false)} />}
      {collecting && <CollectPayment onClose={() => setCollecting(false)} />}
    </div>
  )
}
