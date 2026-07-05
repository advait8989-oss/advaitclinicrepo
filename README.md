# 🌿 Advait Homoeopathic Clinic — Clinic Manager

A simple, private clinic management app for **Dr. Anuprita Dhakane** — patients, visit
history, medicine inventory, money tracking, and WhatsApp messages to patients.

## What's inside

| Section | What it does |
| --- | --- |
| **Dashboard** | Today's patients & collection, follow-ups due (with one-click WhatsApp reminders), medicines running low |
| **Patients** | Full patient register — name, **case paper number**, mobile, age, address, medical history, and a visit timeline (symptoms, remedy, potency, dosage, fee, follow-up date). Search by name, case number, or phone |
| **Medicines** | Inventory with stock counts, +/− buttons for daily use, automatic **to-buy list** when stock runs low (copy it or WhatsApp it to the supplier) |
| **Money** | Every rupee in and out — consultation fees are added automatically when a visit is saved (first visit is categorised as "New Patient"); add salaries, rent, purchases; daily/weekly/monthly totals, a 14-day chart, and a **pending payments** list for patients who pay later |
| **UPI payments** | "Collect payment" (on a patient's page or the Money page) shows a QR code for any amount — patient scans with GPay/PhonePe/Paytm and pays straight to the clinic's bank account, zero fees. Set the UPI ID once in Settings. Can also send a payment request on WhatsApp |
| **Help** | A built-in plain-language guide to every feature |
| **Messages** | Write one message, pick patients, and send personalised WhatsApp messages one tap at a time ({name} is filled in automatically). Photos: attach inside WhatsApp before sending |
| **Settings** | Clinic profile, default fee, backup download/import, sample data |

## Live URLs

The app is hosted **free on GitHub Pages** (share this one):

**<https://advait8989-oss.github.io/advaitclinicrepo/>**

A second copy runs on Railway (paid account): <https://advait-clinic-production.up.railway.app>

Open the link on her phone → browser menu → **Add to Home Screen** — it installs like a
real app with the clinic's leaf icon and works offline after the first open.

Source code: <https://github.com/advait8989-oss/advaitclinicrepo>

### Hosting on Vercel instead (optional, 2 minutes)

The repo is Vercel-ready. Go to <https://vercel.com/new>, sign in with the GitHub
account, pick `advaitclinicrepo`, press Deploy — Vite is auto-detected, no settings
needed. You get `advaitclinicrepo.vercel.app` for free.

⚠️ Note: until Firebase is connected, data lives **per device** — records entered on
the phone stay on the phone, records on the laptop stay on the laptop. Connect
Firebase (below) to share one database across devices.

Redeploying after code changes:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
cd ~/homeoclinic && npm run build
# GitHub Pages (the free shared link):
cd dist && rm -rf .git && git init -qb gh-pages && git add -A && git commit -qm deploy \
  && git push -f https://github.com/advait8989-oss/advaitclinicrepo.git gh-pages && cd ..
# Railway copy (optional):
railway up --detach --service advait-clinic
```

## Running the app

```bash
export PATH="$HOME/.local/node/bin:$PATH"   # Node.js lives here on this Mac
cd ~/homeoclinic
npm run dev        # then open http://localhost:5173
```

To make a production build (deployable to Firebase Hosting, Netlify, Vercel…):

```bash
npm run build      # output goes to dist/
```

## Where is the data?

Out of the box the app runs in **"This Device" mode** — everything is stored in the
browser on this computer. It works fully offline. **Download a backup from Settings
regularly** (weekly is good).

## Connecting Firebase (cloud sync — recommended)

The free Firebase plan is far more than a clinic needs (50k reads/20k writes per day).
Once connected, data is backed up in the cloud automatically and the same records can
be opened from a phone or a second computer, protected by email + password login.

1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. **Create a project** (e.g. `advait-clinic`). Google Analytics can be off.
3. Click the **`</>` (Web)** icon to add a web app. Copy the `firebaseConfig` block it shows.
4. Open `src/firebase-config.js` in this folder and paste the values into the empty strings.
5. Back in the Firebase console:
   - **Build → Authentication → Sign-in method** → enable **Email/Password**.
   - **Build → Firestore Database** → Create database → Start in **production mode**.
   - In Firestore → **Rules**, paste this so only signed-in users can read/write:

     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```

6. Restart the app. It now shows a login screen — click **Create account** once
   (use the clinic email), then sign in with that email/password from any device.
7. If there is already data on this device, download a backup from Settings **before**
   connecting, then use **Import backup** after signing in to move it to the cloud.

### Putting it on the internet (so it opens on her phone)

```bash
npm run build
npx firebase-tools login
npx firebase-tools init hosting    # choose the same project, public dir = dist, single-page = yes
npx firebase-tools deploy
```

This gives a permanent URL like `https://advait-clinic.web.app` — open it on any
phone/laptop and log in. (Firebase Hosting is free at this scale.)

## Card payments / Razorpay (optional, later)

UPI QR covers almost every payment in an Indian clinic for free. If card payments or
automatic reconciliation are ever needed, **Razorpay** is the standard choice:
the clinic owner must open a merchant account (KYC: PAN, bank proof — takes a few
days) and fees are ~2% per transaction. Their no-code **Payment Links / QR** products
work without touching this app; a full checkout integration would need a small
backend (a Firebase Cloud Function) to create orders securely. Not worth it until
UPI stops being enough.

## WhatsApp API upgrade (optional, paid)

The built-in Messages page uses WhatsApp click-to-send: free, uses the clinic's own
WhatsApp, but needs one tap per patient and photos are attached manually.

For **fully automatic** bulk sending (including images sent programmatically):

- Requires the **WhatsApp Business Platform (Cloud API)** — a Meta business
  verification + a dedicated phone number.
- Cost in India (2026): roughly **₹0.78–0.88 per marketing message**; service/utility
  messages are cheaper. 200 patients × 1 message/month ≈ ₹170/month.
- Easiest route is a provider like **Interakt, AiSensy, WATI or Twilio** which handles
  the Meta approval and gives a simple dashboard + API.
- Message templates must be pre-approved by Meta (greetings/reminders are approved easily).

Given the clinic's size, the free click-to-send method is usually the sensible choice;
upgrade only if bulk messaging becomes a weekly chore.

## Tech notes (for whoever maintains this)

- React 18 + Vite, plain CSS (`src/styles.css`), React Router (hash routing so it
  works on any static host).
- Storage adapters in `src/data/`: `localAdapter.js` (localStorage) and
  `firebaseAdapter.js` (Firestore + Auth). The app picks Firebase automatically when
  `src/firebase-config.js` is filled in.
- Collections: `patients`, `visits`, `medicines`, `txns`, plus a `meta/settings` doc.
- Saving a paid visit also writes an income transaction (category "Consultation")
  linked via `visitId`; deleting the visit removes the linked transaction.
