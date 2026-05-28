'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KanbanItem } from '@/lib/kanban'

const tipoConfig = {
  compromiso: { badge: 'bg-green-100 text-green-700',  label: 'Compromiso' },
  tarea:      { badge: 'bg-yellow-100 text-yellow-700', label: 'Tarea'      },
  entrevista: { badge: 'bg-purple-100 text-purple-700', label: 'Entrevista' },
}

const prioridadDot: Record<string, string> = {
  alta:  'bg-red-400',
  media: 'bg-yellow-400',
  baja:  'bg-green-400',
}

interface KanbanCardViewProps {
  item: KanbanItem
  shadow?: boolean
  onOpen?: () => void
}

export function KanbanCardView({ item, shadow = false, onOpen }: KanbanCardViewProps) {
  const cfg = tipoConfig[item.tipo]
  const hoy = new Date().toISOString().split('T')[0]
  const fechaStr = item.fecha
    ? item.fecha.length > 10
      ? item.fecha
      : item.fecha + 'T00:00:00'
    : null
  const vencido =
    item.fecha &&
    item.fecha.slice(0, 10) < hoy &&
    item.columna !== 'completado' &&
    item.columna !== 'cancelado'

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-3 space-y-2 select-none group/card',
        shadow && 'shadow-xl ring-1 ring-black/5 rotate-1'
      )}
    >
      {/* Título + badge + open button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {item.prioridad && (
            <span
              className={cn(
                'w-2 h-2 rounded-full flex-shrink-0',
                prioridadDot[item.prioridad]
              )}
            />
          )}
          <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
            {item.titulo}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap',
              cfg.badge
            )}
          >
            {cfg.label}
          </span>
          {onOpen && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpen() }}
              className="opacity-0 group-hover/card:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Ver detalle"
            >
              <Maximize2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Subtítulo */}
      {item.subtitulo && (
        <p className="text-xs text-gray-400 pl-3.5 truncate">{item.subtitulo}</p>
      )}

      {/* Notas preview */}
      {item.descripcion && (
        <p className="text-xs text-gray-400 pl-3.5 line-clamp-1 italic">
          {item.descripcion}
        </p>
      )}

      {/* Asignado + fecha */}
      <div className="flex items-center justify-between gap-2">
        {item.asignadoNombre ? (
          <span className="text-xs text-gray-400 truncate">{item.asignadoNombre}</span>
        ) : (
          <span />
        )}
        {fechaStr && (
          <span
            className={cn(
              'text-xs ml-auto flex-shrink-0',
              vencido ? 'text-red-500 font-medium' : 'text-gray-400'
            )}
          >
            {vencido ? '! ' : ''}
            {format(new Date(fechaStr), 'd MMM', { locale: es })}
          </span>
        )}
      </div>
    </div>
  )
}
