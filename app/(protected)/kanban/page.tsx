import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { estadoToColumna } from '@/lib/kanban'
import { TIPO_ENTREVISTA_LABELS } from '@/lib/types'
import type { Compromiso, Entrevista, Tarea } from '@/lib/types'
import type { KanbanItem } from '@/lib/kanban'

export default async function KanbanPage() {
  const supabase = await createClient()

  const [
    { data: compromisos },
    { data: entrevistas },
    { data: tareas },
    { data: perfiles },
    { data: unidades },
  ] = await Promise.all([
    supabase
      .from('crm_compromisos')
      .select('*')
      .eq('archivado', false)
      .order('kanban_orden'),
    supabase
      .from('crm_entrevistas')
      .select('*')
      .eq('archivado', false)
      .order('kanban_orden'),
    supabase
      .from('crm_tareas')
      .select('*')
      .eq('archivado', false)
      .order('kanban_orden'),
    supabase
      .from('crm_perfiles')
      .select('id, nombre')
      .order('nombre'),
    supabase
      .from('unidades')
      .select('id, nombre')
      .order('id'),
  ])

  const perfilesData = (perfiles ?? []) as { id: string; nombre: string }[]

  const items: KanbanItem[] = [
    ...(compromisos ?? []).map((c) => {
      const comp = c as Compromiso
      return {
        id:             comp.id,
        tipo:           'compromiso' as const,
        titulo:         comp.titulo,
        estado:         comp.estado,
        columna:        estadoToColumna(comp.estado),
        kanban_orden:   comp.kanban_orden,
        prioridad:      comp.prioridad,
        asignado_a:     comp.asignado_a,
        asignadoNombre: perfilesData.find((p) => p.id === comp.asignado_a)?.nombre ?? null,
        fecha:          comp.fecha_limite,
      }
    }),
    ...(entrevistas ?? []).map((e) => {
      const ent = e as Entrevista
      return {
        id:             ent.id,
        tipo:           'entrevista' as const,
        titulo:         ent.nombre_miembro,
        estado:         ent.estado,
        columna:        estadoToColumna(ent.estado),
        kanban_orden:   ent.kanban_orden,
        asignado_a:     ent.asignado_a,
        asignadoNombre: perfilesData.find((p) => p.id === ent.asignado_a)?.nombre ?? null,
        fecha:          ent.fecha_agendada,
        subtitulo:      TIPO_ENTREVISTA_LABELS[ent.tipo],
      }
    }),
    ...(tareas ?? []).map((t) => {
      const tar = t as Tarea
      return {
        id:             tar.id,
        tipo:           'tarea' as const,
        titulo:         tar.titulo,
        estado:         tar.estado,
        columna:        estadoToColumna(tar.estado),
        kanban_orden:   tar.kanban_orden,
        prioridad:      tar.prioridad,
        asignado_a:     tar.asignado_a,
        asignadoNombre: perfilesData.find((p) => p.id === tar.asignado_a)?.nombre ?? null,
        fecha:          tar.fecha_limite,
      }
    }),
  ]

  return (
    <div className="h-full flex flex-col">
      <KanbanBoard
        items={items}
        perfiles={perfilesData}
        unidades={(unidades ?? []) as { id: string; nombre: string }[]}
      />
    </div>
  )
}
