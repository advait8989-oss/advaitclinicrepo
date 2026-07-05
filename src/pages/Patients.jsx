import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { Modal, Field, Empty, SearchInput } from '../components/ui'
import { ageGender, fmtDate, waLink } from '../data/helpers'

export function PatientForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { name: '', caseNo: '', phone: '', age: '', gender: '', address: '', history: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return
    onSave({ ...f, name: f.name.trim() })
    onClose()
  }

  return (
    <Modal title={initial ? 'Edit patient' : 'New patient'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-row">
          <Field label="Full name *"><input required value={f.name} onChange={set('name')} placeholder="e.g. Sunita Patil" /></Field>
          <Field label="Case paper no."><input value={f.caseNo || ''} onChange={set('caseNo')} placeholder="e.g. 1024" /></Field>
        </div>
        <div className="form-row">
          <Field label="Mobile number" hint="10-digit — used for WhatsApp"><input value={f.phone} onChange={set('phone')} placeholder="98765 43210" /></Field>
          <div className="form-row">
            <Field label="Age"><input type="number" min="0" value={f.age} onChange={set('age')} /></Field>
            <Field label="Gender">
              <select value={f.gender} onChange={set('gender')}>
                <option value="">—</option><option>F</option><option>M</option><option>Other</option>
              </select>
            </Field>
          </div>
        </div>
        <Field label="Address"><input value={f.address} onChange={set('address')} placeholder="Area, city" /></Field>
        <Field label="Medical history / constitution notes">
          <textarea value={f.history} onChange={set('history')} placeholder="Past illnesses, family history, temperament, allergies…" />
        </Field>
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>Save patient</button>
      </form>
    </Modal>
  )
}

export default function Patients() {
  const { patients, visits, add } = useStore()
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const nav = useNavigate()

  const lastVisit = (pid) => {
    const dates = visits.filter((v) => v.patientId === pid).map((v) => v.date).sort()
    return dates[dates.length - 1]
  }

  const filtered = patients
    .filter((p) => [p.name, p.phone, p.caseNo].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Patients</h1>
          <div className="sub">{patients.length} registered</div>
        </div>
        <button className="btn" onClick={() => setAdding(true)}>+ New Patient</button>
      </div>

      <div className="card">
        <SearchInput value={q} onChange={setQ} placeholder="Search by name, case no. or phone…" />
        {filtered.length === 0 ? (
          <Empty icon="🧑‍⚕️" text={patients.length ? 'No patient matches your search.' : 'No patients yet — add your first one!'} />
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table>
              <thead>
                <tr><th>Case No.</th><th>Name</th><th>Phone</th><th>Age / Sex</th><th>Last visit</th><th className="num">Visits</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="clickable" onClick={() => nav(`/patients/${p.id}`)}>
                    <td>{p.caseNo ? <span className="badge ok">{p.caseNo}</span> : <span className="muted">—</span>}</td>
                    <td><b>{p.name}</b></td>
                    <td>{p.phone || '—'}</td>
                    <td>{ageGender(p)}</td>
                    <td>{fmtDate(lastVisit(p.id))}</td>
                    <td className="num">{visits.filter((v) => v.patientId === p.id).length}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {p.phone && (
                        <a className="icon-btn" title="WhatsApp" href={waLink(p.phone)} target="_blank" rel="noreferrer">💬</a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adding && (
        <PatientForm
          onClose={() => setAdding(false)}
          onSave={(f) => { const doc = add('patients', f); nav(`/patients/${doc.id}`) }}
        />
      )}
    </div>
  )
}
