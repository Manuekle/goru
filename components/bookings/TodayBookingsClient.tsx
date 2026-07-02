'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { NewBookingDrawer } from '@/components/calendar/NewBookingDrawer'
import { formatTime, STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/utils'
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

interface TodayBookingsClientProps {
  bookings: CalendarBooking[]
  courts: Court[]
  timezone: string
}

export function TodayBookingsClient({ bookings, courts, timezone }: TodayBookingsClientProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<CalendarBooking | null>(null)

  function saved() {
    setSelected(null)
    router.refresh()
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hora</TableHead>
            <TableHead>Cancha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Pago</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => (
            <TableRow key={b.id} className="cursor-pointer" onClick={() => setSelected(b)}>
              <TableCell className="data-table__time">
                {formatTime(b.start_time, timezone)} – {formatTime(b.end_time, timezone)}
              </TableCell>
              <TableCell>{b.courts?.name ?? '—'}</TableCell>
              <TableCell>
                <p>{b.clients?.full_name ?? 'Sin cliente'}</p>
                {b.clients?.phone && (
                  <p className="data-table__sub">{b.clients.phone}</p>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[b.status as BookingStatus]}>
                  {STATUS_LABELS[b.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={PAYMENT_VARIANT[b.payment_status] ?? 'default'}>
                  {PAYMENT_STATUS_LABELS[b.payment_status] ?? b.payment_status}
                </Badge>
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
          onClose={() => setSelected(null)}
          onSaved={saved}
        />
      )}
    </>
  )
}
