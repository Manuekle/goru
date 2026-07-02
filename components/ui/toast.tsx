'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkBadge01Icon, CancelCircleIcon, InformationCircleIcon, CancelIcon } from '@hugeicons/core-free-icons'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  exiting: boolean
}

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(42,138,62,.18)', border: 'rgba(76,175,112,.4)', icon: '#4caf70' },
  error:   { bg: 'rgba(200,60,60,.16)',  border: 'rgba(229,115,115,.4)', icon: '#e57373' },
  info:    { bg: 'rgba(168,41,20,.14)',  border: 'rgba(168,41,20,.35)',  icon: 'var(--brand)' },
}

const ICON: Record<ToastType, typeof CheckmarkBadge01Icon> = {
  success: CheckmarkBadge01Icon,
  error:   CancelCircleIcon,
  info:    InformationCircleIcon,
}

interface ToastAPI {
  success: (message: string) => void
  error:   (message: string) => void
  info:    (message: string) => void
}

const ToastContext = createContext<ToastAPI | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => { setMounted(true) }, [])

  const add = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const duration = type === 'error' ? 6000 : 4000

    setToasts(prev => [...prev, { id, type, message, exiting: false }])

    // start exit animation before removing
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    }, duration - 300)

    // remove from DOM
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
  }, [])

  const api: ToastAPI = {
    success: (msg: string) => add('success', msg),
    error:   (msg: string) => add('error', msg),
    info:    (msg: string) => add('info', msg),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            aria-label="Notificaciones"
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxWidth: 380,
              pointerEvents: 'none',
            }}
          >
            {toasts.map(t => {
              const c = COLORS[t.type]
              const Icon = ICON[t.type]
              return (
                <div
                  key={t.id}
                  role="status"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 'var(--r-sm)',
                    padding: '12px 14px',
                    pointerEvents: 'auto',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    animation: t.exiting
                      ? 'toast-exit 0.28s var(--ease-in) forwards'
                      : 'toast-enter 0.32s var(--ease-out)',
                  }}
                >
                  <HugeiconsIcon
                    icon={Icon}
                    size={18}
                    style={{ color: c.icon, flexShrink: 0, marginTop: 1 }}
                  />
                  <p style={{
                    flex: 1,
                    fontSize: 13.5,
                    color: 'var(--ink)',
                    lineHeight: 1.5,
                    letterSpacing: '-0.005em',
                    fontWeight: 500,
                    margin: 0,
                  }}>
                    {t.message}
                  </p>
                  <button
                    onClick={() => dismiss(t.id)}
                    aria-label="Cerrar"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted-text)',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <HugeiconsIcon icon={CancelIcon} size={14} />
                  </button>
                </div>
              )
            })}
          </div>,
          document.body
        )}
      <style>{`
        @keyframes toast-enter {
          from { opacity:0; transform:translateX(24px) scale(0.95); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }
        @keyframes toast-exit {
          from { opacity:1; transform:translateX(0) scale(1); }
          to   { opacity:0; transform:translateX(16px) scale(0.95); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
