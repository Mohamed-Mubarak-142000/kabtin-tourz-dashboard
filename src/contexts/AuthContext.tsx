import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { login as loginRequest } from '@/lib/services'
import {
  clearToken,
  getToken,
  getUsername,
  setToken as persistToken,
  setUsername as persistUsername,
} from '@/lib/auth'

type AuthContextValue = {
  token: string | null
  username: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getToken())
  const [username, setUsernameState] = useState<string | null>(getUsername())

  const login = useCallback(async (user: string, password: string) => {
    const res = await loginRequest(user, password)
    if (!res.success || !res.data?.token) {
      throw new Error(res.error || 'فشل تسجيل الدخول')
    }
    persistToken(res.data.token)
    persistUsername(user)
    setToken(res.data.token)
    setUsernameState(user)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setToken(null)
    setUsernameState(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      username,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [token, username, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
