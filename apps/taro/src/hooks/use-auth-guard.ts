import Taro from '@tarojs/taro'
import { useEffect } from 'react'

// TODO: 等 Taro 配置完善后，启用 @repo/store
// import { useAuthStore } from '@repo/store'

type AuthGuardMode = 'protected' | 'guest'

type UseAuthGuardOptions = {
  mode: AuthGuardMode
  protectedRedirectTo?: string
  guestRedirectTo?: string
}

/**
 * 解析认证守卫重定向目标（纯逻辑，可复用）
 */
export function resolveAuthGuardRedirect(
  mode: AuthGuardMode,
  isAuthenticated: boolean,
  isHydrated: boolean
): string | null {
  if (!isHydrated) {
    return null
  }

  if (mode === 'protected' && !isAuthenticated) {
    return '/pages/login/index'
  }

  if (mode === 'guest' && isAuthenticated) {
    return '/pages/index/index'
  }

  return null
}

/**
 * Taro 认证守卫 Hook
 * 注意：使用 Taro 路由 API，不依赖 next/navigation
 * TODO: 等 Taro 配置完善后，启用 @repo/store
 */
export function useAuthGuard({
  mode,
  protectedRedirectTo = '/pages/login/index',
  guestRedirectTo = '/pages/index/index',
}: UseAuthGuardOptions) {
  // TODO: 启用 @repo/store 后恢复
  // const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  // const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = false
  const isHydrated = true

  // TODO: 启用 @repo/store 后恢复
  // useEffect(() => {
  //   useAuthStore.getState().hydrate()
  // }, [])

  useEffect(() => {
    const target = resolveAuthGuardRedirect(mode, isAuthenticated, isHydrated)

    if (target) {
      const redirectUrl = target === '/pages/login/index' ? protectedRedirectTo : guestRedirectTo

      Taro.redirectTo({ url: redirectUrl })
    }
  }, [mode, isAuthenticated, isHydrated, protectedRedirectTo, guestRedirectTo])

  return {
    isAuthenticated,
    isHydrated,
  }
}
