import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/tareas — crear tarea
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const { titulo, descripcion, asignado_a, fecha_limite, prioridad } = body

  if (!titulo) {
    return NextResponse.json({ error: 'Título requerido' }, { status: 400 })
  }

  const { data: maxRow } = await supabase
    .from('crm_tareas')
    .select('kanban_orden')
    .eq('estado', 'pendiente')
    .eq('archivado', false)
    .order('kanban_orden', { ascending: false })
    .limit(1)
    .single()

  const kanban_orden = (maxRow?.kanban_orden ?? 0) + 1000

  const { data, error } = await supabase
    .from('crm_tareas')
    .insert({
      titulo,
      descripcion: descripcion || null,
      asignado_a: asignado_a || null,
      fecha_limite: fecha_limite || null,
      prioridad: prioridad || 'media',
      kanban_orden,
      created_by: user.id,
    })
    .select('*, perfil_asignado:crm_perfiles!asignado_a(id, nombre, avatar_url)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}

// GET /api/tareas — listar con filtros opcionales
export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const estado = searchParams.get('estado')
  const asignado_a = searchParams.get('asignado_a')

  let query = supabase
    .from('crm_tareas')
    .select('*, perfil_asignado:crm_perfiles!asignado_a(id, nombre, avatar_url)')
    .eq('archivado', false)
    .order('kanban_orden', { ascending: true })

  if (estado) query = query.eq('estado', estado)
  if (asignado_a) query = query.eq('asignado_a', asignado_a)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
