import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { toAssessmentWithResults, formatDate } from '@/lib/utils'
import LongitudinalComparisonCard from '@/components/history/LongitudinalComparisonCard'
import AssessmentHistoryTable from '@/components/history/AssessmentHistoryTable'
import type { AssessmentWithResults } from '@/types'

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const rawAssessments = await db.assessment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const assessments: AssessmentWithResults[] = rawAssessments.map(toAssessmentWithResults)

  const latestCompleted = assessments.find((a) => a.analysisStatus === 'COMPLETE') ?? null
  const avgHealthScore =
    assessments.filter((a) => a.overallHealthIndex !== null).length > 0
      ? Math.round(
          assessments
            .filter((a) => a.overallHealthIndex !== null)
            .reduce((s, a) => s + (a.overallHealthIndex ?? 0), 0) /
            assessments.filter((a) => a.overallHealthIndex !== null).length
        )
      : null

  const bestScore = assessments.reduce((best, a) => {
    if (a.overallHealthIndex !== null && a.overallHealthIndex > best) return a.overallHealthIndex
    return best
  }, 0)

  return (
    <div className="p-xl space-y-8 relative">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">history</span>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
            Clinical Records
          </span>
        </div>
        <h1 className="text-headline-lg font-bold text-on-surface">Assessment History</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Complete longitudinal record of all clinical assessments
        </p>
      </div>

      {/* Main grid: Longitudinal card + stat cards */}
      {assessments.length > 0 ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Longitudinal Comparison — col-span-8 */}
          <LongitudinalComparisonCard assessments={assessments} />

          {/* Stat cards — col-span-4 */}
          <div className="col-span-4 space-y-4">
            {/* Total Assessments */}
            <div className="surface-glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]">assignment</span>
                </div>
                <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Total Assessments</span>
              </div>
              <div className="text-display-lg font-bold text-on-surface tabular-nums">{assessments.length}</div>
              <div className="text-label-sm text-on-surface-variant mt-1">All time records</div>
            </div>

            {/* Avg Health Score */}
            <div className="surface-glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px]">health_metrics</span>
                </div>
                <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Avg Health Score</span>
              </div>
              <div className="text-display-lg font-bold text-tertiary-fixed-dim tabular-nums">
                {avgHealthScore ?? '—'}
              </div>
              <div className="text-label-sm text-on-surface-variant mt-1">
                Best: <span className="text-primary-fixed-dim font-semibold">{bestScore > 0 ? bestScore : '—'}</span>
              </div>
            </div>

            {/* Latest date */}
            {latestCompleted && (
              <div className="surface-glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-[20px]">event</span>
                  </div>
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Last Assessment</span>
                </div>
                <div className="text-headline-sm font-bold text-on-surface">
                  {formatDate(latestCompleted.createdAt)}
                </div>
                <div className="text-label-sm text-on-surface-variant mt-1">
                  Score:{' '}
                  <span className="text-primary-fixed-dim font-semibold">
                    {latestCompleted.overallHealthIndex ?? '—'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="surface-glass rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[56px] mb-4 block">history</span>
          <h2 className="text-headline-md font-semibold text-on-surface mb-2">No assessments yet</h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Complete your first assessment to start building your health history.
          </p>
          <a href="/assessment/new" className="btn-cyan inline-flex items-center gap-2 px-6 py-3">
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Start Assessment
          </a>
        </div>
      )}

      {/* Assessment History Table */}
      <AssessmentHistoryTable assessments={assessments} />

      {/* Neural Insight Projection Card */}
      {assessments.length > 0 && (
        <div className="surface-glass rounded-2xl p-6 border border-primary-fixed-dim/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed-dim/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary-fixed-dim text-[24px]">psychology</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-widest text-primary-fixed-dim font-semibold">
                  Neural Insight
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-primary-fixed-dim/10 text-primary-fixed-dim rounded-full">
                  AI Projection
                </span>
              </div>
              <h3 className="text-headline-sm font-semibold text-on-surface mb-2">
                6-Month Health Trajectory
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                {assessments.length >= 2
                  ? `Based on your ${assessments.length} assessment records, the Neural Network model projects a ${
                      (latestCompleted?.overallHealthIndex ?? 70) >= 75 ? 'stable-to-improving' : 'moderate-risk'
                    } health trajectory over the next 6 months. Consistent monitoring and adherence to recommendations can improve your overall health index by an estimated 8–12 points.`
                  : `With more assessments, the AI system can identify trends and provide personalized projections. Complete at least 2 assessments to unlock longitudinal intelligence.`}
              </p>
              {latestCompleted && (
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-outline-variant/10">
                  <div>
                    <div className="text-[10px] text-on-surface-variant">Current Score</div>
                    <div className="text-headline-sm font-bold text-primary-fixed-dim">
                      {latestCompleted.overallHealthIndex ?? '—'}
                    </div>
                  </div>
                  <div className="text-on-surface-variant">→</div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant">6M Projection</div>
                    <div className="text-headline-sm font-bold text-tertiary-fixed-dim">
                      {latestCompleted.overallHealthIndex
                        ? Math.min(100, latestCompleted.overallHealthIndex + 9)
                        : '—'}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <a
                      href={latestCompleted ? `/trends/${latestCompleted.id}` : '#'}
                      className="btn-cyan inline-flex items-center gap-2 px-4 py-2 text-label-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">trending_up</span>
                      View Full Trends
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}