'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { OrgSchema } from '@/lib/validations/org'
import { CourtSchema } from '@/lib/validations/court'

export async function checkSlugAvailability(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single()
  return { available: !data }
}

export async function createOrg(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const raw = Object.fromEntries(formData)
  const parsed = OrgSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert(parsed.data)
    .select()
    .single()

  if (orgError) {
    if (orgError.code === '23505') return { error: { slug: ['Este slug ya está en uso'] } }
    return { error: { _form: [orgError.message] } }
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ org_id: org.id, role: 'owner' })
    .eq('id', user.id)

  if (profileError) return { error: { _form: [profileError.message] } }

  // Refresh session so new JWT includes org_id (avoids fallback query)
  // Non-blocking: fallback in my_org_id() handles stale JWTs
  try {
    await supabase.auth.refreshSession()
  } catch {
    // Token refresh might fail if session expired — fallback handles it
  }

  return { org }
}

export async function addOnboardingCourt(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const raw = Object.fromEntries(formData)
  const parsed = CourtSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data: court, error } = await supabase
    .from('courts')
    .insert({ ...parsed.data, org_id: orgId })
    .select()
    .single()

  if (error) return { error: { _form: [error.message] } }
  return { court }
}

export async function completeOnboarding() {
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
