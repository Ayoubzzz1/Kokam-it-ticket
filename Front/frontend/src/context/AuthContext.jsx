import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { homeForRole } from '../utils/labels'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem('kokam_access')
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/me/')
      .then((res) => setUser(res.data))
      .catch(() => {
        sessionStorage.removeItem('kokam_access')
        sessionStorage.removeItem('kokam_refresh')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email, password) {
        const { data } = await api.post('/auth/login/', { email, password })
        sessionStorage.setItem('kokam_access', data.access)
        sessionStorage.setItem('kokam_refresh', data.refresh)
        setUser(data.user)
        return homeForRole(data.user.role)
      },
      logout() {
        sessionStorage.removeItem('kokam_access')
        sessionStorage.removeItem('kokam_refresh')
        setUser(null)
      },
      setUser,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
