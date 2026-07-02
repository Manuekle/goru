import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Note01Icon } from '@hugeicons/core-free-icons'
import { BookingsListClient } from '@/components/bookings/BookingsListClient'
import { NewBookingTrigger } from '@/components/bookings/NewBookingTrigger'
import type { CalendarBooking } from '@/components/calendar/BookingCalendar'

const WHEN_OPTIONS = ['today', 'upcoming', 'past', 'all'] as const
type When = typeof WHEN_OPTIONS[number]

const WHEN_LABELS: Record<When, string> = {
  today: 'Hoy',
  upcoming: 'Próximas',
  past: 'Anteriores',
  all: 'Todas',
}

interface PageProps {
  searchParams: Promise<{ status?: string; court?: string; when?: string }>
}

export default async function BookingsPage({ searchParams }: PageProps) {
  const { status, court, when: whenParam } = await searchParams
  const when: When = WHEN_OPTIONS.includes(whenParam as When) ? (whenParam as When) : 'today'

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

  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())
  const todayStart = `${todayStr}T00:00:00`
  const todayEnd = `${todayStr}T23:59:59.999`

  let query = supabase
    .from('bookings')
    .select(`
      id, court_id, client_id, start_time, end_time, status, total_price, source, payment_status, payment_method, notes,
      courts(id, name),
      clients(id, full_name, phone)
    `)
    .eq('org_id', profile.org_id)

  if (when === 'today') {
    query = query.gte('start_time', todayStart).lte('start_time', todayEnd).order('start_time', { ascending: true })
  } else if (when === 'upcoming') {
    query = query.gt('start_time', todayEnd).order('start_time', { ascending: true }).limit(100)
  } else if (when === 'past') {
    query = query.lt('start_time', todayStart).order('start_time', { ascending: false }).limit(100)
  } else {
    query = query.order('start_time', { ascending: false }).limit(100)
  }

  const validStatuses = ['pending', 'confirmed', 'cancelled', 'no_show'] as const
  type ValidStatus = typeof validStatuses[number]
  if (status && validStatuses.includes(status as ValidStatus)) {
    query = query.eq('status', status as ValidStatus)
  }
  if (court) query = query.eq('court_id', court)

  const { data: bookings } = await query
  const { data: courts } = await supabase
    .from('courts')
    .select('*')
    .eq('org_id', profile.org_id)
    .eq('active', true)

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <h1 className="dash-page__title">Reservas</h1>
        <NewBookingTrigger courts={courts ?? []} timezone={timezone} />
      </div>

      <div className="filter-bar">
        {WHEN_OPTIONS.map((w) => (
          <Link
            key={w}
            href={`?when=${w}${status ? `&status=${status}` : ''}`}
            className={`filter-pill ${when === w ? 'filter-pill--active' : ''}`}
          >
            {WHEN_LABELS[w]}
          </Link>
        ))}
      </div>

      <div className="filter-bar">
        <Link href={`?when=${when}`} className={`filter-pill ${!status ? 'filter-pill--active' : ''}`}>
          Todos los estados
        </Link>
        <Link href={`?when=${when}&status=confirmed`} className={`filter-pill ${status === 'confirmed' ? 'filter-pill--active' : ''}`}>
          Confirmadas
        </Link>
        <Link href={`?when=${when}&status=pending`} className={`filter-pill ${status === 'pending' ? 'filter-pill--active' : ''}`}>
          Pendientes
        </Link>
        <Link href={`?when=${when}&status=cancelled`} className={`filter-pill ${status === 'cancelled' ? 'filter-pill--active' : ''}`}>
          Canceladas
        </Link>
      </div>

      {!bookings?.length ? (
        <EmptyState
          icon={Note01Icon}
          title={when === 'today' ? 'Sin reservas para hoy' : 'Sin reservas'}
          description={
            when === 'today'
              ? 'Mirá "Anteriores" o "Todas" para ver el historial, o creá una nueva.'
              : 'Creá la primera reserva desde el calendario o desde aquí.'
          }
          action={<NewBookingTrigger courts={courts ?? []} timezone={timezone} />}
        />
      ) : (
        <Card>
          <BookingsListClient
            bookings={bookings as unknown as CalendarBooking[]}
            courts={courts ?? []}
            timezone={timezone}
          />
        </Card>
      )}
    </div>
  )
}
