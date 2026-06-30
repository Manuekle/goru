import { z } from 'zod'

export const OrgSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  slug: z
    .string()
    .min(4, 'Mínimo 4 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Solo letras minúsculas, números y guiones'),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().default('America/Argentina/Buenos_Aires'),
})

export const OrgSettingsSchema = OrgSchema.extend({
  logo_url: z.string().url().optional().or(z.literal('')),
})

export type OrgInput = z.infer<typeof OrgSchema>
export type OrgSettingsInput = z.infer<typeof OrgSettingsSchema>
