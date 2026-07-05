import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { Modal, Field } from './ui'
import { useStore } from '../data/store'
import { todayStr, fmtMoney, waLink, INCOME_CATEGORIES } from '../data/helpers'

// Collect a payment by UPI QR: patient scans with GPay/PhonePe/Paytm and the
// money goes directly to the clinic's bank account — no gateway, no fees.
export default function CollectPayment({ patient, onClose }) {
  const { settings, add } = useStore()
  const [amount, setAmount] = useState(settings.defaultFee || '')
  const [category, setCategory] = useState('Consultation')
  const [qr, setQr] = useState('')
  const [done, setDone] = useState(false)

  const upiUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: settings.upiId || '',
      pn: settings.doctorName || settings.clinicName || 'Clinic',
      am: String(Number(amount) || 0),
      cu: 'INR',
      tn: `${category} - Advait Clinic`,
    })
    return `upi://pay?${params.toString()}`
  }, [settings, amount, category])

  useEffect(() => {
    if (settings.upiId && Number(amount) > 0) {
      QRCode.toDataURL(upiUrl, { width: 260, margin: 1, color: { dark: '#16452b' } }).then(setQr)
    } else {
      setQr('')
    }
  }, [upiUrl, settings.upiId, amount])

  const markReceived = () => {
    add('txns', {
      type: 'income', category, amount: Number(amount), date: todayStr(),
      note: (patient ? patient.name : 'UPI payment') + ' (UPI)', patientId: patient?.id || '',
    })
    setDone(true)
  }

  const requestMsg =
    `Namaste ${patient?.name || ''} 🙏\n\n` +
    `Payment request from ${settings.clinicName}: ${fmtMoney(amount, settings.currency)} (${category}).\n\n` +
    `You can pay by UPI to: ${settings.upiId}\nor tap this link on your phone:\n${upiUrl}\n\nThank you!`

  if (!settings.upiId) {
    return (
      <Modal title="Collect payment by UPI" onClose={onClose}>
        <p>To show a payment QR code, first save the clinic's <b>UPI ID</b> in Settings.</p>
        <p className="muted">
          Your UPI ID is in your GPay / PhonePe / Paytm app — it looks like{' '}
          <b>9423970399@ybl</b> or <b>name@okhdfcbank</b>. Money paid to it goes straight
          to your bank account with no charges.
        </p>
        <Link to="/settings" className="btn" onClick={onClose}>Open Settings</Link>
      </Modal>
    )
  }

  if (done) {
    return (
      <Modal title="Payment recorded ✅" onClose={onClose}>
        <p>
          <b>{fmtMoney(amount, settings.currency)}</b> from <b>{patient?.name || 'patient'}</b> has
          been added to today's income under <b>{category}</b>.
        </p>
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Done</button>
      </Modal>
    )
  }

  return (
    <Modal title={patient ? `Collect payment — ${patient.name}` : 'Collect payment by UPI'} onClose={onClose}>
      <div className="form-row">
        <Field label={`Amount (${settings.currency})`}>
          <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        </Field>
        <Field label="For">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {INCOME_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      {qr ? (
        <div style={{ textAlign: 'center' }}>
          <img src={qr} alt="UPI payment QR code" style={{ borderRadius: 12, border: '1px solid var(--line)' }} />
          <p className="muted" style={{ marginTop: 4 }}>
            Ask the patient to scan with <b>any UPI app</b> (GPay, PhonePe, Paytm…).<br />
            Amount {fmtMoney(amount, settings.currency)} → {settings.upiId}
          </p>
        </div>
      ) : (
        <p className="muted" style={{ textAlign: 'center' }}>Enter an amount to show the QR code.</p>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button className="btn" disabled={!Number(amount)} onClick={markReceived}>
          ✅ Payment received — add to income
        </button>
        {patient?.phone && (
          <a className="btn wa" href={waLink(patient.phone, requestMsg)} target="_blank" rel="noreferrer">
            💬 Request on WhatsApp
          </a>
        )}
      </div>
      <p className="muted" style={{ marginTop: 10 }}>
        Tip: check your bank/UPI app notification to confirm the money arrived before
        pressing "Payment received".
      </p>
    </Modal>
  )
}
