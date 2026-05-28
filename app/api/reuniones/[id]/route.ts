import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH /api/reuniones/[id] — actualizar contenido (con detección de conflictos)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const { contenido, blocknote_version, updated_at_client, estado } = body

  // Leer updated_at actual de la BD para detectar conflicto
  const { data: current, error: fetchError } = await supabase
    .from('crm_reuniones')
    .select('updated_at, archivado')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: 'Reunión no encontrada' }, { status: 404 })
  }

  // Detección de conflicto: otro usuario guardó después que nosotros
  if (updated_at_client && new Date(current.updated_at) > new Date(updated_at_client)) {
    return NextResponse.json(
      { error: 'conflict', updated_at_db: current.updated_at },
      { status: 409 }
    )
  }

  const updatePayload: Record<string, unknown> = {}
  if (contenido !== undefined) {
    updatePayload.contenido = contenido
    updatePayload.blocknote_version = blocknote_version
  }
  if (estado !== undefined) updatePayload.estado = estado

  const { data, error } = await supabase
    .from('crm_reuniones')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// DELETE /api/reuniones/[id] — archivar (soft delete)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { error } = await supabase
    .from('crm_reuniones')
    .update({ archivado: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// GET /api/reuniones/[id] — obtener reunión
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('crm_reuniones')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json(data)
}
