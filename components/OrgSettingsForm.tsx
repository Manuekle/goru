'use client'

import { useActionState } from 'react'
import { updateOrgSettings } from '@/actions/org'
import { Input } from '@/components/ui/Input'
import { FormSelect } from '@/components/ui/FormSelect'
import { Button } from '@/components/ui/Button'
import type { Organization } from '@/lib/supabase/types'

const TIMEZONES = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (UTC-3)' },
  { value: 'America/Bogota', label: 'Colombia (UTC-5)' },
  { value: 'America/Mexico_City', label: 'México (UTC-6)' },
  { value: 'America/Santiago', label: 'Chile (UTC-4)' },
  { value: 'America/Lima', label: 'Perú (UTC-5)' },
]

interface OrgSettingsFormProps {
  org: Organization
}

export function OrgSettingsForm({ org }: OrgSettingsFormProps) {
  const [state, action, pending] = useActionState(updateOrgSettings, null)

  return (
    <form action={action} className="form-stack">
      {state?.error && typeof state.error === 'object' && '_form' in state.error && (
        <p className="auth-error">{(state.error as Record<string, string[]>)._form[0]}</p>
      )}
      {state?.success && <p className="auth-success">Cambios guardados.</p>}

      <Input label="Nombre del complejo" name="name" defaultValue={org.name} required />
      <Input
        label="Identificador (slug)"
        name="slug"
        defaultValue={org.slug}
        pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
        required
      />
      <Input label="Teléfono" name="phone" defaultValue={org.phone ?? ''} />
      <Input label="Dirección" name="address" defaultValue={org.address ?? ''} />
      <FormSelect
        label="Zona horaria"
        name="timezone"
        defaultValue={org.timezone}
        options={TIMEZONES}
      />

      <div className="form-actions">
        <Button type="submit" variant="brand" loading={pending}>Guardar cambios</Button>
      </div>
    </form>
  )
}
