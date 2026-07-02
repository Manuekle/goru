import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { formatDateShort, formatTime, STATUS_LABELS } from '@/lib/utils'
import { ClientForm } from '@/components/clients/ClientForm'
import { DeleteClientButton } from '@/components/clients/DeleteClientButton'
import type { BookingStatus } from '@/lib/supabase/types'

const STATUS_VARIANT: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'danger',
  no_show: 'default',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
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

  const [{ data: client }, { data: bookings }] = await Promise.all([
    supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('org_id', profile.org_id)
      .single(),

    supabase
      .from('bookings')
      .select('id, start_time, end_time, status, total_price, courts(name)')
      .eq('client_id', id)
      .eq('org_id', profile.org_id)
      .order('start_time', { ascending: false })
      .limit(20),
  ])

  if (!client) notFound()

  return (
    <div className="dash-page dash-page--narrow">
      <div className="dash-page__header">
        <Link href="/dashboard/clients">
          <Button variant="ghost" size="sm">← Clientes</Button>
        </Link>
        <h1 className="dash-page__title">{client.full_name}</h1>
        <DeleteClientButton clientId={client.id} clientName={client.full_name} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm client={client} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de reservas</CardTitle>
        </CardHeader>
        {!bookings?.length ? (
          <CardContent>
            <p className="dash-empty">Sin reservas anteriores.</p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cancha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => {
                const court = b.courts as { name: string } | null
                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      <p>{formatDateShort(b.start_time, timezone)}</p>
                      <p className="data-table__sub">
                        {formatTime(b.start_time, timezone)} – {formatTime(b.end_time, timezone)}
                      </p>
                    </TableCell>
                    <TableCell>{court?.name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[b.status as BookingStatus]}>
                        {STATUS_LABELS[b.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>${Number(b.total_price).toLocaleString('es-AR')}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
