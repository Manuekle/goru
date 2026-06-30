'use client'

import { useActionState } from 'react'
import { updateClient } from '@/actions/clients'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { Client } from '@/lib/supabase/types'

interface ClientFormProps {
  client: Client
}

type ClientFieldErrors = { _form?: string[]; full_name?: string[]; phone?: string[]; email?: string[]; notes?: string[] }

export function ClientForm({ client }: ClientFormProps) {
  const action = updateClient.bind(null, client.id)
  const [state, formAction, pending] = useActionState(action, null)
  const err = (typeof state?.error === 'object' && state.error !== null ? state.error : {}) as ClientFieldErrors

  return (
    <form action={formAction} className="form-stack">
      {err._form && <p className="auth-error">{err._form[0]}</p>}

      <Input label="Nombre" name="full_name" defaultValue={client.full_name} required />
      <Input label="Teléfono" name="phone" defaultValue={client.phone ?? ''} />
      <Input label="Email" name="email" type="email" defaultValue={client.email ?? ''} />
      <Textarea label="Notas" name="notes" defaultValue={client.notes ?? ''} rows={3} />

      <div className="form-actions">
        <Button type="submit" variant="brand" loading={pending}>Guardar</Button>
      </div>
    </form>
  )
}
