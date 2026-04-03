'use client'

import { mockLogin, type LoginCredentials } from '@repo/services'
import { useAuthStore } from '@repo/store'
import { useState } from 'react'

type UseLoginOptions = {
  onSuccess?: () => void
}

export function useLogin(options: UseLoginOptions = {}) {
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function submit(credentials: LoginCredentials) {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await mockLogin(credentials)

      login(result.token)
      options.onSuccess?.()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '登录失败，请稍后再试')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    errorMessage,
    login: submit,
  }
}
