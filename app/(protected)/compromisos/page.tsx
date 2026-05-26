'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckSquare, Plus, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { CompromisoModal } from '@/components/compromisos/CompromisoModal'
import type { Compromiso, Perfil, EstadoCompromiso, Prioridad } from '@/lib/types'

const ESTADOS: { value: EstadoCompromiso | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const prioridadDot: Record<Prioridad, string> = {
  alta: 'bg-red-400',
  media: 'bg-yellow-400',
  baja: 'bg-green-400',
}

const estadoBadge: Record<EstadoCompromiso, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  en_progreso: 'bg-blue-100 text-blue-700',
  completado: 'bg-green-100 text-green-700',
  cancelado: 'bg-gray-100 text-gray-500',
}

export default function CompromisosPage() {
  const [compromisos, setCompromisos] = useState<Compromiso[]>([])
  const [perfiles, setPerfiles] = useState<Perfil[]>([])
  const [filtroEstado, setFiltroEstado] = useState<EstadoCompromiso | 'todos'>('todos')
  const [filtroAsignado, setFiltroAsignado] = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const hoy = new Date().toISOString().split('T')[0]

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filtroEstado !== 'todos') params.set('estado', filtroEstado)
    if (filtroAsignado !== 'todos') params.set('asignado_a', filtroAsignado)

    const [compRes, perfilesRes] = await Promise.all([
      fetch(`/api/compromisos?${params}`),
      fetch('/api/perfiles'),
    ])

    if (compRes.ok) {
      const data = await compRes.json()
      setCompromisos(data)
    }
    if (perfilesRes.ok) {
      const data = await perfilesRes.json()
      setPerfiles(data)
    }
    setLoading(false)
  }, [filtroEstado, filtroAsignado])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleEstadoChange(id: string, estado: EstadoCompromiso) {
    const prev = compromisos
    setCompromisos((c) => c.map((x) => (x.id === id ? { ...x, estado } : x)))

    const res = await fetch(`/api/compromisos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })

    if (!res.ok) {
      setCompromisos(prev)
      toast.error('Error al actualizar')
    }
  }

  function handleCreated(c: Compromiso) {
    setCompromisos((prev) => [c, ...prev])
  }

  const pendientes = compromisos.filter(
    (c) => c.fecha_limite && c.fecha_limite < hoy && c.estado !== 'completado'
  ).length

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compromisos</h1>
          {pendientes > 0 && (
            <p className="text-sm text-red-500 mt-0.5 font-medium">
              ⚠ {pendientes} vencido{pendientes > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 text-sm bg-[#1B2A5E] text-white px-4 py-2 rounded-lg hover:bg-[#243578] transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Nuevo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />

        {/* Filtro por estado */}
        <div className="flex gap-1.5 flex-wrap">
          {ESTADOS.map((e) => (
            <button
              key={e.value}
              onClick={() => setFiltroEstado(e.value)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full font-medium transition-colors border',
                filtroEstado === e.value
                  ? 'bg-[#1B2A5E] text-white border-[#1B2A5E]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B2A5E]'
              )}
            >
              {e.label}
            </button>
          ))}
        </div>

        {/* Filtro por persona */}
        {perfiles.length > 0 && (
          <select
            value={filtroAsignado}
            onChange={(e) => setFiltroAsignado(e.target.value)}
            className="text-xs border border-gray-200 rounded-full px-3 py-1.5 bg-white text-gray-600 focus:outline-none focus:border-[#1B2A5E]"
          >
            <option value="todos">Todos los miembros</option>
            {perfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : compromisos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CheckSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">Sin compromisos</p>
          <p className="text-sm mt-1">
            {filtroEstado !== 'todos' || filtroAsignado !== 'todos'
              ? 'Prueba con otros filtros'
              : 'Los compromisos aparecen aquí'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {compromisos.map((c) => {
            const vencido =
              c.fecha_limite && c.fecha_limite < hoy && c.estado !== 'completado'
            const asignado = perfiles.find((p) => p.id === c.asignado_a)

            return (
              <div
                key={c.id}
                className={cn(
                  'bg-white rounded-xl border p-4 flex items-start gap-4',
                  c.estado === 'completado' ? 'opacity-60 border-gray-100' : 'border-gray-200'
                )}
              >
                {/* Punto de prioridad */}
                <span
                  className={cn(
                    'mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0',
                    prioridadDot[c.prioridad]
                  )}
                />

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'font-medium text-gray-900',
                      c.estado === 'completado' && 'line-through text-gray-400'
                    )}
                  >
                    {c.titulo}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    {asignado && (
                      <span className="text-xs text-gray-500">{asignado.nombre}</span>
                    )}
                    {c.fecha_limite && (
                      <span
                        className={cn(
                          'text-xs font-medium',
                          vencido ? 'text-red-500' : 'text-gray-400'
                        )}
                      >
                        {vencido ? '⚠ ' : ''}
                        {format(new Date(c.fecha_limite + 'T00:00:00'), 'd MMM yyyy', {
                          locale: es,
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Selector de estado */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline', estadoBadge[c.estado])}>
                    {c.estado.replace('_', ' ')}
                  </span>
                  <select
                    value={c.estado}
                    onChange={(e) =>
                      handleEstadoChange(c.id, e.target.value as EstadoCompromiso)
                    }
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 text-gray-600 focus:outline-none focus:border-[#1B2A5E]"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En progreso</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <CompromisoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reunionId={null}
        perfiles={perfiles}
        onCreated={handleCreated}
      />
    </div>
  )
}
