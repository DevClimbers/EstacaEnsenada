'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, Plus, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { EntrevistaModal } from '@/components/entrevistas/EntrevistaModal'
import { TIPO_ENTREVISTA_LABELS } from '@/lib/types'
import type { Entrevista, EstadoEntrevista } from '@/lib/types'

const ESTADOS: { value: EstadoEntrevista | 'todos'; label: string }[] = [
  { value: 'todos',    label: 'Todas'     },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'agendada',  label: 'Agendada'  },
  { value: 'realizada', label: 'Realizada' },
  { value: 'cancelada', label: 'Cancelada' },
]

const estadoBadge: Record<EstadoEntrevista, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  agendada:  'bg-blue-100 text-blue-700',
  realizada: 'bg-green-100 text-green-700',
  cancelada: 'bg-gray-100 text-gray-500',
}

interface Perfil { id: string; nombre: string }
interface Unidad { id: string; nombre: string }

export default function EntrevistasPage() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([])
  const [perfiles, setPerfiles] = useState<Perfil[]>([])
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [filtroEstado, setFiltroEstado] = useState<EstadoEntrevista | 'todos'>('todos')
  const [filtroAsignado, setFiltroAsignado] = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filtroEstado !== 'todos') params.set('estado', filtroEstado)
    if (filtroAsignado !== 'todos') params.set('asignado_a', filtroAsignado)

    const [entRes, perfilesRes, unidadesRes] = await Promise.all([
      fetch(`/api/entrevistas?${params}`),
      perfiles.length === 0 ? fetch('/api/perfiles') : Promise.resolve(null),
      unidades.length === 0 ? fetch('/api/unidades') : Promise.resolve(null),
    ])

    if (entRes.ok) setEntrevistas(await entRes.json())
    if (perfilesRes?.ok) setPerfiles(await perfilesRes.json())
    if (unidadesRes?.ok) setUnidades(await unidadesRes.json())
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, filtroAsignado])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleEstadoChange(id: string, estado: EstadoEntrevista) {
    const prev = entrevistas
    setEntrevistas((e) => e.map((x) => (x.id === id ? { ...x, estado } : x)))

    const res = await fetch(`/api/entrevistas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })

    if (!res.ok) {
      setEntrevistas(prev)
      toast.error('Error al actualizar')
    }
  }

  function handleCreated(e: Entrevista) {
    setEntrevistas((prev) => [e, ...prev])
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Entrevistas</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 text-sm bg-[#1B2A5E] text-white px-4 py-2 rounded-lg hover:bg-[#243578] transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Nueva
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />

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
      ) : entrevistas.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">Sin entrevistas</p>
          <p className="text-sm mt-1">
            {filtroEstado !== 'todos' || filtroAsignado !== 'todos'
              ? 'Prueba con otros filtros'
              : 'Registra la primera entrevista'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entrevistas.map((e) => {
            const asignado = perfiles.find((p) => p.id === e.asignado_a)
            const unidad = unidades.find((u) => u.id === e.unidad_id)
            const fechaStr = e.fecha_agendada
              ? format(new Date(e.fecha_agendada), "d 'de' MMM, HH:mm", { locale: es })
              : null

            return (
              <div
                key={e.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
              >
                {/* Icono */}
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{e.nombre_miembro}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                    <span className="text-xs text-gray-500">
                      {TIPO_ENTREVISTA_LABELS[e.tipo]}
                    </span>
                    {unidad && (
                      <span className="text-xs text-gray-400">{unidad.nombre}</span>
                    )}
                    {asignado && (
                      <span className="text-xs text-gray-400">→ {asignado.nombre}</span>
                    )}
                    {fechaStr && (
                      <span className="text-xs text-[#1B2A5E] font-medium">
                        {fechaStr}
                      </span>
                    )}
                  </div>
                </div>

                {/* Estado */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline',
                      estadoBadge[e.estado]
                    )}
                  >
                    {ESTADOS.find((s) => s.value === e.estado)?.label ?? e.estado}
                  </span>
                  <select
                    value={e.estado}
                    onChange={(ev) =>
                      handleEstadoChange(e.id, ev.target.value as EstadoEntrevista)
                    }
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 text-gray-600 focus:outline-none focus:border-[#1B2A5E]"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="agendada">Agendada</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <EntrevistaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        perfiles={perfiles}
        unidades={unidades}
        onCreated={handleCreated}
      />
    </div>
  )
}
