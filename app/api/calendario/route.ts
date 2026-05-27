import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface CalendarEvent {
  id: string
  tipo: 'reunion' | 'entrevista' | 'compromiso' | 'tarea'
  titulo: string
  fecha: string   // YYYY-MM-DD
  hora: string | null
  estado: string
  href: string
}

// GET /api/calendario?start=YYYY-MM-DD&end=YYYY-MM-DD
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start y end son requeridos' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const [
    { data: reuniones },
    { data: entrevistas },
    { data: compromisos },
    { data: tareas },
  ] = await Promise.all([
    supabase
      .from('crm_reuniones')
      .select('id, titulo, fecha, hora_inicio, estado')
      .gte('fecha', start)
      .lte('fecha', end)
      .eq('archivado', false)
      .order('fecha'),
    supabase
      .from('crm_entrevistas')
      .select('id, nombre_miembro, fecha_agendada, tipo, estado')
      .gte('fecha_agendada', `${start}T00:00:00`)
      .lte('fecha_agendada', `${end}T23:59:59`)
      .eq('archivado', false)
      .not('fecha_agendada', 'is', null)
      .order('fecha_agendada'),
    supabase
      .from('crm_compromisos')
      .select('id, titulo, fecha_limite, prioridad, estado')
      .gte('fecha_limite', start)
      .lte('fecha_limite', end)
      .eq('archivado', false)
      .not('fecha_limite', 'is', null)
      .order('fecha_limite'),
    supabase
      .from('crm_tareas')
      .select('id, titulo, fecha_limite, prioridad, estado')
      .gte('fecha_limite', start)
      .lte('fecha_limite', end)
      .eq('archivado', false)
      .not('fecha_limite', 'is', null)
      .order('fecha_limite'),
  ])

  const events: CalendarEvent[] = [
    ...(reuniones ?? []).map((r) => ({
      id:     r.id,
      tipo:   'reunion' as const,
      titulo: r.titulo,
      fecha:  r.fecha,
      hora:   r.hora_inicio ?? null,
      estado: r.estado,
      href:   `/agendas/${r.id}`,
    })),
    ...(entrevistas ?? []).map((e) => ({
      id:     e.id,
      tipo:   'entrevista' as const,
      titulo: e.nombre_miembro,
      fecha:  (e.fecha_agendada as string).split('T')[0],
      hora:   (e.fecha_agendada as string).split('T')[1]?.slice(0, 5) ?? null,
      estado: e.estado,
      href:   '/entrevistas',
    })),
    ...(compromisos ?? []).map((c) => ({
      id:     c.id,
      tipo:   'compromiso' as const,
      titulo: c.titulo,
      fecha:  c.fecha_limite as string,
      hora:   null,
      estado: c.estado,
      href:   '/compromisos',
    })),
    ...(tareas ?? []).map((t) => ({
      id:     t.id,
      tipo:   'tarea' as const,
      titulo: t.titulo,
      fecha:  t.fecha_limite as string,
      hora:   null,
      estado: t.estado,
      href:   '/kanban',
    })),
  ]

  return NextResponse.json(events)
}
