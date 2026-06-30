'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from '@/actions/auth'
import { ROLE_LABELS } from '@/lib/utils'
import type { Organization, Profile } from '@/lib/supabase/types'
import { HugeiconsIcon } from '@hugeicons/react'
import { User02Icon } from '@hugeicons/core-free-icons'

interface TopBarProps {
  org: Organization
  profile: Profile & { organizations: Organization }
}

export function TopBar({ org, profile }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="dash-topbar">
      <p className="dash-topbar__org">{org.name}</p>
      <div className="dash-topbar__right">
        <button
          className="dash-topbar__avatar"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
        >
          <HugeiconsIcon icon={User02Icon} size={18} />
          <span className="dash-topbar__name">{profile.full_name}</span>
        </button>

        {menuOpen && (
          <div className="dash-topbar__menu">
            <p className="dash-topbar__menu-role">{ROLE_LABELS[profile.role]}</p>
            <Link
              href="/dashboard/settings"
              className="dash-topbar__menu-item"
              onClick={() => setMenuOpen(false)}
            >
              Configuración
            </Link>
            <form action={signOut}>
              <button type="submit" className="dash-topbar__menu-item dash-topbar__menu-item--danger">
                Cerrar sesión
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
