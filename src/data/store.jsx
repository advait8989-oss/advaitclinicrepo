import { createContext, useContext, useEffect, useState } from 'react'
import { isFirebaseConfigured } from '../firebase-config'
import { SYNC_URL } from '../sync-config'
import { localAdapter } from './localAdapter'
import { remoteAdapter, hasToken } from './remoteAdapter'
import { uid, DEFAULT_SETTINGS } from './helpers'
import { makeSampleData } from './sample'

const StoreContext = createContext(null)
export const useStore = () => useContext(StoreContext)

const MODE = isFirebaseConfigured() ? 'firebase' : SYNC_URL ? 'cloud' : 'local'

let migrationAsked = false

export function StoreProvider({ children }) {
  const [adapter, setAdapter] = useState(
    MODE === 'local' ? localAdapter : MODE === 'cloud' ? remoteAdapter : null,
  )
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(MODE !== 'firebase')
  const [ready, setReady] = useState(false)
  const [data, setData] = useState({ patients: [], visits: [], medicines: [], txns: [] })
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS)

  // In firebase mode, load the adapter + watch login state.
  useEffect(() => {
    if (MODE !== 'firebase') return
    let unsub
    import('./firebaseAdapter').then((fb) => {
      setAdapter(() => fb.firebaseAdapter)
      unsub = fb.watchAuth((u) => {
        setUser(u)
        setAuthReady(true)
      })
    })
    return () => unsub && unsub()
  }, [])

  // Load all data once storage is usable (local: immediately, cloud/firebase: after login).
  useEffect(() => {
    if (!adapter || (MODE === 'firebase' && !user) || (MODE === 'cloud' && !hasToken())) return
    adapter.loadAll().then(async (all) => {
      let use = all
      // First cloud login from a device that already has records saved on it:
      // offer to move them up so every device sees them.
      const cloudEmpty = !all.patients.length && !all.visits.length &&
        !all.medicines.length && !all.txns.length
      if (MODE === 'cloud' && cloudEmpty && !migrationAsked) {
        migrationAsked = true
        try {
          const local = JSON.parse(localStorage.getItem('advait-clinic-data'))
          const hasLocal = local && (local.patients?.length || local.medicines?.length || local.txns?.length)
          if (hasLocal && confirm('This device has clinic records saved on it. Move them to the cloud so all devices can see them?')) {
            await adapter.replaceAll(local)
            use = { ...all, ...local }
          }
        } catch { /* no local data */ }
      }
      setData({
        patients: use.patients || [], visits: use.visits || [],
        medicines: use.medicines || [], txns: use.txns || [],
      })
      if (use.settings) setSettingsState({ ...DEFAULT_SETTINGS, ...use.settings })
      setReady(true)
    })
  }, [adapter, user])

  const add = (coll, obj) => {
    const docObj = { id: uid(), createdAt: new Date().toISOString(), ...obj }
    setData((d) => ({ ...d, [coll]: [...d[coll], docObj] }))
    adapter.put(coll, docObj)
    return docObj
  }

  const update = (coll, id, patch) => {
    const current = data[coll].find((x) => x.id === id)
    if (!current) return
    adapter.put(coll, { ...current, ...patch })
    setData((d) => ({ ...d, [coll]: d[coll].map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  }

  const remove = (coll, id) => {
    setData((d) => ({ ...d, [coll]: d[coll].filter((x) => x.id !== id) }))
    adapter.remove(coll, id)
  }

  const saveSettings = (patch) => {
    const next = { ...settings, ...patch }
    setSettingsState(next)
    adapter.saveSettings(next)
  }

  const loadSample = async () => {
    const sample = makeSampleData()
    await adapter.replaceAll({ ...sample, settings })
    setData(sample)
  }

  const clearAll = async () => {
    const empty = { patients: [], visits: [], medicines: [], txns: [] }
    await adapter.replaceAll({ ...empty, settings })
    setData(empty)
  }

  const exportJSON = () => JSON.stringify({ ...data, settings }, null, 2)

  const importJSON = async (json) => {
    const parsed = JSON.parse(json)
    const next = {
      patients: parsed.patients || [], visits: parsed.visits || [],
      medicines: parsed.medicines || [], txns: parsed.txns || [],
    }
    await adapter.replaceAll({ ...next, settings: parsed.settings || settings })
    setData(next)
    if (parsed.settings) setSettingsState({ ...DEFAULT_SETTINGS, ...parsed.settings })
  }

  const value = {
    mode: MODE, ready, authReady, user, settings,
    ...data,
    add, update, remove, saveSettings, loadSample, clearAll, exportJSON, importJSON,
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
