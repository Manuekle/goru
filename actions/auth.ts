'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignInSchema, SignUpSchema } from '@/lib/validations/auth'

export async function signUp(_state: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = SignUpSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { full_name, email, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  })

  if (error) return { error: { _form: [error.message] } }

  redirect('/onboarding')
}

export async function signIn(_state: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = SignInSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { error, data } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: { _form: ['Email o contraseña incorrectos'] } }

  // Use JWT app_metadata (synced by DB trigger) to bypass RLS on profiles
  const orgId = data.user?.app_metadata?.org_id as string | undefined
  if (!orgId) redirect('/onboarding')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
