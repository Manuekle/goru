import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { formatDateShort, formatTime } from '@/lib/utils'

type NotificationType = Database['public']['Enums']['notification_type']

interface CreateNotificationParams {
  orgId: string
  type: NotificationType
  title: string
  body?: string
  bookingId?: string
}

export async function createNotification(
  supabase: SupabaseClient<Database>,
  { orgId, type, title, body, bookingId }: CreateNotificationParams
) {
  const { error } = await supabase.from('notifications').insert({
    org_id: orgId,
    type,
    title,
    body: body ?? null,
    booking_id: bookingId ?? null,
  })

  if (error) {
    console.error('[notifications] Failed to create notification:', error.message, { orgId, type })
  }
}

export async function notifyBookingCreated(
  supabase: SupabaseClient<Database>,
  params: {
    orgId: string
    bookingId: string
    clientName: string
    startTime: string
    timezone: string
  }
) {
  await createNotification(supabase, {
    orgId: params.orgId,
    type: 'booking_created',
    bookingId: params.bookingId,
    title: 'Nueva reserva online',
    body: `${params.clientName} reservó para el ${formatDateShort(params.startTime, params.timezone)} a las ${formatTime(params.startTime, params.timezone)}`,
  })
}

export async function notifyBookingCancelled(
  supabase: SupabaseClient<Database>,
  params: {
    orgId: string
    bookingId: string
    clientName?: string | null
    startTime: string
    timezone: string
  }
) {
  await createNotification(supabase, {
    orgId: params.orgId,
    type: 'booking_cancelled',
    bookingId: params.bookingId,
    title: 'Reserva cancelada',
    body: `${params.clientName ?? 'Una reserva'} del ${formatDateShort(params.startTime, params.timezone)} a las ${formatTime(params.startTime, params.timezone)} fue cancelada`,
  })
}

export async function notifyPaymentReceived(
  supabase: SupabaseClient<Database>,
  params: { orgId: string; bookingId: string; amount: number }
) {
  await createNotification(supabase, {
    orgId: params.orgId,
    type: 'payment_received',
    bookingId: params.bookingId,
    title: 'Pago registrado',
    body: `Se marcó como pagada una reserva por $${params.amount.toLocaleString('es-AR')}`,
  })
}
