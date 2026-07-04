'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { InboxIcon, Menu01Icon } from '@hugeicons/core-free-icons'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { formatDateShort, formatTime } from '@/lib/utils'
import type { Organization, Notification } from '@/lib/supabase/types'

interface TopBarProps {
  org: Organization
  onMenuClick?: () => void
}

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Inicio',
  calendar: 'Calendario',
  bookings: 'Reservas',
  courts: 'Canchas',
  clients: 'Clientes',
  team: 'Equipo',
  settings: 'Configuración',
}

function useCurrentPageLabel() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const key = segments[1]
  return key ? (PAGE_LABELS[key] ?? null) : null
}

export function TopBar({ org, onMenuClick }: TopBarProps) {
  const pageLabel = useCurrentPageLabel()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications(data ?? [])
  }

  useEffect(() => {
    loadNotifications()
  }, [org.id])

  const unreadCount = notifications.filter((n) => !n.read_at).length

  async function handleOpenChange(open: boolean) {
    if (!open || unreadCount === 0) return
    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id)
    setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })))
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).in('id', unreadIds)
  }

  return (
    <header className="dash-topbar">
      <button className="dash-topbar__menu" onClick={onMenuClick} aria-label="Menú de navegación">
        <HugeiconsIcon icon={Menu01Icon} size={18} />
      </button>
      <div className="dash-topbar__crumbs">
        <p className="dash-topbar__org">{org.name}</p>
        {pageLabel && (
          <>
            <span className="dash-topbar__sep">/</span>
            <p className="dash-topbar__page">{pageLabel}</p>
          </>
        )}
      </div>
      <div className="dash-topbar__right">
        <DropdownMenu onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger className="dash-topbar__inbox" aria-label="Notificaciones">
            <HugeiconsIcon icon={InboxIcon} size={18} />
            {unreadCount > 0 && <span className="dash-topbar__inbox-dot" />}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={10} className="dash-menu dash-inbox">
            <p className="dash-inbox__head">
              Notificaciones
              {unreadCount > 0 && <span className="dash-inbox__head-count">{unreadCount} nuevas</span>}
            </p>
            {notifications.length === 0 ? (
              <div className="dash-inbox__empty">
                <HugeiconsIcon icon={InboxIcon} size={24} />
                <p className="dash-inbox__empty-title">Sin novedades</p>
                <p className="dash-inbox__empty-desc">Las notificaciones de tu negocio van a aparecer acá.</p>
              </div>
            ) : (
              <div className="dash-inbox__list">
                {notifications.map((n) => (
                  <div key={n.id} className={`dash-inbox__item ${!n.read_at ? 'dash-inbox__item--unread' : ''}`}>
                    <p className="dash-inbox__item-title">{n.title}</p>
                    {n.body && <p className="dash-inbox__item-body">{n.body}</p>}
                    <p className="dash-inbox__item-time">
                      {formatDateShort(n.created_at, org.timezone)} · {formatTime(n.created_at, org.timezone)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
