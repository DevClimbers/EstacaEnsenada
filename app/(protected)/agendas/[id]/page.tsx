import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AgendaEditorShell } from './AgendaEditorShell'
import type { Reunion, Compromiso, Perfil } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AgendaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener reunión
  const { data: reunion, error } = await supabase
    .from('crm_reuniones')
    .select('*')
    .eq('id', id)
    .eq('archivado', false)
    .single()

  if (error || !reunion) {
    notFound()
  }

  // Obtener compromisos de esta reunión
  const { data: compromisos } = await supabase
    .from('crm_compromisos')
    .select('*')
    .eq('reunion_id', id)
    .eq('archivado', false)
    .order('kanban_orden', { ascending: true })

  // Obtener todos los perfiles para asignar compromisos
  const { data: perfiles } = await supabase
    .from('crm_perfiles')
    .select('id, nombre, rol')
    .eq('activo', true)
    .order('nombre')

  return (
    <div className="flex flex-col h-full">
      <AgendaEditorShell
        reunion={reunion as Reunion}
        compromisos={(compromisos ?? []) as Compromiso[]}
        perfiles={(perfiles ?? []) as Perfil[]}
      />
    </div>
  )
}
