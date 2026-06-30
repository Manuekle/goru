'use client'

import { useState, useTransition } from 'react'
import { upsertSchedule, deleteSchedule } from '@/actions/courts'
import { DAY_NAMES_FULL } from '@/lib/utils'
import type { CourtSchedule } from '@/lib/supabase/types'

const SLOT_DURATIONS = [
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2 horas' },
]

interface ScheduleEditorProps {
  courtId: string
  schedules: CourtSchedule[]
}

interface DayState {
  enabled: boolean
  open_time: string
  close_time: string
  slot_duration_minutes: number
  price_per_slot: number
}

export function ScheduleEditor({ courtId, schedules }: ScheduleEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<number, string>>({})

  const initial: Record<number, DayState> = {}
  for (let d = 0; d < 7; d++) {
    const s = schedules.find((s) => s.day_of_week === d)
    initial[d] = s
      ? {
          enabled: true,
          open_time: s.open_time,
          close_time: s.close_time,
          slot_duration_minutes: s.slot_duration_minutes,
          price_per_slot: Number(s.price_per_slot),
        }
      : {
          enabled: false,
          open_time: '08:00',
          close_time: '22:00',
          slot_duration_minutes: 60,
          price_per_slot: 0,
        }
  }

  const [days, setDays] = useState(initial)

  function update(day: number, patch: Partial<DayState>) {
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
  }

  function saveDay(day: number) {
    const d = days[day]
    setSaving(day)
    setErrors((prev) => ({ ...prev, [day]: '' }))

    startTransition(async () => {
      if (!d.enabled) {
        await deleteSchedule(courtId, day)
      } else {
        const fd = new FormData()
        fd.set('day_of_week', String(day))
        fd.set('open_time', d.open_time)
        fd.set('close_time', d.close_time)
        fd.set('slot_duration_minutes', String(d.slot_duration_minutes))
        fd.set('price_per_slot', String(d.price_per_slot))
        const result = await upsertSchedule(courtId, fd)
        if (result?.error) {
          setErrors((prev) => ({
            ...prev,
            [day]: (result.error as Record<string, string[]>)._form?.[0] ?? 'Error al guardar',
          }))
        }
      }
      setSaving(null)
    })
  }

  return (
    <div className="schedule-editor">
      <h2 className="schedule-editor__title">Horarios por día</h2>
      {[1, 2, 3, 4, 5, 6, 0].map((day) => {
        const d = days[day]
        return (
          <div key={day} className={`schedule-row ${d.enabled ? 'schedule-row--active' : ''}`}>
            <label className="schedule-row__toggle">
              <input
                type="checkbox"
                checked={d.enabled}
                onChange={(e) => update(day, { enabled: e.target.checked })}
              />
              <span className="schedule-row__day">{DAY_NAMES_FULL[day]}</span>
            </label>

            {d.enabled && (
              <div className="schedule-row__fields">
                <div className="schedule-row__time-group">
                  <label className="field-label">Apertura</label>
                  <input
                    type="time"
                    value={d.open_time}
                    onChange={(e) => update(day, { open_time: e.target.value })}
                    className="field-input schedule-time"
                  />
                </div>
                <div className="schedule-row__time-group">
                  <label className="field-label">Cierre</label>
                  <input
                    type="time"
                    value={d.close_time}
                    onChange={(e) => update(day, { close_time: e.target.value })}
                    className="field-input schedule-time"
                  />
                </div>
                <div className="schedule-row__time-group">
                  <label className="field-label">Turno</label>
                  <select
                    value={d.slot_duration_minutes}
                    onChange={(e) => update(day, { slot_duration_minutes: Number(e.target.value) })}
                    className="field-select"
                  >
                    {SLOT_DURATIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="schedule-row__time-group">
                  <label className="field-label">Precio/turno</label>
                  <input
                    type="number"
                    min={0}
                    value={d.price_per_slot}
                    onChange={(e) => update(day, { price_per_slot: Number(e.target.value) })}
                    className="field-input schedule-price"
                  />
                </div>
              </div>
            )}

            {errors[day] && <p className="field-error">{errors[day]}</p>}

            <button
              className="schedule-row__save btn btn-ghost btn-sm"
              onClick={() => saveDay(day)}
              disabled={isPending && saving === day}
            >
              {isPending && saving === day ? '...' : 'Guardar'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
