'use client'

import { OrgContext } from '@/hooks/use-org'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import type { Organization, Profile } from '@/lib/supabase/types'

interface Props {
  org: Organization
  profile: Profile & { organizations: Organization }
  children: React.ReactNode
}

export function DashboardShell({ org, profile, children }: Props) {
  return (
    <OrgContext.Provider value={{ org, profile }}>
      <div className="dash-layout">
        <Sidebar role={profile.role} />
        <div className="dash-body">
          <TopBar org={org} profile={profile} />
          <main className="dash-main">{children}</main>
        </div>
      </div>
    </OrgContext.Provider>
  )
}
