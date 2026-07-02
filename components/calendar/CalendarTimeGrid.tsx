'use client'

import { useMemo } from 'react'
import { addMinutes, differenceInMinutes, format, setHours, setMinutes, startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { BookingBlock } from './BookingBlock'
import type { Court } from '@/lib/supabase/types'
import type { CalendarBooking } from './BookingCalendar'

const DAY_START_HOUR = 7
const DAY_END_HOUR = 23
const GRID_RESOLUTION = 15 // minutes per row
const TOTAL_ROWS = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / GRID_RESOLUTION

function getRow(time: Date, dayStart: Date): number {
  const minutes = differenceInMinutes(time, dayStart)
  return Math.max(0, Math.floor(minutes / GRID_RESOLUTION))
}

function getSpan(start: Date, end: Date): number {
  return Math.ceil(differenceInMinutes(end, start) / GRID_RESOLUTION)
}

const TIME_LABELS: string[] = []
for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
  TIME_LABELS.push(`${String(h).padStart(2, '0')}:00`)
}

interface CalendarTimeGridProps {
  courts: Court[]
  bookings: CalendarBooking[]
  date: Date
  timezone: string
  onSlotClick: (courtId: string, start: Date, end: Date) => void
  onBookingClick: (booking: CalendarBooking) => void
}

export function CalendarTimeGrid({
  courts,
  bookings,
  date,
  timezone,
  onSlotClick,
  onBookingClick,
}: CalendarTimeGridProps) {
  const dayStartUtc = useMemo(() => {
    const zoned = toZonedTime(date, timezone)
    const dayLocal = setMinutes(setHours(startOfDay(zoned), DAY_START_HOUR), 0)
    // We work with the date as-is since bookings are UTC stored
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      DAY_START_HOUR,
      0,
      0
    )
  }, [date, timezone])

  const activeCourts = courts.filter((c) => c.active)

  function handleSlotClick(courtId: string, row: number) {
    const start = addMinutes(dayStartUtc, row * GRID_RESOLUTION)
    const end = addMinutes(start, 60)
    onSlotClick(courtId, start, end)
  }

  if (activeCourts.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">Sin canchas activas</p>
        <p className="empty-state__desc">Creá una cancha para empezar a ver y tomar reservas en el calendario.</p>
      </div>
    )
  }

  return (
    <div
      className="cal-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `56px repeat(${activeCourts.length}, 1fr)`,
        gridTemplateRows: `40px repeat(${TOTAL_ROWS}, 20px)`,
        gap: 0,
      }}
    >
      {/* Corner cell */}
      <div className="cal-grid__corner" />

      {/* Court headers */}
      {activeCourts.map((court) => (
        <div key={court.id} className="cal-grid__court-header">
          {court.name}
        </div>
      ))}

      {/* Time labels */}
      {TIME_LABELS.map((label, i) => (
        <div
          key={label}
          className="cal-grid__time"
          style={{ gridRow: `${i * 4 + 2} / span 4`, gridColumn: 1 }}
        >
          {label}
        </div>
      ))}

      {/* Grid cells (clickable empty slots) */}
      {activeCourts.map((court, colIdx) =>
        Array.from({ length: TOTAL_ROWS }, (_, row) => (
          <div
            key={`${court.id}-${row}`}
            className={`cal-grid__cell ${row % 4 === 0 ? 'cal-grid__cell--hour' : ''}`}
            style={{ gridRow: row + 2, gridColumn: colIdx + 2 }}
            onClick={() => handleSlotClick(court.id, row)}
            role="button"
            aria-label={`Reservar ${court.name} a las ${addMinutes(dayStartUtc, row * GRID_RESOLUTION).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`}
          />
        ))
      )}

      {/* Booking blocks */}
      {bookings.map((booking) => {
        const courtIdx = activeCourts.findIndex((c) => c.id === booking.court_id)
        if (courtIdx < 0) return null

        const start = new Date(booking.start_time)
        const end = new Date(booking.end_time)
        const rowStart = getRow(start, dayStartUtc)
        const rowSpan = getSpan(start, end)

        if (rowStart < 0 || rowStart >= TOTAL_ROWS) return null

        return (
          <BookingBlock
            key={booking.id}
            booking={booking}
            gridRow={rowStart + 2}
            gridRowSpan={rowSpan}
            gridColumn={courtIdx + 2}
            timezone={timezone}
            onClick={() => onBookingClick(booking)}
          />
        )
      })}
    </div>
  )
}
