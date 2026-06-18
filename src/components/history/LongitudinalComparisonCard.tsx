// src/components/history/LongitudinalComparisonCard.tsx
import type { AssessmentWithResults } from '@/types'

interface LongitudinalComparisonCardProps {
  assessments: AssessmentWithResults[]
}

interface CategoryData {
  label: string
  icon: string
  current: number
  previous: number | null
  colorClass: string
  barColor: string
}

function getDelta(current: number, previous: number | null): number | null {
  if (previous === null) return null
  return current - previous
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-on-surface-variant text-label-sm">—</span>
  const isPositive = delta > 0
  return (
    <span className={`text-label-sm font-semibold ${isPositive ? 'text-error' : 'text-tertiary-fixed-dim'}`}>
      {isPositive ? '↑' : '↓'} {Math.abs(delta)}%
    </span>
  )
}

export default function LongitudinalComparisonCard({ assessments }: LongitudinalComparisonCardProps) {
  if (assessments.length === 0) {
    return (
      <div className="surface-glass rounded-2xl p-6 col-span-8">
        <p className="text-on-surface-variant text-body-md">No assessments available for comparison.</p>
      </div>
    )
  }

  const latest = assessments[0]
  const previous = assessments[1] ?? null

  const categories: CategoryData[] = [
    {
      label: 'Cardiovascular',
      icon: 'cardiology',
      current: latest.heartDiseaseRisk ?? 0,
      previous: previous?.heartDiseaseRisk ?? null,
      colorClass: 'text-error',
      barColor: '#ffb4ab',
    },
    {
      label: 'Metabolic',
      icon: 'bloodtype',
      current: latest.diabetesRisk ?? 0,
      previous: previous?.diabetesRisk ?? null,
      colorClass: 'text-secondary',
      barColor: '#4cd6ff',
    },
    {
      label: 'Neurological',
      icon: 'neurology',
      current: latest.strokeRisk ?? 0,
      previous: previous?.strokeRisk ?? null,
      colorClass: 'text-primary-fixed-dim',
      barColor: '#00dbe7',
    },
    {
      label: 'Hepatic',
      icon: 'water_drop',
      current: latest.liverDiseaseRisk ?? 0,
      previous: previous?.liverDiseaseRisk ?? null,
      colorClass: 'text-tertiary-fixed-dim',
      barColor: '#3cddc7',
    },
  ]

  const latestHR = latest.heartRate
  const latestBP = `${latest.systolicBP}/${latest.diastolicBP}`
  const prevHR = previous?.heartRate ?? null
  const prevBP = previous ? `${previous.systolicBP}/${previous.diastolicBP}` : null

  return (
    <div className="surface-glass rounded-2xl p-6 col-span-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-headline-sm font-semibold text-on-surface">Longitudinal Comparison</h3>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            {assessments.length >= 2
              ? `Comparing latest vs previous assessment`
              : 'Single assessment — no comparison available'}
          </p>
        </div>
        {previous && (
          <div className="text-label-sm text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg">
            {assessments.length} total assessments
          </div>
        )}
      </div>

      {/* Category bars */}
      <div className="space-y-5">
        {categories.map((cat) => {
          const delta = getDelta(cat.current, cat.previous)
          return (
            <div key={cat.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: cat.barColor }}>
                    {cat.icon}
                  </span>
                  <span className="text-label-md font-semibold text-on-surface">{cat.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  {cat.previous !== null && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full opacity-40"
                          style={{ width: `${cat.previous}%`, background: cat.barColor }}
                        />
                      </div>
                      <span className="text-[11px] text-on-surface-variant tabular-nums">{cat.previous}%</span>
                    </div>
                  )}
                  <DeltaBadge delta={delta} />
                  <span className="text-label-md font-bold tabular-nums" style={{ color: cat.barColor }}>
                    {cat.current}%
                  </span>
                </div>
              </div>

              {/* Dual bar */}
              <div className="relative h-3 bg-surface-container-high rounded-full overflow-hidden">
                {/* Previous bar (ghost) */}
                {cat.previous !== null && (
                  <div
                    className="absolute h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.previous}%`, background: cat.barColor, opacity: 0.2 }}
                  />
                )}
                {/* Current bar */}
                <div
                  className="absolute h-full rounded-full transition-all duration-700"
                  style={{ width: `${cat.current}%`, background: cat.barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Stat cards: Heart Rate + Blood Pressure */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/10">
        {/* Heart Rate */}
        <div className="bg-surface-container-high/40 rounded-xl p-4 border-l-4 border-error/60">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-error text-[18px]">favorite</span>
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Heart Rate</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-headline-md font-bold text-on-surface tabular-nums">
                {latestHR} <span className="text-label-sm font-normal text-on-surface-variant">BPM</span>
              </div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">Current</div>
            </div>
            {prevHR !== null && (
              <div className="text-right">
                <div className="text-body-md text-on-surface-variant tabular-nums">{prevHR} BPM</div>
                <div className="text-[11px] text-on-surface-variant">Previous</div>
                <DeltaBadge delta={latestHR - prevHR} />
              </div>
            )}
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="bg-surface-container-high/40 rounded-xl p-4 border-l-4 border-secondary/60">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-secondary text-[18px]">monitor_heart</span>
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Blood Pressure</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-headline-md font-bold text-on-surface tabular-nums">
                {latestBP} <span className="text-label-sm font-normal text-on-surface-variant">mmHg</span>
              </div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">Current</div>
            </div>
            {prevBP && (
              <div className="text-right">
                <div className="text-body-md text-on-surface-variant tabular-nums">{prevBP}</div>
                <div className="text-[11px] text-on-surface-variant">Previous</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}