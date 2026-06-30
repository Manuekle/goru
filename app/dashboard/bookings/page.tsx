import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateShort, formatTime, STATUS_LABELS } from '@/lib/utils'
import type { BookingStatus } from '@/lib/supabase/types'

const STATUS_VARIANT: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'danger',
  no_show: 'default',
}

interface PageProps {
  searchParams: Promise<{ status?: string; court?: string }>
}

export default async function BookingsPage({ searchParams }: PageProps) {
  const { status, court } = await searchParams
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

  let query = supabase
    .from('bookings')
    .select(`
      id, start_time, end_time, status, total_price, source, notes,
      courts(id, name),
      clients(full_name, phone)
    `)
    .eq('org_id', profile.org_id)
    .order('start_time', { ascending: false })
    .limit(100)

  const validStatuses = ['pending', 'confirmed', 'cancelled', 'no_show'] as const
  type ValidStatus = typeof validStatuses[number]
  if (status && validStatuses.includes(status as ValidStatus)) {
    query = query.eq('status', status as ValidStatus)
  }
  if (court) query = query.eq('court_id', court)

  const { data: bookings } = await query
  const { data: courts } = await supabase
    .from('courts')
    .select('id, name')
    .eq('org_id', profile.org_id)
    .eq('active', true)

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <h1 className="dash-page__title">Reservas</h1>
        <Link href="/dashboard/bookings/new">
          <Button variant="brand" size="sm">+ Nueva reserva</Button>
        </Link>
      </div>

      <div className="filter-bar">
        <Link href="/dashboard/bookings" className={`filter-pill ${!status ? 'filter-pill--active' : ''}`}>
          Todas
        </Link>
        <Link href="?status=confirmed" className={`filter-pill ${status === 'confirmed' ? 'filter-pill--active' : ''}`}>
          Confirmadas
        </Link>
        <Link href="?status=pending" className={`filter-pill ${status === 'pending' ? 'filter-pill--active' : ''}`}>
          Pendientes
        </Link>
        <Link href="?status=cancelled" className={`filter-pill ${status === 'cancelled' ? 'filter-pill--active' : ''}`}>
          Canceladas
        </Link>
      </div>

      {!bookings?.length ? (
        <EmptyState
          title="Sin reservas"
          description="Creá la primera reserva desde el calendario o desde aquí."
        />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha / Hora</th>
              <th>Cancha</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const c = b.courts as { name: string } | null
              const cl = b.clients as { full_name: string; phone: string } | null

              return (
                <tr key={b.id}>
                  <td>
                    <p>{formatDateShort(b.start_time, timezone)}</p>
                    <p className="data-table__sub">
                      {formatTime(b.start_time, timezone)} – {formatTime(b.end_time, timezone)}
                    </p>
                  </td>
                  <td>{c?.name ?? '—'}</td>
                  <td>
                    {cl ? (
                      <>
                        <p>{cl.full_name}</p>
                        <p className="data-table__sub">{cl.phone}</p>
                      </>
                    ) : '—'}
                  </td>
                  <td>
                    <Badge variant={STATUS_VARIANT[b.status as BookingStatus]}>
                      {STATUS_LABELS[b.status]}
                    </Badge>
                  </td>
                  <td>${Number(b.total_price).toLocaleString('es-AR')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
