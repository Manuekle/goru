'use client'

import { useMemo, useState, useTransition } from 'react'
import { upsertSchedule, deleteSchedule } from '@/actions/courts'
import { useToast } from '@/components/ui/toast'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TimePicker } from '@/components/ui/time-picker'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/shadcn-select'
import { DAY_NAMES_FULL, formatPrice } from '@/lib/utils'
import type { CourtSchedule } from '@/lib/supabase/types'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon, ChevronDownIcon } from '@hugeicons/core-free-icons'

const SLOT_DURATIONS = [
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2 horas' },
]

const ORDER = [1, 2, 3, 4, 5, 6, 0]

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

function buildInitial(schedules: CourtSchedule[]): Record<number, DayState> {
  const norm = (t: string) => t.slice(0, 5) // strip seconds: "08:00:00" → "08:00"
  const initial: Record<number, DayState> = {}
  for (let d = 0; d < 7; d++) {
    const s = schedules.find((s) => s.day_of_week === d)
    initial[d] = s
      ? {
          enabled: true,
          open_time: norm(s.open_time),
          close_time: norm(s.close_time),
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
  return initial
}

function sameDay(a: DayState, b: DayState) {
  return (
    a.enabled === b.enabled &&
    a.open_time === b.open_time &&
    a.close_time === b.close_time &&
    a.slot_duration_minutes === b.slot_duration_minutes &&
    a.price_per_slot === b.price_per_slot
  )
}

export function ScheduleEditor({ courtId, schedules }: ScheduleEditorProps) {
  const toast = useToast()
  const [isPending, startTransition] = useTransition()
  const [baseline, setBaseline] = useState(() => buildInitial(schedules))
  const [days, setDays] = useState(baseline)
  const [openDay, setOpenDay] = useState<number | null>(null)

  const dirtyDays = useMemo(
    () => ORDER.filter((d) => !sameDay(days[d], baseline[d])),
    [days, baseline]
  )

  function update(day: number, patch: Partial<DayState>) {
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
  }

  function copyToAll(day: number) {
    const source = days[day]
    setDays((prev) => {
      const next = { ...prev }
      for (const d of ORDER) {
        if (d === day) continue
        next[d] = { ...source }
      }
      return next
    })
  }

  function discard() {
    setDays(baseline)
  }

  function saveAll() {
    startTransition(async () => {
      const results = await Promise.all(
        dirtyDays.map(async (day) => {
          const d = days[day]
          if (!d.enabled) {
            await deleteSchedule(courtId, day)
            return { day, error: null }
          }
          const fd = new FormData()
          fd.set('day_of_week', String(day))
          fd.set('open_time', d.open_time)
          fd.set('close_time', d.close_time)
          fd.set('slot_duration_minutes', String(d.slot_duration_minutes))
          fd.set('price_per_slot', String(d.price_per_slot))
          const result = await upsertSchedule(courtId, fd)
          return { day, error: result?.error ?? null }
        })
      )

      const failed = results.find((r) => r.error)
      if (failed) {
        const err = failed.error as Record<string, string[]> | string
        if (typeof err === 'string') {
          toast.error(err)
        } else if (err._form) {
          toast.error(err._form[0])
        } else {
          const first = Object.entries(err)[0]
          toast.error(first ? `${first[1][0]}` : 'Error al guardar los horarios')
        }
        return
      }
      setBaseline(days)
      toast.success('Horarios guardados')
    })
  }

  return (
    <div className="schedule-editor">
      <div className="schedule-editor__head">
        <h2 className="schedule-editor__title">Horarios por día</h2>
        <p className="schedule-editor__hint">Definí apertura, cierre y precio para cada día. Usá &ldquo;Copiar a todos&rdquo; para aplicar el mismo horario a toda la semana.</p>
      </div>

      <div className="schedule-list">
        {ORDER.map((day) => {
          const d = days[day]
          const expanded = openDay === day
          const isDirty = !sameDay(d, baseline[day])

          return (
            <div key={day} className={`schedule-row ${d.enabled ? 'schedule-row--active' : ''} ${expanded ? 'schedule-row--open' : ''}`}>
              <button
                type="button"
                className="schedule-row__summary"
                onClick={() => setOpenDay(expanded ? null : day)}
              >
                <span className="schedule-row__toggle" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={d.enabled}
                    onCheckedChange={(checked) => update(day, { enabled: checked === true })}
                  />
                </span>
                <span className="schedule-row__day">{DAY_NAMES_FULL[day]}</span>

                {d.enabled ? (
                  <span className="schedule-row__preview">
                    {d.open_time}–{d.close_time}
                    <span className="schedule-row__dot" />
                    {SLOT_DURATIONS.find((s) => Number(s.value) === d.slot_duration_minutes)?.label}
                    <span className="schedule-row__dot" />
                    {formatPrice(d.price_per_slot)}
                  </span>
                ) : (
                  <span className="schedule-row__preview schedule-row__preview--off">Cerrado</span>
                )}

                {isDirty && <span className="schedule-row__dirty" aria-label="Cambios sin guardar" />}

                <HugeiconsIcon icon={ChevronDownIcon} size={16} className="schedule-row__chevron" />
              </button>

              {expanded && d.enabled && (
                <div className="schedule-row__fields">
                  <div className="schedule-row__time-group">
                    <label className="field-label">Apertura</label>
                    <TimePicker
                      value={d.open_time}
                      onChange={(val) => update(day, { open_time: val })}
                      triggerClassName="schedule-control schedule-time justify-between rounded-[var(--r-sm)]"
                    />
                  </div>
                  <div className="schedule-row__time-group">
                    <label className="field-label">Cierre</label>
                    <TimePicker
                      value={d.close_time}
                      onChange={(val) => update(day, { close_time: val })}
                      triggerClassName="schedule-control schedule-time justify-between rounded-[var(--r-sm)]"
                    />
                  </div>
                  <div className="schedule-row__time-group">
                    <label className="field-label">Turno</label>
                    <Select
                      items={SLOT_DURATIONS}
                      value={String(d.slot_duration_minutes)}
                      onValueChange={(val) => update(day, { slot_duration_minutes: Number(val) })}
                    >
                      <SelectTrigger className="schedule-control schedule-duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SLOT_DURATIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="schedule-row__time-group">
                    <label className="field-label">Precio/turno</label>
                    <Input
                      type="number"
                      min={0}
                      value={d.price_per_slot}
                      onChange={(e) => update(day, { price_per_slot: Number(e.target.value) })}
                      className="schedule-control schedule-price"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="schedule-row__copy"
                    onClick={() => copyToAll(day)}
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={14} />
                    Copiar a todos
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {dirtyDays.length > 0 && (
        <div className="schedule-editor__bar">
          <p className="schedule-editor__bar-text">
            {dirtyDays.length} {dirtyDays.length === 1 ? 'día con cambios sin guardar' : 'días con cambios sin guardar'}
          </p>
          <div className="schedule-editor__bar-actions">
            <Button type="button" variant="ghost" size="sm" onClick={discard} disabled={isPending}>
              Descartar
            </Button>
            <Button type="button" variant="brand" size="sm" onClick={saveAll} loading={isPending} disabled={isPending}>
              Guardar cambios
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
