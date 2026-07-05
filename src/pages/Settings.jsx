import { useRef, useState } from 'react'
import { useStore } from '../data/store'
import { Field } from '../components/ui'
import { todayStr } from '../data/helpers'

export default function Settings() {
  const store = useStore()
  const { settings, saveSettings, mode, user } = store
  const [f, setF] = useState(settings)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const save = (e) => {
    e.preventDefault()
    saveSettings({ ...f, defaultFee: Number(f.defaultFee) || 0 })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const download = () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `advait-clinic-backup-${todayStr()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!confirm('Importing a backup will replace the current data. Continue?')) { e.target.value = ''; return }
    try {
      await store.importJSON(await file.text())
      alert('Backup imported successfully! ✅')
    } catch {
      alert('Could not read this file — please choose a backup exported from this app.')
    }
    e.target.value = ''
  }

  const signOut = async () => {
    const fb = await import('../data/firebaseAdapter')
    await fb.logout()
  }

  return (
    <div>
      <div className="page-head"><h1>Settings</h1></div>

      <div className="card">
        <h2>Clinic profile</h2>
        <form onSubmit={save}>
          <div className="form-row">
            <Field label="Clinic name"><input value={f.clinicName} onChange={set('clinicName')} /></Field>
            <Field label="Doctor name"><input value={f.doctorName} onChange={set('doctorName')} /></Field>
          </div>
          <div className="form-row-3">
            <Field label="Tagline"><input value={f.tagline} onChange={set('tagline')} /></Field>
            <Field label="Clinic phone"><input value={f.clinicPhone} onChange={set('clinicPhone')} /></Field>
            <Field label={`Default consultation fee (${f.currency})`}>
              <input type="number" min="0" value={f.defaultFee} onChange={set('defaultFee')} />
            </Field>
          </div>
          <Field
            label="UPI ID (for collecting payments by QR code)"
            hint="Find it in your GPay / PhonePe / Paytm profile — looks like 9423970399@ybl or name@okhdfcbank. Payments go straight to your bank, no charges."
          >
            <input value={f.upiId || ''} onChange={set('upiId')} placeholder="e.g. 9423970399@ybl" />
          </Field>
          <button className="btn">{saved ? '✓ Saved!' : 'Save settings'}</button>
        </form>
      </div>

      <div className="card">
        <h2>Cloud sync</h2>
        {mode === 'cloud' ? (
          <>
            <p>
              ☁️ <b>Cloud sync is ON.</b> Every device that opens the app with the clinic
              password sees the same patients, medicines and money records — and everything
              is safely stored away from the clinic computer.
            </p>
            <button
              className="btn secondary"
              onClick={async () => {
                const fb = await import('../data/remoteAdapter')
                fb.cloudLogout()
              }}
            >
              Sign out on this device
            </button>
          </>
        ) : mode === 'local' ? (
          <>
            <p>
              📍 <b>Data is currently saved only on this device</b> (in this browser).
              It works fully offline, but do take regular backups below.
            </p>
            <p className="muted">
              To sync to the cloud (automatic backup + access from phone and laptop),
              connect Firebase — the free plan is more than enough for a clinic.
              Follow the simple steps in the <b>README.md</b> file in the project folder,
              or ask whoever set this up for you 😊
            </p>
          </>
        ) : (
          <>
            <p>☁️ <b>Connected to Firebase</b> — data is safely synced to the cloud.</p>
            <p className="muted">Signed in as {user?.email}</p>
            <button className="btn secondary" onClick={signOut}>Sign out</button>
          </>
        )}
      </div>

      <div className="card">
        <h2>Backup & data</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn secondary" onClick={download}>⬇️ Download backup</button>
          <button className="btn secondary" onClick={() => fileRef.current.click()}>⬆️ Import backup</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importFile} />
          <button className="btn secondary" onClick={() => confirm('Load sample data? Current data will be replaced.') && store.loadSample()}>
            🧪 Load sample data
          </button>
          <button className="btn danger" onClick={() => confirm('Delete ALL patients, visits, medicines and money records? This cannot be undone!') && store.clearAll()}>
            🗑 Clear all data
          </button>
        </div>
        <p className="muted" style={{ marginTop: 10 }}>
          Tip: download a backup once a week and keep it somewhere safe (email it to yourself or save to Google Drive).
        </p>
      </div>
    </div>
  )
}
