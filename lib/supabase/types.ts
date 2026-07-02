export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          phone: string | null
          address: string | null
          timezone: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          phone?: string | null
          address?: string | null
          timezone?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          phone?: string | null
          address?: string | null
          timezone?: string
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          org_id: string | null
          role: 'owner' | 'admin' | 'receptionist' | 'cashier'
          full_name: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          org_id?: string | null
          role?: 'owner' | 'admin' | 'receptionist' | 'cashier'
          full_name: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          role?: 'owner' | 'admin' | 'receptionist' | 'cashier'
          full_name?: string
          phone?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'profiles_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      courts: {
        Row: {
          id: string
          org_id: string
          name: string
          surface: 'synthetic' | 'natural' | 'indoor' | 'clay'
          capacity: number
          description: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          surface?: 'synthetic' | 'natural' | 'indoor' | 'clay'
          capacity?: number
          description?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          surface?: 'synthetic' | 'natural' | 'indoor' | 'clay'
          capacity?: number
          description?: string | null
          active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'courts_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      court_schedules: {
        Row: {
          id: string
          court_id: string
          day_of_week: number
          open_time: string
          close_time: string
          slot_duration_minutes: number
          price_per_slot: number
        }
        Insert: {
          id?: string
          court_id: string
          day_of_week: number
          open_time: string
          close_time: string
          slot_duration_minutes?: number
          price_per_slot?: number
        }
        Update: {
          id?: string
          court_id?: string
          day_of_week?: number
          open_time?: string
          close_time?: string
          slot_duration_minutes?: number
          price_per_slot?: number
        }
        Relationships: [
          {
            foreignKeyName: 'court_schedules_court_id_fkey'
            columns: ['court_id']
            isOneToOne: false
            referencedRelation: 'courts'
            referencedColumns: ['id']
          }
        ]
      }
      special_schedules: {
        Row: {
          id: string
          court_id: string
          date: string
          open_time: string | null
          close_time: string | null
          price_per_slot: number | null
          reason: 'maintenance' | 'holiday' | 'event' | 'closed'
          notes: string | null
        }
        Insert: {
          id?: string
          court_id: string
          date: string
          open_time?: string | null
          close_time?: string | null
          price_per_slot?: number | null
          reason: 'maintenance' | 'holiday' | 'event' | 'closed'
          notes?: string | null
        }
        Update: {
          id?: string
          court_id?: string
          date?: string
          open_time?: string | null
          close_time?: string | null
          price_per_slot?: number | null
          reason?: 'maintenance' | 'holiday' | 'event' | 'closed'
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'special_schedules_court_id_fkey'
            columns: ['court_id']
            isOneToOne: false
            referencedRelation: 'courts'
            referencedColumns: ['id']
          }
        ]
      }
      clients: {
        Row: {
          id: string
          org_id: string
          full_name: string
          phone: string | null
          email: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          full_name: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'clients_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          org_id: string
          court_id: string
          client_id: string | null
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'no_show'
          notes: string | null
          total_price: number
          source: 'admin' | 'widget' | 'phone'
          payment_status: 'pending' | 'paid' | 'refunded'
          payment_method: 'cash' | 'card' | 'transfer' | null
          paid_at: string | null
          checked_in_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          court_id: string
          client_id?: string | null
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'no_show'
          notes?: string | null
          total_price?: number
          source?: 'admin' | 'widget' | 'phone'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_method?: 'cash' | 'card' | 'transfer' | null
          paid_at?: string | null
          checked_in_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          court_id?: string
          client_id?: string | null
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'no_show'
          notes?: string | null
          total_price?: number
          source?: 'admin' | 'widget' | 'phone'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_method?: 'cash' | 'card' | 'transfer' | null
          paid_at?: string | null
          checked_in_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_court_id_fkey'
            columns: ['court_id']
            isOneToOne: false
            referencedRelation: 'courts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          }
        ]
      }
      invitations: {
        Row: {
          id: string
          org_id: string
          email: string
          role: 'owner' | 'admin' | 'receptionist' | 'cashier'
          token: string
          invited_by: string | null
          accepted_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          role?: 'owner' | 'admin' | 'receptionist' | 'cashier'
          token?: string
          invited_by?: string | null
          accepted_at?: string | null
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          role?: 'owner' | 'admin' | 'receptionist' | 'cashier'
          token?: string
          invited_by?: string | null
          accepted_at?: string | null
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'invitations_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          org_id: string
          booking_id: string | null
          type: 'booking_created' | 'booking_cancelled' | 'payment_received' | 'booking_checked_in'
          title: string
          body: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          booking_id?: string | null
          type: 'booking_created' | 'booking_cancelled' | 'payment_received' | 'booking_checked_in'
          title: string
          body?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          booking_id?: string | null
          type?: 'booking_created' | 'booking_cancelled' | 'payment_received' | 'booking_checked_in'
          title?: string
          body?: string | null
          read_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          }
        ]
      }
      tournaments: {
        Row: {
          id: string
          org_id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          registration_open: boolean
          registration_deadline: string | null
          max_teams: number
          price_per_team: number
          status: 'draft' | 'open' | 'active' | 'finished'
          rules: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          registration_open?: boolean
          registration_deadline?: string | null
          max_teams?: number
          price_per_team?: number
          status?: 'draft' | 'open' | 'active' | 'finished'
          rules?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          registration_open?: boolean
          registration_deadline?: string | null
          max_teams?: number
          price_per_team?: number
          status?: 'draft' | 'open' | 'active' | 'finished'
          rules?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tournaments_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      tournament_teams: {
        Row: {
          id: string
          tournament_id: string
          team_name: string
          captain_name: string
          captain_phone: string
          captain_email: string | null
          payment_status: 'pending' | 'paid'
          payment_method: string | null
          registered_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          team_name: string
          captain_name: string
          captain_phone: string
          captain_email?: string | null
          payment_status?: 'pending' | 'paid'
          payment_method?: string | null
          registered_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          team_name?: string
          captain_name?: string
          captain_phone?: string
          captain_email?: string | null
          payment_status?: 'pending' | 'paid'
          payment_method?: string | null
          registered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tournament_teams_tournament_id_fkey'
            columns: ['tournament_id']
            isOneToOne: false
            referencedRelation: 'tournaments'
            referencedColumns: ['id']
          }
        ]
      }
      tournament_matches: {
        Row: {
          id: string
          tournament_id: string
          round: number
          match_number: number
          team_a_id: string | null
          team_b_id: string | null
          court_id: string | null
          scheduled_at: string | null
          score_a: number | null
          score_b: number | null
          status: 'scheduled' | 'playing' | 'finished' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          round?: number
          match_number?: number
          team_a_id?: string | null
          team_b_id?: string | null
          court_id?: string | null
          scheduled_at?: string | null
          score_a?: number | null
          score_b?: number | null
          status?: 'scheduled' | 'playing' | 'finished' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          round?: number
          match_number?: number
          team_a_id?: string | null
          team_b_id?: string | null
          court_id?: string | null
          scheduled_at?: string | null
          score_a?: number | null
          score_b?: number | null
          status?: 'scheduled' | 'playing' | 'finished' | 'cancelled'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tournament_matches_tournament_id_fkey'
            columns: ['tournament_id']
            isOneToOne: false
            referencedRelation: 'tournaments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tournament_matches_team_a_id_fkey'
            columns: ['team_a_id']
            isOneToOne: false
            referencedRelation: 'tournament_teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tournament_matches_team_b_id_fkey'
            columns: ['team_b_id']
            isOneToOne: false
            referencedRelation: 'tournament_teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tournament_matches_court_id_fkey'
            columns: ['court_id']
            isOneToOne: false
            referencedRelation: 'courts'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      my_org_id: {
        Args: Record<string, never>
        Returns: string
      }
      my_role: {
        Args: Record<string, never>
        Returns: 'owner' | 'admin' | 'receptionist' | 'cashier'
      }
    }
    Enums: {
      profile_role: 'owner' | 'admin' | 'receptionist' | 'cashier'
      court_surface: 'synthetic' | 'natural' | 'indoor' | 'clay'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'no_show'
      booking_source: 'admin' | 'widget' | 'phone'
      booking_payment_status: 'pending' | 'paid' | 'refunded'
      booking_payment_method: 'cash' | 'card' | 'transfer'
      special_schedule_reason: 'maintenance' | 'holiday' | 'event' | 'closed'
      notification_type: 'booking_created' | 'booking_cancelled' | 'payment_received' | 'booking_checked_in'
      tournament_status: 'draft' | 'open' | 'active' | 'finished'
      tournament_payment_status: 'pending' | 'paid'
      match_status: 'scheduled' | 'playing' | 'finished' | 'cancelled'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// Convenience aliases
export type Organization = Tables<'organizations'>
export type Profile = Tables<'profiles'>
export type Court = Tables<'courts'>
export type CourtSchedule = Tables<'court_schedules'>
export type SpecialSchedule = Tables<'special_schedules'>
export type Client = Tables<'clients'>
export type Booking = Tables<'bookings'>
export type Invitation = Tables<'invitations'>
export type Notification = Tables<'notifications'>
export type Tournament = Tables<'tournaments'>
export type TournamentTeam = Tables<'tournament_teams'>
export type TournamentMatch = Tables<'tournament_matches'>

export type ProfileRole = Enums<'profile_role'>
export type CourtSurface = Enums<'court_surface'>
export type BookingStatus = Enums<'booking_status'>
export type BookingSource = Enums<'booking_source'>
