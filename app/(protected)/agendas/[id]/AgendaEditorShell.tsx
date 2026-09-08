'use client'

import dynamic from 'next/dynamic'
import type { Reunion, Compromiso, Perfil } from '@/lib/types'

// AgendaEditor usa BlockNote (CSS global, useCreateBlockNote) — solo cliente
const AgendaEditor = dynamic(
  () => import('@/components/agendas/AgendaEditor').then((m) => m.AgendaEditor),
  { ssr: false }
)

interface Props {
  reunion: Reunion
  compromisos: Compromiso[]
  perfiles: Perfil[]
  usuario: { id: string; nombre: string }
}

export function AgendaEditorShell({ reunion, compromisos, perfiles, usuario }: Props) {
  return (
    <AgendaEditor
      reunion={reunion}
      compromisos={compromisos}
      perfiles={perfiles}
      usuario={usuario}
    />
  )
}
