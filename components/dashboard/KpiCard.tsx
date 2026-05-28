import { Sparkline } from './Sparkline'

const TONES = {
  navy:  { accent: '#1B2A5E', fill: 'rgba(27,42,94,0.08)'  },
  gold:  { accent: '#C9A84C', fill: 'rgba(201,168,76,0.1)'  },
  green: { accent: '#1E6B3A', fill: 'rgba(30,107,58,0.08)'  },
  red:   { accent: '#C24130', fill: 'rgba(194,65,48,0.08)'  },
}

interface KpiCardProps {
  kicker: string
  value: string | number
  suffix?: string
  sub: string
  trend?: { dir: 'up' | 'down'; label: string } | null
  sparkline?: number[]
  tone?: keyof typeof TONES
  accent?: React.ReactNode
}

export function KpiCard({
  kicker,
  value,
  suffix,
  sub,
  trend,
  sparkline,
  tone = 'navy',
  accent,
}: KpiCardProps) {
  const { accent: color, fill } = TONES[tone]

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EAE6D7',
      borderRadius: 14,
      padding: '18px 20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minHeight: 144,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 10.5,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#6F6E66',
          fontWeight: 600,
        }}>
          {kicker}
        </span>
        {trend && (
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: trend.dir === 'up' ? '#1E6B3A' : '#C24130',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}>
            {trend.dir === 'up' ? '↑' : '↓'} {trend.label}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: '#0E1018',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}>
          {value}
        </span>
        {suffix && (
          <span style={{ fontSize: 16, color: '#9C9A91', fontWeight: 500 }}>{suffix}</span>
        )}
      </div>

      <p style={{ fontSize: 12, color: '#9C9A91', margin: 0, lineHeight: 1.4 }}>{sub}</p>

      {accent && <div style={{ marginTop: 4 }}>{accent}</div>}

      {sparkline && (
        <div style={{ position: 'absolute', bottom: 16, right: 16, opacity: 0.7 }}>
          <Sparkline data={sparkline} width={80} height={28} color={color} fill={fill} />
        </div>
      )}
    </div>
  )
}
