'use client'

import { createContext, useContext } from 'react'
import type { Organization, Profile } from '@/lib/supabase/types'

interface OrgContextValue {
  org: Organization
  profile: Profile & { organizations: Organization }
}

export const OrgContext = createContext<OrgContextValue | null>(null)

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext)
  if (!ctx) throw new Error('useOrg must be used within DashboardShell')
  return ctx
}
