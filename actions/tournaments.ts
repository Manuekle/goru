'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TournamentSchema, TournamentTeamSchema, TournamentMatchSchema } from '@/lib/validations/tournament'
import type { Tournament, TournamentTeam, TournamentMatch } from '@/lib/supabase/types'

async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')
  return { supabase, profile }
}

// ─── Tournaments CRUD ───

export async function createTournament(_state: unknown, formData: FormData) {
  const { supabase, profile } = await getProfile()

  const raw = Object.fromEntries(formData)
  const parsed = TournamentSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabase
    .from('tournaments')
    .insert({ ...parsed.data, org_id: profile.org_id! })

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/dashboard/tournaments')
  return { success: true }
}

export async function updateTournament(tournamentId: string, formData: FormData) {
  const { supabase, profile } = await getProfile()

  const raw = Object.fromEntries(formData)
  const parsed = TournamentSchema.partial().safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabase
    .from('tournaments')
    .update(parsed.data)
    .eq('id', tournamentId)
    .eq('org_id', profile.org_id!)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`)
  revalidatePath('/dashboard/tournaments')
  return { success: true }
}

export async function deleteTournament(tournamentId: string) {
  const { supabase, profile } = await getProfile()

  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', tournamentId)
    .eq('org_id', profile.org_id!)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/tournaments')
  return { success: true }
}

// ─── Teams ───

export async function registerTeam(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = TournamentTeamSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  // Use admin client because public widget registers teams without auth
  const supabase = createAdminClient()

  // Check registration is open
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('status, max_teams')
    .eq('id', parsed.data.tournament_id)
    .single()

  if (!tournament) return { error: { _form: ['Torneo no encontrado'] } }
  if (tournament.status !== 'open') return { error: { _form: ['Las inscripciones no están abiertas'] } }

  // Check team limit
  const { count } = await supabase
    .from('tournament_teams')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', parsed.data.tournament_id)

  if (count && count >= tournament.max_teams) {
    return { error: { _form: ['El torneo ya alcanzó el límite de equipos'] } }
  }

  const { error } = await supabase
    .from('tournament_teams')
    .insert(parsed.data)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath(`/dashboard/tournaments/${parsed.data.tournament_id}`)
  return { success: true }
}

export async function updateTeamPayment(teamId: string, paymentStatus: 'pending' | 'paid') {
  const { supabase, profile } = await getProfile()

  const { error } = await supabase
    .from('tournament_teams')
    .update({ payment_status: paymentStatus })
    .eq('id', teamId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/tournaments')
  return { success: true }
}

export async function removeTeam(teamId: string) {
  const { supabase, profile } = await getProfile()

  const { error } = await supabase
    .from('tournament_teams')
    .delete()
    .eq('id', teamId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/tournaments')
  return { success: true }
}

// ─── Matches ───

export async function createMatch(formData: FormData) {
  const { supabase, profile } = await getProfile()

  const raw = Object.fromEntries(formData)
  const parsed = TournamentMatchSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabase
    .from('tournament_matches')
    .insert(parsed.data)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath(`/dashboard/tournaments/${parsed.data.tournament_id}`)
  return { success: true }
}

export async function updateMatch(matchId: string, formData: FormData) {
  const { supabase, profile } = await getProfile()

  const raw = Object.fromEntries(formData)
  const parsed = TournamentMatchSchema.partial().safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabase
    .from('tournament_matches')
    .update(parsed.data)
    .eq('id', matchId)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/dashboard/tournaments')
  return { success: true }
}

export async function deleteMatch(matchId: string) {
  const { supabase, profile } = await getProfile()

  const { error } = await supabase
    .from('tournament_matches')
    .delete()
    .eq('id', matchId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/tournaments')
  return { success: true }
}

// ─── Queries (used by pages) ───

export async function getTournaments() {
  const { supabase, profile } = await getProfile()

  const { data } = await supabase
    .from('tournaments')
    .select('*')
    .eq('org_id', profile.org_id!)
    .order('created_at', { ascending: false })

  return data as Tournament[] | null
}

export async function getTournament(tournamentId: string) {
  const { supabase, profile } = await getProfile()

  const { data } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .eq('org_id', profile.org_id!)
    .single()

  return data as Tournament | null
}

export async function getTournamentWithDetails(tournamentId: string) {
  const { supabase, profile } = await getProfile()

  const [{ data: tournament }, { data: teams }, { data: matches }] = await Promise.all([
    supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .eq('org_id', profile.org_id!)
      .single(),

    supabase
      .from('tournament_teams')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('registered_at'),

    supabase
      .from('tournament_matches')
      .select('*, team_a:team_a_id(*), team_b:team_b_id(*), courts(name)')
      .eq('tournament_id', tournamentId)
      .order('round')
      .order('match_number'),
  ])

  return {
    tournament: tournament as Tournament | null,
    teams: (teams ?? []) as TournamentTeam[],
    matches: (matches ?? []) as unknown as (TournamentMatch & {
      team_a: TournamentTeam | null
      team_b: TournamentTeam | null
      courts: { name: string } | null
    })[],
  }
}

// ─── Public tournament queries ───

export async function getPublicTournaments(slug: string) {
  const supabase = createAdminClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!org) return []

  const { data } = await supabase
    .from('tournaments')
    .select('*')
    .eq('org_id', org.id)
    .neq('status', 'draft')
    .order('start_date')

  return data as Tournament[] | null
}

export async function getPublicTournamentWithTeams(tournamentId: string) {
  const supabase = createAdminClient()

  const [{ data: tournament }, { data: teams }] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', tournamentId).single(),
    supabase.from('tournament_teams').select('*').eq('tournament_id', tournamentId).order('registered_at'),
  ])

  return {
    tournament: tournament as Tournament | null,
    teams: (teams ?? []) as TournamentTeam[],
  }
}
