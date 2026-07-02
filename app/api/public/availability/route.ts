import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSlots } from '@/lib/date'
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const courtId = searchParams.get('courtId')
  const monthStr = searchParams.get('month') // YYYY-MM

  if (!courtId || !monthStr) {
    return NextResponse.json({ error: 'courtId and month required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: court } = await supabase
    .from('courts')
    .select('id, org_id, active, organizations(timezone)')
    .eq('id', courtId)
    .single()

  if (!court || !court.active) {
    return NextResponse.json({ error: 'Court not found' }, { status: 404 })
  }

  const timezone = (court.organizations as { timezone: string } | null)?.timezone ?? 'UTC'
  const monthDate = new Date(`${monthStr}-01T12:00:00`)
  const days = eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) })
  const rangeStart = format(days[0], 'yyyy-MM-dd')
  const rangeEnd = format(days[days.length - 1], 'yyyy-MM-dd')

  const [{ data: schedules }, { data: specialSchedules }, { data: bookings }] = await Promise.all([
    supabase.from('court_schedules').select('*').eq('court_id', courtId),
    supabase
      .from('special_schedules')
      .select('*')
      .eq('court_id', courtId)
      .gte('date', rangeStart)
      .lte('date', rangeEnd),
    supabase
      .from('bookings')
      .select('id, start_time, end_time, status')
      .eq('court_id', courtId)
      .gte('start_time', `${rangeStart}T00:00:00.000Z`)
      .lte('start_time', `${rangeEnd}T23:59:59.999Z`)
      .neq('status', 'cancelled'),
  ])

  const unavailableDates: string[] = []

  for (const day of days) {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayOfWeek = new Date(`${dateStr}T12:00:00`).getDay()
    const schedule = schedules?.find((s) => s.day_of_week === dayOfWeek) ?? null
    const specialSchedule = specialSchedules?.find((s) => s.date === dateStr) ?? null
    const dayBookings = bookings?.filter((b) => b.start_time.startsWith(dateStr)) ?? []

    const slots = generateSlots({
      date: day,
      timezone,
      schedule,
      specialSchedule,
      existingBookings: dayBookings,
    })

    if (!slots.some((s) => s.available)) {
      unavailableDates.push(dateStr)
    }
  }

  return NextResponse.json({ unavailableDates })
}
