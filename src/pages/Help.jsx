import { Link } from 'react-router-dom'

const Section = ({ icon, title, children }) => (
  <div className="card">
    <h2>{icon} {title}</h2>
    {children}
  </div>
)

export default function Help() {
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>How to use this app</h1>
          <div className="sub">A simple guide — nothing here can break, so feel free to explore!</div>
        </div>
      </div>

      <Section icon="🌅" title="Your daily routine">
        <ol>
          <li><b>Morning:</b> open the <Link to="/">Dashboard</Link>. It shows who is due for a follow-up — press the green <b>Remind</b> button to send them a WhatsApp reminder.</li>
          <li><b>When a patient comes:</b> open <Link to="/patients">Patients</Link>, find their name (or press <b>+ New Patient</b>), open their page and press <b>+ New Visit</b>. Write the symptoms, the remedy you gave, and the fee. Done — the fee is added to today's income automatically.</li>
          <li><b>Evening:</b> open <Link to="/money">Money</Link> and see today's total. Add any expenses (salary, purchases) with <b>+ Add Entry</b>.</li>
          <li><b>Patient will pay later?</b> Untick "Payment received" when saving the visit — it waits in Money under <b>⏳ Pending payments</b> until you press ✓ Received.</li>
        </ol>
      </Section>

      <Section icon="🧑‍⚕️" title="Patients">
        <ul>
          <li>Every patient has one page with their phone number, history, and <b>all past visits</b> — you never need to search old paper files again.</li>
          <li>Type a name or phone number in the search box to find anyone instantly.</li>
          <li>The 💬 button opens WhatsApp for that patient, 📞 calls them.</li>
        </ul>
      </Section>

      <Section icon="📱" title="Taking payments by QR code">
        <ul>
          <li>First, one time only: put your <b>UPI ID</b> in <Link to="/settings">Settings</Link> (it is in your GPay/PhonePe/Paytm profile).</li>
          <li>Then on any patient's page press <b>📱 Collect payment</b> — a QR code appears on the screen.</li>
          <li>The patient scans it with their phone and pays. The money goes <b>directly to your bank account</b> — no commission, no middleman.</li>
          <li>When your phone shows "money received", press <b>✅ Payment received</b> and it is written into today's income.</li>
        </ul>
      </Section>

      <Section icon="💊" title="Medicines">
        <ul>
          <li>When you use a bottle, press <b>−</b> next to it. When you buy, press <b>+</b> (or edit for bigger numbers).</li>
          <li>When something runs low, it appears in the <b>🛒 To-buy list</b> automatically — you can WhatsApp the whole list to your supplier in one tap.</li>
        </ul>
      </Section>

      <Section icon="💬" title="Sending messages to many patients">
        <ol>
          <li>Open <Link to="/messages">Messages</Link> and pick a ready-made message (or write your own). Where you write <b>{'{name}'}</b>, each patient's own name appears.</li>
          <li>Tick the patients you want.</li>
          <li>Press the green <b>Send</b> button — WhatsApp opens with the message ready. Press send there (add a photo with 📎 if you like), come back, press for the next patient.</li>
        </ol>
      </Section>

      <Section icon="🛟" title="Keeping your data safe">
        <ul>
          <li>Once a week, go to <Link to="/settings">Settings</Link> and press <b>⬇️ Download backup</b>. Keep the file in Google Drive or email it to yourself.</li>
          <li>If anything ever happens to the computer, <b>⬆️ Import backup</b> brings everything back.</li>
        </ul>
      </Section>

      <div className="note-box">
        ❓ Stuck on something? Ask Advait — and remember, you cannot spoil anything by
        clicking around. Every delete button asks "are you sure?" first.
      </div>
    </div>
  )
}
