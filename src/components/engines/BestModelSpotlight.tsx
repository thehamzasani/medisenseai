import { EngineResult } from '@/types'
import { ENGINE_DEFINITIONS } from '@/constants'

interface BestModelSpotlightProps {
  engineResult: EngineResult | undefined
}

export default function BestModelSpotlight({ engineResult }: BestModelSpotlightProps) {
  const def = ENGINE_DEFINITIONS.find(e => e.name === 'Neural Network')!

  const diseases = engineResult?.diseases
  const epochData = [82, 87, 91, 94, 96, 97.5, 98.3, 98.8, 99.0, 99.2]

  const stats = [
    { label: 'Precision', value: '99.1%' },
    { label: 'Recall',    value: '98.8%' },
    { label: 'F1 Score',  value: '98.9%' },
    { label: 'Latency',   value: `${engineResult?.inferenceMs ?? 42}ms` },
  ]

  return (
    <div className="relative surface-glass rounded-2xl p-8 winner-pulse border border-primary-fixed-dim/30 overflow-hidden">
      {/* Atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-primary-container/5 blur-[80px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[30%] bg-secondary-container/5 blur-[80px] rounded-full" />
      </div>

      {/* BEST PERFORMING MODEL badge */}
      <div className="absolute top-6 right-6">
        <span className="inline-flex items-center gap-1.5 bg-primary-fixed-dim/10 border border-primary-fixed-dim/30 text-primary-fixed-dim text-label-sm px-3 py-1.5 rounded-full winner-pulse">
          <span className="material-symbols-outlined text-[14px]">emoji_events</span>
          BEST PERFORMING MODEL
        </span>
      </div>

      <div className="relative flex gap-10 items-start">
        {/* Left — Accuracy circle + spinning ring */}
        <div className="flex-shrink-0 flex flex-col items-center gap-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Outer spinning dashed ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary-fixed-dim/30 animate-spin-slow" />
            {/* Inner spinning ring (opposite) */}
            <div className="absolute inset-3 rounded-full border border-dashed border-secondary/20" style={{ animation: 'spin 30s linear infinite reverse' }} />
            {/* Static glow ring */}
            <div className="absolute inset-5 rounded-full border border-primary-fixed-dim/20" />
            {/* Core circle */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-fixed-dim/20 to-secondary-container/10 border border-primary-fixed-dim/40 flex flex-col items-center justify-center glow-cyan">
              <span className="text-display-lg font-bold text-primary-fixed-dim leading-none">
                {def.accuracy}
              </span>
              <span className="text-label-sm text-on-surface-variant mt-0.5">%</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-label-sm text-on-surface-variant uppercase tracking-widest">Accuracy</div>
            <div className="text-label-sm text-primary-fixed-dim mt-0.5">Top-1 Diagnostic</div>
          </div>

          {/* Engine icon */}
          <div className="w-12 h-12 rounded-xl bg-primary-fixed-dim/10 border border-primary-fixed-dim/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[24px]">{def.icon}</span>
          </div>
        </div>

        {/* Right — Details */}
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">MediSense AI Engine</span>
          </div>
          <h2 className="text-headline-lg font-bold text-primary-fixed-dim mb-1">
            Neural Network
          </h2>
          <div className="text-label-md text-on-surface-variant mb-1">{def.version}</div>
          <p className="text-body-md text-on-surface-variant mb-6 max-w-lg leading-relaxed">
            {def.description}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map(s => (
              <div key={s.label} className="bg-surface-container-low/50 border border-outline-variant/20 rounded-xl p-3 text-center">
                <div className="text-headline-sm font-bold text-primary-fixed-dim">{s.value}</div>
                <div className="text-label-sm text-on-surface-variant mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Epoch accuracy mini bar chart */}
          <div>
            <div className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
              Training Epoch Accuracy
            </div>
            <div className="flex items-end gap-1.5 h-12">
              {epochData.map((val, i) => {
                const heightPct = ((val - 80) / 20) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm transition-all duration-500"
                      style={{
                        height: `${Math.max(4, heightPct * 0.44)}px`,
                        background: i === epochData.length - 1
                          ? 'linear-gradient(180deg, #00dbe7, #006a71)'
                          : `rgba(0, 219, 231, ${0.3 + (i / epochData.length) * 0.5})`,
                      }}
                    />
                    {i % 2 === 1 && (
                      <span className="text-[9px] text-on-surface-variant">{i + 1}</span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-on-surface-variant">Epoch 1</span>
              <span className="text-[10px] text-on-surface-variant">Epoch 10</span>
            </div>
          </div>

          {/* Disease risk mini summary */}
          {diseases && (
            <div className="mt-5 pt-5 border-t border-outline-variant/20">
              <div className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
                Current Assessment — Disease Risk Summary
              </div>
              <div className="grid grid-cols-6 gap-3">
                {([
                  ['Diabetes',    diseases.diabetes.risk,      diseases.diabetes.level],
                  ['Heart',       diseases.heartDisease.risk,  diseases.heartDisease.level],
                  ['Hypertension',diseases.hypertension.risk,  diseases.hypertension.level],
                  ['Stroke',      diseases.stroke.risk,        diseases.stroke.level],
                  ['Kidney',      diseases.kidneyDisease.risk, diseases.kidneyDisease.level],
                  ['Liver',       diseases.liverDisease.risk,  diseases.liverDisease.level],
                ] as [string, number, string][]).map(([label, risk, level]) => {
                  const color = level === 'LOW' ? '#3cddc7' : level === 'MEDIUM' ? '#a6e6ff' : '#ffb4ab'
                  return (
                    <div key={label} className="text-center">
                      <div className="text-label-sm font-bold" style={{ color }}>{risk}%</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">{label}</div>
                      <div className="mt-1 h-1 rounded-full bg-outline-variant/20 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${risk}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}