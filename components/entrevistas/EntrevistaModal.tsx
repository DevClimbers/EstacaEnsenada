'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { TIPO_ENTREVISTA_LABELS } from '@/lib/types'
import type { Entrevista, TipoEntrevista } from '@/lib/types'

interface Perfil { id: string; nombre: string }
interface Unidad { id: string; nombre: string }

interface EntrevistaModalProps {
  open: boolean
  onClose: () => void
  perfiles: Perfil[]
  unidades: Unidad[]
  onCreated: (entrevista: Entrevista) => void
}

export function EntrevistaModal({
  open,
  onClose,
  perfiles,
  unidades,
  onCreated,
}: EntrevistaModalProps) {
  const [nombreMiembro, setNombreMiembro] = useState('')
  const [unidadId, setUnidadId] = useState('')
  const [tipo, setTipo] = useState<TipoEntrevista>('membresia')
  const [fechaAgendada, setFechaAgendada] = useState('')
  const [lugar, setLugar] = useState('')
  const [asignadoA, setAsignadoA] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() {
    setNombreMiembro('')
    setUnidadId('')
    setTipo('membresia')
    setFechaAgendada('')
    setLugar('')
    setAsignadoA('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombreMiembro.trim() || !tipo) return
    setLoading(true)

    const res = await fetch('/api/entrevistas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_miembro: nombreMiembro.trim(),
        unidad_id: unidadId || null,
        tipo,
        fecha_agendada: fechaAgendada || null,
        lugar: lugar.trim() || null,
        asignado_a: asignadoA || null,
      }),
    })

    if (!res.ok) {
      toast.error('Error al crear la entrevista')
      setLoading(false)
      return
    }

    const entrevista = await res.json()
    toast.success('Entrevista registrada')
    onCreated(entrevista)
    reset()
    onClose()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent showCloseButton className="max-w-md">
        <DialogTitle className="text-lg font-semibold text-gray-900">
          Nueva entrevista
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="nombre-miembro">Nombre del miembro *</Label>
            <Input
              id="nombre-miembro"
              value={nombreMiembro}
              onChange={(e) => setNombreMiembro(e.target.value)}
              placeholder="Nombre completo"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Unidad</Label>
              <Select value={unidadId} onValueChange={(v) => setUnidadId(v ?? '')} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin unidad" />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select
                value={tipo}
                onValueChange={(v) => setTipo((v ?? 'membresia') as TipoEntrevista)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(TIPO_ENTREVISTA_LABELS) as [TipoEntrevista, string][]).map(
                    ([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fecha-agendada">
                Fecha{' '}
                <span className="text-gray-400 text-xs">(opcional)</span>
              </Label>
              <Input
                id="fecha-agendada"
                type="datetime-local"
                value={fechaAgendada}
                onChange={(e) => setFechaAgendada(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lugar">Lugar</Label>
              <Input
                id="lugar"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                placeholder="Edificio, oficina…"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Asignado a</Label>
            <Select value={asignadoA} onValueChange={(v) => setAsignadoA(v ?? '')} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                {perfiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { reset(); onClose() }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#1B2A5E] hover:bg-[#243578] text-white"
              disabled={loading || !nombreMiembro.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Guardar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
