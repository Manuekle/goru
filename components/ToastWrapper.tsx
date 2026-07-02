'use client'

import { ToastProvider } from '@/components/ui/toast'
import type { ReactNode } from 'react'

export function ToastWrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
