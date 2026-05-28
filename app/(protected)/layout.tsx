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

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoy = new Date().toISOString().split('T')[0]

  // Fetch all in parallel: perfil, badge counts, all perfiles for avatar stack
  const [
    { data: perfil },
    { count: compVencidos },
    { count: entPendientes },
    { data: todosPerfiles },
  ] = await Promise.all([
    supabase.from('crm_perfiles').select('*').eq('id', user.id).single(),
    supabase
      .from('crm_compromisos')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['pendiente', 'en_progreso'])
      .lt('fecha_limite', hoy)
      .eq('archivado', false),
    supabase
      .from('crm_entrevistas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')
      .eq('archivado', false),
    supabase.from('crm_perfiles').select('id, nombre, rol').order('rol'),
  ])

  if (!perfil) redirect('/login')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#FAF8F2' }}>
      {/* Sidebar — visible solo en md+ */}
      <div className="hidden md:flex">
        <Sidebar
          badges={{
            compVencidos: compVencidos ?? 0,
            entPendientes: entPendientes ?? 0,
          }}
          perfiles={(todosPerfiles ?? []) as Array<Pick<Perfil, 'id' | 'nombre' | 'rol'>>}
        />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile header bar */}
        <div className="flex items-center md:hidden px-4 py-3 border-b border-[#EAE6D7] bg-[#FAF8F2]">
          <MobileMenu />
          <div className="flex items-center gap-2 ml-2">
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: '#1B2A5E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#C9A84C' }}>PE</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0E1018' }}>Presidencia</span>
          </div>
          <div className="ml-auto">
            <Topbar perfil={perfil as Perfil} />
          </div>
        </div>

        {/* Desktop topbar */}
        <div className="hidden md:block">
          <Topbar perfil={perfil as Perfil} />
        </div>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
