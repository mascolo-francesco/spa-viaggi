'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { User } from '@/types'
import { api } from '@/lib/api'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getInitialAuthState(): { token: string | null; user: User | null } {
  if (typeof window === 'undefined') {
    return { token: null, user: null }
  }

  const token = localStorage.getItem('access_token')
  const rawUser = localStorage.getItem('user')
  if (!token || !rawUser) {
    return { token: null, user: null }
  }

  try {
    return { token, user: JSON.parse(rawUser) as User }
  } catch {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState(getInitialAuthState)

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.login(username, password)
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setAuthState({ token: response.access_token, user: response.user })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setAuthState({ token: null, user: null })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        isLoading: false,
        isAuthenticated: !!authState.token && !!authState.user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
