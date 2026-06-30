'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn } from '@/actions/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type AuthError = { _form?: string[]; email?: string[]; password?: string[] }

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, null)
  const err = state?.error as AuthError | undefined

  return (
    <>
      <h1 className="auth-title">Iniciar sesión</h1>
      <p className="auth-sub">
        ¿No tenés cuenta?{' '}
        <Link href="/auth/signup" className="auth-link">
          Crear cuenta
        </Link>
      </p>

      <form action={action} className="auth-form">
        {err?._form && <p className="auth-error">{err._form[0]}</p>}

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
          autoComplete="current-password"
          required
          error={err?.password?.[0]}
        />

        <Button type="submit" variant="brand" loading={pending} style={{ width: '100%' }}>
          Entrar
        </Button>
      </form>
    </>
  )
}
