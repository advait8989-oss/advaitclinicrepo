import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '../data/store'
import { Modal, Field, Empty } from '../components/ui'
import { todayStr, addDays, fmtDate, fmtMoney, waLink, ageGender } from '../data/helpers'
import { PatientForm } from './Patients'
import CollectPayment from '../components/CollectPayment'

function VisitForm({ patient, onClose }) {
  const { add, settings, visits } = useStore()
  const isFirstVisit = !visits.some((v) => v.patientId === patient.id)
  const [f, setF] = useState({
    date: todayStr(), symptoms: '', remedy: '', dosage: '',
    fee: settings.defaultFee, paid: true, followUpDays: 15, notes: '',
  })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const followUpDate = f.followUpDays ? addDays(f.date, Number(f.followUpDays)) : ''
    const visit = add('visits', {
      patientId: patient.id, date: f.date, symptoms: f.symptoms, remedy: f.remedy,
      dosage: f.dosage, fee: Number(f.fee) || 0, paid: f.paid, followUpDate, notes: f.notes,
    })
    if (f.paid && Number(f.fee) > 0) {
      add('txns', {
        type: 'income', category: isFirstVisit ? 'New Patient' : 'Consultation', amount: Number(f.fee),
        date: f.date, note: patient.name, patientId: patient.id, visitId: visit.id,
      })
    }
    onClose()
  }

  return (
    <Modal title={`New visit — ${patient.name}`} onClose={onClose} wide>
      <form onSubmit={submit}>
        <div className="form-row">
          <Field label="Visit date"><input type="date" value={f.date} onChange={set('date')} /></Field>
          <Field label="Follow-up after (days)" hint="Leave blank for no follow-up">
            <input type="number" min="0" value={f.followUpDays} onChange={set('followUpDays')} />
          </Field>
        </div>
        <Field label="Symptoms / complaints">
          <textarea value={f.symptoms} onChange={set('symptoms')} placeholder="What the patient reported today…" />
        </Field>
        <div className="form-row">
          <Field label="Remedy prescribed"><input value={f.remedy} onChange={set('remedy')} placeholder="e.g. Nux Vomica 30" /></Field>
          <Field label="Dosage"><input value={f.dosage} onChange={set('dosage')} placeholder="e.g. TDS x 15 days" /></Field>
        </div>
        <div className="form-row">
          <Field label={`Fee (${settings.currency})`}><input type="number" min="0" value={f.fee} onChange={set('fee')} /></Field>
          <label className="checkbox-line" style={{ marginTop: 26 }}>
            <input type="checkbox" checked={f.paid} onChange={(e) => setF({ ...f, paid: e.target.checked })} />
            Payment received {f.paid && '(will be added to today’s income)'}
          </label>
        </div>
        <Field label="Notes"><textarea value={f.notes} onChange={set('notes')} /></Field>
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>Save visit</button>
      </form>
    </Modal>
  )
}

export default function PatientDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { patients, visits, txns, update, remove, settings } = useStore()
  const [editing, setEditing] = useState(false)
  const [addingVisit, setAddingVisit] = useState(false)
  const [collecting, setCollecting] = useState(false)

  const patient = patients.find((p) => p.id === id)
  if (!patient) return <Empty icon="🔍" text="Patient not found."><Link to="/patients" className="btn secondary">Back to patients</Link></Empty>

  const history = visits.filter((v) => v.patientId === id).sort((a, b) => b.date.localeCompare(a.date))
  const totalPaid = txns.filter((t) => t.patientId === id && t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)

  const deleteVisit = (v) => {
    if (!confirm('Delete this visit record?')) return
    remove('visits', v.id)
    const linked = txns.find((t) => t.visitId === v.id)
    if (linked) remove('txns', linked.id)
  }

  const deletePatient = () => {
    if (!confirm(`Delete ${patient.name} and all their visit records? This cannot be undone.`)) return
    history.forEach((v) => remove('visits', v.id))
    remove('patients', id)
    nav('/patients')
  }

  return (
    <div>
      <p><Link to="/patients">← All patients</Link></p>
      <div className="page-head">
        <div>
          <h1>{patient.name} {patient.caseNo && <span className="badge ok" style={{ fontSize: 14, verticalAlign: 'middle' }}>Case #{patient.caseNo}</span>}</h1>
          <div className="sub">{ageGender(patient)} · {patient.address || 'no address'} · since {fmtDate(patient.createdAt?.slice(0, 10))}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {patient.phone && <a className="btn wa" href={waLink(patient.phone)} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
          {patient.phone && <a className="btn secondary" href={`tel:+91${patient.phone.replace(/\D/g, '')}`}>📞 Call</a>}
          <button className="btn secondary" onClick={() => setCollecting(true)}>📱 Collect payment</button>
          <button className="btn secondary" onClick={() => setEditing(true)}>✏️ Edit</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-value">{history.length}</div><div className="stat-label">Total visits</div></div>
        <div className="stat-card tone-green"><div className="stat-value">{fmtMoney(totalPaid, settings.currency)}</div><div className="stat-label">Total paid</div></div>
        <div className="stat-card"><div className="stat-value">{patient.phone || '—'}</div><div className="stat-label">Mobile</div></div>
      </div>

      {patient.history && (
        <div className="card">
          <h2>Medical history</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{patient.history}</p>
        </div>
      )}

      <div className="card">
        <div className="page-head" style={{ marginBottom: 8 }}>
          <h2>Visit history</h2>
          <button className="btn" onClick={() => setAddingVisit(true)}>+ New Visit</button>
        </div>
        {history.length === 0 ? (
          <Empty icon="📋" text="No visits recorded yet." />
        ) : (
          <ul className="timeline">
            {history.map((v) => (
              <li key={v.id}>
                <div className="t-head">
                  <span className="t-date">{fmtDate(v.date)}</span>
                  <span>
                    <b>{fmtMoney(v.fee, settings.currency)}</b>{' '}
                    <span className={'badge ' + (v.paid ? 'ok' : 'low')}>{v.paid ? 'paid' : 'unpaid'}</span>{' '}
                    <button className="icon-btn" title="Delete visit" onClick={() => deleteVisit(v)}>🗑</button>
                  </span>
                </div>
                {v.symptoms && <div><span className="muted">Symptoms:</span> {v.symptoms}</div>}
                {v.remedy && <div><span className="muted">Remedy:</span> <b>{v.remedy}</b>{v.dosage && <span className="muted"> — {v.dosage}</span>}</div>}
                {v.followUpDate && <div className="muted">Follow-up: {fmtDate(v.followUpDate)}</div>}
                {v.notes && <div className="muted">Note: {v.notes}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="btn danger" onClick={deletePatient}>Delete patient</button>

      {editing && (
        <PatientForm initial={patient} onClose={() => setEditing(false)} onSave={(f) => update('patients', id, f)} />
      )}
      {addingVisit && <VisitForm patient={patient} onClose={() => setAddingVisit(false)} />}
      {collecting && <CollectPayment patient={patient} onClose={() => setCollecting(false)} />}
    </div>
  )
}
