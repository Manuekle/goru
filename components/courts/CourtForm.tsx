'use client'

import { useActionState } from 'react'
import { createCourt, updateCourt } from '@/actions/courts'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { SURFACE_LABELS } from '@/lib/utils'
import type { Court } from '@/lib/supabase/types'

const SURFACE_OPTIONS = Object.entries(SURFACE_LABELS).map(([value, label]) => ({ value, label }))

interface CourtFormProps {
  court?: Court
}

type CourtFieldErrors = { _form?: string[]; name?: string[]; surface?: string[]; capacity?: string[]; description?: string[]; active?: string[] }

export function CourtForm({ court }: CourtFormProps) {
  const action = court
    ? updateCourt.bind(null, court.id)
    : createCourt

  const [state, formAction, pending] = useActionState(action, null)
  const err = (typeof state?.error === 'object' && state.error !== null ? state.error : {}) as CourtFieldErrors

  return (
    <form action={formAction} className="form-stack">
      {err._form && (
        <p className="auth-error">{err._form[0]}</p>
      )}

      <Input
        label="Nombre de la cancha"
        name="name"
        defaultValue={court?.name}
        required
        error={err.name?.[0]}
      />

      <Select
        label="Superficie"
        name="surface"
        defaultValue={court?.surface ?? 'synthetic'}
        options={SURFACE_OPTIONS}
      />

      <Input
        label="Capacidad (jugadores)"
        name="capacity"
        type="number"
        min={2}
        max={100}
        defaultValue={court?.capacity ?? 10}
        error={err.capacity?.[0]}
      />

      <Textarea
        label="Descripción (opcional)"
        name="description"
        defaultValue={court?.description ?? ''}
        rows={3}
      />

      <div className="form-actions">
        <Button type="submit" variant="brand" loading={pending}>
          {court ? 'Guardar cambios' : 'Crear cancha'}
        </Button>
      </div>
    </form>
  )
}
