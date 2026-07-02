'use client'

import { useState, useEffect, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { registerTeam } from '@/actions/tournaments'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatPrice } from '@/lib/utils'
import type { Tournament, TournamentTeam } from '@/lib/supabase/types'

export default function PublicTournamentRegistrationPage() {
  const params = useParams<{ slug: string; id: string }>()
  const router = useRouter()

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [teams, setTeams] = useState<TournamentTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: t }, { data: tm }] = await Promise.all([
        supabase.from('tournaments').select('*').eq('id', params.id).single(),
        supabase.from('tournament_teams').select('*').eq('tournament_id', params.id).order('registered_at'),
      ])
      setTournament(t)
      setTeams(tm ?? [])
      setLoading(false)
    }
    load()
  }, [params.id, supabase])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('tournament_id', params.id)

    startTransition(async () => {
      const result = await registerTeam(fd)
      if (result?.error) {
        const err = result.error as Record<string, string[]>
        setError(err._form?.[0] ?? 'Error al inscribir')
        return
      }
      setSuccess(true)
    })
  }

  if (loading) {
    return (
      <div className="book-page">
        <div className="flex justify-center py-20">
          <Spinner className="w-8 h-8" />
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="book-page">
        <p className="book-empty">Torneo no encontrado.</p>
      </div>
    )
  }

  const isOpen = tournament.status === 'open' && tournament.registration_open
  const spotsLeft = tournament.max_teams - teams.length
  const datesStr = `${new Date(tournament.start_date + 'T00:00:00').toLocaleDateString('es-AR')} -> ${new Date(tournament.end_date + 'T00:00:00').toLocaleDateString('es-AR')}`

  return (
    <div className="book-page">
      <p className="eyebrow book-eyebrow"><span className="dot" />Torneo</p>
      <h1 className="book-title">{tournament.name}</h1>

      {success ? (
        <div className="book-step--success">
          <div className="book-success-icon">{'>'}</div>
          <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Inscripcion enviada</h2>
          <p style={{ color: 'var(--muted-text)' }}>Tu equipo fue registrado. Te contactaremos para confirmar.</p>
          <Button variant="brand" onClick={() => router.refresh()}>Volver</Button>
        </div>
      ) : (
        <div className="tournament-detail">
          <div className="tournament-detail__info-grid">
            <div className="tournament-detail__info-card">
              <span className="tournament-detail__info-label">Fechas</span>
              <span className="tournament-detail__info-value">{datesStr}</span>
            </div>
            <div className="tournament-detail__info-card">
              <span className="tournament-detail__info-label">Cupos</span>
              <span className="tournament-detail__info-value">{teams.length} / {tournament.max_teams}</span>
            </div>
            <div className="tournament-detail__info-card">
              <span className="tournament-detail__info-label">Precio</span>
              <span className="tournament-detail__info-value">{tournament.price_per_team > 0 ? formatPrice(tournament.price_per_team) : 'Gratis'}</span>
            </div>
          </div>

          {tournament.description && (
            <p className="tournament-detail__desc">{tournament.description}</p>
          )}

          {tournament.rules && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)', marginBottom: 8 }}>Reglamento</h3>
              <p className="tournament-detail__desc whitespace-pre-wrap">{tournament.rules}</p>
            </div>
          )}

          {/* Teams list */}
          {teams.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted-text)', marginBottom: 12 }}>
                Equipos inscriptos ({teams.length})
              </h3>
              <table className="teams-table">
                <thead>
                  <tr>
                    <th>Equipo</th>
                    <th>Capitán</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, i) => (
                    <tr key={team.id}>
                      <td className="font-semibold">{team.team_name}</td>
                      <td>{team.captain_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Registration form */}
          {isOpen && spotsLeft > 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)', marginBottom: 16, marginTop: 24 }}>
                Inscribir equipo
              </h3>
              <form onSubmit={handleSubmit} className="form-stack">
                {error && <p className="auth-error">{error}</p>}
                <Input label="Nombre del equipo" name="team_name" placeholder="Ej: Los Amigos FC" required />
                <Input label="Nombre del capitan" name="captain_name" placeholder="Nombre completo" required />
                <Input label="Telefono" name="captain_phone" type="tel" placeholder="+54 11..." required />
                <Input label="Email (opcional)" name="captain_email" type="email" placeholder="capitan@email.com" />
                <Button type="submit" variant="brand" loading={isPending} disabled={isPending}>
                  Inscribir equipo
                </Button>
              </form>
            </div>
          )}

          {!isOpen && (
            <div className="tournament-register__closed">
              <h3>Inscripciones cerradas</h3>
              <p style={{ color: 'var(--muted-text)', marginTop: 8 }}>
                {tournament.status === 'active' ? 'El torneo ya esta en juego.' : tournament.status === 'finished' ? 'El torneo ya finalizo.' : 'Las inscripciones no estan disponibles por el momento.'}
              </p>
            </div>
          )}

          {isOpen && spotsLeft <= 0 && (
            <div className="tournament-register__closed">
              <h3>Sin cupos</h3>
              <p style={{ color: 'var(--muted-text)', marginTop: 8 }}>Se alcanzo el limite de {tournament.max_teams} equipos.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
