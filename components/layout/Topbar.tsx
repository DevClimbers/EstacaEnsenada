'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, ChevronDown, User } from 'lucide-react'
import { ROL_LABELS } from '@/lib/types'
import type { Perfil } from '@/lib/types'

interface TopbarProps {
  perfil: Perfil
}

function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function Topbar({ perfil }: TopbarProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 flex items-center justify-end px-6 bg-white border-b border-gray-200 flex-shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors focus:outline-none">
          <Avatar className="h-7 w-7">
            <AvatarImage src={perfil.avatar_url ?? undefined} alt={perfil.nombre} />
            <AvatarFallback className="bg-[#1B2A5E] text-white text-xs font-medium">
              {getInitials(perfil.nombre)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">
              {perfil.nombre}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {ROL_LABELS[perfil.rol]}
            </p>
          </div>
          <ChevronDown className="h-3 w-3 text-gray-400 hidden sm:block" />
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
    </header>
  )
}
