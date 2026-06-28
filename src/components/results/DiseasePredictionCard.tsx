import type { DiseaseRisk, TrendDirection } from '@/types'
import RiskBadge from '@/components/shared/RiskBadge'
import ProgressBar from '@/components/shared/ProgressBar'
import RiskDeltaBadge from '@/components/risk/RiskDeltaBadge'
import { cn } from '@/lib/utils'

interface DiseasePredictionCardProps {
  disease: string
  icon: string
  risk: DiseaseRisk | null | undefined
  modelName?: string
  modelVersion?: string
  wide?: boolean
  explainHref?: string
  riskDelta?: { delta: number; trend: TrendDirection } | null
}

const DISEASE_DESCRIPTIONS: Record<string, string> = {
  'Diabetes':          'Type 2 diabetes mellitus risk based on glucose metabolism markers',
  'Hypertension':      'Elevated systemic arterial pressure and cardiovascular strain',
  'Heart Disease':     'Coronary artery disease and cardiovascular event probability',
  'Stroke':            'Cerebrovascular accident risk from thromboembolic factors',
  'Kidney Disease':    'Chronic kidney disease progression via renal function markers',
  'Liver Disease':     'Hepatic dysfunction risk from metabolic and enzymatic indicators',
}

export default function DiseasePredictionCard({
  disease,
  icon,
  risk,
  modelName = 'Neural Network',
  modelVersion = 'v5.0',
  wide = false,
  explainHref,
  riskDelta,
}: DiseasePredictionCardProps) {
  const riskValue = risk?.risk ?? 0
  const riskLevel = risk?.level ?? null
  const confidence = risk?.confidence ?? 0

  const description = DISEASE_DESCRIPTIONS[disease] ?? ''

  return (
    <div
      className={cn(
        'group surface-glass rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden cursor-default',
        'transition-all duration-300',
        wide && 'col-span-2'
      )}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: riskLevel === 'HIGH' || riskLevel === 'CRITICAL'
              ? 'radial-gradient(ellipse at top left, rgba(255,180,171,0.05) 0%, transparent 70%)'
              : riskLevel === 'MEDIUM'
                ? 'radial-gradient(ellipse at top left, rgba(76,214,255,0.05) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at top left, rgba(60,221,199,0.05) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: 20 }}>
              {icon}
            </span>
          </div>
          <div>
            <h3 className="text-label-md font-semibold text-on-surface">{disease}</h3>
            {description && (
              <p className="text-[10px] text-on-surface-variant mt-0.5 line-clamp-1">{description}</p>
            )}
          </div>
        </div>
        <RiskBadge level={riskLevel} size="sm" className="flex-shrink-0" />
      </div>

      {/* Risk score */}
      <div className="flex items-end gap-2">
        <span
          className="text-display-lg font-bold tabular-nums leading-none"
          style={{
            color: riskLevel === 'LOW' ? '#3cddc7'
              : riskLevel === 'MEDIUM' ? '#4cd6ff'
              : '#ffb4ab'
          }}
        >
          {riskValue}
        </span>
        <span className="text-on-surface-variant text-lg mb-1">%</span>
        <span className="text-label-sm text-on-surface-variant mb-1 ml-1">risk probability</span>
        {riskDelta && (
          <span className="mb-1 ml-auto">
            <RiskDeltaBadge delta={riskDelta.delta} trend={riskDelta.trend} />
          </span>
        )}
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={riskValue}
        level={riskLevel}
        glow={riskLevel === 'HIGH' || riskLevel === 'CRITICAL'}
        height="sm"
        animated
      />

      {/* Confidence */}
      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
        <span>Confidence: <span className="text-on-surface font-semibold">{confidence.toFixed(1)}%</span></span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>memory</span>
          {modelName}
        </span>
      </div>

      {/* Hover reveal: model details + explain link */}
      <div className="overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-300 ease-out">
        <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
          <div className="text-[11px] text-on-surface-variant">
            <span className="text-primary-fixed-dim font-mono">{modelName}</span>
            <span className="mx-1">·</span>
            <span>{modelVersion}</span>
            <span className="mx-1">·</span>
            <span>DeepSense Engine</span>
          </div>
          <div className="flex items-center gap-2">
            {explainHref && (
              <a
                href={explainHref}
                className="text-[11px] font-semibold text-primary-fixed-dim hover:text-primary-fixed flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>insights</span>
                Why this prediction?
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}