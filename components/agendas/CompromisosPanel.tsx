'use client'

import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Plus, CheckSquare } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CompromisoModal } from '@/components/compromisos/CompromisoModal'
import type { Compromiso, Perfil, EstadoCompromiso } from '@/lib/types'
import { toast } from 'sonner'

const prioridadDot: Record<string, string> = {
  alta: 'bg-red-400',
  media: 'bg-yellow-400',
  baja: 'bg-green-400',
}

const estadoOpciones: { value: EstadoCompromiso; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
]

interface CompromisoPanelProps {
  reunionId: string
  compromisos: Compromiso[]
  setCompromisos: Dispatch<SetStateAction<Compromiso[]>>
  perfiles: Perfil[]
}

export function CompromisosPanel({
  reunionId,
  compromisos,
  setCompromisos,
  perfiles,
}: CompromisoPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const hoy = new Date().toISOString().split('T')[0]

  function handleCreated(nuevo: Compromiso) {
    // Realtime puede haberlo agregado ya: no duplicar
    setCompromisos((prev) => (prev.some((c) => c.id === nuevo.id) ? prev : [...prev, nuevo]))
  }

  async function handleEstadoChange(id: string, estado: EstadoCompromiso) {
    const prev = compromisos
    setCompromisos((c) =>
      c.map((x) => (x.id === id ? { ...x, estado } : x))
    )

    const res = await fetch(`/api/compromisos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })

    if (!res.ok) {
      setCompromisos(prev) // revertir
      toast.error('Error al actualizar')
    }
  }

  return (
    <aside className="w-72 flex-shrink-0 bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <CheckSquare className="h-4 w-4 text-[#C9A84C]" />
          Compromisos
          {compromisos.length > 0 && (
            <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-1.5">
              {compromisos.length}
            </span>
          )}
        </span>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 text-xs text-[#1B2A5E] hover:text-[#C9A84C] font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo
        </button>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {compromisos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckSquare className="h-6 w-6 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Sin compromisos aún</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 text-xs text-[#1B2A5E] hover:underline"
            >
              + Agregar compromiso
            </button>
          </div>
        ) : (
          compromisos.map((c) => {
            const vencido =
              c.fecha_limite &&
              c.fecha_limite < hoy &&
              c.estado !== 'completado'

            return (
              <div
                key={c.id}
                className={cn(
                  'bg-white rounded-lg border p-3 space-y-2',
                  c.estado === 'completado'
                    ? 'opacity-60 border-gray-100'
                    : 'border-gray-200'
                )}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      'mt-1 w-2 h-2 rounded-full flex-shrink-0',
                      prioridadDot[c.prioridad]
                    )}
                  />
                  <p
                    className={cn(
                      'text-sm text-gray-800 flex-1 leading-tight',
                      c.estado === 'completado' && 'line-through text-gray-400'
                    )}
                  >
                    {c.titulo}
                  </p>
                </div>

                {c.fecha_limite && (
                  <p
                    className={cn(
                      'text-xs pl-4',
                      vencido ? 'text-red-500 font-medium' : 'text-gray-400'
                    )}
                  >
                    {vencido ? '! ' : ''}
                    {format(new Date(c.fecha_limite + 'T00:00:00'), 'd MMM', {
                      locale: es,
                    })}
                  </p>
                )}

                {/* Selector de estado inline */}
                <select
                  value={c.estado}
                  onChange={(e) =>
                    handleEstadoChange(c.id, e.target.value as EstadoCompromiso)
                  }
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 text-gray-600 focus:outline-none focus:border-[#1B2A5E]"
                >
                  {estadoOpciones.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          })
        )}
      </div>

      {/* Modal */}
      <CompromisoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reunionId={reunionId}
        perfiles={perfiles}
        onCreated={handleCreated}
      />
    </aside>
  )
}
