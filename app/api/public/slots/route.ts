import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSlots } from '@/lib/date'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const courtId = searchParams.get('courtId')
  const dateStr = searchParams.get('date')

  if (!courtId || !dateStr) {
    return NextResponse.json({ error: 'courtId and date required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Fetch court + org timezone
  const { data: court } = await supabase
    .from('courts')
    .select('id, org_id, active, organizations(timezone)')
    .eq('id', courtId)
    .single()

  if (!court || !court.active) {
    return NextResponse.json({ error: 'Court not found' }, { status: 404 })
  }

  const timezone = (court.organizations as { timezone: string } | null)?.timezone ?? 'UTC'
  const date = new Date(dateStr)
  const dayOfWeek = new Date(
    new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date) + 'T12:00:00'
  ).getDay()

  const [{ data: schedule }, { data: specialSchedule }, { data: existingBookings }] =
    await Promise.all([
      supabase
        .from('court_schedules')
        .select('*')
        .eq('court_id', courtId)
        .eq('day_of_week', dayOfWeek)
        .single(),

      supabase
        .from('special_schedules')
        .select('*')
        .eq('court_id', courtId)
        .eq('date', dateStr)
        .single(),

      supabase
        .from('bookings')
        .select('id, start_time, end_time, status')
        .eq('court_id', courtId)
        .gte('start_time', `${dateStr}T00:00:00.000Z`)
        .lte('start_time', `${dateStr}T23:59:59.999Z`)
        .neq('status', 'cancelled'),
    ])

  const slots = generateSlots({
    date,
    timezone,
    schedule: schedule ?? null,
    specialSchedule: specialSchedule ?? null,
    existingBookings: existingBookings ?? [],
  })

  return NextResponse.json({
    slots: slots.map((s) => ({
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
      pricePerSlot: s.pricePerSlot,
      available: s.available,
    })),
  })
}
