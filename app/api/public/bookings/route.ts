import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PublicBookingSchema } from '@/lib/validations/booking'

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

  const { court_id, org_id, start_time, end_time, client_name, client_phone, client_email, notes } = parsed.data

  const supabase = await createClient()

  // Verify court belongs to org
  const { data: court } = await supabase
    .from('courts')
    .select('id, active')
    .eq('id', court_id)
    .eq('org_id', org_id)
    .single()

  if (!court || !court.active) {
    return NextResponse.json({ error: 'court_not_found' }, { status: 404 })
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
      total_price: 0,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23P01') {
      return NextResponse.json({ error: 'slot_taken' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookingId: booking.id }, { status: 201 })
}
