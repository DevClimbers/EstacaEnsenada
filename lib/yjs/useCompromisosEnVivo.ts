'use client'

import { useEffect, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Compromiso } from '@/lib/types'

/**
 * Lista de compromisos de una reunión que se actualiza sola cuando alguien
 * más crea, cambia o archiva un compromiso (Supabase Realtime, postgres_changes).
 */
export function useCompromisosEnVivo(reunionId: string, inicial: Compromiso[]) {
  const [compromisos, setCompromisos] = useState<Compromiso[]>(inicial)

  useEffect(() => {
    const supabase = createClient()
    let canal: RealtimeChannel | null = null
    let cancelado = false

    async function suscribir() {
      // postgres_changes filtra por RLS con el token del suscriptor: hay que
      // fijarlo ANTES de unirse al canal, si no Realtime evalúa como anónimo
      // y nunca entrega filas.
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelado) return
      if (session?.access_token) await supabase.realtime.setAuth(session.access_token)
      if (cancelado) return

      canal = supabase
        .channel(`compromisos:${reunionId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'crm_compromisos' },
          (payload) => {
            const nuevo = payload.new as Partial<Compromiso>
            const viejo = payload.old as Partial<Compromiso>

            if (payload.eventType === 'DELETE') {
              setCompromisos((prev) => prev.filter((c) => c.id !== viejo.id))
              return
            }

            const pertenece = nuevo.reunion_id === reunionId && !nuevo.archivado
            setCompromisos((prev) => {
              const existe = prev.some((c) => c.id === nuevo.id)
              if (!pertenece) return existe ? prev.filter((c) => c.id !== nuevo.id) : prev
              if (existe) {
                return prev.map((c) => (c.id === nuevo.id ? { ...c, ...nuevo } : c))
              }
              return [...prev, nuevo as Compromiso].sort(
                (a, b) => a.kanban_orden - b.kanban_orden
              )
            })
          }
        )
        .subscribe()
    }

    void suscribir()

    return () => {
      cancelado = true
      if (canal) void supabase.removeChannel(canal)
    }
  }, [reunionId])

  return [compromisos, setCompromisos] as const
}
