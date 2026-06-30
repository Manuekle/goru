'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/actions/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type AuthError = { _form?: string[]; full_name?: string[]; email?: string[]; password?: string[] }

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUp, null)
  const err = state?.error as AuthError | undefined

  return (
    <>
      <h1 className="auth-title">Crear cuenta</h1>
      <p className="auth-sub">
        ¿Ya tenés cuenta?{' '}
        <Link href="/auth/login" className="auth-link">
          Iniciar sesión
        </Link>
      </p>

      <form action={action} className="auth-form">
        {err?._form && <p className="auth-error">{err._form[0]}</p>}

        <Input
          label="Nombre completo"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          error={err?.full_name?.[0]}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={err?.email?.[0]}
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Mínimo 8 caracteres"
          error={err?.password?.[0]}
        />

        <Button type="submit" variant="brand" loading={pending} style={{ width: '100%' }}>
          Crear cuenta
        </Button>
      </form>
    </>
  )
}
