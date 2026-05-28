interface UnidadRow {
  id: string
  nombre: string
  realizadas: number
  pendientes: number
  total: number
}

interface UnidadesCardProps {
  rows: UnidadRow[]
}

export function UnidadesCard({ rows }: UnidadesCardProps) {
  const maxTotal = Math.max(...rows.map(r => r.total)) || 1

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
            Distribución
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#0E1018', letterSpacing: '-0.02em', marginTop: 4 }}>
            Entrevistas por unidad
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#6F6E66' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#1B2A5E', display: 'inline-block' }} />
            Realizadas
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#C9A84C', display: 'inline-block' }} />
            Pendientes / agendadas
          </div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={TH}>Unidad</th>
            <th style={{ ...TH, width: '45%' }}>Actividad</th>
            <th style={{ ...TH, textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ borderTop: '1px solid #EAE6D7' }}>
              <td style={TD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 6, height: 22, borderRadius: 2,
                    background: row.id.startsWith('RAM') ? '#C9A84C' : '#1B2A5E',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontWeight: 600, color: '#0E1018' }}>{row.nombre}</span>
                </div>
              </td>
              <td style={TD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', height: 8, borderRadius: 999, background: '#F2F1EC', overflow: 'hidden' }}>
                      <div style={{ width: `${(row.realizadas / maxTotal) * 100}%`, background: '#1B2A5E' }} />
                      <div style={{ width: `${(row.pendientes / maxTotal) * 100}%`, background: '#C9A84C', opacity: 0.85 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#6F6E66', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#1B2A5E', fontWeight: 700 }}>{row.realizadas}</span>
                    <span style={{ color: '#9C9A91' }}> / </span>
                    <span style={{ color: '#C9A84C', fontWeight: 700 }}>{row.pendientes}</span>
                  </span>
                </div>
              </td>
              <td style={{ ...TD, textAlign: 'right', fontWeight: 600, color: '#0E1018', fontVariantNumeric: 'tabular-nums' }}>
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TH: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  color: '#9C9A91',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '0 12px 10px',
  textAlign: 'left',
}

const TD: React.CSSProperties = {
  padding: '12px',
  verticalAlign: 'middle',
}
