'use client'

import { NiceModal } from '@repo/ui/custom/modal'
import type { ReactNode } from 'react'

interface NiceModalProviderProps {
  children: ReactNode
}

export function NiceModalProvider({ children }: NiceModalProviderProps) {
  return <NiceModal.Provider>{children}</NiceModal.Provider>
}
