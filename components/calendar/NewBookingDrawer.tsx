'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { createBooking, updateBooking, updateBookingStatus } from '@/actions/bookings'
import { createClient_ } from '@/actions/clients'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { FormSelect } from '@/components/ui/FormSelect'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { formatTime, formatDateShort, STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/utils'
import type { Court, Client } from '@/lib/supabase/types'
import type { CalendarBooking } from './BookingCalendar'

interface NewBookingDrawerProps {
  courts: Court[]
  preselected?: { courtId: string; startTime: Date; endTime: Date } | null
  booking?: CalendarBooking | null
  timezone: string
  onClose: () => void
  onSaved: () => void
}

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))
const PAYMENT_STATUS_OPTIONS = Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))
const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label }))

export function NewBookingDrawer({
  courts,
  preselected,
  booking,
  timezone,
  onClose,
  onSaved,
}: NewBookingDrawerProps) {
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [clientQuery, setClientQuery] = useState('')
  const [clientResults, setClientResults] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (booking?.clients) {
      setSelectedClient({
        id: booking.client_id ?? '',
        full_name: booking.clients.full_name,
        phone: booking.clients.phone,
      } as Client)
    }
  }, [booking])

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
  const isEdit = !!booking

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const form = e.currentTarget
    const fd = new FormData(form)

    if (selectedClient) {
      fd.set('client_id', selectedClient.id)
    } else if (newClientName.trim() && newClientPhone.trim()) {
      const clientFd = new FormData()
      clientFd.set('full_name', newClientName.trim())
      clientFd.set('phone', newClientPhone.trim())
      const clientResult = await createClient_(clientFd)
      if (clientResult.error) {
        const err = clientResult.error as Record<string, string[]>
        setError(err._form?.[0] ?? 'Error al crear el cliente')
        return
      }
      fd.set('client_id', clientResult.client!.id)
    }
    fd.delete('client_name_new')
    fd.delete('client_phone_new')

    startTransition(async () => {
      setSaving(true)
      const result = isEdit
        ? await updateBooking(booking.id, fd)
        : await createBooking(null, fd)
      setSaving(false)
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

  const startTime = preselected?.startTime ?? (booking ? new Date(booking.start_time) : new Date())
  const endTime = preselected?.endTime ?? (booking ? new Date(booking.end_time) : new Date())

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? 'Detalle de reserva' : 'Nueva reserva'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <input type="hidden" name="start_time" value={startTime.toISOString()} />
          <input type="hidden" name="end_time" value={endTime.toISOString()} />
          <input type="hidden" name="source" value="admin" />

          <div className="flex flex-col gap-4 px-5 py-4">
            <div className="flex gap-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[.04em] text-muted-foreground">
              <span>{formatDateShort(startTime, timezone)}</span>
              <span>{formatTime(startTime, timezone)} – {formatTime(endTime, timezone)}</span>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <FormSelect
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
                  <Input
                    type="text"
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
              defaultValue={booking?.total_price ?? 0}
            />

            <FormSelect
              label="Estado"
              name="status"
              defaultValue={booking?.status ?? 'confirmed'}
              options={STATUS_OPTIONS}
            />

            <div className="field-row">
              <FormSelect
                label="Pago"
                name="payment_status"
                defaultValue={booking?.payment_status ?? 'pending'}
                options={PAYMENT_STATUS_OPTIONS}
              />
              <FormSelect
                label="Medio de pago"
                name="payment_method"
                defaultValue={booking?.payment_method ?? 'cash'}
                options={PAYMENT_METHOD_OPTIONS}
              />
            </div>

            <Textarea
              label="Notas (opcional)"
              name="notes"
              defaultValue={booking?.notes ?? ''}
              rows={2}
            />
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button type="submit" variant="brand" loading={saving} disabled={isPending}>
              {isEdit ? 'Guardar cambios' : 'Crear reserva'}
            </Button>
            {isEdit && (
              <>
                <Button
                  type="button"
                  variant="danger"
                  loading={isPending}
                  disabled={saving}
                  onClick={handleCancel}
                >
                  Cancelar reserva
                </Button>
                <Link href={`/t/${booking.id}`} target="_blank" className="btn btn-ghost btn-sm ml-auto">
                  Ver ticket ↗
                </Link>
              </>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
