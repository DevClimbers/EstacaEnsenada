'use client'

import '@blocknote/mantine/style.css'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import type { PartialBlock } from '@blocknote/core'
import { Plus, Save, AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CompromisosPanel } from './CompromisosPanel'
import { CompromisoModal } from '@/components/compromisos/CompromisoModal'
import { BLOCKNOTE_VERSION } from '@/lib/blocknote/template'
import { ESTADO_REUNION_LABELS } from '@/lib/types'
import type { Reunion, Compromiso, Perfil, EstadoReunion } from '@/lib/types'

interface AgendaEditorProps {
  reunion: Reunion
  compromisos: Compromiso[]
  perfiles: Perfil[]
}

const estadoColor: Record<EstadoReunion, string> = {
  borrador: 'bg-gray-100 text-gray-600',
  en_curso: 'bg-blue-100 text-blue-700',
  finalizada: 'bg-green-100 text-green-700',
}

export function AgendaEditor({ reunion, compromisos, perfiles }: AgendaEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [conflict, setConflict] = useState<{ updated_at_db: string } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [localCompromisos, setLocalCompromisos] = useState<Compromiso[]>(compromisos)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAgenda() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      const res = await fetch(`/api/reuniones/${reunion.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Agenda eliminada')
        router.push('/agendas')
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

  const localUpdatedAt = useRef<string>(reunion.updated_at)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const editor = useCreateBlockNote({
    initialContent: reunion.contenido
      ? (reunion.contenido as PartialBlock[])
      : undefined,
  })

  const save = useCallback(
    async (force = false) => {
      setSaving(true)
      const content = editor.document

      const res = await fetch(`/api/reuniones/${reunion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido: content,
          blocknote_version: BLOCKNOTE_VERSION,
          updated_at_client: force ? null : localUpdatedAt.current,
        }),
      })

      setSaving(false)

      if (res.status === 409) {
        const data = await res.json()
        setConflict(data)
        return
      }

      if (!res.ok) {
        toast.error('Error al guardar')
        return
      }

      const updated = await res.json()
      localUpdatedAt.current = updated.updated_at
      setSavedAt(new Date())
      if (force) {
        setConflict(null)
        toast.success('Sobrescrito y guardado')
      }
    },
    [editor, reunion.id]
  )

  // Autosave: debounce 2s tras cada cambio
  function handleChange() {
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => save(), 2000)
  }

  async function handleEstadoChange(estado: EstadoReunion) {
    const res = await fetch(`/api/reuniones/${reunion.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    if (res.ok) toast.success(`Estado: ${ESTADO_REUNION_LABELS[estado]}`)
    else toast.error('Error al cambiar estado')
  }

  return (
    <div className="flex h-full">
      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Barra de herramientas */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-gray-900 truncate max-w-xs">
              {reunion.titulo}
            </h1>
            {/* Selector de estado */}
            <select
              defaultValue={reunion.estado}
              onChange={(e) => handleEstadoChange(e.target.value as EstadoReunion)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full font-medium border-0 focus:outline-none cursor-pointer',
                estadoColor[reunion.estado]
              )}
            >
              {(Object.keys(ESTADO_REUNION_LABELS) as EstadoReunion[]).map((k) => (
                <option key={k} value={k}>
                  {ESTADO_REUNION_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {savedAt && !saving && (
              <span className="text-xs text-gray-400">
                Guardado {savedAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {saving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Save className="h-3 w-3 animate-pulse" /> Guardando…
              </span>
            )}

            {/* Eliminar agenda */}
            {confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-red-600">¿Eliminar agenda?</span>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                  No
                </button>
                <button
                  onClick={handleDeleteAgenda}
                  disabled={deleting}
                  className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50"
                >
                  {deleting ? '…' : 'Sí, eliminar'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleDeleteAgenda}
                title="Eliminar agenda"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 text-sm bg-[#1B2A5E] text-white px-3 py-1.5 rounded-lg hover:bg-[#243578] transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Compromiso
            </button>
          </div>
        </div>

        {/* Aviso de conflicto */}
        {conflict && (
          <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 border-b border-amber-200 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Otro usuario guardó cambios mientras editabas.</span>
            <button
              onClick={() => save(true)}
              className="ml-auto text-sm font-medium text-amber-900 underline underline-offset-2"
            >
              Sobrescribir con mis cambios
            </button>
            <button
              onClick={() => { setConflict(null); window.location.reload() }}
              className="text-sm font-medium text-amber-900 underline underline-offset-2"
            >
              Descartar mis cambios
            </button>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          <BlockNoteView
            editor={editor}
            onChange={handleChange}
            theme="light"
            className="min-h-full px-2"
          />
        </div>
      </div>

      {/* Panel de compromisos */}
      <CompromisosPanel
        reunionId={reunion.id}
        compromisos={localCompromisos}
        perfiles={perfiles}
      />

      {/* Modal rápido de compromiso desde barra */}
      <CompromisoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reunionId={reunion.id}
        perfiles={perfiles}
        onCreated={(c) => setLocalCompromisos((prev) => [...prev, c])}
      />
    </div>
  )
}
