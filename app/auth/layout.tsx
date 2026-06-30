import type { Metadata } from 'next'
import Link from 'next/link'
import Logo from '@/components/Logo'

export const metadata: Metadata = {
  title: 'Goru — Acceso',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          <Link href="/" aria-label="Volver al inicio">
            <Logo size={36} />
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
