'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KanbanCardView } from './KanbanCardView'
import type { KanbanItem } from '@/lib/kanban'

interface KanbanCardProps {
  item: KanbanItem
  onOpen?: (item: KanbanItem) => void
}

export function KanbanCard({ item, onOpen }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { tipo: item.tipo, columna: item.columna, item },
  })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex rounded-lg overflow-hidden', isDragging && 'opacity-30')}
    >
      {/* ── Grip de arrastre (izquierda) ── */}
      <div
        {...listeners}
        {...attributes}
        className="flex-shrink-0 w-5 flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-grab active:cursor-grabbing touch-none border border-r-0 border-gray-200 rounded-l-lg"
        title="Arrastrar"
      >
        <GripVertical className="h-3 w-3 text-gray-300" />
      </div>

      {/* ── Cuerpo clicable (derecha) ── */}
      <div
        className="flex-1 min-w-0 cursor-pointer border border-gray-200 rounded-r-lg hover:border-[#1B2A5E] transition-colors"
        onClick={() => onOpen?.(item)}
      >
        <KanbanCardView item={item} />
      </div>
    </div>
  )
}
