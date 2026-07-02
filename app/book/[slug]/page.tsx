import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SURFACE_LABELS } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BookSlugPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!org) notFound()

  const { data: courts } = await supabase
    .from('courts')
    .select('id, name, surface, capacity, description')
    .eq('org_id', org.id)
    .eq('active', true)
    .order('created_at')

  return (
    <div className="book-page">
      <p className="eyebrow book-eyebrow"><span className="dot" />Reservá tu turno</p>
      <h1 className="book-title">Elegí una cancha</h1>

      {!courts?.length ? (
        <p className="book-empty">No hay canchas disponibles por el momento.</p>
      ) : (
        <div className="book-court-grid">
          {courts.map((court) => (
            <Link key={court.id} href={`/book/${slug}/${court.id}`} className="book-court-card">
              <div className="book-court-card__head">
                <p className="book-court-card__name">{court.name}</p>
                <span className="badge">{SURFACE_LABELS[court.surface]}</span>
              </div>
              <p className="book-court-card__capacity">{court.capacity} jugadores</p>
              {court.description && (
                <p className="book-court-card__desc">{court.description}</p>
              )}
              <span className="btn btn-brand btn-sm book-court-card__cta">Reservar →</span>
            </Link>
          ))}
        </div>
      )}

      <div className="ticket-footer" style={{ marginTop: 32 }}>
        <Link href={`/book/${slug}/torneos`} style={{ color: 'var(--brand)', fontWeight: 600 }}>
          Ver torneos disponibles →
        </Link>
      </div>
    </div>
  )
}
