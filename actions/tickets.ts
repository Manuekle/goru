'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'
import { formatDateShort, formatTime } from '@/lib/utils'

export async function getTicketData(bookingId: string) {
  const supabase = await createClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      courts(name, surface),
      clients(full_name, phone),
      organizations(name, slug, timezone, phone, address)
    `)
    .eq('id', bookingId)
    .single()

  if (error || !booking) return null

  return booking
}

export async function checkInBooking(bookingId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return { error: 'No pertenecés a ninguna organización' }

  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, org_id, client_id, checked_in_at, start_time, clients(full_name)')
    .eq('id', bookingId)
    .eq('org_id', profile.org_id)
    .single()

  if (fetchErr || !booking) return { error: 'Reserva no encontrada' }
  if (booking.checked_in_at) return { error: 'Ya se hizo check-in para esta reserva' }

  const now = new Date().toISOString()
  const { error: updateErr } = await supabase
    .from('bookings')
    .update({ checked_in_at: now })
    .eq('id', bookingId)
    .eq('org_id', profile.org_id)

  if (updateErr) return { error: updateErr.message }

  // Create notification
  const { data: org } = await supabase
    .from('organizations')
    .select('timezone')
    .eq('id', profile.org_id)
    .single()

  const tz = org?.timezone ?? 'UTC'
  const clientName = (booking.clients as unknown as { full_name: string } | null)?.full_name ?? 'Cliente'
  const dateStr = formatDateShort(booking.start_time, tz)
  const timeStr = formatTime(booking.start_time, tz)

  await createNotification(supabase, {
    orgId: profile.org_id,
    type: 'booking_checked_in',
    bookingId,
    title: 'Check-in registrado',
    body: `${clientName} hizo check-in para la reserva del ${dateStr} a las ${timeStr}`,
  })

  revalidatePath(`/t/${bookingId}`)
  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/bookings')
  return { success: true, checked_in_at: now }
}
