import { uid, todayStr, addDays } from './helpers'

// Realistic sample data so the app can be explored before real records exist.
export function makeSampleData() {
  const t = todayStr()
  const pats = [
    { name: 'Sunita Patil', phone: '9876543210', age: 42, gender: 'F', address: 'Mahatma Nagar, Nashik', history: 'Hypothyroid since 2019. On homoeopathic treatment, TSH improving.' },
    { name: 'Rajesh Kulkarni', phone: '9822011223', age: 55, gender: 'M', address: 'College Road, Nashik', history: 'Diabetes + hypertension. Knee pain, worse in cold weather.' },
    { name: 'Aarti Deshmukh', phone: '9765432180', age: 29, gender: 'F', address: 'Gangapur Road, Nashik', history: 'PCOD, irregular cycles. Also acne and hair fall.' },
    { name: 'Vikram Shinde', phone: '9890012345', age: 34, gender: 'M', address: 'Satpur, Nashik', history: 'Recurrent allergic rhinitis, sneezing every morning.' },
    { name: 'Meera Joshi', phone: '9922334455', age: 8, gender: 'F', address: 'Trimbak Road, Nashik', history: 'Frequent tonsillitis. Parents prefer avoiding antibiotics.' },
    { name: 'Prakash Wagh', phone: '9850098500', age: 61, gender: 'M', address: 'Indira Nagar, Nashik', history: 'Chronic eczema on both legs, itching worse at night.' },
  ].map((p, i) => ({ ...p, id: uid(), caseNo: String(1001 + i), createdAt: addDays(t, -60) }))

  const visit = (pi, date, symptoms, remedy, fee, followUp) => ({
    id: uid(), patientId: pats[pi].id, date, symptoms, remedy,
    dosage: 'TDS x 15 days', fee, paid: true, followUpDate: followUp || '', notes: '',
  })

  const visits = [
    visit(0, addDays(t, -30), 'Fatigue, weight gain, hair fall', 'Thyroidinum 30', 300, addDays(t, -2)),
    visit(0, t, 'Feeling better, energy improved', 'Thyroidinum 30 (repeat)', 300, addDays(t, 30)),
    visit(1, addDays(t, -20), 'Knee pain worse on first motion, better by movement', 'Rhus Tox 30', 300, addDays(t, 1)),
    visit(2, addDays(t, -15), 'Irregular menses, acne on face', 'Pulsatilla 30', 350, addDays(t, 15)),
    visit(3, t, 'Morning sneezing spells, watery eyes', 'Allium Cepa 30', 300, addDays(t, 20)),
    visit(4, addDays(t, -7), 'Throat pain, difficulty swallowing, mild fever', 'Belladonna 200', 250, addDays(t, 7)),
    visit(5, addDays(t, -3), 'Itchy eruptions both legs, worse at night in bed', 'Sulphur 200', 300, addDays(t, 12)),
  ]
  visits[5].paid = false // Meera's parents will pay on the next visit

  const meds = [
    { name: 'Arnica Montana', potency: '30', form: 'Dilution', stock: 3, minStock: 2, unit: 'bottles' },
    { name: 'Belladonna', potency: '200', form: 'Dilution', stock: 1, minStock: 2, unit: 'bottles' },
    { name: 'Nux Vomica', potency: '30', form: 'Dilution', stock: 4, minStock: 2, unit: 'bottles' },
    { name: 'Sulphur', potency: '200', form: 'Dilution', stock: 0, minStock: 1, unit: 'bottles' },
    { name: 'Rhus Tox', potency: '30', form: 'Dilution', stock: 2, minStock: 2, unit: 'bottles' },
    { name: 'Pulsatilla', potency: '30', form: 'Dilution', stock: 5, minStock: 2, unit: 'bottles' },
    { name: 'Allium Cepa', potency: '30', form: 'Dilution', stock: 2, minStock: 1, unit: 'bottles' },
    { name: 'Calendula', potency: 'Q', form: 'Mother Tincture (Q)', stock: 1, minStock: 1, unit: 'bottles' },
    { name: 'Bioplasgen No. 12', potency: '', form: 'Biochemic', stock: 6, minStock: 3, unit: 'boxes' },
    { name: 'Sugar Globules No. 30', potency: '', form: 'Globules', stock: 2, minStock: 4, unit: 'packets' },
  ].map((m) => ({ ...m, id: uid(), notes: '' }))

  const txns = [
    ...visits.filter((v) => v.paid).map((v) => ({
      id: uid(), type: 'income', category: 'Consultation', amount: v.fee,
      date: v.date, note: pats.find((p) => p.id === v.patientId).name, patientId: v.patientId, visitId: v.id,
    })),
    { id: uid(), type: 'expense', category: 'Salary', amount: 8000, date: addDays(t, -4), note: 'Receptionist salary — this month' },
    { id: uid(), type: 'expense', category: 'Medicine Purchase', amount: 2350, date: addDays(t, -10), note: 'Dilutions + globules from supplier' },
    { id: uid(), type: 'expense', category: 'Electricity', amount: 940, date: addDays(t, -12), note: 'Monthly bill' },
    { id: uid(), type: 'income', category: 'Other', amount: 150, date: t, note: 'Calendula ointment sale' },
  ]

  return { patients: pats, visits, medicines: meds, txns }
}
