import type { Metadata } from 'next'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import JsonLd from '@/components/JsonLd'
import { ToastWrapper } from '@/components/ToastWrapper'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const SITE_URL = 'https://goru.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Goru — Software para gestionar tu negocio de canchas',
    template: '%s — Goru',
  },
  description:
    'Goru es la plataforma que usan los negocios de canchas sintéticas para vender reservas, cobrar online y administrar todo desde un solo panel. Activa, pausa o cancela cuando quieras.',
  keywords: [
    'software canchas sintéticas', 'reservas canchas', 'gestión canchas deportivas',
    'sistema canchas fútbol', 'cobro online canchas', 'administración canchas',
    'booking sports courts', 'cancha sintética', 'gestión deportiva',
  ],
  alternates: { canonical: SITE_URL },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Goru',
    statusBarStyle: 'black-translucent',
  },
  themeColor: '#0a0a0a',
  openGraph: {
    title: 'Goru — El software para gestionar tu negocio de canchas',
    description:
      'Reservas online, cobro automático y un panel administrativo completo para tu negocio de canchas.',
    url: SITE_URL,
    siteName: 'Goru',
    locale: 'es_CO',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Goru',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goru — Software para canchas',
    description: 'Reservas online, cobro automático y panel administrativo para tu negocio de canchas.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning>
        <ToastWrapper>
          {children}
        </ToastWrapper>
        <JsonLd />
      </body>
    </html>
  )
}
