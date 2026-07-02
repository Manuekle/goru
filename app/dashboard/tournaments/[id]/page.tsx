import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TOURNAMENT_STATUS_LABELS, MATCH_STATUS_LABELS, formatPrice, formatDateTime } from '@/lib/utils'
import { TournamentForm } from '@/components/tournaments/TournamentForm'
import { TeamManager } from '@/components/tournaments/TeamManager'
import { FixtureManager } from '@/components/tournaments/FixtureManager'
import type { Tournament, TournamentTeam, TournamentMatch } from '@/lib/supabase/types'
import { ChampionIcon } from '@hugeicons/core-free-icons'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function TournamentDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { tab: activeTab } = await searchParams
  const tab = activeTab ?? 'info'

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role, organizations(timezone)')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  const tz = (profile.organizations as { timezone: string } | null)?.timezone ?? 'UTC'

  const [{ data: tournament }, { data: teams }, { data: matches }] = await Promise.all([
    supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .eq('org_id', profile.org_id)
      .single(),

    supabase
      .from('tournament_teams')
      .select('*')
      .eq('tournament_id', id)
      .order('registered_at'),

    supabase
      .from('tournament_matches')
      .select('*, team_a:team_a_id(*), team_b:team_b_id(*), courts(name)')
      .eq('tournament_id', id)
      .order('round')
      .order('match_number'),
  ])

  if (!tournament) notFound()

  const isOwnerAdmin = profile.role === 'owner' || profile.role === 'admin'

  return (
    <div className="dash-page tournament-detail">
      <div className="dash-page__header">
        <div className="dash-page__heading">
          <h1 className="dash-page__title">{tournament.name}</h1>
          <p className="dash-page__sub">
            <span className={`status-pill ${tournament.status === 'open' ? 'ok' : tournament.status === 'active' ? 'pend' : ''}`}>
              {TOURNAMENT_STATUS_LABELS[tournament.status]}
            </span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tournament-tabs">
        <Link href={`/dashboard/tournaments/${id}?tab=info`} className={`tournament-tab ${tab === 'info' ? 'tournament-tab--active' : ''}`}>
          Información
        </Link>
        <Link href={`/dashboard/tournaments/${id}?tab=teams`} className={`tournament-tab ${tab === 'teams' ? 'tournament-tab--active' : ''}`}>
          Equipos ({teams?.length ?? 0})
        </Link>
        <Link href={`/dashboard/tournaments/${id}?tab=fixtures`} className={`tournament-tab ${tab === 'fixtures' ? 'tournament-tab--active' : ''}`}>
          Fixture
        </Link>
      </div>

      {tab === 'info' && (
        <div className="flex flex-col gap-5">
          {/* Info grid */}
          <div className="tournament-detail__info-grid">
            <div className="tournament-detail__info-card">
              <span className="tournament-detail__info-label">Fechas</span>
              <span className="tournament-detail__info-value">
                {new Date(tournament.start_date + 'T00:00:00').toLocaleDateString('es-AR')} →{' '}
                {new Date(tournament.end_date + 'T00:00:00').toLocaleDateString('es-AR')}
              </span>
            </div>
            <div className="tournament-detail__info-card">
              <span className="tournament-detail__info-label">Equipos</span>
              <span className="tournament-detail__info-value">{teams?.length ?? 0} / {tournament.max_teams}</span>
            </div>
            <div className="tournament-detail__info-card">
              <span className="tournament-detail__info-label">Precio</span>
              <span className="tournament-detail__info-value">{tournament.price_per_team > 0 ? formatPrice(tournament.price_per_team) : 'Gratis'}</span>
            </div>
            <div className="tournament-detail__info-card">
              <span className="tournament-detail__info-label">Inscripción</span>
              <span className="tournament-detail__info-value">
                {tournament.registration_open ? 'Abierta' : 'Cerrada'}
                {tournament.registration_deadline && ` (hasta ${new Date(tournament.registration_deadline + 'T00:00:00').toLocaleDateString('es-AR')})`}
              </span>
            </div>
          </div>

          {tournament.description && (
            <Card>
              <CardHeader><CardTitle>Descripción</CardTitle></CardHeader>
              <CardContent>
                <p className="tournament-detail__desc">{tournament.description}</p>
              </CardContent>
            </Card>
          )}

          {tournament.rules && (
            <Card>
              <CardHeader><CardTitle>Reglamento</CardTitle></CardHeader>
              <CardContent>
                <p className="tournament-detail__desc whitespace-pre-wrap">{tournament.rules}</p>
              </CardContent>
            </Card>
          )}

          {isOwnerAdmin && (
            <Card>
              <CardHeader><CardTitle>Editar torneo</CardTitle></CardHeader>
              <CardContent>
                <TournamentForm tournament={tournament as Tournament} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === 'teams' && (
        <TeamManager
          tournamentId={id}
          teams={(teams ?? []) as TournamentTeam[]}
          isStaff={isOwnerAdmin}
        />
      )}

      {tab === 'fixtures' && (
        <FixtureManager
          tournamentId={id}
          matches={(matches ?? []) as unknown as (TournamentMatch & {
            team_a: TournamentTeam | null
            team_b: TournamentTeam | null
            courts: { name: string } | null
          })[]}
          teams={(teams ?? []) as TournamentTeam[]}
          isStaff={isOwnerAdmin}
        />
      )}
    </div>
  )
}
