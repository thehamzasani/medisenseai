import { AssessmentWithResults, RiskLevel } from '@/types'
import { getRiskColor, getRiskLabel, cn } from '@/lib/utils'

interface RiskProfileGridProps {
  latestAssessment: AssessmentWithResults | null
}

interface DiseaseEntry {
  key: string
  label: string
  icon: string
  risk: number | null
  level: RiskLevel | null
}

function ProgressBar({ value, level }: { value: number; level: RiskLevel }) {
  const colors: Record<RiskLevel, string> = {
    LOW: 'bg-tertiary-fixed-dim',
    MEDIUM: 'bg-secondary',
    HIGH: 'bg-error',
    CRITICAL: 'bg-error',
  }
  return (
    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colors[level]}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const colors = getRiskColor(level)
  const pulse = level === 'HIGH' || level === 'CRITICAL' ? 'risk-pulse-high' : ''
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${pulse}`}
    >
      {getRiskLabel(level)}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="surface-glass rounded-xl p-md flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high" />
          <div className="w-24 h-4 rounded bg-surface-container-high" />
        </div>
        <div className="w-16 h-5 rounded-full bg-surface-container-high" />
      </div>
      <div className="w-full h-1.5 rounded-full bg-surface-container-high" />
      <div className="flex justify-between">
        <div className="w-10 h-4 rounded bg-surface-container-high" />
        <div className="w-20 h-3 rounded bg-surface-container-high" />
      </div>
    </div>
  )
}

const DISEASE_CONFIG = [
  { key: 'diabetes',     label: 'Diabetes',       icon: 'glucose'        },
  { key: 'hypertension', label: 'Hypertension',   icon: 'monitor_heart'  },
  { key: 'heartDisease', label: 'Heart Disease',  icon: 'cardiology'     },
  { key: 'stroke',       label: 'Stroke',         icon: 'neurology'      },
  { key: 'kidneyDisease',label: 'Kidney Disease', icon: 'water_drop'     },
  { key: 'liverDisease', label: 'Liver Disease',  icon: 'labs'           },
]

export default function RiskProfileGrid({ latestAssessment }: RiskProfileGridProps) {
  if (!latestAssessment) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {DISEASE_CONFIG.map((d) => (
          <SkeletonCard key={d.key} />
        ))}
      </div>
    )
  }

  const diseases: DiseaseEntry[] = [
    {
      key: 'diabetes',
      label: 'Diabetes',
      icon: 'glucose',
      risk: latestAssessment.diabetesRisk,
      level: latestAssessment.diabetesLevel,
    },
    {
      key: 'hypertension',
      label: 'Hypertension',
      icon: 'monitor_heart',
      risk: latestAssessment.hypertensionRisk,
      level: latestAssessment.hypertensionLevel,
    },
    {
      key: 'heartDisease',
      label: 'Heart Disease',
      icon: 'cardiology',
      risk: latestAssessment.heartDiseaseRisk,
      level: latestAssessment.heartDiseaseLevel,
    },
    {
      key: 'stroke',
      label: 'Stroke',
      icon: 'neurology',
      risk: latestAssessment.strokeRisk,
      level: latestAssessment.strokeLevel,
    },
    {
      key: 'kidneyDisease',
      label: 'Kidney Disease',
      icon: 'water_drop',
      risk: latestAssessment.kidneyDiseaseRisk,
      level: latestAssessment.kidneyDiseaseLevel,
    },
    {
      key: 'liverDisease',
      label: 'Liver Disease',
      icon: 'labs',
      risk: latestAssessment.liverDiseaseRisk,
      level: latestAssessment.liverDiseaseLevel,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {diseases.map((disease) => {
        const risk = disease.risk ?? 0
        const level: RiskLevel = disease.level ?? 'LOW'

        return (
          <div
            key={disease.key}
            className="surface-glass rounded-xl p-md flex flex-col gap-3 group hover:border-primary-fixed-dim/30 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed-dim/10 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-primary-fixed-dim"
                    style={{ fontSize: '16px' }}
                  >
                    {disease.icon}
                  </span>
                </div>
                <span className="text-label-md font-semibold text-on-surface">{disease.label}</span>
              </div>
              <RiskBadge level={level} />
            </div>

            <ProgressBar value={risk} level={level} />

            <div className="flex items-center justify-between">
              <span className="text-headline-sm font-bold text-on-surface tabular-nums inline-flex items-center gap-1.5">
                {risk.toFixed(0)}%
                {(() => {
                  const rd = latestAssessment.riskDelta?.[disease.key as keyof typeof latestAssessment.riskDelta]
                  if (!rd || rd.trend === 'stable') return null
                  const isWorse = rd.trend === 'worsening'
                  return (
                    <span className={cn(
                      'inline-flex items-center gap-0.5 text-[10px] font-semibold',
                      isWorse ? 'text-error' : 'text-tertiary-fixed-dim',
                    )}>
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                        {isWorse ? 'trending_up' : 'trending_down'}
                      </span>
                      {isWorse ? '+' : ''}{rd.delta.toFixed(1)}
                    </span>
                  )
                })()}
              </span>
              <span className="text-[10px] text-on-surface-variant truncate max-w-[120px]">
                Neural Network v5.0
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}