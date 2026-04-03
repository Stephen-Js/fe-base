'use client'

import { useAuthGuard, useLogin } from '@repo/hooks'
import { LoginPage } from '@repo/pages'
import { useRouter } from 'next/navigation'

export default function LoginRoutePage() {
  const router = useRouter()
  useAuthGuard({
    mode: 'guest',
  })
  const { login, isLoading, errorMessage } = useLogin({
    onSuccess: () => {
      router.replace('/')
    },
  })

  return <LoginPage isLoading={isLoading} errorMessage={errorMessage} onSubmit={login} />
}
