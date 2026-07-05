import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('advaitclinic@gmail.com')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const fb = await import('../data/firebaseAdapter')
      if (mode === 'signin') await fb.login(email, password)
      else await fb.register(email, password)
    } catch (err) {
      const code = err?.code || ''
      setError(
        code.includes('invalid-credential') || code.includes('wrong-password')
          ? 'Wrong email or password. Please try again.'
          : code.includes('email-already-in-use')
            ? 'This email already has an account — use Sign In instead.'
            : 'Could not sign in: ' + (err.message || code),
      )
    } finally {
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
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 10 }} />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: 14 }} />
          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>
        <p className="muted" style={{ marginTop: 14 }}>
          {mode === 'signin' ? 'First time here? ' : 'Already have an account? '}
          <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}>
            {mode === 'signin' ? 'Create account' : 'Sign in'}
          </a>
        </p>
      </div>
    </div>
  )
}
