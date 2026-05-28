import type { Perfil } from '@/lib/types'

interface CargaItem {
  perfil: Pick<Perfil, 'id' | 'nombre' | 'rol'>
  entActivas: number
  compActivos: number
  hechos: number
}

interface CargaCardProps {
  items: CargaItem[]
}

const TONES = ['#1B2A5E', '#2F4D8C', '#3D6FA8', '#5C7FA8']

export function CargaCard({ items }: CargaCardProps) {
  const max = Math.max(...items.map(c => c.entActivas + c.compActivos)) || 1

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EAE6D7',
      borderRadius: 14,
      padding: 22,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9C9A91', fontWeight: 600 }}>
            Asignaciones
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#0E1018', letterSpacing: '-0.02em', marginTop: 4 }}>
            Carga por dirigente
          </div>
        </div>
        <span style={{ fontSize: 11.5, color: '#6F6E66' }}>activos + completados</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((c, i) => {
          const initials = c.perfil.nombre.split(' ').slice(0, 2).map(n => n[0]).join('')
          const total = c.entActivas + c.compActivos

          return (
            <div key={c.perfil.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: TONES[i % TONES.length],
                color: '#fff',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {initials}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0E1018' }}>
                      {c.perfil.nombre.split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div style={{ fontSize: 11, color: '#9C9A91' }}>{c.perfil.rol}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
                    <span>
                      <span style={{ color: '#1B2A5E', fontWeight: 700 }}>{c.entActivas}</span>
                      {' '}<span style={{ color: '#9C9A91' }}>ent</span>
                    </span>
                    <span>
                      <span style={{ color: '#C9A84C', fontWeight: 700 }}>{c.compActivos}</span>
                      {' '}<span style={{ color: '#9C9A91' }}>comp</span>
                    </span>
                    <span>
                      <span style={{ color: '#1E6B3A', fontWeight: 700 }}>{c.hechos}</span>
                      {' '}<span style={{ color: '#9C9A91' }}>hechos</span>
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', height: 6, borderRadius: 999, background: '#F2F1EC', overflow: 'hidden' }}>
                  <div style={{ width: `${(c.entActivas / max) * 100}%`, background: '#1B2A5E', transition: 'width .4s' }} />
                  <div style={{ width: `${(c.compActivos / max) * 100}%`, background: '#C9A84C', transition: 'width .4s' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
