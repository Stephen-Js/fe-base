'use client'

import { create } from 'zustand'

export const AUTH_TOKEN_KEY = 'token'

type AuthState = {
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  hydrate: () => void
  login: (token: string) => void
  logout: () => void
}

function readToken() {
  if (typeof globalThis.localStorage === 'undefined') {
    return null
  }

  return globalThis.localStorage.getItem(AUTH_TOKEN_KEY)
}

function writeToken(token: string) {
  if (typeof globalThis.localStorage === 'undefined') {
    return
  }

  globalThis.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

function clearToken() {
  if (typeof globalThis.localStorage === 'undefined') {
    return
  }

  globalThis.localStorage.removeItem(AUTH_TOKEN_KEY)
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  isHydrated: false,
  hydrate: () => {
    const token = readToken()

    set({
      token,
      isAuthenticated: Boolean(token),
      isHydrated: true,
    })
  },
  login: (token) => {
    writeToken(token)

    set({
      token,
      isAuthenticated: true,
      isHydrated: true,
    })
  },
  logout: () => {
    clearToken()

    set({
      token: null,
      isAuthenticated: false,
      isHydrated: true,
    })
  },
}))
