'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBooking } from '@/actions/bookings'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Input } from '@/components/ui/Input'
import { FormSelect } from '@/components/ui/FormSelect'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Clock2Icon, CalendarIcon } from 'lucide-react'
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
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('11:00')
  const supabase = createClient()
  const err = (typeof state?.error === 'object' && state.error !== null ? state.error : {}) as BookingFieldErrors

  function combine(d: Date | undefined, time: string) {
    if (!d) return ''
    const [h, m] = time.split(':').map(Number)
    const combined = new Date(d)
    combined.setHours(h, m, 0, 0)
    return combined.toISOString()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

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

      <FormSelect
        label="Cancha"
        name="court_id"
        options={courts}
        required
        error={err.court_id?.[0]}
      />

      <input type="hidden" name="start_time" value={combine(date, startTime)} />
      <input type="hidden" name="end_time" value={combine(date, endTime)} />

      <div className="field">
        <label className="field-label">Fecha</label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger className="field-input flex items-center gap-2 text-left cursor-pointer">
            <CalendarIcon className="size-4 shrink-0 text-[var(--muted-text)]" />
            {date ? format(date, "EEEE d 'de' MMMM yyyy", { locale: es }) : 'Elegir fecha'}
          </PopoverTrigger>
          <PopoverContent align="start">
            <Calendar
              mode="single"
              locale={es}
              selected={date}
              onSelect={(d) => { setDate(d); setCalendarOpen(false) }}
              disabled={{ before: today }}
            />
          </PopoverContent>
        </Popover>
        {err.start_time && <p className="field-error">{err.start_time[0]}</p>}
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label">Hora de inicio</label>
          <InputGroup>
            <InputGroupInput
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            <InputGroupAddon>
              <Clock2Icon className="text-[var(--muted-text)]" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="field">
          <label className="field-label">Hora de fin</label>
          <InputGroup>
            <InputGroupInput
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            <InputGroupAddon>
              <Clock2Icon className="text-[var(--muted-text)]" />
            </InputGroupAddon>
          </InputGroup>
        </div>
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
            <Input
              type="text"
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
      <FormSelect label="Estado" name="status" defaultValue="confirmed" options={STATUS_OPTIONS} />
      <input type="hidden" name="source" value="admin" />
      <Textarea label="Notas (opcional)" name="notes" rows={3} />

      <div className="form-actions">
        <Button type="submit" variant="brand" loading={pending}>Crear reserva</Button>
      </div>
    </form>
  )
}
