import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fusionarYjs, yjsABloques } from '@/lib/yjs/server'

// PATCH /api/reuniones/[id] — guardar contenido colaborativo (Yjs) o estado
//
// El cliente manda el estado completo de su documento Yjs. El servidor lo
// fusiona con lo que ya hay en la BD (Yjs garantiza que la fusión no pierde
// cambios de nadie) y deriva la copia JSON de lectura. Ya no hay conflictos
// ni "sobrescribir": los cambios de todos se combinan.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const { yjs, blocknote_version, estado } = body as {
    yjs?: string
    blocknote_version?: string
    estado?: string
  }

  const updatePayload: Record<string, unknown> = {}

  if (typeof yjs === 'string' && yjs.length > 0) {
    const { data: current, error: fetchError } = await supabase
      .from('crm_reuniones')
      .select('contenido_yjs')
      .eq('id', id)
      .single()

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Reunión no encontrada' }, { status: 404 })
    }

    let fusionado: string
    let bloques: unknown[]
    try {
      fusionado = fusionarYjs(current.contenido_yjs, yjs)
      bloques = yjsABloques(fusionado)
    } catch {
      return NextResponse.json({ error: 'Documento inválido' }, { status: 400 })
    }

    updatePayload.contenido_yjs = fusionado
    updatePayload.contenido = bloques
    if (blocknote_version) updatePayload.blocknote_version = blocknote_version
  }

  if (estado !== undefined) updatePayload.estado = estado

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('crm_reuniones')
    .update(updatePayload)
    .eq('id', id)
    .select('id, estado, updated_at')
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
