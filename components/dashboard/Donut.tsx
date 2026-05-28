// Pure SVG donut chart — server component
interface DonutProps {
  value: number   // 0–100
  size?: number
  stroke?: number
  color?: string
  track?: string
}

export function Donut({
  value,
  size = 92,
  stroke = 10,
  color = '#1B2A5E',
  track = '#EFEDE5',
}: DonutProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c * (1 - Math.min(100, Math.max(0, value)) / 100)
  const half = size / 2

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={half} cy={half} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={half} cy={half} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          transform={`rotate(-90 ${half} ${half})`}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontSize: size * 0.24,
          fontWeight: 600,
          color: '#161824',
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}>
          {value}<span style={{ fontSize: size * 0.13, color: '#9C9A91' }}>%</span>
        </span>
      </div>
    </div>
  )
}
