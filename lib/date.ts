import {
  addMinutes,
  differenceInMinutes,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isSameDay,
  isToday,
  isPast,
  addDays,
  subDays,
  startOfDay,
} from 'date-fns'
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz'
import type { CourtSchedule, SpecialSchedule, Booking } from './supabase/types'

export interface SlotResult {
  startTime: Date
  endTime: Date
  pricePerSlot: number
  available: boolean
  bookingId?: string
}

export function generateSlots(params: {
  date: Date
  timezone: string
  schedule: CourtSchedule | null
  specialSchedule: SpecialSchedule | null
  existingBookings: Pick<Booking, 'start_time' | 'end_time' | 'id' | 'status'>[]
}): SlotResult[] {
  const { date, timezone, schedule, specialSchedule, existingBookings } = params

  let openTimeStr: string | null = null
  let closeTimeStr: string | null = null
  let slotDuration = 60
  let pricePerSlot = 0

  if (specialSchedule) {
    if (!specialSchedule.open_time) return []
    openTimeStr = specialSchedule.open_time
    closeTimeStr = specialSchedule.close_time
    pricePerSlot = Number(specialSchedule.price_per_slot ?? schedule?.price_per_slot ?? 0)
    slotDuration = schedule?.slot_duration_minutes ?? 60
  } else if (schedule) {
    openTimeStr = schedule.open_time
    closeTimeStr = schedule.close_time
    slotDuration = schedule.slot_duration_minutes
    pricePerSlot = Number(schedule.price_per_slot)
  } else {
    return []
  }

  if (!closeTimeStr) return []

  const [openH, openM] = openTimeStr.split(':').map(Number)
  const [closeH, closeM] = closeTimeStr.split(':').map(Number)

  const dayInTz = toZonedTime(date, timezone)

  const makeLocalTime = (h: number, m: number) => {
    const d = setMilliseconds(setSeconds(setMinutes(setHours(dayInTz, h), m), 0), 0)
    return fromZonedTime(d, timezone)
  }

  let current = makeLocalTime(openH, openM)
  const end = makeLocalTime(closeH, closeM)

  const slots: SlotResult[] = []

  while (current < end) {
    const slotEnd = addMinutes(current, slotDuration)
    if (slotEnd > end) break

    const conflict = existingBookings.find(
      (b) =>
        b.status !== 'cancelled' &&
        current < new Date(b.end_time) &&
        slotEnd > new Date(b.start_time)
    )

    slots.push({
      startTime: current,
      endTime: slotEnd,
      pricePerSlot,
      available: !conflict,
      bookingId: conflict?.id,
    })

    current = slotEnd
  }

  return slots
}

export function getWeekBounds(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return { start, end }
}

export function getWeekDays(date: Date): Date[] {
  const { start, end } = getWeekBounds(date)
  return eachDayOfInterval({ start, end })
}

export function toTimeString(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'HH:mm')
}

export function formatSlotTime(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'HH:mm')
}

export function minutesFromDayStart(time: Date, dayStart: Date): number {
  return differenceInMinutes(time, dayStart)
}

export function getGridRow(startTime: Date, dayStart: Date): number {
  const minutes = differenceInMinutes(startTime, dayStart)
  return Math.floor(minutes / 15) + 2
}

export function getGridSpan(startTime: Date, endTime: Date): number {
  const minutes = differenceInMinutes(endTime, startTime)
  return Math.ceil(minutes / 15)
}

export function todayInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone)
}

export function startOfDayInTimezone(date: Date, timezone: string): Date {
  const zonedDate = toZonedTime(date, timezone)
  const startLocal = startOfDay(zonedDate)
  return fromZonedTime(startLocal, timezone)
}

export { isToday, isPast, isSameDay, addDays, subDays, format }
