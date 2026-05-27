import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/unidades — listar unidades de la estaca
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('unidades')
    .select('id, nombre')
    .order('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
