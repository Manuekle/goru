'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Spinner } from '@/components/ui/Spinner'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons'

interface CalendarHeaderProps {
  date: Date
  timezone: string
  loading: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarHeader({
  date,
  loading,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const label = format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })

  return (
    <div className="cal-header">
      <div className="cal-header__nav">
        <button className="btn btn-ghost btn-sm" onClick={onPrev} aria-label="Día anterior">
          <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onNext} aria-label="Día siguiente">
          <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
        </button>
        <button className="btn btn-dark btn-sm" onClick={onToday}>
          Hoy
        </button>
      </div>

      <div className="cal-header__date">
        {loading && <Spinner size="sm" />}
        <span className="cal-header__label">{label}</span>
      </div>
    </div>
  )
}
