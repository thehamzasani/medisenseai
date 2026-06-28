'use client'

import { useState } from 'react'

interface SimulatableFeature {
  key: string
  label: string
  value: number
  unit: string
  min: number
  max: number
  step: number
  riskImpact: number // how much risk changes per unit
  currentRisk: number
  healthyMin: number
  healthyMax: number
}

interface WhatIfSimulatorProps {
  disease: string
  currentRisk: number
  features: SimulatableFeature[]
}

export default function WhatIfSimulator({ disease, currentRisk, features }: WhatIfSimulatorProps) {
  const [adjusted, setAdjusted] = useState<Record<string, number>>(
    Object.fromEntries(features.map(f => [f.key, f.value]))
  )

  const computedRisk = features.reduce((risk, f) => {
    const delta = adjusted[f.key] - f.value
    return risk + delta * f.riskImpact
  }, currentRisk)

  const clampedRisk = Math.max(0, Math.min(100, Math.round(computedRisk)))
  const riskDiff = clampedRisk - currentRisk
  const isImproved = riskDiff <= 0

  const hasChanges = features.some(f => adjusted[f.key] !== f.value)

  const resetAll = () => {
    setAdjusted(Object.fromEntries(features.map(f => [f.key, f.value])))
  }

  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
        </div>
        <div>
          <h3 className="text-headline-sm font-semibold text-on-surface">What-If Simulator</h3>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            Adjust biomarkers to see how {disease} risk changes
          </p>
        </div>
      </div>

      {/* Current vs simulated risk */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-surface-container/50">
        <div className="text-center flex-1">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Current</p>
          <p className="text-display-sm font-bold text-on-surface tabular-nums">{currentRisk}%</p>
        </div>
        <div className="flex flex-col items-center">
          {hasChanges && (
            <>
              <span className={`material-symbols-outlined text-xl ${isImproved ? 'text-tertiary-fixed-dim' : 'text-error'}`}>
                {isImproved ? 'trending_down' : 'trending_up'}
              </span>
              <span className={`text-label-sm font-semibold ${isImproved ? 'text-tertiary-fixed-dim' : 'text-error'}`}>
                {isImproved ? '' : '+'}{Math.abs(riskDiff)}%
              </span>
            </>
          )}
        </div>
        <div className="text-center flex-1">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Simulated</p>
          <p className={`text-display-sm font-bold tabular-nums ${hasChanges ? (isImproved ? 'text-tertiary-fixed-dim' : 'text-error') : 'text-on-surface-variant'}`}>
            {clampedRisk}%
          </p>
        </div>
      </div>

      {/* Feature sliders */}
      <div className="space-y-4 mb-5">
        {features.map(f => (
          <div key={f.key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-label-sm text-on-surface-variant">{f.label}</span>
              <span className={`text-label-sm font-semibold tabular-nums ${
                adjusted[f.key] >= f.healthyMin && adjusted[f.key] <= f.healthyMax
                  ? 'text-tertiary-fixed-dim'
                  : 'text-error'
              }`}>
                {adjusted[f.key].toFixed(f.step >= 1 ? 0 : 1)} {f.unit}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={adjusted[f.key]}
                onChange={e => setAdjusted({ ...adjusted, [f.key]: parseFloat(e.target.value) })}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    ${adjusted[f.key] >= f.healthyMin && adjusted[f.key] <= f.healthyMax ? '#3cddc7' : '#ffb4ab'} 
                    ${((adjusted[f.key] - f.min) / (f.max - f.min)) * 100}%, 
                    rgba(58,73,75,0.4) ${((adjusted[f.key] - f.min) / (f.max - f.min)) * 100}%)`,
                }}
              />
              <div className="flex justify-between text-[9px] text-on-surface-variant mt-0.5">
                <span>{f.min}</span>
                <span>Healthy: {f.healthyMin}–{f.healthyMax}</span>
                <span>{f.max}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
        <button
          onClick={resetAll}
          disabled={!hasChanges}
          className="text-label-sm text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-40 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">refresh</span>
          Reset
        </button>
        <p className="text-[10px] text-on-surface-variant">
          Simulated risk: {clampedRisk}% {hasChanges ? (isImproved ? '(improved)' : '(worsened)') : '(unchanged)'}
        </p>
      </div>
    </div>
  )
}
