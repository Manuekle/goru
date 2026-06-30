'use client'

import { useActionState } from 'react'
import { inviteMember } from '@/actions/team'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const ROLE_OPTIONS = [
  { value: 'receptionist', label: 'Recepcionista' },
  { value: 'cashier', label: 'Cajero' },
  { value: 'admin', label: 'Administrador' },
]

type InviteFieldErrors = { _form?: string[]; email?: string[]; role?: string[] }

export function TeamInviteForm() {
  const [state, action, pending] = useActionState(inviteMember, null)
  const err = (typeof state?.error === 'object' && state.error !== null ? state.error : {}) as InviteFieldErrors

  return (
    <form action={action} className="form-stack form-stack--inline">
      {err._form && <p className="auth-error">{err._form[0]}</p>}
      {state?.invitation && (
        <p className="auth-success">Invitación creada para {state.invitation.email}</p>
      )}

      <Input
        label="Email"
        name="email"
        type="email"
        required
        error={err.email?.[0]}
      />
      <Select
        label="Rol"
        name="role"
        defaultValue="receptionist"
        options={ROLE_OPTIONS}
      />
      <div className="form-actions">
        <Button type="submit" variant="brand" loading={pending}>Invitar</Button>
      </div>
    </form>
  )
}
