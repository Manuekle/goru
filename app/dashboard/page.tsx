import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { TodayBookingsClient } from '@/components/bookings/TodayBookingsClient'
import { NewBookingTrigger } from '@/components/bookings/NewBookingTrigger'
import type { CalendarBooking } from '@/components/calendar/BookingCalendar'
import { Note01Icon, Grid02Icon, Coins01Icon } from '@hugeicons/core-free-icons'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, organizations(timezone)')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  const timezone = (profile.organizations as { timezone: string } | null)?.timezone ?? 'UTC'

  // Today's date range in org timezone
  const now = new Date()
  const todayStart = new Date(
    new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(now) + 'T00:00:00'
  )
  const todayEnd = new Date(
    new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(now) + 'T23:59:59'
  )

  const [{ data: todayBookings }, { data: courts }, { data: pendingCount }] = await Promise.all([
    supabase
      .from('bookings')
      .select(`
        id, court_id, client_id, start_time, end_time, status, total_price, source, payment_status, payment_method, notes,
        courts(id, name, surface),
        clients(id, full_name, phone)
      `)
      .eq('org_id', profile.org_id)
      .gte('start_time', todayStart.toISOString())
      .lte('start_time', todayEnd.toISOString())
      .neq('status', 'cancelled')
      .order('start_time'),

    supabase
      .from('courts')
      .select('*')
      .eq('org_id', profile.org_id)
      .eq('active', true),

    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', profile.org_id)
      .eq('payment_status', 'pending')
      .neq('status', 'cancelled'),
  ])

  const totalBookings = todayBookings?.length ?? 0
  const totalCourts = courts?.length ?? 0
  const confirmedBookings = todayBookings?.filter((b) => b.status === 'confirmed').length ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingCountNum = (pendingCount as any)?.count ?? 0

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div className="dash-page__heading">
          <h1 className="dash-page__title">Hoy</h1>
          <p className="dash-page__sub">
            {formatDate(now, timezone)}
          </p>
        </div>
        <NewBookingTrigger courts={courts ?? []} timezone={timezone} />
      </div>

      <div className="stat-grid">
        <StatCard
          label="Reservas hoy"
          value={totalBookings}
          sub={`${confirmedBookings} confirmadas`}
          icon={Note01Icon}
        />
        <StatCard
          label="Canchas activas"
          value={totalCourts}
          icon={Grid02Icon}
        />
        <StatCard
          label="Pendientes de pago"
          value={pendingCountNum}
          icon={Coins01Icon}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservas del día</CardTitle>
        </CardHeader>

        {!todayBookings?.length ? (
          <CardContent>
            <p className="dash-empty">No hay reservas para hoy.</p>
          </CardContent>
        ) : (
          <CardContent>
            <TodayBookingsClient
              bookings={todayBookings as unknown as CalendarBooking[]}
              courts={courts ?? []}
              timezone={timezone}
            />
          </CardContent>
        )}
      </Card>
    </div>
  )
}
