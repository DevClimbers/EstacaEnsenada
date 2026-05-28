'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Reunion, EstadoReunion } from '@/lib/types'

const estadoConfig: Record<EstadoReunion, { label: string; className: string }> = {
  borrador:   { label: 'Borrador',   className: 'bg-gray-100 text-gray-600'   },
  en_curso:   { label: 'En curso',   className: 'bg-blue-100 text-blue-700'   },
  finalizada: { label: 'Finalizada', className: 'bg-green-100 text-green-700' },
}

interface AgendaCardProps {
  reunion: Reunion
}

export function AgendaCard({ reunion }: AgendaCardProps) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const config = estadoConfig[reunion.estado]

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm) {
      setConfirm(true)
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/reuniones/${reunion.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Agenda eliminada')
        router.refresh()
      } else {
        toast.error('Error al eliminar la agenda')
        setDeleting(false)
      }
    } catch {
      toast.error('Error de red')
      setDeleting(false)
    }
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setConfirm(false)
  }

  return (
    <div className="relative group">
      <Link
        href={`/agendas/${reunion.id}`}
        className={cn(
          'block bg-white rounded-xl border border-gray-200 p-5',
          'hover:border-[#1B2A5E] hover:shadow-sm transition-all',
          confirm && 'rounded-b-none border-b-0'
        )}
      >
        <div className="flex items-start justify-between gap-3 pr-8">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 group-hover:text-[#1B2A5E] truncate">
              {reunion.titulo}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {format(
                new Date(reunion.fecha + 'T00:00:00'),
                "EEEE d 'de' MMMM 'de' yyyy",
                { locale: es }
              )}
              {reunion.hora_inicio && (
                <span className="ml-1">· {reunion.hora_inicio.slice(0, 5)}</span>
              )}
            </p>
          </div>
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0', config.className)}>
            {config.label}
          </span>
        </div>
      </Link>

      {/* Botón eliminar (visible en hover) */}
      {!confirm && (
        <button
          onClick={handleDelete}
          title="Eliminar agenda"
          className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Franja de confirmación */}
      {confirm && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-b-xl border border-t-0 border-red-200">
          <span className="text-xs text-red-700 flex-1">
            ¿Eliminar esta agenda permanentemente?
          </span>
          <button
            onClick={handleCancelDelete}
            className="text-xs text-gray-600 px-2.5 py-1 rounded-md hover:bg-white border border-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-md font-medium disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      )}
    </div>
  )
}
