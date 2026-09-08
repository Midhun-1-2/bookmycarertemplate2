import { createContext, useContext, useEffect, useState } from 'react'
import { usersApi, staffApi, adminsApi } from './mockApi'

const SESSION_KEY = 'bmc:session'
const SessionContext = createContext(null)

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(loadSession)

  useEffect(() => {
    saveSession(session)
  }, [session])

  async function loginUser(phone, name) {
    const users = await usersApi.list()
    let account = users.find((u) => u.phone === phone)
    if (!account) {
      account = { id: `user-${Date.now()}`, name: name || 'New Care Seeker', phone, city: '', area: '' }
      await usersApi.create(account)
    }
    const next = { id: account.id, name: account.name, phone, role: 'user' }
    setSession(next)
    return { ok: true, session: next }
  }

  async function loginStaff(phone) {
    const staff = await staffApi.list()
    const account = staff.find((s) => s.phone === phone)
    if (!account) {
      return { ok: false, message: 'No staff account found for this number. Ask your Admin to create one.' }
    }
    const next = { id: account.id, name: account.name, phone, role: 'staff' }
    setSession(next)
    return { ok: true, session: next }
  }

  async function loginAdmin(phone, expectedRole) {
    const admins = await adminsApi.list()
    const account = admins.find((a) => a.phone === phone && a.role === expectedRole)
    if (!account) {
      const label = expectedRole === 'super-admin' ? 'Super Admin' : 'Admin'
      return { ok: false, message: `No ${label} account found for this number.` }
    }
    const next = { id: account.id, name: account.name, phone, role: account.role }
    setSession(next)
    return { ok: true, session: next }
  }

  function logout() {
    setSession(null)
  }

  const value = { session, loginUser, loginStaff, loginAdmin, logout }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
