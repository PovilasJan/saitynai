import { createContext, useContext, useEffect, useState } from 'react'
import { api, getAuth, setAuth } from './api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getAuth()?.user || null)

  useEffect(() => {
    const sync = () => setUser(getAuth()?.user || null)
    window.addEventListener('auth', sync)
    return () => window.removeEventListener('auth', sync)
  }, [])

  const save = (data) => { setAuth(data); setUser(data.user) }
  const login = async (username, password) => save(await api('/auth/login', { method: 'POST', body: { username, password } }))
  const register = async (username, password) => save(await api('/auth/register', { method: 'POST', body: { username, password } }))
  const logout = async () => {
    const a = getAuth()
    await api('/auth/logout', { method: 'POST', body: { refreshToken: a?.refreshToken } }).catch(() => {})
    setAuth(null); setUser(null)
  }

  return <Ctx.Provider value={{ user, login, register, logout, isAdmin: user?.role === 'admin' }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
