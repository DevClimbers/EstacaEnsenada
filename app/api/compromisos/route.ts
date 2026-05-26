import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/compromisos — crear compromiso
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const { titulo, descripcion, reunion_id, asignado_a, fecha_limite, prioridad } = body

  if (!titulo) {
    return NextResponse.json({ error: 'Título requerido' }, { status: 400 })
  }

  // Calcular kanban_orden: MAX actual + 1000
  const { data: maxRow } = await supabase
    .from('crm_compromisos')
    .select('kanban_orden')
    .eq('estado', 'pendiente')
    .eq('archivado', false)
    .order('kanban_orden', { ascending: false })
    .limit(1)
    .single()

  const kanban_orden = (maxRow?.kanban_orden ?? 0) + 1000

  const { data, error } = await supabase
    .from('crm_compromisos')
    .insert({
      titulo,
      descripcion: descripcion || null,
      reunion_id: reunion_id || null,
      asignado_a: asignado_a || null,
      fecha_limite: fecha_limite || null,
      prioridad: prioridad || 'media',
      kanban_orden,
      created_by: user.id,
    })
    .select(`
      *,
      perfil_asignado:crm_perfiles!asignado_a(id, nombre, avatar_url)
    `)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}

// GET /api/compromisos — listar con filtros opcionales
export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const reunion_id = searchParams.get('reunion_id')
  const estado = searchParams.get('estado')
  const asignado_a = searchParams.get('asignado_a')

  let query = supabase
    .from('crm_compromisos')
    .select(`
      *,
      perfil_asignado:crm_perfiles!asignado_a(id, nombre, avatar_url),
      reunion:crm_reuniones!reunion_id(id, titulo, fecha)
    `)
    .eq('archivado', false)
    .order('kanban_orden', { ascending: true })

  if (reunion_id) query = query.eq('reunion_id', reunion_id)
  if (estado) query = query.eq('estado', estado)
  if (asignado_a) query = query.eq('asignado_a', asignado_a)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
