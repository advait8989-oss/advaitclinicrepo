// Cloud storage via the clinic's own sync server (see server/index.js).
// One clinic password → same data on every device.
import { SYNC_URL } from '../sync-config'

const TOKEN_KEY = 'advait-sync-token'

export const hasToken = () => Boolean(localStorage.getItem(TOKEN_KEY))

export async function cloudLogin(password) {
  const res = await fetch(SYNC_URL + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) throw new Error('wrong-password')
  const { token } = await res.json()
  localStorage.setItem(TOKEN_KEY, token)
}

export function cloudLogout() {
  localStorage.removeItem(TOKEN_KEY)
  window.location.reload()
}

let lastAlert = 0
function syncTrouble(err) {
  console.error('cloud sync:', err)
  if (Date.now() - lastAlert > 30000) {
    lastAlert = Date.now()
    alert('Could not reach the cloud — please check the internet connection. Your last change may not be saved.')
  }
  throw err
}

async function call(path, opts = {}) {
  let res
  try {
    res = await fetch(SYNC_URL + path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem(TOKEN_KEY),
        ...(opts.headers || {}),
      },
    })
  } catch (err) {
    syncTrouble(err)
  }
  if (res.status === 401) {
    // Password was changed on the server — ask for it again.
    localStorage.removeItem(TOKEN_KEY)
    window.location.reload()
    throw new Error('unauthorized')
  }
  if (!res.ok) syncTrouble(new Error('HTTP ' + res.status))
  return res.json()
}

export const remoteAdapter = {
  mode: 'cloud',
  loadAll: () => call('/data'),
  put: (coll, docObj) => call(`/doc/${coll}/${docObj.id}`, { method: 'PUT', body: JSON.stringify(docObj) }),
  remove: (coll, id) => call(`/doc/${coll}/${id}`, { method: 'DELETE' }),
  saveSettings: (s) => call('/settings', { method: 'PUT', body: JSON.stringify(s) }),
  replaceAll: (data) => call('/all', { method: 'PUT', body: JSON.stringify(data) }),
}
