import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Goru — El software para gestionar tu negocio de canchas',
  description:
    'Goru es la plataforma que usan los negocios de canchas sintéticas para vender reservas, cobrar online y administrar todo desde un solo panel. Activa, pausa o cancela cuando quieras.',
  openGraph: {
    title: 'Goru — El software para gestionar tu negocio de canchas',
    description:
      'Reservas online, cobro automático y un panel administrativo completo para tu negocio de canchas.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
