'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface NuevaReunionModalProps {
  open: boolean
  defaultFecha?: string  // YYYY-MM-DD
  onClose: () => void
  onCreated?: () => void
}

export function NuevaReunionModal({
  open,
  defaultFecha,
  onClose,
  onCreated,
}: NuevaReunionModalProps) {
  const router = useRouter()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [titulo, setTitulo] = useState('Reunión de Presidencia')
  const [fecha, setFecha] = useState(defaultFecha ?? today)
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() {
    setTitulo('Reunión de Presidencia')
    setFecha(defaultFecha ?? today)
    setHoraInicio('')
    setHoraFin('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !fecha) return
    setLoading(true)

    try {
      const res = await fetch('/api/reuniones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          fecha,
          hora_inicio: horaInicio || null,
          hora_fin: horaFin || null,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body?.error ?? 'Error al crear la reunión')
        setLoading(false)
        return
      }

      const reunion = await res.json()
      toast.success('Reunión creada')
      onCreated?.()
      onClose()
      reset()
      setLoading(false)
      router.push(`/agendas/${reunion.id}`)
      router.refresh()
    } catch {
      toast.error('Error de red al crear la reunión')
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) { reset(); onClose() }
      }}
    >
      <DialogContent showCloseButton className="max-w-md">
        <DialogTitle className="text-lg font-semibold text-gray-900">
          Nueva reunión
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="nr-titulo">Título *</Label>
            <Input
              id="nr-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Reunión de Presidencia"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nr-fecha">Fecha *</Label>
            <Input
              id="nr-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nr-hora-inicio">
                Hora inicio{' '}
                <span className="text-xs text-gray-400">(opcional)</span>
              </Label>
              <Input
                id="nr-hora-inicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nr-hora-fin">
                Hora fin{' '}
                <span className="text-xs text-gray-400">(opcional)</span>
              </Label>
              <Input
                id="nr-hora-fin"
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                disabled={loading}
              />
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
              disabled={loading || !titulo.trim() || !fecha}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Crear reunión'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
