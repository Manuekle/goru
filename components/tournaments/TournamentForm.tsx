'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateTournament, deleteTournament } from '@/actions/tournaments'
import { Input } from '@/components/ui/Input'
import { FormSelect } from '@/components/ui/FormSelect'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TOURNAMENT_STATUS_LABELS } from '@/lib/utils'
import type { Tournament } from '@/lib/supabase/types'

const STATUS_OPTIONS = Object.entries(TOURNAMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))

interface Props {
  tournament: Tournament
}

export function TournamentForm({ tournament }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateTournament(tournament.id, fd)
      if (result?.error) {
        const err = result.error as Record<string, string[]>
        setError(err._form?.[0] ?? 'Error al guardar')
        return
      }
      router.refresh()
    })
  }

  async function handleDelete() {
    await deleteTournament(tournament.id)
    router.push('/dashboard/tournaments')
  }

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      {error && <p className="auth-error">{error}</p>}

      <Input label="Nombre" name="name" defaultValue={tournament.name} required />
      <Textarea label="Descripción" name="description" defaultValue={tournament.description ?? ''} rows={3} />

      <div className="field-row">
        <Input label="Fecha inicio" name="start_date" type="date" defaultValue={tournament.start_date} />
        <Input label="Fecha fin" name="end_date" type="date" defaultValue={tournament.end_date} />
      </div>

      <div className="field-row">
        <Input label="Máx. equipos" name="max_teams" type="number" min={2} max={64} defaultValue={tournament.max_teams} />
        <Input label="Precio por equipo" name="price_per_team" type="number" min={0} defaultValue={tournament.price_per_team} />
      </div>

      <Input
        label="Fecha límite inscripción"
        name="registration_deadline"
        type="date"
        defaultValue={tournament.registration_deadline ?? ''}
      />

      <FormSelect label="Estado" name="status" defaultValue={tournament.status} options={STATUS_OPTIONS} />

      <div className="field">
        <label className="field-label">
          <input
            type="checkbox"
            name="registration_open"
            value="true"
            defaultChecked={tournament.registration_open}
            className="mr-2"
          />
          Inscripciones abiertas (visible en página pública)
        </label>
      </div>

      <Textarea label="Reglamento" name="rules" defaultValue={tournament.rules ?? ''} rows={3} />

      <div className="form-actions">
        <Button type="submit" variant="brand" loading={isPending}>Guardar cambios</Button>
        <ConfirmDialog
          trigger={<Button type="button" variant="danger" disabled={isPending}>Eliminar torneo</Button>}
          title="Eliminar torneo?"
          description="Se eliminaran todos los equipos y partidos asociados. Esta accion no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
        />
      </div>
    </form>
  )
}
