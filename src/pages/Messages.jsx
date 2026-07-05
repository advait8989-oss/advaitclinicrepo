import { useState } from 'react'
import { useStore } from '../data/store'
import { Empty, SearchInput } from '../components/ui'
import { waLink, fillTemplate, MESSAGE_TEMPLATES } from '../data/helpers'

export default function Messages() {
  const { patients, settings } = useStore()
  const [text, setText] = useState(MESSAGE_TEMPLATES[0].text)
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [sent, setSent] = useState(() => new Set())

  const withPhone = patients.filter((p) => p.phone).sort((a, b) => a.name.localeCompare(b.name))
  const filtered = withPhone.filter((p) => (p.name + p.phone).toLowerCase().includes(q.toLowerCase()))

  const toggle = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }
  const selectAll = () => setSelected(new Set(filtered.map((p) => p.id)))
  const clearAll = () => setSelected(new Set())

  const chosen = withPhone.filter((p) => selected.has(p.id))
  const pending = chosen.filter((p) => !sent.has(p.id))

  const send = (p) => {
    window.open(waLink(p.phone, fillTemplate(text, p, settings)), '_blank')
    setSent((s) => new Set(s).add(p.id))
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Messages</h1>
          <div className="sub">Send WhatsApp messages to your patients</div>
        </div>
      </div>

      <div className="note-box">
        📷 <b>Sending a photo too?</b> WhatsApp opens with your message pre-filled — tap the
        <b> 📎 attach</b> button inside WhatsApp to add the photo before pressing send.
        Each patient gets a personal message (their own name filled in) — no group is created.
      </div>

      <div className="two-col">
        <div className="card">
          <h2>1. Write your message</h2>
          <div className="pill-row">
            {MESSAGE_TEMPLATES.map((t) => (
              <button key={t.label} className={'pill' + (text === t.text ? ' active' : '')} onClick={() => setText(t.text)}>
                {t.label}
              </button>
            ))}
          </div>
          <textarea rows="9" value={text} onChange={(e) => setText(e.target.value)} />
          <p className="muted">
            <b>{'{name}'}</b> becomes the patient's name, <b>{'{clinic}'}</b> the clinic name, <b>{'{doctor}'}</b> your name.
          </p>
          {chosen[0] && (
            <div style={{ background: 'var(--green-soft)', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, whiteSpace: 'pre-wrap' }}>
              <b>Preview for {chosen[0].name}:</b>{'\n'}{fillTemplate(text, chosen[0], settings)}
            </div>
          )}
        </div>

        <div className="card">
          <h2>2. Choose patients ({selected.size} selected)</h2>
          {withPhone.length === 0 ? (
            <Empty icon="📱" text="No patients with phone numbers yet." />
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                <SearchInput value={q} onChange={setQ} placeholder="Search…" />
                <button className="btn secondary small" onClick={selectAll}>Select all</button>
                <button className="btn secondary small" onClick={clearAll}>Clear</button>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <ul className="list-plain">
                  {filtered.map((p) => (
                    <li key={p.id}>
                      <label className="checkbox-line" style={{ marginBottom: 0, cursor: 'pointer' }}>
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                        <b>{p.name}</b> <span className="muted">{p.phone}</span>
                      </label>
                      {sent.has(p.id) && <span className="badge ok">sent ✓</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2>3. Send</h2>
        {chosen.length === 0 ? (
          <Empty icon="✉️" text="Select at least one patient above." />
        ) : (
          <>
            {pending.length > 0 ? (
              <button className="btn wa" onClick={() => send(pending[0])}>
                💬 Send to {pending[0].name} ({pending.length} remaining)
              </button>
            ) : (
              <p><b>✅ All {chosen.length} messages opened in WhatsApp.</b></p>
            )}
            <p className="muted" style={{ marginTop: 8 }}>
              Each click opens WhatsApp with the message ready — press <b>Send</b> there
              (and attach a photo if you want), then come back and click for the next patient.
            </p>
            <ul className="list-plain" style={{ marginTop: 8 }}>
              {chosen.map((p) => (
                <li key={p.id}>
                  <span><b>{p.name}</b> <span className="muted">{p.phone}</span></span>
                  {sent.has(p.id)
                    ? <span className="badge ok">sent ✓</span>
                    : <button className="btn wa small" onClick={() => send(p)}>Send ➤</button>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="note-box" style={{ background: 'var(--green-soft)', color: 'var(--green-deep)' }}>
        💡 <b>Want fully automatic bulk sending?</b> That needs the official WhatsApp Business API
        (≈ ₹0.80 per marketing message + a Meta business verification). This app is ready for it —
        see the "WhatsApp API upgrade" section in the README when you're ready.
      </div>
    </div>
  )
}
