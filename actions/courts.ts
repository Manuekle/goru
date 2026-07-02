'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CourtSchema, CourtScheduleSchema } from '@/lib/validations/court'

async function getProfileOrRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')
  if (!['owner', 'admin'].includes(profile.role)) {
    return { error: 'Sin permisos', supabase, profile: null }
  }

  return { supabase, profile, error: null }
}

export async function createCourt(_state: unknown, formData: FormData) {
  const { supabase, profile, error } = await getProfileOrRedirect()
  if (error || !profile) return { error }

  const raw = Object.fromEntries(formData)
  const parsed = CourtSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error: dbError } = await supabase
    .from('courts')
    .insert({ ...parsed.data, org_id: profile.org_id! })

  if (dbError) return { error: { _form: [dbError.message] } }

  revalidatePath('/dashboard/courts')
  redirect('/dashboard/courts')
}

export async function updateCourt(courtId: string, _state: unknown, formData: FormData) {
  const { supabase, profile, error } = await getProfileOrRedirect()
  if (error || !profile) return { error }

  const raw = Object.fromEntries(formData)
  const parsed = CourtSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error: dbError } = await supabase
    .from('courts')
    .update(parsed.data)
    .eq('id', courtId)
    .eq('org_id', profile.org_id!)

  if (dbError) return { error: { _form: [dbError.message] } }

  revalidatePath('/dashboard/courts')
  revalidatePath(`/dashboard/courts/${courtId}`)
}

export async function deleteCourt(courtId: string) {
  const { supabase, profile, error } = await getProfileOrRedirect()
  if (error || !profile) return { error }

  const { error: dbError } = await supabase
    .from('courts')
    .update({ active: false })
    .eq('id', courtId)
    .eq('org_id', profile.org_id!)

  if (dbError) return { error: dbError.message }

  revalidatePath('/dashboard/courts')
  redirect('/dashboard/courts')
}

export async function upsertSchedule(courtId: string, formData: FormData) {
  const { supabase, profile, error } = await getProfileOrRedirect()
  if (error || !profile) return { error }

  const raw = Object.fromEntries(formData)
  const parsed = CourtScheduleSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error: dbError } = await supabase
    .from('court_schedules')
    .upsert({ ...parsed.data, court_id: courtId }, { onConflict: 'court_id,day_of_week' })

  if (dbError) return { error: { _form: [dbError.message] } }

  revalidatePath(`/dashboard/courts/${courtId}`)
  return { success: true }
}

export async function deleteSchedule(courtId: string, dayOfWeek: number) {
  const { supabase, profile, error } = await getProfileOrRedirect()
  if (error || !profile) return { error }

  const { error: dbError } = await supabase
    .from('court_schedules')
    .delete()
    .eq('court_id', courtId)
    .eq('day_of_week', dayOfWeek)

  if (dbError) return { error: { _form: [dbError.message] } }

  revalidatePath(`/dashboard/courts/${courtId}`)
  return { success: true }
}
