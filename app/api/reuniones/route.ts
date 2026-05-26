import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getPlantillaAgenda, BLOCKNOTE_VERSION } from '@/lib/blocknote/template'

// POST /api/reuniones — crear nueva reunión
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const { titulo, fecha, hora_inicio, hora_fin } = body

  if (!titulo || !fecha) {
    return NextResponse.json({ error: 'Título y fecha son requeridos' }, { status: 400 })
  }

  const contenido = getPlantillaAgenda(new Date(fecha + 'T00:00:00'))

  const { data, error } = await supabase
    .from('crm_reuniones')
    .insert({
      titulo,
      fecha,
      hora_inicio: hora_inicio || null,
      hora_fin: hora_fin || null,
      contenido,
      blocknote_version: BLOCKNOTE_VERSION,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}

// GET /api/reuniones — listar reuniones
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('crm_reuniones')
    .select('*')
    .eq('archivado', false)
    .order('fecha', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
