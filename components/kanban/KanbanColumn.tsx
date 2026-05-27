'use client'

import { useDroppable } from '@dnd-kit/core'
import { Clock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KanbanCard } from './KanbanCard'
import type { KanbanItem, KanbanColumna, KanbanColumnaConfig } from '@/lib/kanban'

const ICONS = { Clock, ArrowRight, CheckCircle2, XCircle }

const iconColor: Record<KanbanColumna, string> = {
  pendiente:  'text-gray-400',
  progreso:   'text-blue-500',
  completado: 'text-green-500',
  cancelado:  'text-gray-300',
}

interface KanbanColumnProps {
  id: KanbanColumna
  label: string
  icon: KanbanColumnaConfig['icon']
  items: KanbanItem[]
}

export function KanbanColumn({ id, label, icon, items }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const Icon = ICONS[icon]

  return (
    <div className="flex flex-col w-72 flex-shrink-0 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 py-2 mb-1">
        <Icon className={cn('h-4 w-4 flex-shrink-0', iconColor[id])} />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-[11px] bg-gray-200 text-gray-500 rounded-full px-1.5 py-0.5 ml-auto">
          {items.length}
        </span>
      </div>

      {/* Zona de drop */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-xl p-2 space-y-2 overflow-y-auto transition-colors',
          isOver ? 'bg-blue-50 ring-2 ring-blue-200 ring-inset' : 'bg-gray-100/80'
        )}
      >
        {items.map((item) => (
          <KanbanCard key={item.id} item={item} />
        ))}

        {items.length === 0 && (
          <div
            className={cn(
              'text-center py-8 rounded-lg text-xs',
              isOver ? 'text-blue-400' : 'text-gray-300'
            )}
          >
            {isOver ? 'Suelta aquí' : 'Sin elementos'}
          </div>
        )}
      </div>
    </div>
  )
}
