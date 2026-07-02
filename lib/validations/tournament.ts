import { z } from 'zod'

export const TournamentSchema = z.object({
  name: z.string().min(3, 'Nombre requerido (mín. 3 caracteres)'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Fecha de inicio requerida'),
  end_date: z.string().min(1, 'Fecha de fin requerida'),
  registration_open: z.coerce.boolean().default(false),
  registration_deadline: z.string().optional(),
  max_teams: z.coerce.number().int().min(2).max(64).default(16),
  price_per_team: z.coerce.number().min(0).default(0),
  status: z.enum(['draft', 'open', 'active', 'finished']).default('draft'),
  rules: z.string().optional(),
})

export const TournamentTeamSchema = z.object({
  tournament_id: z.string().uuid(),
  team_name: z.string().min(2, 'Nombre del equipo requerido'),
  captain_name: z.string().min(2, 'Nombre del capitán requerido'),
  captain_phone: z.string().min(6, 'Teléfono requerido'),
  captain_email: z.string().email().optional().or(z.literal('')),
})

export const TournamentMatchSchema = z.object({
  tournament_id: z.string().uuid(),
  round: z.coerce.number().int().min(1).default(1),
  match_number: z.coerce.number().int().min(1).default(1),
  team_a_id: z.string().uuid().optional().nullable(),
  team_b_id: z.string().uuid().optional().nullable(),
  court_id: z.string().uuid().optional().nullable(),
  scheduled_at: z.string().datetime().optional().nullable(),
  score_a: z.coerce.number().int().min(0).optional().nullable(),
  score_b: z.coerce.number().int().min(0).optional().nullable(),
  status: z.enum(['scheduled', 'playing', 'finished', 'cancelled']).default('scheduled'),
})

export type TournamentInput = z.infer<typeof TournamentSchema>
export type TournamentTeamInput = z.infer<typeof TournamentTeamSchema>
export type TournamentMatchInput = z.infer<typeof TournamentMatchSchema>
