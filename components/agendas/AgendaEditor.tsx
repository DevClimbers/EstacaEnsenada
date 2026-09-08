'use client'

import '@blocknote/mantine/style.css'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import * as Y from 'yjs'
import { Awareness } from 'y-protocols/awareness'
import { Plus, Save, Trash2, ArrowLeft, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CompromisosPanel } from './CompromisosPanel'
import { CompromisoModal } from '@/components/compromisos/CompromisoModal'
import { BLOCKNOTE_VERSION } from '@/lib/blocknote/template'
import { crearUploadFile } from '@/lib/blocknote/upload'
import { createClient } from '@/lib/supabase/client'
import { SupabaseYjsProvider } from '@/lib/yjs/supabase-provider'
import { fromBase64, toBase64 } from '@/lib/yjs/codec'
import { colorDeUsuario } from '@/lib/yjs/colores'
import { useCompromisosEnVivo } from '@/lib/yjs/useCompromisosEnVivo'
import { ESTADO_REUNION_LABELS } from '@/lib/types'
import type { Reunion, Compromiso, Perfil, EstadoReunion } from '@/lib/types'

/** Debe coincidir con FRAGMENTO_AGENDA en lib/yjs/server.ts */
const FRAGMENTO_AGENDA = 'agenda'

interface AgendaEditorProps {
  reunion: Reunion
  compromisos: Compromiso[]
  perfiles: Perfil[]
  usuario: { id: string; nombre: string }
}

interface Colaborador {
  clientId: number
  name: string
  color: string
}

const estadoColor: Record<EstadoReunion, string> = {
  borrador: 'bg-gray-100 text-gray-600',
  en_curso: 'bg-blue-100 text-blue-700',
  finalizada: 'bg-green-100 text-green-700',
}

export function AgendaEditor({ reunion, compromisos, perfiles, usuario }: AgendaEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [localCompromisos, setLocalCompromisos] = useCompromisosEnVivo(reunion.id, compromisos)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [conectado, setConectado] = useState(false)
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])

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

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const dirty = useRef(false)

  // Documento colaborativo (Yjs). Se crea una sola vez con el estado guardado
  // en la BD; a partir de ahí los cambios se sincronizan entre navegadores.
  const [{ doc, awareness, fragment }] = useState(() => {
    const doc = new Y.Doc()
    if (reunion.contenido_yjs) Y.applyUpdate(doc, fromBase64(reunion.contenido_yjs), 'db')
    return { doc, awareness: new Awareness(doc), fragment: doc.getXmlFragment(FRAGMENTO_AGENDA) }
  })

  const editor = useCreateBlockNote({
    collaboration: {
      fragment,
      provider: { awareness },
      user: { name: usuario.nombre, color: colorDeUsuario(usuario.id) },
      showCursorLabels: 'activity',
    },
    // Habilita la pestaña "Subir" en el bloque de imagen y el pegado/arrastre
    // de archivos. Sube a Supabase Storage y guarda la URL pública en la agenda.
    uploadFile: async (file: File) => {
      try {
        return await crearUploadFile(reunion.id)(file)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'No se pudo subir la imagen')
        throw err
      }
    },
  })

  const save = useCallback(async () => {
    dirty.current = false
    setSaving(true)
    const res = await fetch(`/api/reuniones/${reunion.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        yjs: toBase64(Y.encodeStateAsUpdate(doc)),
        blocknote_version: BLOCKNOTE_VERSION,
      }),
    })
    setSaving(false)

    if (!res.ok) {
      dirty.current = true
      toast.error('Error al guardar')
      return
    }
    setSavedAt(new Date())
  }, [doc, reunion.id])

  // Conexión en vivo + autosave. El provider se crea en un efecto (y se
  // destruye al desmontar) para no dejar canales abiertos.
  useEffect(() => {
    const supabase = createClient()
    const provider = new SupabaseYjsProvider(supabase, reunion.id, doc, awareness)
    const offEstado = provider.onEstado((e) => setConectado(e === 'conectado'))

    // Autosave: 2 s después del último cambio LOCAL (los cambios remotos los
    // guarda quien los hizo; el servidor fusiona todo de todas formas).
    const onUpdate = (_u: Uint8Array, origin: unknown) => {
      if (origin === provider || origin === 'db') return
      dirty.current = true
      clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => void save(), 2000)
    }
    doc.on('update', onUpdate)

    // Quiénes están en la agenda ahora mismo
    const onAwareness = () => {
      const otros: Colaborador[] = []
      awareness.getStates().forEach((state, clientId) => {
        if (clientId === doc.clientID || !state?.user) return
        otros.push({ clientId, name: state.user.name, color: state.user.color })
      })
      setColaboradores(otros)
    }
    awareness.on('change', onAwareness)

    // Si cierran la pestaña con cambios sin guardar, mandar un último guardado
    const onPageHide = () => {
      if (!dirty.current) return
      clearTimeout(saveTimeout.current)
      void fetch(`/api/reuniones/${reunion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          yjs: toBase64(Y.encodeStateAsUpdate(doc)),
          blocknote_version: BLOCKNOTE_VERSION,
        }),
      })
    }
    window.addEventListener('pagehide', onPageHide)

    return () => {
      window.removeEventListener('pagehide', onPageHide)
      awareness.off('change', onAwareness)
      doc.off('update', onUpdate)
      offEstado()
      clearTimeout(saveTimeout.current)
      onPageHide()
      provider.destroy()
    }
  }, [doc, awareness, reunion.id, save])

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
            <Link
              href="/agendas"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0"
              title="Volver a agendas"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Atrás</span>
            </Link>
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
            {/* Presencia: quién más está en la agenda */}
            {colaboradores.length > 0 && (
              <div className="flex items-center -space-x-1.5 mr-1" title={colaboradores.map((c) => c.name).join(', ')}>
                {colaboradores.slice(0, 4).map((c) => (
                  <span
                    key={c.clientId}
                    className="h-6 w-6 rounded-full ring-2 ring-white text-[10px] font-semibold text-white flex items-center justify-center"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.name.trim().charAt(0).toUpperCase() || '?'}
                  </span>
                ))}
                {colaboradores.length > 4 && (
                  <span className="text-xs text-gray-500 pl-2">+{colaboradores.length - 4}</span>
                )}
              </div>
            )}
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                conectado ? 'text-green-600' : 'text-gray-400'
              )}
              title={conectado ? 'Sincronización en vivo activa' : 'Sin conexión en vivo: los cambios se guardan y se fusionan al reconectar'}
            >
              {conectado ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              <span className="hidden md:inline">{conectado ? 'En vivo' : 'Sin conexión'}</span>
            </span>
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

        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          <BlockNoteView
            editor={editor}
            theme="light"
            className="min-h-full px-2"
          />
        </div>
      </div>

      {/* Panel de compromisos */}
      <CompromisosPanel
        reunionId={reunion.id}
        compromisos={localCompromisos}
        setCompromisos={setLocalCompromisos}
        perfiles={perfiles}
      />

      {/* Modal rápido de compromiso desde barra */}
      <CompromisoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reunionId={reunion.id}
        perfiles={perfiles}
        onCreated={(c) =>
          setLocalCompromisos((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c]))
        }
      />
    </div>
  )
}
