'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ClientSchema } from '@/lib/validations/client'

async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')
  return { supabase, profile }
}

export async function createClient_(formData: FormData) {
  const { supabase, profile } = await getProfile()

  const raw = Object.fromEntries(formData)
  const parsed = ClientSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...parsed.data, org_id: profile.org_id! })
    .select()
    .single()

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/dashboard/clients')
  return { client: data }
}

export async function updateClient(clientId: string, _state: unknown, formData: FormData) {
  const { supabase, profile } = await getProfile()

  const raw = Object.fromEntries(formData)
  const parsed = ClientSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabase
    .from('clients')
    .update(parsed.data)
    .eq('id', clientId)
    .eq('org_id', profile.org_id!)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/dashboard/clients')
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { success: true }
}

export async function deleteClient(clientId: string) {
  const { supabase, profile } = await getProfile()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('org_id', profile.org_id!)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/clients')
  redirect('/dashboard/clients')
}
