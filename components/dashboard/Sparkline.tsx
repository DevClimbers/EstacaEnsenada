// Pure SVG sparkline — server component
interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  fill?: string
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = '#1B2A5E',
  fill = 'rgba(27,42,94,0.08)',
}: SparklineProps) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = (max - min) || 1
  const step = width / (data.length - 1)
  const pts = data.map((v, i) => ({
    x: i * step,
    y: height - 4 - ((v - min) / range) * (height - 8),
  }))
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`
  const last = pts[pts.length - 1]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block' }}
    >
      <path d={area} fill={fill} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
    </svg>
  )
}
