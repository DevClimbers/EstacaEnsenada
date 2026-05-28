'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { KanbanItem } from '@/lib/kanban'
import { API_ENDPOINT } from '@/lib/kanban'

interface KanbanCardDetailProps {
  item: KanbanItem | null
  onClose: () => void
  onDeleted: (id: string) => void
  onDescripcionSaved: (id: string, descripcion: string | null) => void
}

const TIPO_LABEL: Record<string, string> = {
  compromiso: 'Compromiso',
  tarea: 'Tarea',
  entrevista: 'Entrevista',
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  agendada: 'Agendada',
  completado: 'Completado',
  completada: 'Completada',
  realizada: 'Realizada',
  cancelado: 'Cancelado',
  cancelada: 'Cancelada',
}

const PRIORIDAD_COLOR: Record<string, string> = {
  alta: '#C24130',
  media: '#C9A84C',
  baja: '#1E6B3A',
}

/** Campo DB que se usa como notas según el tipo */
function notasField(tipo: string): string {
  return tipo === 'entrevista' ? 'notas' : 'descripcion'
}

export function KanbanCardDetail({
  item,
  onClose,
  onDeleted,
  onDescripcionSaved,
}: KanbanCardDetailProps) {
  const [notas, setNotas] = useState('')
  const [savingNotas, setSavingNotas] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const prevId = useRef<string | null>(null)

  // Reset cuando cambia el item
  useEffect(() => {
    if (!item || item.id === prevId.current) return
    prevId.current = item.id
    setConfirmDelete(false)
    setNotas(item.descripcion ?? '')
  }, [item?.id, item?.descripcion])

  async function saveNotas() {
    if (!item) return
    const val = notas.trim() || null
    // No persistir si no cambió
    if ((val ?? '') === (item.descripcion ?? '')) return

    setSavingNotas(true)
    try {
      const res = await fetch(`${API_ENDPOINT[item.tipo]}/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [notasField(item.tipo)]: val }),
      })
      if (res.ok) {
        onDescripcionSaved(item.id, val)
      } else {
        toast.error('Error al guardar las notas')
      }
    } catch {
      toast.error('Error de red')
    } finally {
      setSavingNotas(false)
    }
  }

  async function handleDelete() {
    if (!item) return
    if (!confirmDelete) { setConfirmDelete(true); return }

    setDeleting(true)
    try {
      const res = await fetch(`${API_ENDPOINT[item.tipo]}/${item.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Eliminado correctamente')
        onDeleted(item.id)
        onClose()
      } else {
        toast.error('Error al eliminar')
        setDeleting(false)
      }
    } catch {
      toast.error('Error de red')
      setDeleting(false)
    }
  }

  const fechaStr = (() => {
    if (!item?.fecha) return null
    try {
      const iso = item.fecha.length > 10 ? item.fecha : item.fecha + 'T00:00:00'
      return format(new Date(iso), "d 'de' MMMM yyyy", { locale: es })
    } catch { return item.fecha }
  })()

  return (
    <Dialog
      open={!!item}
      onOpenChange={(open) => {
        if (!open) {
          setConfirmDelete(false)
          onClose()
        }
      }}
    >
      <DialogContent showCloseButton className="max-w-md">
        {item && (
          <>
            <DialogTitle
              style={{
                fontSize: 16, fontWeight: 700, color: '#0E1018',
                letterSpacing: '-0.01em', lineHeight: 1.35, paddingRight: 28,
              }}
            >
              {item.titulo}
            </DialogTitle>

            {/* Badges de meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 9px',
                borderRadius: 999, background: '#EEF1F8', color: '#1B2A5E',
              }}>
                {TIPO_LABEL[item.tipo] ?? item.tipo}
              </span>
              <span style={{
                fontSize: 11, padding: '2px 9px',
                borderRadius: 999, background: '#F2F1EC', color: '#6F6E66',
              }}>
                {ESTADO_LABEL[item.estado] ?? item.estado}
              </span>
              {item.prioridad && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 9px',
                  borderRadius: 999, background: '#F2F1EC',
                  color: PRIORIDAD_COLOR[item.prioridad] ?? '#9C9A91',
                }}>
                  {item.prioridad.charAt(0).toUpperCase() + item.prioridad.slice(1)}
                </span>
              )}
            </div>

            {/* Info secundaria */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 }}>
              {item.asignadoNombre && (
                <div style={{ fontSize: 12.5, color: '#6F6E66' }}>
                  Asignado a:{' '}
                  <span style={{ fontWeight: 600, color: '#0E1018' }}>{item.asignadoNombre}</span>
                </div>
              )}
              {fechaStr && (
                <div style={{ fontSize: 12.5, color: '#6F6E66' }}>
                  {item.tipo === 'entrevista' ? 'Fecha agendada' : 'Fecha límite'}:{' '}
                  <span style={{ fontWeight: 600, color: '#0E1018' }}>{fechaStr}</span>
                </div>
              )}
              {item.subtitulo && (
                <div style={{ fontSize: 12.5, color: '#9C9A91' }}>{item.subtitulo}</div>
              )}
            </div>

            {/* Campo de notas */}
            <div style={{ marginTop: 8 }}>
              <div style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.11em',
                textTransform: 'uppercase', color: '#9C9A91', marginBottom: 6,
              }}>
                Notas / Comentarios
              </div>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                onBlur={saveNotas}
                placeholder="Agrega notas o comentarios sobre esta tarjeta…"
                rows={4}
                style={{
                  width: '100%', padding: '8px 10px', fontSize: 13,
                  borderRadius: 8, border: '1px solid #EAE6D7',
                  background: '#FAF8F2', color: '#0E1018',
                  resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  lineHeight: 1.55,
                }}
              />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginTop: 4, fontSize: 10.5, color: '#B0ADA4',
              }}>
                {savingNotas
                  ? <><Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> Guardando…</>
                  : <><Save size={10} /> Se guardan al salir del campo</>
                }
              </div>
            </div>

            {/* Footer: eliminar */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
              gap: 8, marginTop: 4, paddingTop: 12,
              borderTop: '1px solid #EAE6D7',
            }}>
              {confirmDelete ? (
                <>
                  <span style={{ fontSize: 12.5, color: '#C24130', flex: 1 }}>
                    ¿Eliminar permanentemente?
                  </span>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    style={{
                      fontSize: 12, padding: '4px 10px', borderRadius: 6,
                      border: '1px solid #EAE6D7', background: '#fff',
                      color: '#6F6E66', cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: '4px 12px',
                      borderRadius: 6, background: '#C24130', color: '#fff',
                      border: 'none', cursor: deleting ? 'not-allowed' : 'pointer',
                      opacity: deleting ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    {deleting
                      ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Eliminando…</>
                      : 'Sí, eliminar'
                    }
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDelete}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12.5, color: '#C24130',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '4px 8px', borderRadius: 6,
                  }}
                >
                  <Trash2 size={13} />
                  Eliminar
                </button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
