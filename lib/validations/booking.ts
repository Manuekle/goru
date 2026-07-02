import { z } from 'zod'

export const BookingSchema = z.object({
  court_id: z.string().uuid('Cancha requerida'),
  client_id: z.string().uuid().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'no_show']).default('confirmed'),
  notes: z.string().optional(),
  total_price: z.coerce.number().min(0).default(0),
  source: z.enum(['admin', 'widget', 'phone']).default('admin'),
  payment_status: z.enum(['pending', 'paid', 'refunded']).default('pending'),
  payment_method: z.enum(['cash', 'card', 'transfer']).optional(),
})

export const PublicBookingSchema = z.object({
  court_id: z.string().uuid(),
  org_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  client_name: z.string().min(2, 'Nombre requerido'),
  client_phone: z.string().min(6, 'Teléfono requerido'),
  client_email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  payment_method: z.enum(['cash', 'card', 'transfer']).default('cash'),
})

export type BookingInput = z.infer<typeof BookingSchema>
export type PublicBookingInput = z.infer<typeof PublicBookingSchema>
