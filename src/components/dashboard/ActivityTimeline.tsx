import { AssessmentListItem, RiskLevel } from '@/types'
import { formatRelativeTime, getRiskColor, getRiskLabel } from '@/lib/utils'
import Link from 'next/link'

interface ActivityTimelineProps {
  assessments: AssessmentListItem[]
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const colors = getRiskColor(level)
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {getRiskLabel(level)}
    </span>
  )
}

function getOverallLevel(a: AssessmentListItem): RiskLevel {
  const levels: RiskLevel[] = [
    a.diabetesLevel,
    a.heartDiseaseLevel,
    a.hypertensionLevel,
  ].filter(Boolean) as RiskLevel[]

  const order: Record<RiskLevel, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
  if (levels.length === 0) return 'LOW'
  return levels.sort((a, b) => order[b] - order[a])[0]
}

export default function ActivityTimeline({ assessments }: ActivityTimelineProps) {
  const recent = assessments
    .filter((a) => a.analysisStatus === 'COMPLETE')
    .slice(0, 3)

  if (recent.length === 0) {
    return (
      <div className="surface-glass rounded-xl p-lg">
        <h3 className="text-label-md font-semibold text-on-surface uppercase tracking-wider mb-4">
          Recent Activity
        </h3>
        <div className="flex flex-col items-center justify-center py-8">
          <span className="material-symbols-outlined text-on-surface-variant mb-2" style={{ fontSize: '32px' }}>
            history
          </span>
          <p className="text-label-sm text-on-surface-variant">No assessments yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-glass rounded-xl p-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-label-md font-semibold text-on-surface uppercase tracking-wider">
          Recent Activity
        </h3>
        <Link
          href="/history"
          className="text-[10px] text-primary-fixed-dim hover:text-primary-fixed uppercase tracking-wider transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="relative">
        {/* Connector line */}
        {recent.length > 1 && (
          <div className="absolute left-[15px] top-8 bottom-8 w-px bg-gradient-to-b from-primary-fixed-dim/40 via-primary-fixed-dim/20 to-transparent" />
        )}

        <div className="flex flex-col gap-4">
          {recent.map((assessment, index) => {
            const overallLevel = getOverallLevel(assessment)
            const score = assessment.overallHealthIndex

            return (
              <Link key={assessment.id} href={`/results/${assessment.id}`}>
                <div className="flex items-start gap-4 group cursor-pointer">
                  {/* Cyan dot */}
                  <div className="relative flex-shrink-0 mt-1">
                    <div
                      className={`w-[30px] h-[30px] rounded-full flex items-center justify-center z-10 relative transition-transform duration-200 group-hover:scale-110
                        ${index === 0 ? 'bg-primary-fixed-dim/20 border border-primary-fixed-dim' : 'bg-surface-container-high border border-outline-variant'}`}
                    >
                      <span
                        className={`material-symbols-outlined ${index === 0 ? 'text-primary-fixed-dim' : 'text-on-surface-variant'}`}
                        style={{ fontSize: '14px' }}
                      >
                        {index === 0 ? 'radio_button_checked' : 'circle'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-label-md font-semibold text-on-surface group-hover:text-primary-fixed-dim transition-colors truncate">
                          {assessment.label ?? `Assessment #${assessment.id.slice(-5).toUpperCase()}`}
                        </p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {formatRelativeTime(assessment.createdAt)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        {score != null && (
                          <span className="text-label-sm font-bold text-primary-fixed-dim tabular-nums">
                            {score}
                            <span className="text-[9px] text-on-surface-variant font-normal"> /100</span>
                          </span>
                        )}
                        <RiskBadge level={overallLevel} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}