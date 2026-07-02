'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CourtForm } from '@/components/courts/CourtForm'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export function NewCourtTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="brand" size="sm" onClick={() => setOpen(true)}>+ Nueva cancha</Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Nueva cancha</SheetTitle>
          </SheetHeader>
          <div className="px-5 py-4">
            <CourtForm />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
