import type { AssessmentWithResults } from '@/types'

interface Props {
  assessment: AssessmentWithResults
}

interface ConfidenceGauge {
  label: string
  sublabel: string
  icon: string
  confidence: number
  risk: number
  color: string
  bgColor: string
}

export default function ConditionConfidenceCard({ assessment }: Props) {
  const bestEngine = assessment.engineResults?.find(e => e.isBest) ?? assessment.engineResults?.[0]

  const gauges: ConfidenceGauge[] = [
    {
      label: 'CKD Risk',
      sublabel: 'Chronic Kidney Disease',
      icon: 'water_drop',
      confidence: bestEngine?.diseases.kidneyDisease.confidence ?? 0,
      risk: assessment.kidneyDiseaseRisk ?? 0,
      color: 'text-secondary-fixed-dim',
      bgColor: 'bg-secondary-fixed-dim',
    },
    {
      label: 'Subclinical Cardiac',
      sublabel: 'Cardiovascular Risk',
      icon: 'cardiology',
      confidence: bestEngine?.diseases.heartDisease.confidence ?? 0,
      risk: assessment.heartDiseaseRisk ?? 0,
      color: 'text-error',
      bgColor: 'bg-error',
    },
    {
      label: 'Neurological',
      sublabel: 'Stroke Risk Indicator',
      icon: 'neurology',
      confidence: bestEngine?.diseases.stroke.confidence ?? 0,
      risk: assessment.strokeRisk ?? 0,
      color: 'text-tertiary-fixed-dim',
      bgColor: 'bg-tertiary-fixed-dim',
    },
  ]

  return (
    <div className="surface-glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-secondary-fixed-dim text-xl">
          precision_manufacturing
        </span>
        <div>
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant">
            Condition Confidence
          </p>
          <p className="text-[10px] text-on-surface-variant/60">Neural Network — Primary Engine</p>
        </div>
      </div>

      <div className="space-y-5">
        {gauges.map((gauge, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-lg ${gauge.color}`}>
                  {gauge.icon}
                </span>
                <div>
                  <p className="text-label-sm font-semibold text-on-surface">{gauge.label}</p>
                  <p className="text-[10px] text-on-surface-variant">{gauge.sublabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-label-md font-bold ${gauge.color}`}>
                  {gauge.confidence.toFixed(1)}%
                </p>
                <p className="text-[10px] text-on-surface-variant">confidence</p>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${gauge.bgColor}`}
                style={{ width: `${gauge.confidence}%` }}
              />
            </div>

            {/* Risk sub-bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-on-surface-variant w-12">Risk:</span>
              <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full opacity-60 ${gauge.bgColor}`}
                  style={{
                    width: `${gauge.risk}%`,
                    transition: 'width 1.2s ease-out',
                  }}
                />
              </div>
              <span className={`text-[10px] font-semibold ${gauge.color} w-8 text-right`}>
                {gauge.risk}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-outline-variant/20">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
            Model Confidence
          </span>
          <span className="text-label-sm font-bold text-primary-fixed-dim">
            {((gauges.reduce((s, g) => s + g.confidence, 0) / gauges.length)).toFixed(1)}% avg
          </span>
        </div>
        <div className="h-1 bg-surface-container-high rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-primary-fixed-dim rounded-full"
            style={{
              width: `${gauges.reduce((s, g) => s + g.confidence, 0) / gauges.length}%`,
              transition: 'width 1.5s ease-out',
            }}
          />
        </div>
      </div>
    </div>
  )
}