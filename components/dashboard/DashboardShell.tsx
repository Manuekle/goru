'use client'

import { useState } from 'react'
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <OrgContext.Provider value={{ org, profile }}>
      <div className="dash-layout">
        <Sidebar profile={profile} mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
        <div className="dash-body">
          <TopBar org={org} onMenuClick={() => setMobileNavOpen(v => !v)} />
          <main className="dash-main">{children}</main>
        </div>
        {mobileNavOpen && <div className="dash-overlay" onClick={() => setMobileNavOpen(false)} />}
      </div>
    </OrgContext.Provider>
  )
}
