import { useState } from 'react'
import { cloudLogin } from '../data/remoteAdapter'

export default function CloudLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await cloudLogin(password.trim())
      window.location.reload()
    } catch (err) {
      setError(
        err.message === 'wrong-password'
          ? 'That password is not correct — please try again.'
          : 'Could not connect — please check the internet and try again.',
      )
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand-logo">🌿</div>
        <h1>Advait Homoeopathic Clinic</h1>
        <p className="muted">Healing Naturally, Living Fully</p>
        <form onSubmit={submit} style={{ marginTop: 18, textAlign: 'left' }}>
          <input
            type="password"
            required
            placeholder="Clinic password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: 14 }}
            autoFocus
          />
          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
            {busy ? 'Opening…' : 'Open clinic records'}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>
        <p className="muted" style={{ marginTop: 14 }}>
          One password for the whole clinic — the same records open on every device.
        </p>
      </div>
    </div>
  )
}
