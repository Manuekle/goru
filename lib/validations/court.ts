import { z } from 'zod'

export const CourtSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  surface: z.enum(['synthetic', 'natural', 'indoor', 'clay']).default('synthetic'),
  capacity: z.coerce.number().int().min(2).max(100).default(10),
  description: z.string().optional(),
  active: z.coerce.boolean().default(true),
})

export const CourtScheduleSchema = z.object({
  day_of_week: z.coerce.number().int().min(0).max(6),
  open_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  close_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  slot_duration_minutes: z.coerce
    .number()
    .refine((v) => [30, 60, 90, 120].includes(v), 'Duración inválida')
    .default(60),
  price_per_slot: z.coerce.number().min(0).default(0),
})

export const ScheduleEditorSchema = z.object({
  schedules: z.array(
    CourtScheduleSchema.extend({
      enabled: z.boolean().default(false),
    })
  ),
})

export type CourtInput = z.infer<typeof CourtSchema>
export type CourtScheduleInput = z.infer<typeof CourtScheduleSchema>
