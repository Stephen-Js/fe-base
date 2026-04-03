import { describe, expect, it } from 'vitest'

import { mockLogin } from './auth-service'

describe('mockLogin', () => {
  it('returns a token for the default admin account', async () => {
    const result = await mockLogin({
      username: 'admin',
      password: '123456',
    })

    expect(result.token).toContain('mock-token-admin-')
    expect(result.user.username).toBe('admin')
  })

  it('rejects invalid credentials', async () => {
    await expect(
      mockLogin({
        username: 'wrong',
        password: 'wrong',
      })
    ).rejects.toThrow('账号或密码错误')
  })
})
