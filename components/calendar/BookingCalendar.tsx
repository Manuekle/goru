'use client'

import { useState, useCallback } from 'react'
import { addDays, subDays, format, isSameDay } from 'date-fns'
import { CalendarHeader } from './CalendarHeader'
import { CalendarTimeGrid } from './CalendarTimeGrid'
import { NewBookingDrawer } from './NewBookingDrawer'
import type { Court, Booking, Client } from '@/lib/supabase/types'

export type CalendarBooking = Pick<
  Booking,
  'id' | 'court_id' | 'start_time' | 'end_time' | 'status' | 'notes' | 'total_price' | 'source'
> & {
  courts: { id: string; name: string } | null
  clients: { full_name: string; phone: string } | null
}

interface BookingCalendarProps {
  courts: Court[]
  initialBookings: CalendarBooking[]
  initialDate?: Date
  orgTimezone: string
}

export function BookingCalendar({
  courts,
  initialBookings,
  initialDate,
  orgTimezone,
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate ?? new Date())
  const [bookings, setBookings] = useState(initialBookings)
  const [loading, setLoading] = useState(false)
  const [drawerSlot, setDrawerSlot] = useState<{
    courtId: string
    startTime: Date
    endTime: Date
  } | null>(null)
  const [editBooking, setEditBooking] = useState<CalendarBooking | null>(null)

  const fetchWeek = useCallback(async (date: Date) => {
    setLoading(true)
    const from = new Date(date)
    from.setDate(date.getDate() - date.getDay() + 1) // Monday
    from.setHours(0, 0, 0, 0)
    const to = new Date(from)
    to.setDate(from.getDate() + 6)
    to.setHours(23, 59, 59, 999)

    try {
      const res = await fetch(
        `/api/bookings/week?from=${from.toISOString()}&to=${to.toISOString()}`
      )
      if (res.ok) {
        const { bookings: fetched } = await res.json()
        setBookings(fetched ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  function navigate(delta: number) {
    const next = addDays(selectedDate, delta)
    setSelectedDate(next)
    fetchWeek(next)
  }

  const dayBookings = bookings.filter((b) =>
    isSameDay(new Date(b.start_time), selectedDate)
  )

  function handleSlotClick(courtId: string, startTime: Date, endTime: Date) {
    setEditBooking(null)
    setDrawerSlot({ courtId, startTime, endTime })
  }

  function handleBookingClick(booking: CalendarBooking) {
    setDrawerSlot(null)
    setEditBooking(booking)
  }

  function handleDrawerClose() {
    setDrawerSlot(null)
    setEditBooking(null)
  }

  function handleBookingSaved() {
    fetchWeek(selectedDate)
    setDrawerSlot(null)
    setEditBooking(null)
  }

  return (
    <div className="calendar-wrap">
      <CalendarHeader
        date={selectedDate}
        timezone={orgTimezone}
        loading={loading}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        onToday={() => {
          const today = new Date()
          setSelectedDate(today)
          fetchWeek(today)
        }}
      />

      <CalendarTimeGrid
        courts={courts}
        bookings={dayBookings}
        date={selectedDate}
        timezone={orgTimezone}
        onSlotClick={handleSlotClick}
        onBookingClick={handleBookingClick}
      />

      {(drawerSlot || editBooking) && (
        <NewBookingDrawer
          courts={courts}
          preselected={drawerSlot}
          booking={editBooking}
          timezone={orgTimezone}
          onClose={handleDrawerClose}
          onSaved={handleBookingSaved}
        />
      )}
    </div>
  )
}
