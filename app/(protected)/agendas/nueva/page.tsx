import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { NuevaAgendaForm } from '@/components/agendas/NuevaAgendaForm'

export default function NuevaAgendaPage() {
  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Link
          href="/agendas"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}
        >
          <ArrowLeft className="h-4 w-4" />
          Agendas
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva agenda</h1>
        <p className="text-sm text-gray-500 mt-1">
          Crea una reunión de presidencia con su agenda editable
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <NuevaAgendaForm />
      </div>
    </div>
  )
}
