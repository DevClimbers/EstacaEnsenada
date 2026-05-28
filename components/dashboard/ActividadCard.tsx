import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ActividadItem {
  id: string
  ts: string          // ISO timestamp
  actorNombre: string
  verbo: string
  objeto: string
  tono: string        // hex color for the actor
}

interface ActividadCardProps {
  items: ActividadItem[]
}

const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

export function ActividadCard({ items }: ActividadCardProps) {
  if (items.length === 0) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #EAE6D7',
        borderRadius: 14,
        padding: '24px 22px',
        textAlign: 'center',
        color: '#9C9A91',
        fontSize: 13,
      }}>
        Sin actividad reciente
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EAE6D7',
      borderRadius: 14,
      padding: 22,
    }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9C9A91', fontWeight: 600 }}>
          Bitácora
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#0E1018', letterSpacing: '-0.02em', marginTop: 4 }}>
          Actividad reciente
        </div>
      </div>

      <div style={{ position: 'relative', paddingLeft: 18 }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: 7, top: 8, bottom: 8,
          width: 1,
          background: '#EAE6D7',
        }} />

        {items.map((a) => {
          const d = new Date(a.ts)
          const hora = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
          const fecha = `${d.getDate()} ${MESES[d.getMonth()]}`
          const initials = a.actorNombre.split(' ').slice(0, 2).map(n => n[0]).join('')

          return (
            <div
              key={a.id}
              style={{
                position: 'relative',
                padding: '10px 0 10px 18px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              {/* Timeline dot */}
              <div style={{
                position: 'absolute',
                left: -11,
                top: 16,
                width: 9, height: 9,
                borderRadius: '50%',
                background: '#fff',
                border: `2px solid ${a.tono}`,
              }} />

              {/* Actor avatar */}
              <div style={{
                width: 26, height: 26,
                borderRadius: '50%',
                background: a.tono,
                color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {initials}
              </div>

              {/* Text */}
              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.45 }}>
                <span style={{ fontWeight: 600, color: '#0E1018' }}>
                  {a.actorNombre.split(' ').slice(0, 2).join(' ')}
                </span>
                <span style={{ color: '#6F6E66' }}> {a.verbo} </span>
                <span style={{ color: '#0E1018', fontWeight: 500 }}>{a.objeto}</span>
                <div style={{
                  fontSize: 11,
                  color: '#9C9A91',
                  marginTop: 3,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {fecha} · {hora}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
