'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Bell, User, ChevronDown } from 'lucide-react'
import { ROL_LABELS } from '@/lib/types'
import type { Perfil } from '@/lib/types'

const PAGE_TITLES: { prefix: string; exactMatch: boolean; kicker: string; title: string }[] = [
  { prefix: '/dashboard',   exactMatch: true,  kicker: 'Inicio',         title: 'Dashboard' },
  { prefix: '/agendas',     exactMatch: false, kicker: 'Reuniones',      title: 'Agendas' },
  { prefix: '/kanban',      exactMatch: false, kicker: 'Seguimiento',    title: 'Tablero Kanban' },
  { prefix: '/calendario',  exactMatch: false, kicker: 'Planificación',  title: 'Calendario' },
  { prefix: '/compromisos', exactMatch: false, kicker: 'Seguimiento',    title: 'Compromisos' },
  { prefix: '/entrevistas', exactMatch: false, kicker: 'Pastoreo',       title: 'Entrevistas' },
]

function getPageInfo(pathname: string) {
  for (const p of PAGE_TITLES) {
    const match = p.exactMatch ? pathname === p.prefix : pathname.startsWith(p.prefix)
    if (match) return { kicker: p.kicker, title: p.title }
  }
  return { kicker: 'CRM', title: 'Presidencia de Estaca' }
}

function getInitials(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

interface TopbarProps {
  perfil: Perfil
}

export function Topbar({ perfil }: TopbarProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const page     = getPageInfo(pathname)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: '#FAF8F2',
      borderBottom: '1px solid #EAE6D7',
      flexShrink: 0,
    }}>
      {/* Left: page kicker + title */}
      <div>
        <div style={{
          fontSize: 9.5, letterSpacing: '0.13em', textTransform: 'uppercase',
          color: '#9C9A91', fontWeight: 600, lineHeight: 1,
        }}>
          {page.kicker}
        </div>
        <div style={{
          fontSize: 15, fontWeight: 700, color: '#0E1018',
          letterSpacing: '-0.015em', lineHeight: 1.15, marginTop: 3,
        }}>
          {page.title}
        </div>
      </div>

      {/* Right: bell + user pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Bell */}
        <button
          onClick={() => {}}
          style={{
            width: 34, height: 34, borderRadius: 8,
            border: '1px solid #EAE6D7', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#9C9A91', flexShrink: 0,
          }}
        >
          <Bell size={15} />
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg focus:outline-none" style={{
            padding: '4px 10px 4px 5px',
            background: '#fff',
            border: '1px solid #EAE6D7',
          }}>
            {/* Mini avatar */}
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: '#1B2A5E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff',
              flexShrink: 0,
            }}>
              {getInitials(perfil.nombre)}
            </div>
            {/* Name + role */}
            <div style={{ textAlign: 'left' }} className="hidden sm:block">
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0E1018', lineHeight: 1.2 }}>
                {perfil.nombre.split(' ').slice(0, 2).join(' ')}
              </div>
              <div style={{ fontSize: 10, color: '#9C9A91' }}>
                {ROL_LABELS[perfil.rol]}
              </div>
            </div>
            <ChevronDown size={11} className="hidden sm:block" style={{ color: '#9C9A91' }} />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{perfil.nombre}</p>
                  <p className="text-xs text-gray-500 font-normal">{ROL_LABELS[perfil.rol]}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push('/perfil')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Mi perfil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
