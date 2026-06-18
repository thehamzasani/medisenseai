import { EngineResult } from '@/types'
// import { RISK_COLORS } from '@/constants'

interface EngineCardProps {
  result: EngineResult
  icon: string
  wide?: boolean
}

export default function EngineCard({ result, icon, wide }: EngineCardProps) {
  const diseases = [
    { label: 'Diabetes',    data: result.diseases.diabetes      },
    { label: 'Heart',       data: result.diseases.heartDisease  },
    { label: 'Hypertension',data: result.diseases.hypertension  },
    { label: 'Stroke',      data: result.diseases.stroke        },
    { label: 'Kidney',      data: result.diseases.kidneyDisease },
    { label: 'Liver',       data: result.diseases.liverDisease  },
  ]

  const statusColor = result.status === 'deprecated'
    ? 'text-error bg-error/10 border-error/20'
    : 'text-tertiary-fixed-dim bg-tertiary-fixed-dim/10 border-tertiary-fixed-dim/20'

  const getRiskBarColor = (level: string) => {
    if (level === 'LOW')      return '#3cddc7'
    if (level === 'MEDIUM')   return '#a6e6ff'
    if (level === 'HIGH')     return '#ffb4ab'
    return '#ffb4ab'
  }

  return (
    <div
      className={`surface-glass rounded-xl p-5 hover:border-primary-fixed-dim/20 transition-all duration-300 flex flex-col gap-4 ${wide ? 'col-span-2' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-low/70 border border-outline-variant/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]">{icon}</span>
          </div>
          <div>
            <div className="text-label-md font-semibold text-on-surface leading-tight">{result.engine}</div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">{result.modelVersion}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-headline-sm font-bold text-primary-fixed-dim">{result.accuracy}%</div>
          <div className="text-[10px] text-on-surface-variant">Accuracy</div>
        </div>
      </div>

      {/* Description — only shown on wide cards */}
      {wide && (
        <p className="text-label-md text-on-surface-variant leading-relaxed">
          {result.insight || 'Hierarchical rule-based mapping optimized for explainability and clinical transparency.'}
        </p>
      )}

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${statusColor}`}>
          {result.status}
        </span>
        <span className="text-[10px] text-on-surface-variant">
          {result.inferenceMs}ms inference
        </span>
      </div>

      {/* Disease mini-bars — 2 col grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {diseases.map(({ label, data }) => {
          const barColor = getRiskBarColor(data.level)
          return (
            <div key={label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wide">{label}</span>
                <span className="text-[10px] font-semibold tabular-nums" style={{ color: barColor }}>
                  {data.risk}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-outline-variant/20 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${data.risk}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall accuracy bar */}
      <div className="pt-3 border-t border-outline-variant/20">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Overall Accuracy</span>
          <span className="text-[10px] font-semibold text-primary-fixed-dim">{result.accuracy}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-outline-variant/20 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${result.accuracy}%`,
              background: 'linear-gradient(90deg, #006a71, #00dbe7)',
            }}
          />
        </div>
      </div>
    </div>
  )
}