import { useState } from 'react'
import { useStore } from '../data/store'
import { Modal, Field, Empty, SearchInput, StatCard } from '../components/ui'
import { MEDICINE_FORMS } from '../data/helpers'

function MedicineForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { name: '', potency: '', form: 'Dilution', stock: 0, minStock: 1, unit: 'bottles', notes: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return
    onSave({ ...f, name: f.name.trim(), stock: Number(f.stock) || 0, minStock: Number(f.minStock) || 0 })
    onClose()
  }

  return (
    <Modal title={initial ? 'Edit medicine' : 'Add medicine'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-row">
          <Field label="Medicine name *"><input required value={f.name} onChange={set('name')} placeholder="e.g. Arnica Montana" /></Field>
          <Field label="Potency"><input value={f.potency} onChange={set('potency')} placeholder="30 / 200 / 1M / Q" /></Field>
        </div>
        <div className="form-row">
          <Field label="Form">
            <select value={f.form} onChange={set('form')}>
              {MEDICINE_FORMS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Unit"><input value={f.unit} onChange={set('unit')} placeholder="bottles / boxes / packets" /></Field>
        </div>
        <div className="form-row">
          <Field label="Current stock"><input type="number" min="0" value={f.stock} onChange={set('stock')} /></Field>
          <Field label="Alert when below" hint="Shows in the to-buy list at this level">
            <input type="number" min="0" value={f.minStock} onChange={set('minStock')} />
          </Field>
        </div>
        <Field label="Notes"><input value={f.notes} onChange={set('notes')} placeholder="Supplier, brand…" /></Field>
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>Save medicine</button>
      </form>
    </Modal>
  )
}

export default function Inventory() {
  const { medicines, add, update, remove } = useStore()
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null) // 'new' | medicine object
  const [copied, setCopied] = useState(false)

  const filtered = medicines
    .filter((m) => (m.name + ' ' + m.potency + ' ' + m.form).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const low = medicines.filter((m) => Number(m.stock) <= Number(m.minStock))
  const out = medicines.filter((m) => Number(m.stock) === 0)

  const bump = (m, delta) => {
    const next = Math.max(0, Number(m.stock) + delta)
    update('medicines', m.id, { stock: next })
  }

  const label = (m) => `${m.name}${m.potency ? ' ' + m.potency : ''}`

  const buyListText = () =>
    'To buy — medicines:\n' + low.map((m) => `• ${label(m)} (${m.form}) — have ${m.stock} ${m.unit || ''}`).join('\n')

  const copyBuyList = async () => {
    await navigator.clipboard.writeText(buyListText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Medicines</h1>
          <div className="sub">{medicines.length} items in inventory</div>
        </div>
        <button className="btn" onClick={() => setModal('new')}>+ Add Medicine</button>
      </div>

      <div className="stat-grid">
        <StatCard label="Total medicines" value={medicines.length} />
        <StatCard label="Running low" value={low.length} tone={low.length ? 'amber' : undefined} />
        <StatCard label="Out of stock" value={out.length} tone={out.length ? 'red' : undefined} />
      </div>

      {low.length > 0 && (
        <div className="card">
          <h2>🛒 To-buy list</h2>
          <ul className="list-plain">
            {low.map((m) => (
              <li key={m.id}>
                <span><b>{label(m)}</b> <span className="muted">({m.form})</span></span>
                <span className={'badge ' + (Number(m.stock) === 0 ? 'out' : 'low')}>
                  {Number(m.stock) === 0 ? 'Out of stock' : `${m.stock} ${m.unit || ''} left`}
                </span>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn secondary" onClick={copyBuyList}>{copied ? '✓ Copied!' : '📋 Copy list'}</button>
            <a className="btn wa" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(buyListText())}`}>
              💬 Send to supplier
            </a>
          </div>
        </div>
      )}

      <div className="card">
        <SearchInput value={q} onChange={setQ} placeholder="Search medicines…" />
        {filtered.length === 0 ? (
          <Empty icon="💊" text={medicines.length ? 'No medicine matches your search.' : 'No medicines yet — add your stock!'} />
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table>
              <thead>
                <tr><th>Medicine</th><th>Form</th><th>Stock</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const stock = Number(m.stock)
                  const status = stock === 0 ? 'out' : stock <= Number(m.minStock) ? 'low' : 'ok'
                  return (
                    <tr key={m.id}>
                      <td><b>{label(m)}</b>{m.notes && <div className="muted">{m.notes}</div>}</td>
                      <td>{m.form}</td>
                      <td>
                        <span className="stock-controls">
                          <button onClick={() => bump(m, -1)} title="Used one">−</button>
                          <b>{stock}</b>
                          <button onClick={() => bump(m, +1)} title="Bought one">+</button>
                          <span className="muted">{m.unit}</span>
                        </span>
                      </td>
                      <td>
                        <span className={'badge ' + status}>
                          {status === 'out' ? 'Out of stock' : status === 'low' ? 'Buy soon' : 'In stock'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="icon-btn" title="Edit" onClick={() => setModal(m)}>✏️</button>
                        <button className="icon-btn" title="Delete" onClick={() => confirm(`Delete ${label(m)}?`) && remove('medicines', m.id)}>🗑</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <MedicineForm
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={(f) => (modal === 'new' ? add('medicines', f) : update('medicines', modal.id, f))}
        />
      )}
    </div>
  )
}
