'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { NewBookingDrawer } from '@/components/calendar/NewBookingDrawer'
import { markBookingPaid } from '@/actions/bookings'
import { formatDateShort, formatTime, STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/utils'
import type { BookingStatus, Court } from '@/lib/supabase/types'
import type { CalendarBooking } from '@/components/calendar/BookingCalendar'

const STATUS_VARIANT: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'danger',
  no_show: 'default',
}

const PAYMENT_VARIANT: Record<string, 'success' | 'warning' | 'default'> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'default',
}

interface BookingsListClientProps {
  bookings: CalendarBooking[]
  courts: Court[]
  timezone: string
}

export function BookingsListClient({ bookings, courts, timezone }: BookingsListClientProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<CalendarBooking | null>(null)
  const [isPending, startTransition] = useTransition()

  function close() {
    setSelected(null)
  }

  function saved() {
    close()
    router.refresh()
  }

  function handleMarkPaid(e: React.MouseEvent, bookingId: string) {
    e.stopPropagation()
    startTransition(async () => {
      await markBookingPaid(bookingId, 'cash')
      router.refresh()
    })
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha / Hora</TableHead>
            <TableHead>Cancha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Pago</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => (
            <TableRow key={b.id} className="cursor-pointer" onClick={() => setSelected(b)}>
              <TableCell>
                <p>{formatDateShort(b.start_time, timezone)}</p>
                <p className="data-table__sub">
                  {formatTime(b.start_time, timezone)} – {formatTime(b.end_time, timezone)}
                </p>
              </TableCell>
              <TableCell>{b.courts?.name ?? '—'}</TableCell>
              <TableCell>
                {b.clients ? (
                  <>
                    <p>{b.clients.full_name}</p>
                    <p className="data-table__sub">{b.clients.phone}</p>
                  </>
                ) : '—'}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[b.status as BookingStatus]}>
                  {STATUS_LABELS[b.status]}
                </Badge>
              </TableCell>
              <TableCell>${Number(b.total_price).toLocaleString('es-AR')}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={PAYMENT_VARIANT[b.payment_status] ?? 'default'}>
                    {PAYMENT_STATUS_LABELS[b.payment_status] ?? b.payment_status}
                  </Badge>
                  {b.payment_status !== 'paid' && b.status !== 'cancelled' && (
                    <button
                      type="button"
                      className="data-table__action"
                      disabled={isPending}
                      onClick={(e) => handleMarkPaid(e, b.id)}
                    >
                      Marcar pagado
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selected && (
        <NewBookingDrawer
          courts={courts}
          booking={selected}
          timezone={timezone}
          onClose={close}
          onSaved={saved}
        />
      )}
    </>
  )
}
