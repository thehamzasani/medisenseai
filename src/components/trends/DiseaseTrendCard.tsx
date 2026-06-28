'use client'

interface DiseaseTrendCardProps {
  title: string
  icon: string
  currentRisk: number | null
  predictedRisk: number
  historicalRisks?: number[]
  upperBound?: number
  lowerBound?: number
  level?: string | null
}

export default function DiseaseTrendCard({
  title,
  icon,
  currentRisk,
  predictedRisk,
  historicalRisks = [],
  upperBound,
  lowerBound,
  level,
}: DiseaseTrendCardProps) {
  const risk = currentRisk ?? 50
  const delta = predictedRisk - risk
  const isImproving = delta <= 0

  const levelColor: Record<string, string> = {
    LOW: 'text-tertiary-fixed-dim',
    MEDIUM: 'text-secondary',
    HIGH: 'text-error',
    CRITICAL: 'text-error',
  }

  const barColor = risk >= 70 ? 'bg-error' : risk >= 40 ? 'bg-secondary' : 'bg-tertiary-fixed-dim'
  const deltaColor = isImproving ? 'text-tertiary-fixed-dim' : 'text-error'

  // Mini sparkline from historical data
  const allData = [...historicalRisks, risk, predictedRisk]
  const sparkW = 100
  const sparkH = 36
  const sPad = 2
  const sInnerW = sparkW - sPad * 2
  const sInnerH = sparkH - sPad * 2
  const sMax = Math.max(...allData)
  const sMin = Math.min(...allData)
  const sRange = sMax - sMin || 1

  const sparkPoints = allData.map((v, i) => {
    const x = sPad + (i / Math.max(allData.length - 1, 1)) * sInnerW
    const y = sPad + sInnerH - ((v - sMin) / sRange) * sInnerH
    return `${x},${y}`
  })

  const histCount = historicalRisks.length + 1
  const histLinePath = sparkPoints.slice(0, histCount).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p}`).join(' ')
  const predLinePath = sparkPoints.slice(histCount - 1).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p}`).join(' ')

  return (
    <div className="surface-glass rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">{icon}</span>
          </div>
          <div>
            <h4 className="text-label-md font-semibold text-on-surface">{title}</h4>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Trend Analysis</p>
          </div>
        </div>

        {/* Sparkline */}
        <svg viewBox={`0 0 ${sparkW} ${sparkH}`} className="w-[100px] h-9 shrink-0">
          {histLinePath && (
            <path d={histLinePath} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {predLinePath && (
            <path d={predLinePath} fill="none" stroke="#00dbe7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
          )}
        </svg>
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
          <span className={`material-symbols-outlined text-[20px] ${deltaColor}`}>
            {isImproving ? 'trending_down' : 'trending_up'}
          </span>
          <span className={`text-label-sm font-semibold ${deltaColor}`}>
            {isImproving ? '' : '+'}{Math.round(Math.abs(delta))}%
          </span>
        </div>

        <div className="text-right">
          <div className="text-headline-md font-bold tabular-nums" style={{ color: predictedRisk >= 70 ? '#ffb4ab' : predictedRisk >= 40 ? '#a6e6ff' : '#3cddc7' }}>
            {Math.round(predictedRisk)}
            <span className="text-body-md font-normal">%</span>
          </div>
          <div className="text-label-sm text-on-surface-variant">Predicted</div>
        </div>
      </div>

      {/* Confidence interval */}
      {upperBound != null && lowerBound != null && (
        <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
          <span>Range: {Math.round(lowerBound)}% – {Math.round(upperBound)}%</span>
          <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full bg-primary-fixed-dim/40 absolute"
              style={{
                left: `${lowerBound}%`,
                width: `${Math.max(4, upperBound - lowerBound)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Level badge */}
      {level && (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${barColor}`} />
          <span className={`text-label-sm font-semibold ${levelColor[level] ?? 'text-on-surface-variant'}`}>
            {level.charAt(0) + level.slice(1).toLowerCase()} Risk
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${risk}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-on-surface-variant">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}
