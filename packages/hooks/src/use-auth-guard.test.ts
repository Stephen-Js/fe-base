import { describe, expect, it } from 'vitest'

import { resolveAuthGuardRedirect } from './use-auth-guard'

describe('resolveAuthGuardRedirect', () => {
  it('redirects protected routes to login when unauthenticated after hydration', () => {
    expect(
      resolveAuthGuardRedirect({
        mode: 'protected',
        isAuthenticated: false,
        isHydrated: true,
      })
    ).toBe('/login')
  })

  it('redirects guest routes to home when authenticated after hydration', () => {
    expect(
      resolveAuthGuardRedirect({
        mode: 'guest',
        isAuthenticated: true,
        isHydrated: true,
      })
    ).toBe('/')
  })

  it('does not redirect before hydration completes', () => {
    expect(
      resolveAuthGuardRedirect({
        mode: 'guest',
        isAuthenticated: true,
        isHydrated: false,
      })
    ).toBeNull()
  })
})
