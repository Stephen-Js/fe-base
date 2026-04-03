'use client'

import { useAuthStore } from '@repo/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type AuthGuardMode = 'protected' | 'guest'

type ResolveAuthGuardRedirectOptions = {
  mode: AuthGuardMode
  isAuthenticated: boolean
  isHydrated: boolean
}

type UseAuthGuardOptions = {
  mode: AuthGuardMode
  protectedRedirectTo?: string
  guestRedirectTo?: string
}

export function resolveAuthGuardRedirect({
  mode,
  isAuthenticated,
  isHydrated,
}: ResolveAuthGuardRedirectOptions) {
  if (!isHydrated) {
    return null
  }

  if (mode === 'protected' && !isAuthenticated) {
    return '/login'
  }

  if (mode === 'guest' && isAuthenticated) {
    return '/'
  }

  return null
}

export function useAuthGuard({
  mode,
  protectedRedirectTo = '/login',
  guestRedirectTo = '/',
}: UseAuthGuardOptions) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])

  useEffect(() => {
    const target =
      resolveAuthGuardRedirect({
        mode,
        isAuthenticated,
        isHydrated,
      }) ??
      null

    if (target === '/login') {
      router.replace(protectedRedirectTo)
    }

    if (target === '/') {
      router.replace(guestRedirectTo)
    }
  }, [guestRedirectTo, isAuthenticated, isHydrated, mode, protectedRedirectTo, router])

  return {
    isAuthenticated,
    isHydrated,
  }
}
