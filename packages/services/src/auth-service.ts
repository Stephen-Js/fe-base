export type LoginCredentials = {
  username: string
  password: string
}

export type LoginResult = {
  token: string
  user: {
    username: string
    displayName: string
  }
}

const DEFAULT_USERNAME = 'admin'
const DEFAULT_PASSWORD = '123456'

export async function mockLogin({
  username,
  password,
}: LoginCredentials): Promise<LoginResult> {
  const normalizedUsername = username.trim()

  if (normalizedUsername !== DEFAULT_USERNAME || password !== DEFAULT_PASSWORD) {
    throw new Error('账号或密码错误')
  }

  return {
    token: `mock-token-${normalizedUsername}-${Date.now()}`,
    user: {
      username: normalizedUsername,
      displayName: '管理员',
    },
  }
}
