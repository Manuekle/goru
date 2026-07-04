'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/utils'
import Logo from '@/components/Logo'
import { signOut } from '@/actions/auth'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { Profile, ProfileRole } from '@/lib/supabase/types'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  Home01Icon,
  Calendar01Icon,
  Note01Icon,
  Grid02Icon,
  Group01Icon,
  Setting06Icon,
  UserGroup02Icon,
  Logout01Icon,
  ChampionIcon,
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
  { href: '/dashboard/tournaments', label: 'Torneos', icon: ChampionIcon, roles: ['owner', 'admin'] },
  { href: '/dashboard/clients', label: 'Clientes', icon: Group01Icon },
  { href: '/dashboard/team', label: 'Equipo', icon: UserGroup02Icon, roles: ['owner', 'admin'] },
  { href: '/dashboard/settings', label: 'Configuración', icon: Setting06Icon, roles: ['owner', 'admin'] },
]

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

interface SidebarProps {
  profile: Profile
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ profile, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const visible = NAV.filter((item) => !item.roles || item.roles.includes(profile.role))

  return (
    <aside className={`dash-sidebar${mobileOpen ? ' dash-sidebar--open' : ''}`}>
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
              onClick={onMobileClose}
              className={cn('dash-nav-item', active && 'dash-nav-item--active')}
            >
              <HugeiconsIcon icon={Icon} size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="dash-sidebar__footer">
        <DropdownMenu>
          <DropdownMenuTrigger className="dash-sidebar__profile">
            <span className="dash-sidebar__profile-mark">{initials(profile.full_name) || 'U'}</span>
            <span className="dash-sidebar__profile-info">
              <span className="dash-sidebar__profile-name">{profile.full_name}</span>
              <span className="dash-sidebar__profile-role">{ROLE_LABELS[profile.role]}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="top"
            sideOffset={10}
            className="dash-menu w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel inset={false} className="dash-menu__label">
                {profile.full_name}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/settings" />} className="dash-menu__item">
              <HugeiconsIcon icon={Setting06Icon} size={16} />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="dash-menu__item"
              onClick={() => signOut()}
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
