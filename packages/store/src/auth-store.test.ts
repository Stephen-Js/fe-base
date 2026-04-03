import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AUTH_TOKEN_KEY, useAuthStore } from './auth-store'

function createStorage() {
  const store = new Map<string, string>()

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key)
    }),
    clear: vi.fn(() => {
      store.clear()
    }),
  }
}

describe('useAuthStore', () => {
  beforeEach(() => {
    const localStorage = createStorage()

    vi.stubGlobal('localStorage', localStorage)
    useAuthStore.setState({
      token: null,
      isAuthenticated: false,
      isHydrated: false,
    })
  })

  it('persists token on login', () => {
    useAuthStore.getState().login('mock-token')

    expect(localStorage.setItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY, 'mock-token')
    expect(useAuthStore.getState().token).toBe('mock-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('hydrates token from localStorage', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'persisted-token')

    useAuthStore.getState().hydrate()

    expect(useAuthStore.getState().token).toBe('persisted-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().isHydrated).toBe(true)
  })

  it('clears token on logout', () => {
    useAuthStore.getState().login('mock-token')

    useAuthStore.getState().logout()

    expect(localStorage.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY)
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
