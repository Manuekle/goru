'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { NewBookingDrawer } from '@/components/calendar/NewBookingDrawer'
import type { Court } from '@/lib/supabase/types'

interface NewBookingTriggerProps {
  courts: Court[]
  timezone: string
}

export function NewBookingTrigger({ courts, timezone }: NewBookingTriggerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="brand" size="sm" onClick={() => setOpen(true)}>Nueva reserva</Button>
      {open && (
        <NewBookingDrawer
          courts={courts}
          timezone={timezone}
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); router.refresh() }}
        />
      )}
    </>
  )
}
