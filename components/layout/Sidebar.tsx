'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CalendarDays,
  KanbanSquare,
  Calendar,
  CheckSquare,
  Users,
  Settings,
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: 'Agendas',
    href: '/agendas',
    icon: CalendarDays,
    enabled: true,
  },
  {
    label: 'Kanban',
    href: '/kanban',
    icon: KanbanSquare,
    enabled: false,
    badge: 'Próx.',
  },
  {
    label: 'Calendario',
    href: '/calendario',
    icon: Calendar,
    enabled: false,
    badge: 'Próx.',
  },
  {
    label: 'Compromisos',
    href: '/compromisos',
    icon: CheckSquare,
    enabled: true,
  },
  {
    label: 'Entrevistas',
    href: '/entrevistas',
    icon: Users,
    enabled: false,
    badge: 'Próx.',
  },
  {
    label: 'Config',
    href: '/configuracion',
    icon: Settings,
    enabled: false,
    badge: 'Próx.',
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex flex-col w-60 min-h-screen bg-[#1B2A5E] text-white',
        className
      )}
    >
      {/* Logo / Nombre */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-white">PE</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold leading-none">Presidencia</p>
          <p className="text-xs text-blue-300 mt-0.5">Estaca Ensenada</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/30 cursor-not-allowed select-none"
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] bg-white/10 text-white/40 rounded px-1.5 py-0.5">
                    {item.badge}
                  </span>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#C9A84C] text-white font-medium'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-xs text-white/30">Estaca Ensenada México</p>
      </div>
    </aside>
  )
}
