import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Reunion, EstadoReunion } from '@/lib/types'

const estadoConfig: Record<EstadoReunion, { label: string; className: string }> = {
  borrador: { label: 'Borrador', className: 'bg-gray-100 text-gray-600' },
  en_curso: { label: 'En curso', className: 'bg-blue-100 text-blue-700' },
  finalizada: { label: 'Finalizada', className: 'bg-green-100 text-green-700' },
}

interface AgendaCardProps {
  reunion: Reunion
}

export function AgendaCard({ reunion }: AgendaCardProps) {
  const config = estadoConfig[reunion.estado]

  return (
    <Link
      href={`/agendas/${reunion.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-[#1B2A5E] hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 group-hover:text-[#1B2A5E] truncate">
            {reunion.titulo}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(reunion.fecha + 'T00:00:00'), "EEEE d 'de' MMMM 'de' yyyy", {
              locale: es,
            })}
            {reunion.hora_inicio && (
              <span className="ml-1">· {reunion.hora_inicio.slice(0, 5)}</span>
            )}
          </p>
        </div>
        <span
          className={cn(
            'text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0',
            config.className
          )}
        >
          {config.label}
        </span>
      </div>
    </Link>
  )
}
