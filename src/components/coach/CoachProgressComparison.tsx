'use client'

import type { CoachProgressData } from '@/types'

interface CoachProgressComparisonProps {
  progress: CoachProgressData
}

export default function CoachProgressComparison({ progress }: CoachProgressComparisonProps) {
  const hasComparison = progress.previousHealthIndex != null && progress.currentHealthIndex != null
  const hasBiomarkers = progress.biomarkerChanges.length > 0

  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-tertiary-fixed-dim/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px]">trending_up</span>
        </div>
        <div>
          <h3 className="text-headline-sm font-semibold text-on-surface">Progress Overview</h3>
          <p className="text-label-sm text-on-surface-variant mt-0.5">Compare your health across assessments</p>
        </div>
      </div>

      {/* Health Index Comparison */}
      {hasComparison && (
        <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-surface-container/50">
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Previous</p>
            <p className="text-headline-md font-bold text-on-surface tabular-nums">{progress.previousHealthIndex}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className={`material-symbols-outlined text-xl ${(progress.healthDelta ?? 0) >= 0 ? 'text-tertiary-fixed-dim' : 'text-error'}`}>
              {(progress.healthDelta ?? 0) >= 0 ? 'trending_up' : 'trending_down'}
            </span>
            <span className={`text-label-sm font-semibold ${(progress.healthDelta ?? 0) >= 0 ? 'text-tertiary-fixed-dim' : 'text-error'}`}>
              {(progress.healthDelta ?? 0) >= 0 ? '+' : ''}{progress.healthDelta}
            </span>
          </div>
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Current</p>
            <p className="text-headline-md font-bold text-tertiary-fixed-dim tabular-nums">{progress.currentHealthIndex}</p>
          </div>
        </div>
      )}

      {/* Biomarker changes */}
      {hasBiomarkers && (
        <div>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Biomarker Changes</p>
          <div className="space-y-2">
            {progress.biomarkerChanges.map(b => {
              if (b.current == null || b.previous == null) return null
              const isImproving = b.delta != null ? b.delta < 0 : false
              return (
                <div key={b.label} className="flex items-center gap-3 py-1.5">
                  <span className="text-label-sm text-on-surface-variant w-28 shrink-0">{b.label}</span>
                  <span className="text-label-sm text-on-surface-variant w-12 text-right tabular-nums">{b.previous}</span>
                  <span className={`material-symbols-outlined text-[14px] ${isImproving ? 'text-tertiary-fixed-dim' : 'text-error'}`}>
                    {isImproving ? 'arrow_downward' : b.delta === 0 ? 'remove' : 'arrow_upward'}
                  </span>
                  <span className="text-label-sm text-on-surface w-12 text-right tabular-nums">{b.current}</span>
                  <span className="text-[10px] text-on-surface-variant w-16">{b.unit}</span>
                  {b.delta != null && (
                    <span className={`text-[10px] font-semibold ${isImproving ? 'text-tertiary-fixed-dim' : 'text-error'}`}>
                      {b.delta >= 0 ? '+' : ''}{b.delta}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!hasComparison && (
        <p className="text-center py-6 text-label-sm text-on-surface-variant">
          Complete at least 2 assessments to see your progress.
        </p>
      )}
    </div>
  )
}
