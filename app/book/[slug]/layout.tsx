import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('slug', slug)
    .single()

  return {
    title: org ? `Reservar en ${org.name}` : 'Reservas',
  }
}

export default async function BookLayout({ params, children }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, logo_url')
    .eq('slug', slug)
    .single()

  if (!org) notFound()

  return (
    <div className="book-shell">
      <header className="book-nav">
        <p className="book-nav__name">{org.name}</p>
      </header>
      <main className="book-main">{children}</main>
    </div>
  )
}
