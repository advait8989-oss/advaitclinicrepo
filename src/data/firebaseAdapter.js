// Cloud storage via Firebase (Firestore + Auth). Active once
// src/firebase-config.js is filled in — see README.md.
import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, getDocs, doc, setDoc, deleteDoc, getDoc, writeBatch,
} from 'firebase/firestore'
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
} from 'firebase/auth'
import { firebaseConfig } from '../firebase-config'

const COLLECTIONS = ['patients', 'visits', 'medicines', 'txns']

let app, db, auth
function ensure() {
  if (!app) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
  }
}

export function watchAuth(cb) {
  ensure()
  return onAuthStateChanged(auth, cb)
}

export function login(email, password) {
  ensure()
  return signInWithEmailAndPassword(auth, email, password)
}

export function register(email, password) {
  ensure()
  return createUserWithEmailAndPassword(auth, email, password)
}

export function logout() {
  ensure()
  return signOut(auth)
}

export const firebaseAdapter = {
  mode: 'firebase',

  async loadAll() {
    ensure()
    const out = { patients: [], visits: [], medicines: [], txns: [], settings: null }
    for (const c of COLLECTIONS) {
      const snap = await getDocs(collection(db, c))
      out[c] = snap.docs.map((d) => d.data())
    }
    const s = await getDoc(doc(db, 'meta', 'settings'))
    out.settings = s.exists() ? s.data() : null
    return out
  },

  async put(coll, docObj) {
    ensure()
    await setDoc(doc(db, coll, docObj.id), docObj)
  },

  async remove(coll, id) {
    ensure()
    await deleteDoc(doc(db, coll, id))
  },

  async saveSettings(settings) {
    ensure()
    await setDoc(doc(db, 'meta', 'settings'), settings)
  },

  async replaceAll(data) {
    ensure()
    // Firestore batches are capped at 500 writes.
    let batch = writeBatch(db)
    let count = 0
    const flushIfFull = async () => {
      if (++count >= 450) {
        await batch.commit()
        batch = writeBatch(db)
        count = 0
      }
    }
    for (const c of COLLECTIONS) {
      const existing = await getDocs(collection(db, c))
      const keep = new Set((data[c] || []).map((d) => d.id))
      for (const snap of existing.docs) {
        if (!keep.has(snap.id)) {
          batch.delete(snap.ref)
          await flushIfFull()
        }
      }
      for (const d of data[c] || []) {
        batch.set(doc(db, c, d.id), d)
        await flushIfFull()
      }
    }
    if (data.settings) batch.set(doc(db, 'meta', 'settings'), data.settings)
    await batch.commit()
  },
}
