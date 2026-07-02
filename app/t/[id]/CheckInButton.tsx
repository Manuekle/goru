'use client'

import { useState, useTransition } from 'react'
import { checkInBooking } from '@/actions/tickets'
import { Button } from '@/components/ui/Button'

interface Props {
  bookingId: string
  isCheckedIn: boolean
}

export function CheckInButton({ bookingId, isCheckedIn }: Props) {
  const [isPending, startTransition] = useTransition()
  const [confirmed, setConfirmed] = useState(isCheckedIn)
  const [error, setError] = useState('')

  function handleCheckIn() {
    setError('')
    startTransition(async () => {
      const result = await checkInBooking(bookingId)
      if (result.error) {
        setError(result.error)
        return
      }
      setConfirmed(true)
    })
  }

  if (confirmed) {
    return (
      <div className="ticket-checkin-done">
        <span className="ticket-checkin-check">✓</span>
        <span>Check-in registrado</span>
      </div>
    )
  }

  return (
    <div className="ticket-checkin-wrap">
      <Button
        variant="brand"
        size="sm"
        loading={isPending}
        disabled={isPending}
        onClick={handleCheckIn}
      >
        Registrar check-in
      </Button>
      {error && <p className="field-error ticket-checkin-error">{error}</p>}
    </div>
  )
}
