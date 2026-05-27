import { createClient } from '@/lib/supabase/server'
import { PerfilForm } from './PerfilForm'
import { ROL_LABELS } from '@/lib/types'
import type { Perfil } from '@/lib/types'

export default async function PerfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase
    .from('crm_perfiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="p-6 max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona tu información personal y acceso
        </p>
      </div>

      <PerfilForm
        perfil={perfil as Perfil}
        email={user!.email ?? ''}
      />
    </div>
  )
}
