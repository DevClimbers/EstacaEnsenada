'use client'

import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/app/api/calendario/route'

const TIPO_STYLES: Record<CalendarEvent['tipo'], string> = {
  reunion:     'bg-[#1B2A5E] text-white',
  entrevista:  'bg-blue-500 text-white',
  compromiso:  'bg-amber-500 text-white',
  tarea:       'bg-emerald-500 text-white',
}

const TIPO_DOT: Record<CalendarEvent['tipo'], string> = {
  reunion:    'bg-[#1B2A5E]',
  entrevista: 'bg-blue-500',
  compromiso: 'bg-amber-500',
  tarea:      'bg-emerald-500',
}

interface EventPillProps {
  event: CalendarEvent
  compact?: boolean
  onClick?: () => void
}

export function EventPill({ event, compact = false, onClick }: EventPillProps) {
  if (compact) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onClick?.() }}
        className={cn(
          'w-full text-left truncate rounded px-1.5 py-0.5 text-[10px] leading-tight font-medium cursor-pointer hover:opacity-90 transition-opacity',
          TIPO_STYLES[event.tipo]
        )}
        title={event.titulo}
      >
        {event.hora ? `${event.hora} ` : ''}{event.titulo}
      </button>
    )
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
      className="w-full flex items-center gap-2 rounded-lg p-2.5 hover:bg-gray-50 transition-colors text-left group"
    >
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', TIPO_DOT[event.tipo])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{event.titulo}</p>
        {event.hora && (
          <p className="text-xs text-gray-500">{event.hora}</p>
        )}
      </div>
      <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 capitalize">
        {event.tipo}
      </span>
    </button>
  )
}
