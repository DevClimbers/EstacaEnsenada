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
import type { Tarea, Prioridad } from '@/lib/types'

interface Perfil { id: string; nombre: string }

interface TareaModalProps {
  open: boolean
  onClose: () => void
  perfiles: Perfil[]
  onCreated: (tarea: Tarea) => void
}

export function TareaModal({ open, onClose, perfiles, onCreated }: TareaModalProps) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [asignadoA, setAsignadoA] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [prioridad, setPrioridad] = useState<Prioridad>('media')
  const [loading, setLoading] = useState(false)

  function reset() {
    setTitulo('')
    setDescripcion('')
    setAsignadoA('')
    setFechaLimite('')
    setPrioridad('media')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    setLoading(true)

    const res = await fetch('/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        asignado_a: asignadoA || null,
        fecha_limite: fechaLimite || null,
        prioridad,
      }),
    })

    if (!res.ok) {
      toast.error('Error al crear la tarea')
      setLoading(false)
      return
    }

    const tarea = await res.json()
    toast.success('Tarea creada')
    onCreated(tarea)
    reset()
    onClose()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent showCloseButton className="max-w-md">
        <DialogTitle className="text-lg font-semibold text-gray-900">
          Nueva tarea
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="titulo-t">Título *</Label>
            <Input
              id="titulo-t"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Descripción de la tarea"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcion-t">
              Descripción{' '}
              <span className="text-gray-400 text-xs">(opcional)</span>
            </Label>
            <Input
              id="descripcion-t"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles adicionales"
              disabled={loading}
            />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fecha-limite-t">Fecha límite</Label>
              <Input
                id="fecha-limite-t"
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <Select
                value={prioridad}
                onValueChange={(v) => setPrioridad((v ?? 'media') as Prioridad)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              disabled={loading || !titulo.trim()}
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
