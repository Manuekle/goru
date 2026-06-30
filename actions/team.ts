'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const InviteSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'receptionist', 'cashier']).default('receptionist'),
})

async function getAdminProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, org_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')
  if (!['owner', 'admin'].includes(profile.role)) return { error: 'Sin permisos', supabase, profile: null }

  return { supabase, profile, error: null }
}

export async function inviteMember(_state: unknown, formData: FormData) {
  const { supabase, profile, error } = await getAdminProfile()
  if (error || !profile) return { error }

  const raw = Object.fromEntries(formData)
  const parsed = InviteSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data: invitation, error: dbError } = await supabase
    .from('invitations')
    .insert({
      org_id: profile.org_id!,
      email: parsed.data.email,
      role: parsed.data.role,
      invited_by: profile.id,
    })
    .select()
    .single()

  if (dbError) return { error: { _form: [dbError.message] } }

  revalidatePath('/dashboard/team')
  return { invitation }
}

export async function updateMemberRole(
  memberId: string,
  role: 'admin' | 'receptionist' | 'cashier'
) {
  const { supabase, profile, error } = await getAdminProfile()
  if (error || !profile) return { error }

  const { error: dbError } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', memberId)
    .eq('org_id', profile.org_id!)

  if (dbError) return { error: dbError.message }

  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function removeMember(memberId: string) {
  const { supabase, profile, error } = await getAdminProfile()
  if (error || !profile) return { error }

  const { error: dbError } = await supabase
    .from('profiles')
    .update({ org_id: null })
    .eq('id', memberId)
    .eq('org_id', profile.org_id!)

  if (dbError) return { error: dbError.message }

  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function revokeInvitation(invitationId: string) {
  const { supabase, profile, error } = await getAdminProfile()
  if (error || !profile) return { error }

  await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)
    .eq('org_id', profile.org_id!)

  revalidatePath('/dashboard/team')
  return { success: true }
}
