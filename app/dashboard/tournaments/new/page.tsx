'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createTournament } from '@/actions/tournaments'
import { Input } from '@/components/ui/Input'
import { FormSelect } from '@/components/ui/FormSelect'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TOURNAMENT_STATUS_LABELS } from '@/lib/utils'

const STATUS_OPTIONS = Object.entries(TOURNAMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))

export default function NewTournamentPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createTournament(null, fd)
      if (result?.error) {
        const err = result.error as Record<string, string[]>
        setError(err._form?.[0] ?? 'Error al crear')
        return
      }
      router.push('/dashboard/tournaments')
      router.refresh()
    })
  }

  return (
    <div className="dash-page dash-page--narrow">
      <div className="dash-page__header">
        <h1 className="dash-page__title">Nuevo torneo</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del torneo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="form-stack">
            {error && <p className="auth-error">{error}</p>}

            <Input label="Nombre del torneo" name="name" placeholder="Ej: Copa de Verano 2026" required />

            <Textarea label="Descripción" name="description" placeholder="Describí el torneo, formato, premios..." rows={3} />

            <div className="field-row">
              <Input label="Fecha de inicio" name="start_date" type="date" required />
              <Input label="Fecha de fin" name="end_date" type="date" required />
            </div>

            <div className="field-row">
              <Input label="Máximo de equipos" name="max_teams" type="number" min={2} max={64} defaultValue={16} />
              <Input label="Precio por equipo ($)" name="price_per_team" type="number" min={0} defaultValue={0} />
            </div>

            <Input label="Fecha límite de inscripción" name="registration_deadline" type="date" />

            <FormSelect
              label="Estado"
              name="status"
              defaultValue="draft"
              options={STATUS_OPTIONS}
            />

            <div className="field">
              <label className="field-label">
                <input type="checkbox" name="registration_open" value="true" className="mr-2" />
                Inscripciones abiertas
              </label>
            </div>

            <Textarea label="Reglamento (opcional)" name="rules" placeholder="Reglas del torneo..." rows={3} />

            <div className="form-actions">
              <Button type="submit" variant="brand" loading={isPending} disabled={isPending}>
                Crear torneo
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
