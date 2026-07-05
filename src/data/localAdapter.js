// Saves everything in this browser (localStorage). Used until Firebase is configured.
const KEY = 'advait-clinic-data'

const EMPTY = { patients: [], visits: [], medicines: [], txns: [], settings: null }

function load() {
  try {
    return { ...EMPTY, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }
  } catch {
    return { ...EMPTY }
  }
}

function save(blob) {
  localStorage.setItem(KEY, JSON.stringify(blob))
}

export const localAdapter = {
  mode: 'local',

  async loadAll() {
    return load()
  },

  async put(coll, docObj) {
    const blob = load()
    const idx = blob[coll].findIndex((d) => d.id === docObj.id)
    if (idx >= 0) blob[coll][idx] = docObj
    else blob[coll].push(docObj)
    save(blob)
  },

  async remove(coll, id) {
    const blob = load()
    blob[coll] = blob[coll].filter((d) => d.id !== id)
    save(blob)
  },

  async saveSettings(settings) {
    const blob = load()
    blob.settings = settings
    save(blob)
  },

  async replaceAll(data) {
    save({ ...EMPTY, ...data })
  },
}
