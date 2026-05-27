'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { Plus, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCardView } from './KanbanCardView'
import {
  COLUMNAS,
  estadoToColumna,
  columnaToEstado,
  API_ENDPOINT,
  type KanbanItem,
  type KanbanColumna,
  type KanbanTipo,
} from '@/lib/kanban'
import { EntrevistaModal } from '@/components/entrevistas/EntrevistaModal'
import { TareaModal } from '@/components/tareas/TareaModal'
import { CompromisoModal } from '@/components/compromisos/CompromisoModal'
import type { Entrevista, Tarea, Compromiso } from '@/lib/types'
import { TIPO_ENTREVISTA_LABELS } from '@/lib/types'

interface Perfil { id: string; nombre: string }
interface Unidad { id: string; nombre: string }

interface KanbanBoardProps {
  items: KanbanItem[]
  perfiles: Perfil[]
  unidades: Unidad[]
}

// Collision detection personalizado: pointer primero, después rect
function customCollision(args: Parameters<typeof pointerWithin>[0]) {
  const pointer = pointerWithin(args)
  if (pointer.length > 0) return pointer
  return rectIntersection(args)
}

export function KanbanBoard({ items: initialItems, perfiles, unidades }: KanbanBoardProps) {
  const [items, setItems] = useState<KanbanItem[]>(initialItems)
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<KanbanTipo | 'todos'>('todos')
  const [filtroAsignado, setFiltroAsignado] = useState<string>('todos')
  const [modalEntrevista, setModalEntrevista] = useState(false)
  const [modalTarea, setModalTarea] = useState(false)
  const [modalCompromiso, setModalCompromiso] = useState(false)

  const filtered = items.filter((i) => {
    if (filtroTipo !== 'todos' && i.tipo !== filtroTipo) return false
    if (filtroAsignado !== 'todos' && i.asignado_a !== filtroAsignado) return false
    return true
  })

  function handleDragStart({ active }: DragStartEvent) {
    const item = items.find((i) => i.id === active.id)
    setActiveItem(item ?? null)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveItem(null)
    if (!over) return

    const item = items.find((i) => i.id === active.id)
    if (!item) return

    const targetColumna = over.id as KanbanColumna
    if (item.columna === targetColumna) return

    const nuevoEstado = columnaToEstado(targetColumna, item.tipo)

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, columna: targetColumna, estado: nuevoEstado } : i
      )
    )

    // Persist
    fetch(`${API_ENDPOINT[item.tipo]}/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    }).then((res) => {
      if (!res.ok) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, columna: item.columna, estado: item.estado } : i
          )
        )
        toast.error('Error al mover la tarjeta')
      }
    })
  }

  // Helpers para convertir respuestas de API → KanbanItem
  function entrevistaToItem(e: Entrevista): KanbanItem {
    return {
      id: e.id,
      tipo: 'entrevista',
      titulo: e.nombre_miembro,
      estado: e.estado,
      columna: estadoToColumna(e.estado),
      kanban_orden: e.kanban_orden,
      asignado_a: e.asignado_a,
      asignadoNombre: perfiles.find((p) => p.id === e.asignado_a)?.nombre ?? null,
      fecha: e.fecha_agendada,
      subtitulo: TIPO_ENTREVISTA_LABELS[e.tipo],
    }
  }

  function tareaToItem(t: Tarea): KanbanItem {
    return {
      id: t.id,
      tipo: 'tarea',
      titulo: t.titulo,
      estado: t.estado,
      columna: estadoToColumna(t.estado),
      kanban_orden: t.kanban_orden,
      prioridad: t.prioridad,
      asignado_a: t.asignado_a,
      asignadoNombre: perfiles.find((p) => p.id === t.asignado_a)?.nombre ?? null,
      fecha: t.fecha_limite,
    }
  }

  function compromisoToItem(c: Compromiso): KanbanItem {
    return {
      id: c.id,
      tipo: 'compromiso',
      titulo: c.titulo,
      estado: c.estado,
      columna: estadoToColumna(c.estado),
      kanban_orden: c.kanban_orden,
      prioridad: c.prioridad,
      asignado_a: c.asignado_a,
      asignadoNombre: perfiles.find((p) => p.id === c.asignado_a)?.nombre ?? null,
      fecha: c.fecha_limite,
    }
  }

  return (
    <DndContext
      collisionDetection={customCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0 gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            {/* Filtro tipo */}
            <div className="flex gap-1.5 flex-wrap">
              {([
                { v: 'todos', l: 'Todos' },
                { v: 'compromiso', l: 'Compromisos' },
                { v: 'tarea', l: 'Tareas' },
                { v: 'entrevista', l: 'Entrevistas' },
              ] as const).map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setFiltroTipo(v)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium transition-colors border',
                    filtroTipo === v
                      ? 'bg-[#1B2A5E] text-white border-[#1B2A5E]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B2A5E]'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            {/* Filtro asignado */}
            {perfiles.length > 0 && (
              <select
                value={filtroAsignado}
                onChange={(e) => setFiltroAsignado(e.target.value)}
                className="text-xs border border-gray-200 rounded-full px-2.5 py-1 bg-white text-gray-600 focus:outline-none focus:border-[#1B2A5E]"
              >
                <option value="todos">Todos</option>
                {perfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Botones de creación */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setModalCompromiso(true)}
              className="flex items-center gap-1 text-xs border border-green-300 text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-50 font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Compromiso
            </button>
            <button
              onClick={() => setModalTarea(true)}
              className="flex items-center gap-1 text-xs border border-yellow-300 text-yellow-700 px-2.5 py-1.5 rounded-lg hover:bg-yellow-50 font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Tarea
            </button>
            <button
              onClick={() => setModalEntrevista(true)}
              className="flex items-center gap-1 text-xs border border-purple-300 text-purple-700 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Entrevista
            </button>
          </div>
        </div>

        {/* Tablero — scroll horizontal */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-6 h-full" style={{ minWidth: 'max-content' }}>
            {COLUMNAS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                emoji={col.emoji}
                items={filtered.filter((i) => i.columna === col.id)}
              />
            ))}
          </div>
        </div>

        {/* DragOverlay — render visual sin hooks de draggable */}
        <DragOverlay>
          {activeItem ? <KanbanCardView item={activeItem} shadow /> : null}
        </DragOverlay>
      </div>

      {/* Modals */}
      <EntrevistaModal
        open={modalEntrevista}
        onClose={() => setModalEntrevista(false)}
        perfiles={perfiles}
        unidades={unidades}
        onCreated={(e) => setItems((prev) => [entrevistaToItem(e), ...prev])}
      />
      <TareaModal
        open={modalTarea}
        onClose={() => setModalTarea(false)}
        perfiles={perfiles}
        onCreated={(t) => setItems((prev) => [tareaToItem(t), ...prev])}
      />
      <CompromisoModal
        open={modalCompromiso}
        onClose={() => setModalCompromiso(false)}
        reunionId={null}
        perfiles={perfiles}
        onCreated={(c) => setItems((prev) => [compromisoToItem(c), ...prev])}
      />
    </DndContext>
  )
}
