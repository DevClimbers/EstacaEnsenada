import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const allowed = ['titulo', 'descripcion', 'estado', 'prioridad', 'asignado_a',
                   'fecha_limite', 'kanban_orden', 'archivado']

  const updatePayload: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updatePayload[key] = body[key]
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: 'Sin campos a actualizar' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('crm_tareas')
    .update(updatePayload)
    .eq('id', id)
    .select('*, perfil_asignado:crm_perfiles!asignado_a(id, nombre, avatar_url)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { error } = await supabase
    .from('crm_tareas')
    .update({ archivado: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
