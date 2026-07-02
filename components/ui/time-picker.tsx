"use client"

import * as React from "react"
import { ClockIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn-button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

function pad(n: number) {
  return String(n).padStart(2, "0")
}

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  id?: string
  className?: string
  triggerClassName?: string
}

export function TimePicker({
  value,
  onChange,
  id,
  className,
  triggerClassName,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [hour, minute] = value.split(":").map((v) => Number(v) || 0)

  function setHour(h: number) {
    onChange(`${pad(h)}:${pad(minute)}`)
  }

  function setMinute(m: number) {
    onChange(`${pad(hour)}:${pad(m)}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn("w-28 justify-between font-normal", triggerClassName)}
          >
            {pad(hour)}:{pad(minute)}
            <ClockIcon className="text-[var(--muted-text)]" />
          </Button>
        }
      />
      <PopoverContent className={cn("flex w-auto gap-0 p-0", className)} align="start">
        <div className="scrollbar-none max-h-56 overflow-y-auto border-r border-[var(--line)] py-1">
          {HOURS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHour(h)}
              className={cn(
                "block w-14 px-3 py-1.5 text-left text-sm transition-colors hover:bg-[var(--muted)]",
                h === hour && "bg-[var(--brand)] text-white hover:bg-[var(--brand)]"
              )}
            >
              {pad(h)}
            </button>
          ))}
        </div>
        <div className="scrollbar-none max-h-56 overflow-y-auto py-1">
          {MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinute(m)}
              className={cn(
                "block w-14 px-3 py-1.5 text-left text-sm transition-colors hover:bg-[var(--muted)]",
                m === minute && "bg-[var(--brand)] text-white hover:bg-[var(--brand)]"
              )}
            >
              {pad(m)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
