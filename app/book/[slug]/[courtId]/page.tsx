'use client'

import { useState, useEffect, use } from 'react'
import { formatPrice, formatTime } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Calendar } from '@/components/ui/calendar'
import { BackButton } from '@/components/ui/BackButton'
import { Check, Wallet, CreditCard } from 'lucide-react'

type Step = 'date' | 'slot' | 'confirm' | 'payment' | 'success'
type PaymentMethod = 'card' | 'cash'

interface Slot {
  startTime: string
  endTime: string
  pricePerSlot: number
  available: boolean
}

interface ContactInfo {
  client_name: string
  client_phone: string
  client_email: string
  notes: string
}

interface PageProps {
  params: Promise<{ slug: string; courtId: string }>
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatCardExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length < 3) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
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
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [paidNow, setPaidNow] = useState(false)
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])

  // Fetch org id once
  useEffect(() => {
    fetch(`/api/public/org-by-slug?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => setOrgId(d.orgId ?? ''))
      .catch(() => {})
  }, [slug])

  // Fetch which days have zero availability for the visible month
  useEffect(() => {
    const month = format(monthDate, 'yyyy-MM')
    fetch(`/api/public/availability?courtId=${courtId}&month=${month}`)
      .then((r) => r.json())
      .then((d) => {
        const dates = (d.unavailableDates ?? []).map((s: string) => new Date(`${s}T12:00:00`))
        setUnavailableDates(dates)
      })
      .catch(() => {})
  }, [courtId, monthDate])

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

  function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setContact({
      client_name: fd.get('client_name') as string,
      client_phone: fd.get('client_phone') as string,
      client_email: (fd.get('client_email') as string) ?? '',
      notes: (fd.get('notes') as string) ?? '',
    })
    setBookingError('')
    // Free courts (no price configured) skip the payment step entirely
    setPaymentMethod(selectedSlot && selectedSlot.pricePerSlot > 0 ? null : 'cash')
    setStep('payment')
  }

  async function submitBooking(method: PaymentMethod) {
    if (!contact || !selectedSlot) return
    setSubmitting(true)
    setBookingError('')

    const body = {
      court_id: courtId,
      org_id: orgId,
      start_time: selectedSlot.startTime,
      end_time: selectedSlot.endTime,
      client_name: contact.client_name,
      client_phone: contact.client_phone,
      client_email: contact.client_email,
      notes: contact.notes,
      payment_method: method,
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
        setPaidNow(!!data.paid)
        setStep('success')
      }
    } catch {
      setBookingError('Error de conexión. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
      setProcessingPayment(false)
    }
  }

  function handlePayAtVenue() {
    submitBooking('cash')
  }

  async function handleCardSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProcessingPayment(true)
    // Simulated payment gateway: no real charge is made, this only mimics the
    // processing delay/UX of a real checkout.
    await new Promise((resolve) => setTimeout(resolve, 1400))
    submitBooking('card')
  }

  function reset() {
    setStep('date')
    setSelectedDate(null)
    setSelectedSlot(null)
    setSlots([])
    setContact(null)
    setPaymentMethod(null)
    setCardNumber('')
    setCardName('')
    setCardExpiry('')
    setCardCvv('')
    setBookingError('')
    setBookingId('')
    setPaidNow(false)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stepIndex = step === 'date' ? 0 : step === 'slot' ? 1 : step === 'confirm' ? 2 : step === 'payment' ? 3 : 4

  return (
    <div className="book-page">
      {step !== 'success' && (
        <div className="book-steps" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`book-steps__seg ${i < stepIndex ? 'book-steps__seg--done' : i === stepIndex ? 'book-steps__seg--active' : ''}`}
            >
              <span className="book-steps__seg-fill" />
            </span>
          ))}
        </div>
      )}

      {step === 'date' && (
        <div className="book-step">
          <p className="eyebrow book-eyebrow"><span className="dot" />Paso 1 de 4 — Fecha</p>
          <h1 className="book-title">Elegí una fecha</h1>
          <div className="book-calendar book-calendar--picker">
            <Calendar
              mode="single"
              locale={es}
              selected={selectedDate ?? undefined}
              onSelect={(d) => d && handleDateSelect(d)}
              month={monthDate}
              onMonthChange={setMonthDate}
              disabled={[{ before: today }, ...unavailableDates, ...(slotsLoading ? [() => true] : [])]}
              modifiers={{ noAvailability: unavailableDates }}
              className="w-full"
            />
            <div className="book-calendar__legend">
              <span className="book-calendar__legend-item">
                <span className="book-calendar__dot book-calendar__dot--off" />
                Sin turnos disponibles
              </span>
            </div>
          </div>
          {slotsLoading && <p className="book-loading">Cargando horarios...</p>}
        </div>
      )}

      {step === 'slot' && (
        <div className="book-step">
          <BackButton onClick={() => setStep('date')} label="Cambiar fecha" className="back-btn--labeled" />
          <p className="eyebrow book-eyebrow"><span className="dot" />Paso 2 de 4 — Horario</p>
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
          <BackButton onClick={() => setStep('slot')} label="Cambiar horario" className="back-btn--labeled" />
          <p className="eyebrow book-eyebrow"><span className="dot" />Paso 3 de 4 — Tus datos</p>
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
              <div className="book-summary__row book-summary__row--total">
                <span>Total</span>
                <span>{formatPrice(selectedSlot.pricePerSlot)}</span>
              </div>
            )}
          </div>

          {bookingError && <p className="auth-error">{bookingError}</p>}

          <form onSubmit={handleContactSubmit} className="form-stack">
            <Input label="Nombre completo" name="client_name" defaultValue={contact?.client_name} required />
            <Input label="Teléfono" name="client_phone" type="tel" defaultValue={contact?.client_phone} required />
            <Input label="Email (opcional)" name="client_email" type="email" defaultValue={contact?.client_email} />
            <Textarea label="Notas (opcional)" name="notes" rows={2} defaultValue={contact?.notes} />

            <Button type="submit" variant="brand" style={{ width: '100%' }}>
              Continuar
            </Button>
          </form>
        </div>
      )}

      {step === 'payment' && selectedSlot && (
        <div className="book-step">
          <BackButton onClick={() => setStep('confirm')} label="Volver a tus datos" className="back-btn--labeled" />
          <p className="eyebrow book-eyebrow"><span className="dot" />Paso 4 de 4 — Pago</p>
          <h1 className="book-title">Elegí cómo pagar</h1>

          <div className="book-summary">
            <div className="book-summary__row">
              <span>Fecha</span>
              <span>{selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })}</span>
            </div>
            <div className="book-summary__row">
              <span>Horario</span>
              <span>{formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}</span>
            </div>
            <div className="book-summary__row book-summary__row--total">
              <span>Total</span>
              <span>{selectedSlot.pricePerSlot > 0 ? formatPrice(selectedSlot.pricePerSlot) : 'A coordinar'}</span>
            </div>
          </div>

          {bookingError && <p className="auth-error">{bookingError}</p>}

          {paymentMethod === null && (
            <div className="book-pay-options">
              <button type="button" className="book-pay-option" onClick={() => setPaymentMethod('card')}>
                <CreditCard size={20} />
                <div>
                  <span className="book-pay-option__title">Pagar ahora con tarjeta</span>
                  <span className="book-pay-option__desc">Pago simulado, confirmación inmediata</span>
                </div>
              </button>
              <button type="button" className="book-pay-option" onClick={handlePayAtVenue} disabled={submitting}>
                <Wallet size={20} />
                <div>
                  <span className="book-pay-option__title">Pagar en el local</span>
                  <span className="book-pay-option__desc">Efectivo o transferencia al llegar</span>
                </div>
              </button>
            </div>
          )}

          {paymentMethod === 'cash' && selectedSlot.pricePerSlot === 0 && (
            <Button variant="brand" style={{ width: '100%' }} loading={submitting} onClick={handlePayAtVenue}>
              Confirmar reserva
            </Button>
          )}

          {paymentMethod === 'card' && (
            <form onSubmit={handleCardSubmit} className="form-stack book-card-form">
              <p className="book-card-form__badge">
                <CreditCard size={14} /> Pasarela simulada — no se realiza ningún cobro real
              </p>
              <Input
                label="Nombre en la tarjeta"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
              <Input
                label="Número de tarjeta"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                required
              />
              <div className="field-row">
                <Input
                  label="Vencimiento"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                  placeholder="MM/AA"
                  inputMode="numeric"
                  required
                />
                <Input
                  label="CVV"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  inputMode="numeric"
                  required
                />
              </div>
              <Button type="submit" variant="brand" style={{ width: '100%' }} loading={processingPayment || submitting}>
                {processingPayment ? 'Procesando pago...' : `Pagar ${formatPrice(selectedSlot.pricePerSlot)}`}
              </Button>
              <button
                type="button"
                className="book-pay-back"
                onClick={() => setPaymentMethod(null)}
                disabled={processingPayment || submitting}
              >
                Elegir otro método
              </button>
            </form>
          )}
        </div>
      )}

      {step === 'success' && (
        <div className="book-step book-step--success">
          <span className="book-success-icon t-success-check" data-state="in" aria-hidden="true">
            <Check size={32} strokeWidth={3} />
          </span>
          <p className="eyebrow book-eyebrow"><span className="dot" />Listo</p>
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
            <div className="book-summary__row">
              <span>Pago</span>
              <span>{paidNow ? 'Pagado' : 'Pendiente — abonar en el local'}</span>
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
