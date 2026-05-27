'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { KanbanCardView } from './KanbanCardView'
import type { KanbanItem } from '@/lib/kanban'

interface KanbanCardProps {
  item: KanbanItem
}

export function KanbanCard({ item }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { tipo: item.tipo, columna: item.columna, item },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing touch-none',
        isDragging && 'opacity-30'
      )}
    >
      <KanbanCardView item={item} />
    </div>
  )
}
