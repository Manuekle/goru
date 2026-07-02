import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChampionIcon } from '@hugeicons/core-free-icons'
import { TOURNAMENT_STATUS_LABELS, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { Tournament } from '@/lib/supabase/types'

export default async function TournamentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  const statusVariant = (s: string) => {
    if (s === 'open') return 'ok'
    if (s === 'active') return 'pend'
    if (s === 'finished') return ''
    return ''
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <h1 className="dash-page__title">Torneos</h1>
        <Link href="/dashboard/tournaments/new">
          <Button variant="brand" size="sm">Crear torneo</Button>
        </Link>
      </div>

      {!tournaments?.length ? (
        <EmptyState
          icon={ChampionIcon}
          title="Sin torneos aún"
          description="Creá torneos para que los equipos se inscriban desde la página pública de reservas."
          action={
            <Link href="/dashboard/tournaments/new">
              <Button variant="brand">Crear torneo</Button>
            </Link>
          }
        />
      ) : (
        <div className="tournament-grid">
          {(tournaments as Tournament[]).map((t) => (
            <Link key={t.id} href={`/dashboard/tournaments/${t.id}`} className="tournament-card">
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
                {t.price_per_team > 0 && (
                  <p className="tournament-card__price">{formatPrice(t.price_per_team)} por equipo</p>
                )}
              </div>
              {t.description && (
                <p className="tournament-card__desc">{t.description.slice(0, 120)}{t.description.length > 120 ? '...' : ''}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
