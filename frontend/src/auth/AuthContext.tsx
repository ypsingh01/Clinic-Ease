import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthSession, AuthUser, Role } from './types'
import { api, setApiToken, setUnauthorizedHandler } from '@/api/client'

const STORAGE_KEY = 'clinicease.session'
const USE_API = import.meta.env.VITE_USE_MOCK_CLINIC !== 'true'
const DEMO_LOGIN = import.meta.env.VITE_DEMO_LOGIN !== 'false'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  pendingPhone: string | null
  setPendingPhone: (phone: string | null) => void
  login: (email: string, password: string, captchaToken?: string) => Promise<AuthUser>
  beginPhoneLogin: (phone: string) => Promise<void>
  register: (input: {
    name: string
    email: string
    phone: string
    password: string
    captchaToken?: string
  }) => Promise<void>
  verifyOtp: (code: string) => Promise<AuthUser>
  logout: () => void
  enterAs: (role: Role) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const demoUsers: Record<Role, AuthUser> = {
  patient: {
    id: 'u-patient',
    name: 'Asha Verma',
    email: 'patient@clinicease.app',
    phone: '+91 98765 43210',
    role: 'patient',
    whatsappLinked: true,
  },
  doctor: {
    id: 'u-doctor',
    name: 'Dr. Mehta',
    email: 'doctor@clinicease.app',
    phone: '+91 98765 40001',
    role: 'doctor',
    whatsappLinked: true,
  },
  admin: {
    id: 'u-admin',
    name: 'Clinic Admin',
    email: 'admin@clinicease.app',
    phone: '+91 98765 40000',
    role: 'admin',
    whatsappLinked: true,
  },
}

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

function saveSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY)
    setApiToken(null)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  setApiToken(session.token)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadSession()
  const [user, setUser] = useState<AuthUser | null>(initial?.user ?? null)
  const [token, setToken] = useState<string | null>(initial?.token ?? null)
  const [pendingPhone, setPendingPhone] = useState<string | null>(null)

  useEffect(() => {
    if (initial?.token) setApiToken(initial.token)
  }, [initial?.token])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    saveSession(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      setToken(null)
      saveSession(null)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  // Drop stale / mock tokens when talking to the real API
  useEffect(() => {
    if (!USE_API || !initial?.token) return
    if (initial.token.startsWith('mock.')) {
      logout()
      return
    }
    void api<{ user: AuthUser }>('/api/auth/me')
      .then((data) => {
        setUser(data.user)
        setToken(initial.token)
        setApiToken(initial.token)
      })
      .catch(() => logout())
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot once
  }, [])

  const persist = useCallback((next: AuthUser, nextToken: string) => {
    const session: AuthSession = { user: next, token: nextToken }
    setUser(session.user)
    setToken(session.token)
    saveSession(session)
  }, [])

  const login = useCallback(
    async (email: string, password: string, captchaToken = 'ok') => {
      if (!USE_API) {
        await new Promise((r) => setTimeout(r, 300))
        const role: Role = email.includes('admin')
          ? 'admin'
          : email.includes('doctor') || email.includes('dr')
            ? 'doctor'
            : 'patient'
        const next = { ...demoUsers[role], email }
        persist(next, `mock.${role}.${Date.now()}`)
        return next
      }
      const data = await api<{ token: string; user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        json: { email, password, captchaToken },
      })
      persist(data.user, data.token)
      return data.user
    },
    [persist],
  )

  const beginPhoneLogin = useCallback(async (phone: string) => {
    setPendingPhone(phone.trim())
    sessionStorage.setItem('clinicease.pendingPhone', phone.trim())
    if (!USE_API) return
    await api('/api/auth/otp/send', { method: 'POST', json: { phone: phone.trim() } })
  }, [])

  const register = useCallback(
    async (input: {
      name: string
      email: string
      phone: string
      password: string
      captchaToken?: string
    }) => {
      setPendingPhone(input.phone)
      sessionStorage.setItem('clinicease.pendingPhone', input.phone)
      sessionStorage.setItem(
        'clinicease.pendingUser',
        JSON.stringify({
          name: input.name,
          email: input.email,
          phone: input.phone,
        }),
      )
      if (!USE_API) return
      await api('/api/auth/register', {
        method: 'POST',
        json: {
          ...input,
          captchaToken: input.captchaToken ?? 'ok',
        },
      })
    },
    [],
  )

  const verifyOtp = useCallback(
    async (code: string) => {
      if (code.trim().length < 4) throw new Error('Enter the 6-digit code we sent')
      const phone =
        pendingPhone ?? sessionStorage.getItem('clinicease.pendingPhone') ?? '+91 98765 43210'
      const draftRaw = sessionStorage.getItem('clinicease.pendingUser')
      const draft = draftRaw ? (JSON.parse(draftRaw) as { name?: string; email?: string }) : {}

      if (!USE_API) {
        const next = {
          ...demoUsers.patient,
          phone,
          name: draft.name ?? demoUsers.patient.name,
          email: draft.email ?? demoUsers.patient.email,
          whatsappLinked: true,
        }
        persist(next, `mock.patient.${Date.now()}`)
        setPendingPhone(null)
        sessionStorage.removeItem('clinicease.pendingUser')
        sessionStorage.removeItem('clinicease.pendingPhone')
        return next
      }

      const data = await api<{ token: string; user: AuthUser }>('/api/auth/otp/verify', {
        method: 'POST',
        json: { phone, code, name: draft.name, email: draft.email },
      })
      persist(data.user, data.token)
      setPendingPhone(null)
      sessionStorage.removeItem('clinicease.pendingUser')
      sessionStorage.removeItem('clinicease.pendingPhone')
      return data.user
    },
    [pendingPhone, persist],
  )

  const enterAs = useCallback(
    async (role: Role) => {
      const emails: Record<Role, string> = {
        patient: 'patient@clinicease.app',
        doctor: 'doctor@clinicease.app',
        admin: 'admin@clinicease.app',
      }
      if (USE_API) {
        await login(emails[role], 'demo1234', 'ok')
        return
      }
      if (!DEMO_LOGIN) throw new Error('Demo login is disabled')
      persist(demoUsers[role], `mock.${role}.${Date.now()}`)
    },
    [login, persist],
  )

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      pendingPhone,
      setPendingPhone,
      login,
      beginPhoneLogin,
      register,
      verifyOtp,
      logout,
      enterAs,
    }),
    [user, token, pendingPhone, login, beginPhoneLogin, register, verifyOtp, logout, enterAs],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function homePathForRole(role: Role) {
  if (role === 'doctor') return '/doctor'
  if (role === 'admin') return '/admin'
  return '/patient'
}
