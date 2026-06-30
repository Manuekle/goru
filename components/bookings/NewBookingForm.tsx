'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBooking } from '@/actions/bookings'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { Client } from '@/lib/supabase/types'

interface NewBookingFormProps {
  courts: { value: string; label: string }[]
  timezone: string
}

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'pending', label: 'Pendiente' },
]

type BookingFieldErrors = { _form?: string[]; court_id?: string[]; start_time?: string[]; end_time?: string[]; status?: string[]; total_price?: string[]; source?: string[]; client_id?: string[]; notes?: string[] }

export function NewBookingForm({ courts, timezone }: NewBookingFormProps) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createBooking, null)
  const [clientQuery, setClientQuery] = useState('')
  const [clientResults, setClientResults] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const supabase = createClient()
  const err = (typeof state?.error === 'object' && state.error !== null ? state.error : {}) as BookingFieldErrors

  useEffect(() => {
    if (state && !state.error) router.push('/dashboard/bookings')
  }, [state])

  useEffect(() => {
    if (clientQuery.length < 2) {
      setClientResults([])
      return
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .ilike('full_name', `%${clientQuery}%`)
        .limit(5)
      setClientResults(data ?? [])
    }, 300)
    return () => clearTimeout(t)
  }, [clientQuery])

  return (
    <form action={action} className="form-stack">
      {err._form && <p className="auth-error">{err._form[0]}</p>}

      <Select
        label="Cancha"
        name="court_id"
        options={courts}
        required
        error={err.court_id?.[0]}
      />

      <div className="field-row">
        <Input
          label="Inicio"
          name="start_time"
          type="datetime-local"
          required
          error={err.start_time?.[0]}
        />
        <Input
          label="Fin"
          name="end_time"
          type="datetime-local"
          required
          error={err.end_time?.[0]}
        />
      </div>

      <div className="field">
        <label className="field-label">Cliente</label>
        {selectedClient ? (
          <div className="client-selected">
            <input type="hidden" name="client_id" value={selectedClient.id} />
            <span>{selectedClient.full_name}</span>
            <button type="button" className="client-selected__clear" onClick={() => setSelectedClient(null)}>×</button>
          </div>
        ) : (
          <>
            <input
              type="text"
              className="field-input"
              placeholder="Buscar cliente..."
              value={clientQuery}
              onChange={(e) => setClientQuery(e.target.value)}
            />
            {clientResults.length > 0 && (
              <ul className="client-results">
                {clientResults.map((c) => (
                  <li key={c.id} className="client-result" onClick={() => { setSelectedClient(c); setClientQuery(''); setClientResults([]) }}>
                    <span>{c.full_name}</span>
                    <span className="client-result__phone">{c.phone}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <Input label="Precio total" name="total_price" type="number" min={0} defaultValue={0} />
      <Select label="Estado" name="status" defaultValue="confirmed" options={STATUS_OPTIONS} />
      <input type="hidden" name="source" value="admin" />
      <Textarea label="Notas (opcional)" name="notes" rows={3} />

      <div className="form-actions">
        <Button type="submit" variant="brand" loading={pending}>Crear reserva</Button>
      </div>
    </form>
  )
}
