import Link from 'next/link'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Entrevista, Compromiso, Perfil } from '@/lib/types'
import { TIPO_ENTREVISTA_LABELS } from '@/lib/types'

interface FocoItem {
  kind: 'entrevista' | 'compromiso'
  id: string
  titulo: string
  sub: string
  fecha: string       // YYYY-MM-DD
  hora: string | null
  href: string
  prioridad: string | null
  perfil: Pick<Perfil, 'nombre'> | null
}

interface FocoSemanaProps {
  items: FocoItem[]
  today: string  // YYYY-MM-DD
}

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function FocoSemana({ items, today }: FocoSemanaProps) {
  // Group by date
  const grupos: Record<string, FocoItem[]> = {}
  for (const item of items) {
    if (!grupos[item.fecha]) grupos[item.fecha] = []
    grupos[item.fecha].push(item)
  }
  const fechas = Object.keys(grupos).sort()

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EAE6D7',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 22px 14px',
        borderBottom: '1px solid #EAE6D7',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9C9A91', fontWeight: 600, marginBottom: 4 }}>
            Próximos 7 días
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#0E1018', letterSpacing: '-0.02em' }}>
            Foco de la semana
          </div>
        </div>
        <span style={{ fontSize: 12, color: '#6F6E66' }}>
          <strong style={{ color: '#0E1018' }}>{items.length}</strong> elementos
        </span>
      </div>

      {/* Items */}
      <div style={{ padding: '6px 0' }}>
        {fechas.length === 0 ? (
          <div style={{ padding: '40px 22px', textAlign: 'center', color: '#9C9A91', fontSize: 13 }}>
            Sin pendientes en los próximos 7 días.
          </div>
        ) : (
          fechas.map((fecha) => {
            const d = new Date(fecha + 'T12:00:00')
            const dow = DOW[d.getDay()]
            const dd = d.getDate()
            const isHoy = fecha === today

            return (
              <div key={fecha} style={{ display: 'flex', gap: 16, padding: '10px 22px', alignItems: 'flex-start' }}>
                {/* Date badge */}
                <div style={{ width: 56, textAlign: 'center', flexShrink: 0, paddingTop: 2 }}>
                  <div style={{
                    fontSize: 10.5,
                    letterSpacing: '0.1em',
                    color: isHoy ? '#C9A84C' : '#9C9A91',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}>
                    {dow}
                  </div>
                  <div style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: isHoy ? '#1B2A5E' : '#0E1018',
                    letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}>
                    {dd}
                  </div>
                  {isHoy && (
                    <div style={{ fontSize: 9.5, color: '#C9A84C', fontWeight: 700, letterSpacing: '0.1em', marginTop: 4 }}>
                      HOY
                    </div>
                  )}
                </div>

                {/* Events */}
                <div style={{
                  flex: 1,
                  borderLeft: '1px solid #EAE6D7',
                  paddingLeft: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  {grupos[fecha].map((item) => (
                    <Link
                      key={item.kind + item.id}
                      href={item.href}
                      style={{ textDecoration: 'none' }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '6px 0',
                        borderRadius: 8,
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: item.kind === 'entrevista'
                            ? '#1B2A5E'
                            : item.prioridad === 'alta' ? '#C24130' : '#C9A84C',
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, color: '#0E1018', fontWeight: 500 }}>{item.titulo}</div>
                          <div style={{ fontSize: 11.5, color: '#9C9A91', marginTop: 2 }}>
                            {item.sub}
                            {item.hora && (
                              <span style={{ color: '#1B2A5E', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                {' · '}{item.hora}
                              </span>
                            )}
                          </div>
                        </div>
                        {item.perfil && (
                          <div
                            style={{
                              width: 22, height: 22, borderRadius: '50%',
                              background: '#EEF1F8',
                              color: '#1B2A5E',
                              fontSize: 9, fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {item.perfil.nombre.split(' ').slice(0, 2).map(n => n[0]).join('')}
                          </div>
                        )}
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          padding: '1px 8px',
                          borderRadius: 999,
                          background: item.kind === 'entrevista' ? '#EEF1F8' : '#F8F1DD',
                          color: item.kind === 'entrevista' ? '#1B2A5E' : '#7B5C12',
                          whiteSpace: 'nowrap',
                        }}>
                          {item.kind === 'entrevista' ? 'Entrevista' : 'Compromiso'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
