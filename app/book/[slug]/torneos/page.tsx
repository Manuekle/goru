import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TOURNAMENT_STATUS_LABELS, formatPrice } from '@/lib/utils'
import type { Tournament } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PublicTournamentsPage({ params }: Props) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!org) notFound()

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('org_id', org.id)
    .neq('status', 'draft')
    .order('start_date')

  const statusVariant = (s: string) => {
    if (s === 'open') return 'ok'
    if (s === 'active') return 'pend'
    return ''
  }

  return (
    <div className="book-page">
      <p className="eyebrow book-eyebrow"><span className="dot" />Torneos</p>
      <h1 className="book-title">Torneos disponibles</h1>

      {!tournaments?.length ? (
        <p className="book-empty">No hay torneos activos por el momento.</p>
      ) : (
        <div className="tournament-grid">
          {(tournaments as Tournament[]).map((t) => (
            <Link key={t.id} href={`/book/${slug}/torneos/${t.id}`} className="tournament-card">
              <div className="tournament-card__head">
                <p className="tournament-card__name">{t.name}</p>
                <span className={`status-pill ${statusVariant(t.status)}`}>
                  {TOURNAMENT_STATUS_LABELS[t.status]}
                </span>
              </div>
              <div className="tournament-card__meta">
                <p className="tournament-card__dates">
                  {new Date(t.start_date + 'T00:00:00').toLocaleDateString('es-AR')} →{' '}
                  {new Date(t.end_date + 'T00:00:00').toLocaleDateString('es-AR')}
                </p>
                <p className="tournament-card__price">
                  {t.price_per_team > 0 ? `${formatPrice(t.price_per_team)} por equipo` : 'Gratis'}
                </p>
              </div>
              {t.description && (
                <p className="tournament-card__desc">
                  {t.description.slice(0, 120)}{t.description.length > 120 ? '...' : ''}
                </p>
              )}
              {t.status === 'open' && (
                <span className="btn btn-brand btn-sm">Inscribir equipo →</span>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="ticket-footer mt-10">
        <Link href={`/book/${slug}`} className="ticket-footer__link">
          ← Volver a reservas
        </Link>
      </div>
    </div>
  )
}
