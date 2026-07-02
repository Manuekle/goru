'use client'

import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { CalendarBooking } from './BookingCalendar'

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'booking-block--confirmed',
  pending: 'booking-block--pending',
  no_show: 'booking-block--no-show',
}

interface BookingBlockProps {
  booking: CalendarBooking
  gridRow: number
  gridRowSpan: number
  gridColumn: number
  timezone: string
  onClick: () => void
}

export function BookingBlock({
  booking,
  gridRow,
  gridRowSpan,
  gridColumn,
  timezone,
  onClick,
}: BookingBlockProps) {
  const client = booking.clients
  const start = formatTime(booking.start_time, timezone)
  const end = formatTime(booking.end_time, timezone)

  return (
    <div
      className={cn('booking-block', STATUS_COLORS[booking.status] ?? '')}
      style={{
        gridRow: `${gridRow} / span ${Math.max(gridRowSpan, 1)}`,
        gridColumn,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <p className="booking-block__time">
        {start} – {end}
        {booking.payment_status === 'pending' && (
          <span className="booking-block__pay-dot" title="Pago pendiente" />
        )}
      </p>
      {client && <p className="booking-block__client">{client.full_name}</p>}
    </div>
  )
}
