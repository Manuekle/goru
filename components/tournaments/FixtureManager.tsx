'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createMatch, updateMatch, deleteMatch } from '@/actions/tournaments'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormSelect } from '@/components/ui/FormSelect'
import { EmptyState } from '@/components/ui/EmptyState'
import { MATCH_STATUS_LABELS, formatDateTime } from '@/lib/utils'
import { Calendar01Icon } from '@hugeicons/core-free-icons'
import type { TournamentTeam, TournamentMatch } from '@/lib/supabase/types'

interface Props {
  tournamentId: string
  matches: (TournamentMatch & {
    team_a: TournamentTeam | null
    team_b: TournamentTeam | null
    courts: { name: string } | null
  })[]
  teams: TournamentTeam[]
  isStaff: boolean
}

const STATUS_OPTIONS = Object.entries(MATCH_STATUS_LABELS).map(([value, label]) => ({ value, label }))

export function FixtureManager({ tournamentId, matches, teams, isStaff }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState('')

  const rounds = new Map<number, typeof matches>()
  matches.forEach((m) => {
    const r = rounds.get(m.round) ?? []
    r.push(m)
    rounds.set(m.round, r)
  })

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('tournament_id', tournamentId)

    startTransition(async () => {
      const result = await createMatch(fd)
      if (result?.error) {
        const err = result.error as Record<string, string[]>
        setError(err._form?.[0] ?? 'Error')
        return
      }
      setShowNew(false)
      router.refresh()
    })
  }

  function handleUpdate(matchId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      await updateMatch(matchId, fd)
      setEditing(null)
      router.refresh()
    })
  }

  function handleDelete(matchId: string) {
    startTransition(async () => {
      await deleteMatch(matchId)
      router.refresh()
    })
  }

  const teamOptions = [{ value: '', label: 'Por definir' }, ...teams.map((t) => ({ value: t.id, label: t.team_name }))]

  return (
    <div>
      {isStaff && (
        <div className="flex justify-end mb-4">
          <Button variant="brand" size="sm" onClick={() => setShowNew(!showNew)}>
            {showNew ? 'Cancelar' : '+ Agregar partido'}
          </Button>
        </div>
      )}

      {showNew && (
        <div className="mb-6 p-4 bg-surface border border-line rounded-lg">
          <form onSubmit={handleCreate} className="form-stack">
            {error && <p className="auth-error">{error}</p>}
            <div className="field-row">
              <Input label="Ronda" name="round" type="number" min={1} defaultValue={rounds.size + 1} />
              <Input label="N° partido" name="match_number" type="number" min={1} defaultValue={1} />
            </div>
            <div className="field-row">
              <FormSelect label="Equipo A" name="team_a_id" options={teamOptions} />
              <FormSelect label="Equipo B" name="team_b_id" options={teamOptions} />
            </div>
            <Input label="Fecha y hora" name="scheduled_at" type="datetime-local" />
            <Button type="submit" variant="brand" size="sm" loading={isPending}>Crear</Button>
          </form>
        </div>
      )}

      {matches.length === 0 ? (
        <EmptyState
          icon={Calendar01Icon}
          title="Fixture vacío"
          description="Agregá partidos para armar el fixture del torneo."
        />
      ) : (
        <div className="fixture-grid">
          {Array.from(rounds.entries()).map(([round, roundMatches]) => (
            <div key={round} className="fixture-round">
              <p className="fixture-round__title">Ronda {round}</p>
              {roundMatches.map((match) => (
                <div key={match.id} className="fixture-match">
                  {editing === match.id ? (
                    <form onSubmit={(e) => handleUpdate(match.id, e)} className="flex flex-1 flex-wrap items-end gap-3">
                      <div className="flex-1 min-w-[120px]">
                        <FormSelect name="team_a_id" defaultValue={match.team_a_id ?? ''} options={teamOptions} />
                      </div>
                      <span className="fixture-match__vs">vs</span>
                      <div className="flex-1 min-w-[120px]">
                        <FormSelect name="team_b_id" defaultValue={match.team_b_id ?? ''} options={teamOptions} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Input name="score_a" type="number" min={0} defaultValue={match.score_a ?? ''} style={{ width: 60 }} />
                        <span className="text-muted-foreground font-mono text-xs">-</span>
                        <Input name="score_b" type="number" min={0} defaultValue={match.score_b ?? ''} style={{ width: 60 }} />
                      </div>
                      <FormSelect name="status" defaultValue={match.status} options={STATUS_OPTIONS} />
                      <div className="flex gap-1">
                        <Button type="submit" variant="brand" size="sm">Guardar</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span className={`fixture-match__team ${!match.team_a ? 'fixture-match__team--tbd' : ''}`}>
                        {match.team_a?.team_name ?? 'Por definir'}
                      </span>
                      {(match.score_a != null || match.score_b != null) ? (
                        <span className="fixture-match__score">{match.score_a ?? 0} - {match.score_b ?? 0}</span>
                      ) : (
                        <span className="fixture-match__vs">vs</span>
                      )}
                      <span className={`fixture-match__team ${!match.team_b ? 'fixture-match__team--tbd' : ''}`}>
                        {match.team_b?.team_name ?? 'Por definir'}
                      </span>
                      <span className="fixture-match__info">
                        <span className="status-pill">{MATCH_STATUS_LABELS[match.status]}</span>
                        {match.courts?.name && <span>{match.courts.name}</span>}
                        {match.scheduled_at && <span>{formatDateTime(match.scheduled_at)}</span>}
                      </span>
                      {isStaff && (
                        <div className="flex gap-1 ml-auto">
                          <button
                            type="button"
                            className="data-table__action"
                            onClick={() => setEditing(match.id)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="data-table__action text-destructive"
                            disabled={isPending}
                            onClick={() => handleDelete(match.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
