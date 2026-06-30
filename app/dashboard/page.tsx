import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/dashboard/StatCard'
import { formatDate, formatTime } from '@/lib/utils'
import { STATUS_LABELS, SURFACE_LABELS } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { BookingStatus } from '@/lib/supabase/types'

const STATUS_VARIANT: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'danger',
  no_show: 'default',
}

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
        id, start_time, end_time, status, total_price, notes,
        courts(name, surface),
        clients(full_name, phone)
      `)
      .eq('org_id', profile.org_id)
      .gte('start_time', todayStart.toISOString())
      .lte('start_time', todayEnd.toISOString())
      .neq('status', 'cancelled')
      .order('start_time'),

    supabase
      .from('courts')
      .select('id')
      .eq('org_id', profile.org_id)
      .eq('active', true),

    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', profile.org_id)
      .eq('status', 'pending'),
  ])

  const totalBookings = todayBookings?.length ?? 0
  const totalCourts = courts?.length ?? 0
  const confirmedBookings = todayBookings?.filter((b) => b.status === 'confirmed').length ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingCountNum = (pendingCount as any)?.count ?? 0

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <h1 className="dash-page__title">Hoy</h1>
        <p className="dash-page__sub">
          {formatDate(now, timezone)}
        </p>
        <Link href="/dashboard/bookings/new">
          <Button variant="brand" size="sm">+ Nueva reserva</Button>
        </Link>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Reservas hoy"
          value={totalBookings}
          sub={`${confirmedBookings} confirmadas`}
        />
        <StatCard
          label="Canchas activas"
          value={totalCourts}
        />
        <StatCard
          label="Pendientes de pago"
          value={pendingCountNum}
        />
      </div>

      <section className="dash-section">
        <h2 className="dash-section__title">Reservas del día</h2>

        {!todayBookings?.length ? (
          <p className="dash-empty">No hay reservas para hoy.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Cancha</th>
                <th>Cliente</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {todayBookings.map((b) => {
                const court = b.courts as { name: string; surface: string } | null
                const client = b.clients as { full_name: string; phone: string } | null

                return (
                  <tr key={b.id}>
                    <td className="data-table__time">
                      {formatTime(b.start_time, timezone)} – {formatTime(b.end_time, timezone)}
                    </td>
                    <td>{court?.name ?? '—'}</td>
                    <td>
                      <p>{client?.full_name ?? 'Sin cliente'}</p>
                      {client?.phone && (
                        <p className="data-table__sub">{client.phone}</p>
                      )}
                    </td>
                    <td>
                      <Badge variant={STATUS_VARIANT[b.status as BookingStatus]}>
                        {STATUS_LABELS[b.status]}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
