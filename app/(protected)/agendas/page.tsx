import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, BookOpen } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { AgendaCard } from '@/components/agendas/AgendaCard'
import type { Reunion } from '@/lib/types'

export default async function AgendasPage() {
  const supabase = await createClient()

  const { data: reuniones } = await supabase
    .from('crm_reuniones')
    .select('*')
    .eq('archivado', false)
    .order('fecha', { ascending: false })

  const lista = (reuniones ?? []) as Reunion[]

  // Agrupar por mes
  const porMes = lista.reduce<Record<string, Reunion[]>>((acc, r) => {
    const mes = format(new Date(r.fecha + 'T00:00:00'), 'MMMM yyyy', { locale: es })
    if (!acc[mes]) acc[mes] = []
    acc[mes].push(r)
    return acc
  }, {})

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Agendas</h1>
        <Link
          href="/agendas/nueva"
          className={cn(
            buttonVariants({ variant: 'default' }),
            'bg-[#1B2A5E] hover:bg-[#243578] text-white'
          )}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva agenda
        </Link>
      </div>

      {/* Lista agrupada por mes */}
      {lista.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">Sin agendas todavía</p>
          <p className="text-sm mt-1">Crea la primera reunión de presidencia</p>
          <Link
            href="/agendas/nueva"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'mt-4 bg-[#1B2A5E] hover:bg-[#243578] text-white'
            )}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva agenda
          </Link>
        </div>
      ) : (
        Object.entries(porMes).map(([mes, items]) => (
          <section key={mes}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 capitalize">
              {mes}
            </h2>
            <div className="space-y-2">
              {items.map((r) => (
                <AgendaCard key={r.id} reunion={r} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
