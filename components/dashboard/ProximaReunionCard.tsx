import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Reunion } from '@/lib/types'

interface ProximaReunionCardProps {
  reunion: Reunion | null
}

export function ProximaReunionCard({ reunion }: ProximaReunionCardProps) {
  if (!reunion) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #EAE6D7',
        borderRadius: 14,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 140,
      }}>
        <p style={{ fontSize: 13, color: '#9C9A91' }}>No hay reuniones programadas</p>
        <Link
          href="/agendas/nueva"
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: '#1B2A5E',
            textDecoration: 'none',
          }}
        >
          Crear una ahora →
        </Link>
      </div>
    )
  }

  const fecha = new Date(reunion.fecha + 'T12:00:00')
  const dw = format(fecha, 'EEEE', { locale: es })

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #EAE6D7' }}>
      {/* Navy header */}
      <div style={{
        background: 'linear-gradient(135deg, #1B2A5E 0%, #243578 70%, #2F4D8C 100%)',
        color: '#fff',
        padding: '20px 22px',
      }}>
        <div style={{
          fontSize: 10.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.65)',
          fontWeight: 600,
        }}>
          Próxima reunión
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, marginTop: 6, letterSpacing: '-0.01em' }}>
          {reunion.titulo}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
          <span style={{
            fontSize: 30,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            {format(fecha, 'd')}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.04em', textTransform: 'capitalize' }}>
            {dw}, {format(fecha, 'MMMM', { locale: es })}
            {reunion.hora_inicio && (
              <span style={{ color: '#F1DCA1', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {' · '}{reunion.hora_inicio}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 22px', background: '#fff' }}>
        <Link
          href={`/agendas/${reunion.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12.5,
            fontWeight: 600,
            color: '#1B2A5E',
            textDecoration: 'none',
          }}
        >
          Abrir agenda →
        </Link>
      </div>
    </div>
  )
}
