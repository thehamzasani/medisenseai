'use client'

import type { TimelinePredictionData, AssessmentHistoryPoint } from '@/types'

interface TimelineForecastPanelProps {
  prediction: TimelinePredictionData
  historical: AssessmentHistoryPoint[]
  onRefresh?: () => void
  isLoading?: boolean
}

export default function TimelineForecastPanel({
  prediction,
  historical,
  onRefresh,
  isLoading,
}: TimelineForecastPanelProps) {
  const lastHistorical = historical[historical.length - 1]
  const lastPrediction = prediction.predictedScores[prediction.predictedScores.length - 1]

  const currentScore = lastHistorical?.overallHealthIndex ?? 70
  const projectedScore = lastPrediction?.overallHealthIndex ?? currentScore
  const scoreDelta = projectedScore - currentScore
  const isImproving = scoreDelta > 0

  // Count risk changes
  const riskChanges = [
    { label: 'Diabetes', current: lastHistorical?.diabetesRisk ?? 0, projected: lastPrediction?.diabetesRisk ?? 0 },
    { label: 'Heart Disease', current: lastHistorical?.heartDiseaseRisk ?? 0, projected: lastPrediction?.heartDiseaseRisk ?? 0 },
    { label: 'Hypertension', current: lastHistorical?.hypertensionRisk ?? 0, projected: lastPrediction?.hypertensionRisk ?? 0 },
    { label: 'Stroke', current: lastHistorical?.strokeRisk ?? 0, projected: lastPrediction?.strokeRisk ?? 0 },
    { label: 'Kidney Disease', current: lastHistorical?.kidneyDiseaseRisk ?? 0, projected: lastPrediction?.kidneyDiseaseRisk ?? 0 },
    { label: 'Liver Disease', current: lastHistorical?.liverDiseaseRisk ?? 0, projected: lastPrediction?.liverDiseaseRisk ?? 0 },
  ]

  const improvingRisks = riskChanges.filter(r => (r.projected - r.current) <= 0).length
  const worseningRisks = riskChanges.filter(r => (r.projected - r.current) > 0).length

  return (
    <div className="surface-glass rounded-2xl p-6 border border-primary-fixed-dim/10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed-dim/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-primary-fixed-dim font-semibold">
                Neural Network
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-primary-fixed-dim/10 text-primary-fixed-dim rounded-full">
                {prediction.projectionMonths}-Month Forecast
              </span>
            </div>
            <h3 className="text-headline-sm font-semibold text-on-surface">
              AI Health Trajectory
            </h3>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-outline-variant/20 text-label-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[14px] ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {isLoading ? 'Generating...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Score comparison */}
      <div className="flex items-center justify-around mb-6 p-4 rounded-xl bg-surface-container/50">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Current</p>
          <p className="text-display-md font-bold text-on-surface tabular-nums">
            {currentScore}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <span className={`material-symbols-outlined text-2xl ${isImproving ? 'text-tertiary-fixed-dim' : 'text-error'}`}>
            {isImproving ? 'trending_up' : 'trending_down'}
          </span>
          <span className={`text-label-sm font-semibold ${isImproving ? 'text-tertiary-fixed-dim' : 'text-error'}`}>
            {isImproving ? '+' : ''}{Math.round(scoreDelta)}
          </span>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Projected</p>
          <p className="text-display-md font-bold text-primary-fixed-dim tabular-nums">
            {Math.round(projectedScore)}
          </p>
        </div>
      </div>

      {/* Risk breakdown */}
      <div className="space-y-3 mb-4">
        <p className="text-label-sm font-semibold text-on-surface uppercase tracking-wider">Disease Risk Trajectories</p>
        {riskChanges.map(r => {
          const delta = Math.round(r.projected - r.current)
          const isRiskImproving = delta <= 0
          return (
            <div key={r.label} className="flex items-center gap-3">
              <span className="text-label-sm text-on-surface-variant w-28 shrink-0">{r.label}</span>
              <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full absolute"
                  style={{
                    width: `${Math.min(100, Math.max(0, r.current))}%`,
                    backgroundColor: r.current >= 70 ? '#ffb4ab' : r.current >= 40 ? '#a6e6ff' : '#3cddc7',
                    opacity: 0.5,
                  }}
                />
                <div
                  className="h-full rounded-full absolute"
                  style={{
                    width: `${Math.min(100, Math.max(0, r.projected))}%`,
                    backgroundColor: r.current >= 70 ? '#ffb4ab' : r.current >= 40 ? '#a6e6ff' : '#3cddc7',
                    opacity: 0.9,
                  }}
                />
              </div>
              <span className={`text-[10px] font-semibold w-12 text-right ${isRiskImproving ? 'text-tertiary-fixed-dim' : 'text-error'}`}>
                {isRiskImproving ? '' : '+'}{Math.abs(delta)}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant/10">
        <div className="bg-surface-container/50 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Risks Improving</p>
          <p className="text-headline-sm font-bold text-tertiary-fixed-dim">{improvingRisks}/6</p>
        </div>
        <div className="bg-surface-container/50 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Risks Worsening</p>
          <p className="text-headline-sm font-bold text-error">{worseningRisks}/6</p>
        </div>
      </div>

      {/* Insight */}
      {prediction.insight && (
        <div className="mt-4 p-3 rounded-xl bg-primary-fixed-dim/5 border border-primary-fixed-dim/10 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px] mt-0.5 shrink-0">insights</span>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">{prediction.insight}</p>
        </div>
      )}

      {/* Model info */}
      <p className="text-[9px] text-on-surface-variant/40 mt-3 text-center">
        Model: {prediction.modelVersion} · Generated {new Date().toLocaleDateString()}
      </p>
    </div>
  )
}
