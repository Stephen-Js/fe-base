'use client'

import { useEffect, useState } from 'react'

interface MockProviderProps {
  children: React.ReactNode
}

const isDevelopment = process.env.NODE_ENV === 'development'
const isMswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW !== 'false'
const shouldEnableMsw = isDevelopment && isMswEnabled

export function MockProvider({ children }: MockProviderProps) {
  const [isReady, setIsReady] = useState(!shouldEnableMsw)

  useEffect(() => {
    if (!shouldEnableMsw) {
      return
    }

    let isMounted = true

    async function startWorker() {
      const { worker } = await import('@/mocks/browser')
      await worker.start({
        onUnhandledRequest: 'bypass',
      })

      if (isMounted) {
        setIsReady(true)
      }
    }

    void startWorker().catch(() => {
      if (isMounted) {
        setIsReady(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  if (!isReady) {
    return null
  }

  return <>{children}</>
}
