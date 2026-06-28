'use client'

import { useState } from 'react'
import type { EnsembleMetrics, DiseaseKey } from '@/types'

interface EnsembleWeightChartProps {
  ensembleMetrics: EnsembleMetrics
}

const DISEASE_LABELS: Record<DiseaseKey, string> = {
  diabetes: 'Diabetes',
  heartDisease: 'Heart Disease',
  hypertension: 'Hypertension',
  stroke: 'Stroke',
  kidneyDisease: 'Kidney Disease',
  liverDisease: 'Liver Disease',
}

const ENGINE_COLORS: Record<string, string> = {
  'Neural Network': '#00dbe7',
  XGBoost: '#34d399',
  LightGBM: '#60a5fa',
  'Random Forest': '#a78bfa',
  AdaBoost: '#f59e0b',
  SVM: '#f472b6',
  'Decision Tree': '#e2e8f0',
  KNN: '#94a3b8',
  'Logistic Regression': '#fb923c',
  'Naive Bayes': '#cbd5e1',
}

export default function EnsembleWeightChart({ ensembleMetrics }: EnsembleWeightChartProps) {
  const [selectedDisease, setSelectedDisease] = useState<DiseaseKey>('diabetes')

  const diseaseInfo = ensembleMetrics.diseases[selectedDisease]
  const weights = diseaseInfo.weights

  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-headline-sm font-semibold text-on-surface">Ensemble Weight Distribution</h3>
          <p className="text-label-sm text-on-surface-variant mt-0.5">Confidence-weighted contribution by engine</p>
        </div>
      </div>

      {/* Disease selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(DISEASE_LABELS) as DiseaseKey[]).map(key => (
          <button
            key={key}
            onClick={() => setSelectedDisease(key)}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all ${
              selectedDisease === key
                ? 'bg-primary-fixed-dim text-[#002022]'
                : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/20 hover:text-on-surface'
            }`}
          >
            {DISEASE_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Weight bars */}
      <div className="space-y-3">
        {weights.map((w) => {
          const barWidth = Math.max(2, w.weight * 100)
          const color = ENGINE_COLORS[w.name] ?? '#00dbe7'
          return (
            <div key={w.name} className="flex items-center gap-3">
              <div className="w-28 shrink-0 flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-label-sm text-on-surface truncate">{w.name}</span>
              </div>
              <div className="flex-1 h-5 bg-surface-container-high rounded-md overflow-hidden relative">
                <div
                  className="h-full rounded-md transition-all duration-700"
                  style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                  }}
                />
                <span className="absolute inset-0 flex items-center px-2 text-[10px] font-semibold text-on-surface tabular-nums" style={{ mixBlendMode: 'difference' }}>
                  {w.risk}% risk · {(w.weight * 100).toFixed(1)}% weight
                </span>
              </div>
              <span className="text-label-sm text-on-surface-variant w-12 text-right tabular-nums">
                {w.accuracy}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Summary stats under the chart */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-outline-variant/10">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Consensus Level</p>
          <p className={`text-headline-sm font-bold ${
            diseaseInfo.consensusLevel === 'LOW' ? 'text-tertiary-fixed-dim'
            : diseaseInfo.consensusLevel === 'MEDIUM' ? 'text-secondary'
            : 'text-error'
          }`}>
            {diseaseInfo.consensusLevel}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Agreement</p>
          <p className={`text-headline-sm font-bold ${
            diseaseInfo.agreementScore >= 70 ? 'text-tertiary-fixed-dim'
            : diseaseInfo.agreementScore >= 50 ? 'text-secondary'
            : 'text-error'
          }`}>
            {diseaseInfo.agreementScore}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Std Dev</p>
          <p className="text-headline-sm font-bold text-on-surface">{diseaseInfo.stdDev}</p>
        </div>
      </div>
    </div>
  )
}
