'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateTeamPayment, removeTeam } from '@/actions/tournaments'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { TournamentTeam } from '@/lib/supabase/types'

interface Props {
  tournamentId: string
  teams: TournamentTeam[]
  isStaff: boolean
}

export function TeamManager({ teams, isStaff }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function togglePayment(teamId: string, currentStatus: string) {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid'
    startTransition(async () => {
      await updateTeamPayment(teamId, newStatus as 'pending' | 'paid')
      router.refresh()
    })
  }

  function handleRemove(teamId: string) {
    startTransition(async () => {
      await removeTeam(teamId)
      router.refresh()
    })
  }

  if (!teams.length) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">Sin equipos inscriptos</p>
        <p className="empty-state__desc">
          Cuando abras las inscripciones, los equipos podrán registrarse desde la página pública.
        </p>
      </div>
    )
  }

  return (
    <div>
      <table className="teams-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Equipo</th>
            <th>Capitán</th>
            <th>Contacto</th>
            <th>Pago</th>
            {isStaff && <th className="text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => (
            <tr key={team.id}>
              <td className="text-muted-foreground font-mono text-xs">{i + 1}</td>
              <td className="font-semibold">{team.team_name}</td>
              <td>{team.captain_name}</td>
              <td>
                <p className="text-sm">{team.captain_phone}</p>
                {team.captain_email && <p className="data-table__sub">{team.captain_email}</p>}
              </td>
              <td>
                {isStaff ? (
                  <button
                    type="button"
                    className="data-table__action"
                    disabled={isPending}
                    onClick={() => togglePayment(team.id, team.payment_status)}
                  >
                    <Badge variant={team.payment_status === 'paid' ? 'success' : 'warning'}>
                      {team.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </Badge>
                  </button>
                ) : (
                  <Badge variant={team.payment_status === 'paid' ? 'success' : 'warning'}>
                    {team.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </Badge>
                )}
              </td>
              {isStaff && (
                <td className="text-right">
                  <ConfirmDialog
                    trigger={<button type="button" className="data-table__action text-destructive" disabled={isPending}>Quitar</button>}
                    title="Quitar equipo?"
                    description="El equipo sera eliminado del torneo."
                    confirmLabel="Quitar"
                    onConfirm={async () => { await removeTeam(team.id); router.refresh() }}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
