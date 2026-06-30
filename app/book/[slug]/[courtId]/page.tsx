'use client'

import { useState, useEffect, use } from 'react'
import { formatPrice, formatTime, DAY_NAMES_FULL } from '@/lib/utils'
import { addMonths, subMonths, startOfMonth, getDaysInMonth, getDay, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

type Step = 'date' | 'slot' | 'confirm' | 'success'

interface Slot {
  startTime: string
  endTime: string
  pricePerSlot: number
  available: boolean
}

interface PageProps {
  params: Promise<{ slug: string; courtId: string }>
}

export default function BookCourtPage({ params }: PageProps) {
  const { slug, courtId } = use(params)

  const [step, setStep] = useState<Step>('date')
  const [monthDate, setMonthDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [orgId, setOrgId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingId, setBookingId] = useState('')

  // Fetch org id once
  useEffect(() => {
    fetch(`/api/public/org-by-slug?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => setOrgId(d.orgId ?? ''))
      .catch(() => {})
  }, [slug])

  async function handleDateSelect(date: Date) {
    setSelectedDate(date)
    setSlotsLoading(true)
    const dateStr = format(date, 'yyyy-MM-dd')

    try {
      const res = await fetch(`/api/public/slots?courtId=${courtId}&date=${dateStr}`)
      const { slots: fetched } = await res.json()
      setSlots(fetched ?? [])
      setStep('slot')
    } finally {
      setSlotsLoading(false)
    }
  }

  function handleSlotSelect(slot: Slot) {
    setSelectedSlot(slot)
    setStep('confirm')
  }

  async function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setBookingError('')

    const fd = new FormData(e.currentTarget)
    const body = {
      court_id: courtId,
      org_id: orgId,
      start_time: selectedSlot!.startTime,
      end_time: selectedSlot!.endTime,
      client_name: fd.get('client_name') as string,
      client_phone: fd.get('client_phone') as string,
      client_email: fd.get('client_email') as string,
      notes: fd.get('notes') as string,
    }

    try {
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        setBookingError(
          data.error === 'slot_taken'
            ? 'Ese horario ya fue reservado. Elegí otro.'
            : 'Error al crear la reserva. Intentá de nuevo.'
        )
        if (data.error === 'slot_taken') setStep('slot')
      } else {
        setBookingId(data.bookingId)
        setStep('success')
      }
    } catch {
      setBookingError('Error de conexión. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep('date')
    setSelectedDate(null)
    setSelectedSlot(null)
    setSlots([])
    setBookingError('')
    setBookingId('')
  }

  // Calendar rendering
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const daysInMonth = getDaysInMonth(monthDate)
  const firstDayOfWeek = getDay(startOfMonth(monthDate))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="book-page">
      {step === 'date' && (
        <div className="book-step">
          <h1 className="book-title">Elegí una fecha</h1>
          <div className="book-calendar">
            <div className="book-cal-nav">
              <button className="btn btn-ghost btn-sm" onClick={() => setMonthDate(subMonths(monthDate, 1))}>
                ←
              </button>
              <span className="book-cal-month">
                {format(monthDate, 'MMMM yyyy', { locale: es })}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setMonthDate(addMonths(monthDate, 1))}>
                →
              </button>
            </div>

            <div className="book-cal-grid">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                <div key={d} className="book-cal-weekday">{d}</div>
              ))}

              {/* Offset for first day (Monday-based) */}
              {Array.from({ length: (firstDayOfWeek + 6) % 7 }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = new Date(year, month, i + 1)
                const isPast = d < today
                const isSelected = selectedDate && format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')

                return (
                  <button
                    key={i}
                    className={`book-cal-day ${isPast ? 'book-cal-day--past' : ''} ${isSelected ? 'book-cal-day--selected' : ''}`}
                    disabled={isPast || slotsLoading}
                    onClick={() => handleDateSelect(d)}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>
          {slotsLoading && <p className="book-loading">Cargando horarios...</p>}
        </div>
      )}

      {step === 'slot' && (
        <div className="book-step">
          <button className="book-back" onClick={() => setStep('date')}>← Cambiar fecha</button>
          <h1 className="book-title">
            {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </h1>

          {!slots.filter((s) => s.available).length ? (
            <div className="book-no-slots">
              <p>No hay turnos disponibles para esta fecha.</p>
              <button className="btn btn-dark" onClick={() => setStep('date')}>Elegir otra fecha</button>
            </div>
          ) : (
            <div className="book-slot-grid">
              {slots.map((slot, i) => (
                <button
                  key={i}
                  className={`book-slot ${slot.available ? 'book-slot--available' : 'book-slot--taken'}`}
                  disabled={!slot.available}
                  onClick={() => handleSlotSelect(slot)}
                >
                  <span className="book-slot__time">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </span>
                  {slot.pricePerSlot > 0 && (
                    <span className="book-slot__price">{formatPrice(slot.pricePerSlot)}</span>
                  )}
                  {!slot.available && <span className="book-slot__label">Ocupado</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'confirm' && selectedSlot && (
        <div className="book-step">
          <button className="book-back" onClick={() => setStep('slot')}>← Cambiar horario</button>
          <h1 className="book-title">Confirmá tu reserva</h1>

          <div className="book-summary">
            <div className="book-summary__row">
              <span>Fecha</span>
              <span>{selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })}</span>
            </div>
            <div className="book-summary__row">
              <span>Horario</span>
              <span>{formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}</span>
            </div>
            {selectedSlot.pricePerSlot > 0 && (
              <div className="book-summary__row">
                <span>Precio</span>
                <span>{formatPrice(selectedSlot.pricePerSlot)}</span>
              </div>
            )}
          </div>

          {bookingError && <p className="auth-error">{bookingError}</p>}

          <form onSubmit={handleConfirm} className="form-stack">
            <Input label="Nombre completo" name="client_name" required />
            <Input label="Teléfono" name="client_phone" type="tel" required />
            <Input label="Email (opcional)" name="client_email" type="email" />
            <Textarea label="Notas (opcional)" name="notes" rows={2} />

            <Button type="submit" variant="brand" loading={submitting} style={{ width: '100%' }}>
              Confirmar reserva
            </Button>
          </form>
        </div>
      )}

      {step === 'success' && (
        <div className="book-step book-step--success">
          <div className="book-success-icon">✓</div>
          <h1 className="book-title">¡Reserva confirmada!</h1>
          <div className="book-summary">
            <div className="book-summary__row">
              <span>Fecha</span>
              <span>{selectedDate && format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}</span>
            </div>
            <div className="book-summary__row">
              <span>Horario</span>
              <span>{selectedSlot && `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}`}</span>
            </div>
          </div>
          <button className="btn btn-dark" onClick={reset}>
            Reservar otro turno
          </button>
        </div>
      )}
    </div>
  )
}
