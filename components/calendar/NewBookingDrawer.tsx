'use client'

import { useState, useTransition, useEffect } from 'react'
import { createBooking, updateBookingStatus } from '@/actions/bookings'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { formatTime, formatDateShort, STATUS_LABELS } from '@/lib/utils'
import type { Court, Client } from '@/lib/supabase/types'
import type { CalendarBooking } from './BookingCalendar'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'

interface NewBookingDrawerProps {
  courts: Court[]
  preselected?: { courtId: string; startTime: Date; endTime: Date } | null
  booking?: CalendarBooking | null
  timezone: string
  onClose: () => void
  onSaved: () => void
}

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))

export function NewBookingDrawer({
  courts,
  preselected,
  booking,
  timezone,
  onClose,
  onSaved,
}: NewBookingDrawerProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [clientQuery, setClientQuery] = useState('')
  const [clientResults, setClientResults] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (clientQuery.length < 2) {
      setClientResults([])
      return
    }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .ilike('full_name', `%${clientQuery}%`)
        .limit(5)
      setClientResults(data ?? [])
    }, 300)
    return () => clearTimeout(timeout)
  }, [clientQuery])

  const courtOptions = courts
    .filter((c) => c.active)
    .map((c) => ({ value: c.id, label: c.name }))

  const defaultCourt = preselected?.courtId ?? booking?.court_id ?? courts.find((c) => c.active)?.id ?? ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const form = e.currentTarget
    const fd = new FormData(form)

    if (selectedClient) {
      fd.set('client_id', selectedClient.id)
    }

    startTransition(async () => {
      const result = await createBooking(null, fd)
      if (result?.error) {
        const err = result.error as Record<string, string[]>
        setError(err._form?.[0] ?? 'Error al guardar')
        return
      }
      onSaved()
    })
  }

  async function handleCancel() {
    if (!booking) return
    startTransition(async () => {
      await updateBookingStatus(booking.id, 'cancelled')
      onSaved()
    })
  }

  const isEdit = !!booking
  const startTime = preselected?.startTime ?? (booking ? new Date(booking.start_time) : new Date())
  const endTime = preselected?.endTime ?? (booking ? new Date(booking.end_time) : new Date())

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer__header">
          <h2 className="drawer__title">
            {isEdit ? 'Detalle de reserva' : 'Nueva reserva'}
          </h2>
          <button className="drawer__close" onClick={onClose} aria-label="Cerrar">
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        <div className="drawer__meta">
          <span>{formatDateShort(startTime, timezone)}</span>
          <span>{formatTime(startTime, timezone)} – {formatTime(endTime, timezone)}</span>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="drawer__form">
          <input type="hidden" name="start_time" value={startTime.toISOString()} />
          <input type="hidden" name="end_time" value={endTime.toISOString()} />
          <input type="hidden" name="source" value="admin" />

          <Select
            label="Cancha"
            name="court_id"
            defaultValue={defaultCourt}
            options={courtOptions}
          />

          <div className="field">
            <label className="field-label">Cliente</label>
            {selectedClient ? (
              <div className="client-selected">
                <span>{selectedClient.full_name}</span>
                <button
                  type="button"
                  className="client-selected__clear"
                  onClick={() => setSelectedClient(null)}
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Buscar por nombre..."
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                />
                {clientResults.length > 0 && (
                  <ul className="client-results">
                    {clientResults.map((c) => (
                      <li
                        key={c.id}
                        className="client-result"
                        onClick={() => {
                          setSelectedClient(c)
                          setClientQuery('')
                          setClientResults([])
                        }}
                      >
                        <span>{c.full_name}</span>
                        <span className="client-result__phone">{c.phone}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="field-hint">O ingresá nuevo cliente:</p>
                <Input
                  name="client_name_new"
                  placeholder="Nombre"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                />
                <Input
                  name="client_phone_new"
                  placeholder="Teléfono"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                />
              </>
            )}
          </div>

          <Input
            label="Precio total"
            name="total_price"
            type="number"
            min={0}
            defaultValue={0}
          />

          <Select
            label="Estado"
            name="status"
            defaultValue={booking?.status ?? 'confirmed'}
            options={STATUS_OPTIONS}
          />

          <Textarea
            label="Notas (opcional)"
            name="notes"
            defaultValue={booking?.notes ?? ''}
            rows={2}
          />

          <div className="drawer__actions">
            <Button type="submit" variant="brand" loading={isPending}>
              {isEdit ? 'Guardar cambios' : 'Crear reserva'}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="danger"
                loading={isPending}
                onClick={handleCancel}
              >
                Cancelar reserva
              </Button>
            )}
          </div>
        </form>
      </aside>
    </>
  )
}
