import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { MobileMenu } from '@/components/layout/MobileMenu'
import type { Perfil } from '@/lib/types'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Verificar sesión
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil del usuario
  const { data: perfil } = await supabase
    .from('crm_perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil) {
    // Usuario autenticado pero sin perfil en la presidencia
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — visible solo en md+ */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center md:block">
          {/* Botón hamburguesa (solo mobile) */}
          <div className="flex items-center gap-2 px-4 py-3 md:hidden">
            <MobileMenu />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#C9A84C] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">PE</span>
              </div>
              <span className="text-sm font-semibold text-[#1B2A5E]">Presidencia</span>
            </div>
          </div>
          <div className="hidden md:block">
            <Topbar perfil={perfil as Perfil} />
          </div>
          {/* Topbar mobile (solo el avatar) */}
          <div className="ml-auto md:hidden pr-4">
            <Topbar perfil={perfil as Perfil} />
          </div>
        </div>

        {/* Página */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
