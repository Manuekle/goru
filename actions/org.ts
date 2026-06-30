'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { OrgSettingsSchema } from '@/lib/validations/org'

export async function updateOrgSettings(_state: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')
  if (!['owner', 'admin'].includes(profile.role)) return { error: 'Sin permisos' }

  const raw = Object.fromEntries(formData)
  const parsed = OrgSettingsSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabase
    .from('organizations')
    .update(parsed.data)
    .eq('id', profile.org_id)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
