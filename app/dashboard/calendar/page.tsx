import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookingCalendar } from '@/components/calendar/BookingCalendar'
import { getWeekBounds } from '@/lib/date'

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, organizations(timezone)')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  const orgTimezone = (profile.organizations as { timezone: string } | null)?.timezone ?? 'UTC'

  const { start, end } = getWeekBounds(new Date())

  const [{ data: courts }, { data: bookings }] = await Promise.all([
    supabase
      .from('courts')
      .select('*')
      .eq('org_id', profile.org_id)
      .eq('active', true)
      .order('created_at'),

    supabase
      .from('bookings')
      .select(`
        id, court_id, client_id, start_time, end_time, status, notes, total_price, source, payment_status, payment_method,
        courts(id, name),
        clients(id, full_name, phone)
      `)
      .eq('org_id', profile.org_id)
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString())
      .neq('status', 'cancelled')
      .order('start_time'),
  ])

  return (
    <div className="dash-page dash-page--full">
      <div className="dash-page__header">
        <h1 className="dash-page__title">Calendario</h1>
      </div>

      <BookingCalendar
        courts={courts ?? []}
        initialBookings={(bookings ?? []) as Parameters<typeof BookingCalendar>[0]['initialBookings']}
        orgTimezone={orgTimezone}
      />
    </div>
  )
}
