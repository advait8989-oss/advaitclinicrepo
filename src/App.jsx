import { NavLink, Routes, Route } from 'react-router-dom'
import { useStore } from './data/store'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import Inventory from './pages/Inventory'
import Money from './pages/Money'
import Messages from './pages/Messages'
import Settings from './pages/Settings'
import Help from './pages/Help'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/patients', label: 'Patients', icon: '🧑‍⚕️' },
  { to: '/inventory', label: 'Medicines', icon: '💊' },
  { to: '/money', label: 'Money', icon: '💰' },
  { to: '/messages', label: 'Messages', icon: '💬' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
  { to: '/help', label: 'Help', icon: '❓' },
]

export default function App() {
  const { mode, authReady, user, ready, settings } = useStore()

  if (!authReady) return <div className="fullpage-note">Loading…</div>
  if (mode === 'firebase' && !user) return <Login />
  if (!ready) return <div className="fullpage-note">Loading your clinic data…</div>

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">🌿</div>
          <div>
            <div className="brand-name">Advait Clinic</div>
            <div className="brand-tag">{settings.tagline}</div>
          </div>
        </div>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="nav-link">
              <span className="nav-icon">{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          {mode === 'local' ? '📍 Saved on this device' : '☁️ Synced to cloud'}
        </div>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/money" element={<Money />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </main>
    </div>
  )
}
