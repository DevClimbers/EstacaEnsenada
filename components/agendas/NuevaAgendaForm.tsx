'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export function NuevaAgendaForm({ defaultFecha }: { defaultFecha?: string }) {
  const router = useRouter()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [titulo, setTitulo] = useState('Reunión de Presidencia')
  const [fecha, setFecha] = useState(defaultFecha ?? today)
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')
  const [loading, setLoading] = useState(false)

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
      router.push(`/agendas/${reunion.id}`)
      router.refresh()
    } catch {
      toast.error('Error de red al crear la reunión')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="titulo">Título de la reunión</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Reunión de Presidencia"
          required
          disabled={loading}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fecha">Fecha</Label>
        <Input
          id="fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="hora_inicio">
            Hora inicio{' '}
            <span className="text-gray-400 text-xs">(opcional)</span>
          </Label>
          <Input
            id="hora_inicio"
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hora_fin">
            Hora fin{' '}
            <span className="text-gray-400 text-xs">(opcional)</span>
          </Label>
          <Input
            id="hora_fin"
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
          onClick={() => router.back()}
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
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando…</>
          ) : (
            'Crear agenda'
          )}
        </Button>
      </div>
    </form>
  )
}
