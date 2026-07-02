import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PublicBookingSchema } from '@/lib/validations/booking'
import { generateSlots } from '@/lib/date'
import { notifyBookingCreated } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = PublicBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { court_id, org_id, start_time, end_time, client_name, client_phone, client_email, notes, payment_method } = parsed.data

  const supabase = await createClient()

  // Verify court belongs to org
  const { data: court } = await supabase
    .from('courts')
    .select('id, active, organizations(timezone)')
    .eq('id', court_id)
    .eq('org_id', org_id)
    .single()

  if (!court || !court.active) {
    return NextResponse.json({ error: 'court_not_found' }, { status: 404 })
  }

  const timezone = (court.organizations as { timezone: string } | null)?.timezone ?? 'UTC'
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date(start_time))
  const dayOfWeek = new Date(`${dateStr}T12:00:00`).getDay()

  const [{ data: schedule }, { data: specialSchedule }, { data: dayBookings }] = await Promise.all([
    supabase
      .from('court_schedules')
      .select('*')
      .eq('court_id', court_id)
      .eq('day_of_week', dayOfWeek)
      .single(),
    supabase
      .from('special_schedules')
      .select('*')
      .eq('court_id', court_id)
      .eq('date', dateStr)
      .single(),
    supabase
      .from('bookings')
      .select('id, start_time, end_time, status')
      .eq('court_id', court_id)
      .gte('start_time', `${dateStr}T00:00:00.000Z`)
      .lte('start_time', `${dateStr}T23:59:59.999Z`)
      .neq('status', 'cancelled'),
  ])

  const slots = generateSlots({
    date: new Date(start_time),
    timezone,
    schedule: schedule ?? null,
    specialSchedule: specialSchedule ?? null,
    existingBookings: dayBookings ?? [],
  })

  const matchedSlot = slots.find(
    (s) => s.startTime.toISOString() === new Date(start_time).toISOString()
  )

  if (!matchedSlot || !matchedSlot.available) {
    return NextResponse.json({ error: 'slot_taken' }, { status: 409 })
  }

  // Upsert client by phone + org
  let clientId: string | null = null

  if (client_phone) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('org_id', org_id)
      .eq('phone', client_phone)
      .single()

    if (existing) {
      clientId = existing.id
    } else {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({
          org_id,
          full_name: client_name,
          phone: client_phone,
          email: client_email || null,
        })
        .select('id')
        .single()

      clientId = newClient?.id ?? null
    }
  }

  // Card payments are captured immediately in this simulated checkout; cash/transfer
  // are settled later (on-site or manually confirmed by the venue).
  const isPaidNow = payment_method === 'card'

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      org_id,
      court_id,
      client_id: clientId,
      start_time,
      end_time,
      status: 'confirmed',
      source: 'widget',
      notes: notes || null,
      total_price: matchedSlot.pricePerSlot,
      payment_method,
      payment_status: isPaidNow ? 'paid' : 'pending',
      paid_at: isPaidNow ? new Date().toISOString() : null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[bookings] Insert failed:', error.code, error.message, { org_id, court_id })
    if (error.code === '23P01') {
      return NextResponse.json({ error: 'slot_taken' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[bookings] Created:', { bookingId: booking.id, orgId: org_id, client: client_name, paid: isPaidNow })

  await notifyBookingCreated(supabase, {
    orgId: org_id,
    bookingId: booking.id,
    clientName: client_name,
    startTime: start_time,
    timezone,
  })

  return NextResponse.json(
    { bookingId: booking.id, paid: isPaidNow, totalPrice: matchedSlot.pricePerSlot },
    { status: 201 }
  )
}
