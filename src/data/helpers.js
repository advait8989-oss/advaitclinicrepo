export const uid = () => crypto.randomUUID()

const pad = (n) => String(n).padStart(2, '0')

export function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function addDays(dateStr, n) {
  const d = dateStr ? new Date(dateStr + 'T12:00:00') : new Date()
  d.setDate(d.getDate() + n)
  return todayStr(d)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function fmtDate(s) {
  if (!s) return '—'
  const [y, m, d] = s.split('-')
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`
}

export function fmtMoney(n, sym = '₹') {
  return sym + Number(n || 0).toLocaleString('en-IN')
}

// WhatsApp click-to-chat link. Assumes India (+91) for 10-digit numbers.
export function waLink(phone, text = '') {
  let p = String(phone || '').replace(/\D/g, '')
  if (p.length === 10) p = '91' + p
  const q = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${p}${q}`
}

export function fillTemplate(text, patient, settings) {
  return (text || '')
    .replaceAll('{name}', patient?.name || '')
    .replaceAll('{clinic}', settings?.clinicName || '')
    .replaceAll('{doctor}', settings?.doctorName || '')
}

export function ageGender(p) {
  const parts = []
  if (p.age) parts.push(p.age + ' yrs')
  if (p.gender) parts.push(p.gender)
  return parts.join(' / ') || '—'
}

export const DEFAULT_SETTINGS = {
  clinicName: 'Advait Homoeopathic Clinic & Counselling Center',
  doctorName: 'Dr. Anuprita Dhakane',
  tagline: 'Healing Naturally, Living Fully',
  clinicPhone: '9423970399',
  defaultFee: 300,
  currency: '₹',
}

export const EXPENSE_CATEGORIES = [
  'Salary', 'Rent', 'Medicine Purchase', 'Electricity', 'Equipment', 'Cleaning', 'Other Expense',
]
export const INCOME_CATEGORIES = ['Consultation', 'New Patient', 'Other']

export const MEDICINE_FORMS = [
  'Dilution', 'Mother Tincture (Q)', 'Tablets', 'Biochemic', 'Ointment', 'Globules', 'Other',
]

export const MESSAGE_TEMPLATES = [
  {
    label: 'Follow-up reminder',
    text: 'Namaste {name} 🙏\n\nThis is a gentle reminder from {clinic} that your follow-up visit is due. Please call or WhatsApp us to book a convenient time.\n\n— {doctor}',
  },
  {
    label: 'Festival greeting',
    text: 'Namaste {name} 🙏🌸\n\nWarm festival greetings to you and your family from all of us at {clinic}! Wishing you health and happiness.\n\n— {doctor}',
  },
  {
    label: 'Clinic timing update',
    text: 'Namaste {name} 🙏\n\nA small update from {clinic}: our clinic timings are Monday–Saturday, 11:00 AM to 5:00 PM. For appointments please call or WhatsApp.\n\n— {doctor}',
  },
  {
    label: 'Health tip',
    text: 'Namaste {name} 🌿\n\nA health tip from {clinic}: drink warm water through the day, eat fresh home-cooked food, and sleep on time — small habits, big healing!\n\n— {doctor}',
  },
]
