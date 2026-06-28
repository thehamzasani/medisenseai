'use client'

import type { DiseaseExplainability } from '@/types'

interface DiseaseFactorBreakdownProps {
  disease: string
  icon: string
  risk: number
  level: string | null
  explainability: DiseaseExplainability
}

export default function DiseaseFactorBreakdown({
  disease,
  icon,
  risk,
  level,
  explainability,
}: DiseaseFactorBreakdownProps) {
  const factors = explainability.factors ?? []
  const hasPositive = explainability.topPositiveFactors.length > 0
  const hasNegative = explainability.topNegativeFactors.length > 0

  const levelColor = level === 'HIGH' || level === 'CRITICAL'
    ? 'text-error'
    : level === 'MEDIUM'
    ? 'text-secondary'
    : 'text-tertiary-fixed-dim'

  return (
    <div className="surface-glass rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          level === 'HIGH' || level === 'CRITICAL'
            ? 'bg-error/10'
            : level === 'MEDIUM'
            ? 'bg-secondary/10'
            : 'bg-tertiary-fixed-dim/10'
        }`}>
          <span className={`material-symbols-outlined text-[20px] ${levelColor}`}>{icon}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-headline-sm font-semibold text-on-surface">{disease}</h3>
            <span className={`text-label-sm font-semibold ${levelColor}`}>
              {risk}% · {level ?? 'N/A'}
            </span>
          </div>
          <p className="text-label-sm text-on-surface-variant mt-0.5">Factor Attribution Analysis</p>
        </div>
      </div>

      {/* Key factors driving the prediction */}
      {factors.length > 0 && (
        <div className="mb-5">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Contributing Factors</p>
          <div className="space-y-2">
            {factors.map((factor, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-container-low/50">
                <span className="material-symbols-outlined text-primary-fixed-dim text-[14px] mt-0.5 shrink-0">
                  {factor.toLowerCase().includes('low') || factor.toLowerCase().includes('normal') ? 'check_circle' : 'warning'}
                </span>
                <span className="text-label-sm text-on-surface leading-relaxed">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top positive (risk-increasing) factors */}
      {hasPositive && (
        <div className="mb-3">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-error text-[14px]">trending_up</span>
            Risk Increasing
          </p>
          <div className="flex flex-wrap gap-2">
            {explainability.topPositiveFactors.map((f, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-error/10 text-error border border-error/20">
                {f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top negative (risk-decreasing) factors */}
      {hasNegative && (
        <div>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-[14px]">trending_down</span>
            Risk Decreasing
          </p>
          <div className="flex flex-wrap gap-2">
            {explainability.topNegativeFactors.map((f, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim border border-tertiary-fixed-dim/20">
                {f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
