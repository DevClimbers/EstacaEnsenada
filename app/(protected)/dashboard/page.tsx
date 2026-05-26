import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, CheckSquare, Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Reunion, Compromiso, EstadoCompromiso } from '@/lib/types'

const estadoBadgeColor: Record<EstadoCompromiso, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_progreso: 'bg-blue-100 text-blue-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-gray-100 text-gray-500',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const hoy = new Date().toISOString().split('T')[0]

  // Próxima reunión
  const { data: proximaReunion } = await supabase
    .from('crm_reuniones')
    .select('*')
    .eq('archivado', false)
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })
    .limit(1)
    .single()

  // Mis compromisos pendientes
  const { data: misCompromisos } = await supabase
    .from('crm_compromisos')
    .select('*')
    .eq('asignado_a', user!.id)
    .in('estado', ['pendiente', 'en_progreso'])
    .eq('archivado', false)
    .order('fecha_limite', { ascending: true, nullsFirst: false })
    .limit(5)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/agendas/nueva"
          className={cn(buttonVariants({ variant: 'default' }), 'bg-[#1B2A5E] hover:bg-[#243578] text-white')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva agenda
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Próxima reunión */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-700">
              <CalendarDays className="h-4 w-4 text-[#C9A84C]" />
              Próxima reunión
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proximaReunion ? (
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {(proximaReunion as Reunion).titulo}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(
                      new Date((proximaReunion as Reunion).fecha + 'T00:00:00'),
                      "EEEE d 'de' MMMM 'de' yyyy",
                      { locale: es }
                    )}
                    {(proximaReunion as Reunion).hora_inicio && (
                      <span> · {(proximaReunion as Reunion).hora_inicio}</span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/agendas/${(proximaReunion as Reunion).id}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-center')}
                >
                  Abrir agenda
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay reuniones programadas</p>
                <Link
                  href="/agendas/nueva"
                  className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'mt-2 text-[#1B2A5E]')}
                >
                  Crear una ahora
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mis compromisos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base font-semibold text-gray-700">
              <span className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-[#C9A84C]" />
                Mis compromisos
              </span>
              <Link
                href="/compromisos"
                className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'text-[#1B2A5E] h-auto p-0 text-xs')}
              >
                Ver todos
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {misCompromisos && misCompromisos.length > 0 ? (
              <ul className="space-y-2">
                {misCompromisos.map((c) => {
                  const comp = c as Compromiso
                  const vencido =
                    comp.fecha_limite &&
                    comp.fecha_limite < hoy &&
                    comp.estado !== 'completado'
                  return (
                    <li
                      key={comp.id}
                      className="flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {comp.titulo}
                        </p>
                        {comp.fecha_limite && (
                          <p className={`text-xs mt-0.5 ${vencido ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            {vencido ? '⚠ Vencido · ' : ''}
                            {format(new Date(comp.fecha_limite + 'T00:00:00'), 'd MMM', { locale: es })}
                          </p>
                        )}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${estadoBadgeColor[comp.estado]}`}>
                        {comp.estado.replace('_', ' ')}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin compromisos pendientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
