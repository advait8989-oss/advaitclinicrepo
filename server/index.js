// Sync server for the Advait Clinic app.
// Stores the whole clinic dataset as one JSON file on a persistent volume.
// Auth: single clinic password (CLINIC_PASSWORD env) exchanged for a bearer token.
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const PORT = process.env.PORT || 8787
const DATA_FILE = process.env.DATA_FILE || '/data/clinic.json'
const PASSWORD = process.env.CLINIC_PASSWORD || 'change-me'
const SECRET = process.env.TOKEN_SECRET ||
  crypto.createHash('sha256').update('advait-clinic:' + PASSWORD).digest('hex')

const COLLECTIONS = ['patients', 'visits', 'medicines', 'txns']
const EMPTY = { patients: [], visits: [], medicines: [], txns: [], settings: null }

const makeToken = () =>
  crypto.createHmac('sha256', SECRET).update('clinic-token-v1').digest('hex')

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

function load() {
  try {
    return { ...EMPTY, ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) }
  } catch {
    return { ...EMPTY }
  }
}

function save(blob) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  const tmp = DATA_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(blob))
  fs.renameSync(tmp, DATA_FILE)
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.post('/login', (req, res) => {
  if (safeEqual(req.body?.password || '', PASSWORD)) return res.json({ token: makeToken() })
  res.status(401).json({ error: 'wrong password' })
})

app.use((req, res, next) => {
  const got = (req.headers.authorization || '').replace('Bearer ', '')
  if (got && safeEqual(got, makeToken())) return next()
  res.status(401).json({ error: 'not signed in' })
})

app.get('/data', (_req, res) => res.json(load()))

app.put('/doc/:coll/:id', (req, res) => {
  const { coll, id } = req.params
  if (!COLLECTIONS.includes(coll)) return res.status(400).json({ error: 'bad collection' })
  const blob = load()
  const docObj = { ...req.body, id }
  const idx = blob[coll].findIndex((d) => d.id === id)
  if (idx >= 0) blob[coll][idx] = docObj
  else blob[coll].push(docObj)
  save(blob)
  res.json({ ok: true })
})

app.delete('/doc/:coll/:id', (req, res) => {
  const { coll, id } = req.params
  if (!COLLECTIONS.includes(coll)) return res.status(400).json({ error: 'bad collection' })
  const blob = load()
  blob[coll] = blob[coll].filter((d) => d.id !== id)
  save(blob)
  res.json({ ok: true })
})

app.put('/settings', (req, res) => {
  const blob = load()
  blob.settings = req.body || null
  save(blob)
  res.json({ ok: true })
})

app.put('/all', (req, res) => {
  const next = { ...EMPTY }
  for (const c of COLLECTIONS) {
    if (req.body?.[c] && !Array.isArray(req.body[c])) return res.status(400).json({ error: 'bad data' })
    next[c] = req.body?.[c] || []
  }
  next.settings = req.body?.settings || null
  save(next)
  res.json({ ok: true })
})

app.listen(PORT, () => console.log(`Clinic sync server on :${PORT}, data at ${DATA_FILE}`))
