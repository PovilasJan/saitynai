const KEY = 'edh_auth'

export const getAuth = () => JSON.parse(localStorage.getItem(KEY) || 'null')
export const setAuth = (a) => (a ? localStorage.setItem(KEY, JSON.stringify(a)) : localStorage.removeItem(KEY))

let refreshing = null

async function refresh() {
  const a = getAuth()
  if (!a?.refreshToken) return false
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: a.refreshToken }),
  })
  if (!res.ok) { setAuth(null); window.dispatchEvent(new Event('auth')); return false }
  setAuth(await res.json())
  return true
}

// fetch wrapper: prideda access token, pasibaigus - automatiškai atnaujina per refresh
export async function api(path, { method = 'GET', body } = {}, retry = true) {
  const a = getAuth()
  const headers = { 'Content-Type': 'application/json' }
  if (a?.accessToken) headers.Authorization = `Bearer ${a.accessToken}`
  const res = await fetch('/api' + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  if (res.status === 401 && retry && a?.refreshToken && !path.startsWith('/auth/')) {
    refreshing = refreshing || refresh().finally(() => (refreshing = null))
    if (await refreshing) return api(path, { method, body }, false)
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    const msg = data?.details ? data.details.join(', ') : data?.error || 'Klaida'
    throw new Error(msg)
  }
  return data
}
