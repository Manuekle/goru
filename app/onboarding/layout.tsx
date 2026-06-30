import type { Metadata } from 'next'
import Logo from '@/components/Logo'

export const metadata: Metadata = {
  title: 'Goru — Configurar tu complejo',
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="onboarding-shell">
      <header className="onboarding-header">
        <Logo size={28} />
        <span className="onboarding-header__brand">Goru</span>
      </header>
      <div className="onboarding-body">{children}</div>
    </div>
  )
}
