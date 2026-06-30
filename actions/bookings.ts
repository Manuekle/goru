'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { BookingSchema } from '@/lib/validations/booking'

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

export async function createBooking(_state: unknown, formData: FormData) {
  const { supabase, profile } = await getProfile()

  const raw = Object.fromEntries(formData)
  const parsed = BookingSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error: dbError } = await supabase
    .from('bookings')
    .insert({ ...parsed.data, org_id: profile.org_id! })

  if (dbError) {
    if (dbError.code === '23P01') return { error: { _form: ['Ese horario ya está reservado'] } }
    return { error: { _form: [dbError.message] } }
  }

  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/bookings')
  return { success: true }
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show'
) {
  const { supabase, profile } = await getProfile()

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .eq('org_id', profile.org_id!)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/bookings')
  return { success: true }
}

export async function cancelBooking(bookingId: string) {
  return updateBookingStatus(bookingId, 'cancelled')
}

export async function updateBooking(bookingId: string, formData: FormData) {
  const { supabase, profile } = await getProfile()

  const raw = Object.fromEntries(formData)
  const parsed = BookingSchema.partial().safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error: dbError } = await supabase
    .from('bookings')
    .update(parsed.data)
    .eq('id', bookingId)
    .eq('org_id', profile.org_id!)

  if (dbError) {
    if (dbError.code === '23P01') return { error: { _form: ['Ese horario ya está reservado'] } }
    return { error: { _form: [dbError.message] } }
  }

  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/bookings')
  return { success: true }
}
