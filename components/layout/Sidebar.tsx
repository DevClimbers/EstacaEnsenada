'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  KanbanSquare,
  Calendar,
  CheckSquare,
  Users,
  Settings,
  ExternalLink,
} from 'lucide-react'
import type { Perfil } from '@/lib/types'

interface SidebarBadges {
  compVencidos?: number
  entPendientes?: number
}

interface SidebarProps {
  className?: string
  badges?: SidebarBadges
  perfiles?: Array<Pick<Perfil, 'id' | 'nombre' | 'rol'>>
}

const GESTION_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    exactMatch: true,
    badgeKey: null as null | keyof SidebarBadges,
  },
  {
    label: 'Agendas',
    href: '/agendas',
    icon: CalendarDays,
    exactMatch: false,
    badgeKey: null as null | keyof SidebarBadges,
  },
  {
    label: 'Kanban',
    href: '/kanban',
    icon: KanbanSquare,
    exactMatch: false,
    badgeKey: null as null | keyof SidebarBadges,
  },
  {
    label: 'Calendario',
    href: '/calendario',
    icon: Calendar,
    exactMatch: false,
    badgeKey: null as null | keyof SidebarBadges,
  },
  {
    label: 'Compromisos',
    href: '/compromisos',
    icon: CheckSquare,
    exactMatch: false,
    badgeKey: 'compVencidos' as keyof SidebarBadges,
  },
  {
    label: 'Entrevistas',
    href: '/entrevistas',
    icon: Users,
    exactMatch: false,
    badgeKey: 'entPendientes' as keyof SidebarBadges,
  },
]

function getInitials(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const AVATAR_TONES = ['#1B2A5E', '#2F4D8C', '#C9A84C', '#3D6FA8']

export function Sidebar({ badges = {}, perfiles = [] }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: '#FAF8F2',
      borderRight: '1px solid #EAE6D7',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '20px 18px 18px',
        borderBottom: '1px solid #EAE6D7',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#1B2A5E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#C9A84C', letterSpacing: '0.02em' }}>
            PE
          </span>
        </div>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0E1018', letterSpacing: '-0.01em' }}>
            Presidencia
          </div>
          <div style={{ fontSize: 10.5, color: '#9C9A91', fontWeight: 500 }}>
            Estaca Ensenada
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px 10px' }}>
        {/* Section label */}
        <div style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#B0ADA4',
          padding: '0 10px 8px',
        }}>
          Gestión
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {GESTION_ITEMS.map((item) => {
            const isActive = item.exactMatch
              ? pathname === item.href
              : pathname.startsWith(item.href)
            const badge = item.badgeKey ? (badges[item.badgeKey] ?? 0) : 0

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '7px 10px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#fff' : '#3D3D38',
                  background: isActive ? '#1B2A5E' : 'transparent',
                }}
              >
                <item.icon
                  size={15}
                  style={{ flexShrink: 0, opacity: isActive ? 1 : 0.55 }}
                />
                <span style={{ flex: 1 }}>{item.label}</span>
                {badge > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: isActive ? 'rgba(255,255,255,0.22)' : '#C9A84C',
                    color: '#fff',
                    borderRadius: 999,
                    padding: '1px 6px',
                    lineHeight: 1.6,
                  }}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Conferencia section */}
        <div style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#B0ADA4',
          padding: '16px 10px 8px',
        }}>
          Evento
        </div>

        <a
          href="https://conferencia-estaca.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '7px 10px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 13.5,
            fontWeight: 400,
            color: '#3D3D38',
            background: 'transparent',
          }}
        >
          <ExternalLink size={15} style={{ flexShrink: 0, opacity: 0.55 }} />
          <span style={{ flex: 1 }}>Conferencia</span>
          <span style={{
            fontSize: 9.5, fontWeight: 700,
            background: '#C9A84C', color: '#fff',
            borderRadius: 4, padding: '1px 5px',
          }}>
            24 may
          </span>
        </a>

        {/* Sistema section */}
        <div style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#B0ADA4',
          padding: '16px 10px 8px',
        }}>
          Sistema
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 10px', borderRadius: 8,
          fontSize: 13.5, color: '#C4C2BC',
          cursor: 'not-allowed', userSelect: 'none',
        }}>
          <Settings size={15} style={{ flexShrink: 0, opacity: 0.4 }} />
          <span style={{ flex: 1 }}>Configuración</span>
          <span style={{
            fontSize: 9.5, fontWeight: 600,
            background: '#EAE6D7', color: '#B0ADA4',
            borderRadius: 4, padding: '1px 5px',
          }}>
            Próx.
          </span>
        </div>
      </nav>

      {/* Avatar stack */}
      {perfiles.length > 0 && (
        <div style={{
          padding: '12px 18px 16px',
          borderTop: '1px solid #EAE6D7',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{ display: 'flex' }}>
            {perfiles.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                title={p.nombre}
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: AVATAR_TONES[i % AVATAR_TONES.length],
                  border: '2px solid #FAF8F2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8.5, fontWeight: 700, color: '#fff',
                  marginLeft: i === 0 ? 0 : -6,
                  position: 'relative',
                  zIndex: perfiles.length - i,
                  flexShrink: 0,
                }}
              >
                {getInitials(p.nombre)}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 11, color: '#9C9A91' }}>
            {perfiles.length} dirigente{perfiles.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </aside>
  )
}
