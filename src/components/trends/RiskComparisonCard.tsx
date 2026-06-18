import { cn } from '@/lib/utils'

interface RiskComparisonCardProps {
  title: string
  icon: string
  currentRisk: number | null
  projectedRisk?: number
  level?: string | null
  sparklineData?: number[]
  className?: string
}

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const w = 80
  const h = 32
  const pad = 2
  const innerW = w - pad * 2
  const innerH = h - pad * 2
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * innerW
    const y = pad + innerH - ((v - min) / range) * innerH
    return `${x},${y}`
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p}`).join(' ')
  const areaPath =
    linePath +
    ` L ${pad + innerW},${pad + innerH} L ${pad},${pad + innerH} Z`

  const trend = data[data.length - 1] - data[0]
  const trendColor = trend > 0 ? '#ffb4ab' : '#3cddc7'

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-8 shrink-0">
      <defs>
        <linearGradient id={`spark-${data[0]}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${data[0]})`} />
      <path d={linePath} fill="none" stroke={trendColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function RiskComparisonCard({
  title,
  icon,
  currentRisk,
  projectedRisk,
  level,
  sparklineData = [],
  className,
}: RiskComparisonCardProps) {
  const risk = currentRisk ?? 0
  const projected = projectedRisk ?? Math.max(0, risk - 8)
  const delta = projected - risk
  const isImproving = delta <= 0

  const levelColors: Record<string, string> = {
    LOW: 'text-tertiary-fixed-dim',
    MEDIUM: 'text-secondary',
    HIGH: 'text-error',
    CRITICAL: 'text-error',
  }
  const levelColor = levelColors[level ?? 'LOW'] ?? 'text-on-surface-variant'

  // Progress bar color
  const barColor =
    risk >= 70 ? 'bg-error' : risk >= 40 ? 'bg-secondary' : 'bg-tertiary-fixed-dim'

  return (
    <div className={cn('surface-glass rounded-2xl p-5 flex flex-col gap-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">{icon}</span>
          </div>
          <div>
            <h4 className="text-label-md font-semibold text-on-surface">{title}</h4>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Risk Analysis</p>
          </div>
        </div>
        <MiniSparkline data={sparklineData.length >= 2 ? sparklineData : [risk - 10, risk - 5, risk + 2, risk - 3, risk]} />
      </div>

      {/* Risk values */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-display-lg font-bold tabular-nums" style={{ color: risk >= 70 ? '#ffb4ab' : risk >= 40 ? '#a6e6ff' : '#3cddc7' }}>
            {risk}
            <span className="text-headline-sm text-on-surface-variant font-normal">%</span>
          </div>
          <div className="text-label-sm text-on-surface-variant">Current Risk</div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className={`material-symbols-outlined text-[20px] ${isImproving ? 'text-tertiary-fixed-dim' : 'text-error'}`}>
            {isImproving ? 'trending_down' : 'trending_up'}
          </span>
          <span className={`text-label-sm font-semibold ${isImproving ? 'text-tertiary-fixed-dim' : 'text-error'}`}>
            {isImproving ? '' : '+'}{Math.abs(delta)}%
          </span>
        </div>

        <div className="text-right">
          <div className="text-headline-md font-bold tabular-nums text-on-surface-variant">
            {projected}
            <span className="text-body-md font-normal">%</span>
          </div>
          <div className="text-label-sm text-on-surface-variant">Projected</div>
        </div>
      </div>

      {/* Level badge */}
      {level && (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${barColor}`} />
          <span className={`text-label-sm font-semibold ${levelColor}`}>
            {level.charAt(0) + level.slice(1).toLowerCase()} Risk
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${risk}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-on-surface-variant">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}