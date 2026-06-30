'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Logo from '@/components/Logo'
import type { ProfileRole } from '@/lib/supabase/types'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  Home01Icon,
  Calendar01Icon,
  Note01Icon,
  Grid02Icon,
  Group01Icon,
  Setting06Icon,
  UserGroup02Icon,
} from '@hugeicons/core-free-icons'

interface NavItem {
  href: string
  label: string
  icon: IconSvgElement
  roles?: ProfileRole[]
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home01Icon },
  { href: '/dashboard/calendar', label: 'Calendario', icon: Calendar01Icon },
  { href: '/dashboard/bookings', label: 'Reservas', icon: Note01Icon },
  { href: '/dashboard/courts', label: 'Canchas', icon: Grid02Icon, roles: ['owner', 'admin'] },
  { href: '/dashboard/clients', label: 'Clientes', icon: Group01Icon },
  { href: '/dashboard/team', label: 'Equipo', icon: UserGroup02Icon, roles: ['owner', 'admin'] },
  { href: '/dashboard/settings', label: 'Configuración', icon: Setting06Icon, roles: ['owner', 'admin'] },
]

interface SidebarProps {
  role: ProfileRole
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const visible = NAV.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar__logo">
        <Logo size={28} />
        <span className="dash-sidebar__brand">Goru</span>
      </div>
      <nav className="dash-sidebar__nav">
        {visible.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn('dash-nav-item', active && 'dash-nav-item--active')}
            >
              <HugeiconsIcon icon={Icon} size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
