import { notFound } from 'next/navigation'
import type { PartialBlock } from '@blocknote/core'
import { createClient } from '@/lib/supabase/server'
import { bloquesAYjs } from '@/lib/yjs/server'
import { AgendaEditorShell } from './AgendaEditorShell'
import type { Reunion, Compromiso, Perfil } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AgendaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Obtener reunión
  const { data: reunionRow, error } = await supabase
    .from('crm_reuniones')
    .select('*')
    .eq('id', id)
    .eq('archivado', false)
    .single()

  if (error || !reunionRow) {
    notFound()
  }

  let reunion = reunionRow as Reunion

  // Agendas creadas antes de la colaboración en tiempo real (o recién creadas
  // con plantilla) solo tienen JSON: sembrar el documento Yjs una única vez.
  // El WHERE contenido_yjs IS NULL evita que dos personas que abren la agenda
  // al mismo tiempo la siembren por duplicado.
  if (!reunion.contenido_yjs && reunion.contenido) {
    const semilla = bloquesAYjs(reunion.contenido as PartialBlock[])
    await supabase
      .from('crm_reuniones')
      .update({ contenido_yjs: semilla })
      .eq('id', id)
      .is('contenido_yjs', null)

    const { data: releida } = await supabase
      .from('crm_reuniones')
      .select('*')
      .eq('id', id)
      .single()
    if (releida) reunion = releida as Reunion
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
    .order('nombre')

  const yo = (perfiles ?? []).find((p) => p.id === user?.id)

  return (
    <div className="flex flex-col h-full">
      <AgendaEditorShell
        reunion={reunion}
        compromisos={(compromisos ?? []) as Compromiso[]}
        perfiles={(perfiles ?? []) as Perfil[]}
        usuario={{ id: user?.id ?? 'anon', nombre: yo?.nombre ?? 'Alguien' }}
      />
    </div>
  )
}
