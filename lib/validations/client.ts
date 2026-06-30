import { z } from 'zod'

export const ClientSchema = z.object({
  full_name: z.string().min(2, 'Nombre requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
})

export type ClientInput = z.infer<typeof ClientSchema>
