import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toAssessmentWithResults } from '@/lib/utils'
import { AssessmentWithResults, AssessmentListItem } from '@/types'
import StatsCard from '@/components/dashboard/StatsCard'
import RiskProfileGrid from '@/components/dashboard/RiskProfileGrid'
import HealthTrendChart from '@/components/dashboard/HealthTrendChart'
import ActivityTimeline from '@/components/dashboard/ActivityTimeline'
import HealthScoreGauge from '@/components/dashboard/HealthScoreGauge'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Fetch all assessments for this user
  const rawAssessments = await db.assessment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const assessments: AssessmentWithResults[] = rawAssessments.map(toAssessmentWithResults)

  const completed = assessments.filter((a) => a.analysisStatus === 'COMPLETE')
  const latestAssessment: AssessmentWithResults | null = completed[0] ?? null

  // Build list items for chart (no need to cast JSON for lightweight list)
  const listItems: AssessmentListItem[] = assessments.map((a) => ({
    id: a.id,
    createdAt: a.createdAt,
    label: a.label,
    overallHealthIndex: a.overallHealthIndex,
    analysisStatus: a.analysisStatus,
    diabetesLevel: a.diabetesLevel,
    heartDiseaseLevel: a.heartDiseaseLevel,
    hypertensionLevel: a.hypertensionLevel,
  }))

  // Stats calculations
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, a) => sum + (a.overallHealthIndex ?? 0), 0) / completed.length
        )
      : 0

  const activeRisks = latestAssessment
    ? [
        latestAssessment.diabetesLevel,
        latestAssessment.heartDiseaseLevel,
        latestAssessment.hypertensionLevel,
        latestAssessment.strokeLevel,
        latestAssessment.kidneyDiseaseLevel,
        latestAssessment.liverDiseaseLevel,
      ].filter((l) => l === 'HIGH' || l === 'CRITICAL').length
    : 0

  const firstName = session.user.name?.split(' ')[0] ?? 'Doctor'

  return (
    <div className="min-h-screen p-xl relative">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">
              Clinical Overview
            </p>
            <h1 className="text-headline-lg font-bold text-on-surface">
              Welcome back,{' '}
              <span className="gradient-text">{firstName}</span>
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              {completed.length > 0
                ? `You have ${assessments.length} assessment${assessments.length !== 1 ? 's' : ''} on record. Latest health score: ${latestAssessment?.overallHealthIndex ?? '—'}/100.`
                : 'No assessments yet. Start your first clinical analysis below.'}
            </p>
          </div>
          <Link
            href="/assessment/new"
            className="btn-cyan px-6 py-3 text-label-md flex items-center gap-2 hidden md:flex"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              add_circle
            </span>
            New Assessment
          </Link>
        </div>
      </div>

      {assessments.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24">
          <div className="surface-glass rounded-2xl p-12 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-primary-fixed-dim/10 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: '40px' }}>
                clinical_notes
              </span>
            </div>
            <h2 className="text-headline-sm font-bold text-on-surface mb-3">
              No Assessments Yet
            </h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              Run your first AI-powered clinical assessment to see your health dashboard come to life.
            </p>
            <Link href="/assessment/new" className="btn-cyan px-8 py-3 text-label-md inline-flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span>
              Start First Assessment
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 4 Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              icon="assignment"
              label="Total Assessments"
              value={assessments.length}
              change={assessments.length > 0 ? `${completed.length} complete` : undefined}
              changeType="positive"
            />

            <div className="surface-glass rounded-xl p-lg flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed-dim/5 to-transparent rounded-xl pointer-events-none" />
              <div className="w-10 h-10 rounded-lg bg-primary-fixed-dim/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: '20px' }}>
                  favorite
                </span>
              </div>
              <div className="flex items-end gap-4">
                <HealthScoreGauge score={avgScore} size={80} showLabel={false} />
                <div>
                  <div className="text-headline-md font-bold text-on-surface tabular-nums">
                    {avgScore}
                  </div>
                  <div className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Avg Health Score
                  </div>
                </div>
              </div>
            </div>

            <StatsCard
              icon="warning"
              label="Active Risks"
              value={activeRisks}
              change={activeRisks > 0 ? 'Requires attention' : 'All clear'}
              changeType={activeRisks > 2 ? 'negative' : activeRisks > 0 ? 'neutral' : 'positive'}
            />

            <StatsCard
              icon="calendar_month"
              label="Next Checkup"
              value={
                latestAssessment?.urgency === 'URGENT'
                  ? 'Immediate'
                  : latestAssessment?.urgency === 'SOON'
                  ? '2–4 Weeks'
                  : latestAssessment?.urgency === 'WATCH'
                  ? '1–2 Months'
                  : '6 Months'
              }
              change={latestAssessment?.urgency ?? undefined}
              changeType={
                latestAssessment?.urgency === 'URGENT' || latestAssessment?.urgency === 'SOON'
                  ? 'negative'
                  : 'positive'
              }
            />
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Risk Profile Grid — col-span-5 */}
            <div className="col-span-12 lg:col-span-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-label-md font-semibold text-on-surface uppercase tracking-wider">
                  Disease Risk Profile
                </h2>
                {latestAssessment && (
                  <Link
                    href={`/results/${latestAssessment.id}`}
                    className="text-[10px] text-primary-fixed-dim hover:text-primary-fixed uppercase tracking-wider transition-colors"
                  >
                    Full Report →
                  </Link>
                )}
              </div>
              <RiskProfileGrid latestAssessment={latestAssessment} />
            </div>

            {/* Health Trend Chart — col-span-4 */}
            <div className="col-span-12 lg:col-span-4">
              <div className="mb-3">
                <h2 className="text-label-md font-semibold text-on-surface uppercase tracking-wider">
                  Score Trend
                </h2>
              </div>
              <HealthTrendChart assessments={listItems} />
            </div>

            {/* Activity Timeline — col-span-3 */}
            <div className="col-span-12 lg:col-span-3">
              <div className="mb-3">
                <h2 className="text-label-md font-semibold text-on-surface uppercase tracking-wider">
                  Recent Activity
                </h2>
              </div>
              <ActivityTimeline assessments={listItems} />
            </div>
          </div>

          {/* Latest Assessment Quick Stats */}
          {latestAssessment && (
            <div className="mt-6">
              <div className="surface-glass rounded-xl p-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-label-md font-semibold text-on-surface uppercase tracking-wider">
                      Latest Assessment Snapshot
                    </h2>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      Neural Network — Best engine results
                    </p>
                  </div>
                  <Link
                    href={`/results/${latestAssessment.id}`}
                    className="text-label-sm text-primary-fixed-dim hover:text-primary-fixed transition-colors flex items-center gap-1"
                  >
                    <span>View Full Analysis</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      arrow_forward
                    </span>
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {[
                    { label: 'Age', value: `${latestAssessment.age} yrs`, icon: 'person' },
                    { label: 'BMI', value: latestAssessment.bmi.toFixed(1), icon: 'monitor_weight' },
                    {
                      label: 'Blood Pressure',
                      value: `${latestAssessment.systolicBP}/${latestAssessment.diastolicBP}`,
                      icon: 'monitor_heart',
                    },
                    { label: 'Heart Rate', value: `${latestAssessment.heartRate} BPM`, icon: 'favorite' },
                    {
                      label: 'SpO₂',
                      value: `${latestAssessment.oxygenSat.toFixed(1)}%`,
                      icon: 'air',
                    },
                    {
                      label: 'Glucose',
                      value: `${latestAssessment.fastingGlucose} mg/dL`,
                      icon: 'glucose',
                    },
                    {
                      label: 'HbA1c',
                      value: `${latestAssessment.hba1c}%`,
                      icon: 'biotech',
                    },
                    {
                      label: 'Cholesterol',
                      value: `${latestAssessment.cholesterol} mg/dL`,
                      icon: 'labs',
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col gap-1 p-3 rounded-lg bg-surface-container/50"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="material-symbols-outlined text-on-surface-variant"
                          style={{ fontSize: '13px' }}
                        >
                          {stat.icon}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-on-surface-variant">
                          {stat.label}
                        </span>
                      </div>
                      <span className="text-label-md font-bold text-on-surface tabular-nums">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Urgency banner if needed */}
                {latestAssessment.urgency && latestAssessment.urgency !== 'MONITOR' && (
                  <div
                    className={`mt-4 flex items-center gap-3 px-4 py-3 rounded-lg ${
                      latestAssessment.urgency === 'URGENT' || latestAssessment.urgency === 'SOON'
                        ? 'bg-error/10 border border-error/20'
                        : 'bg-secondary/10 border border-secondary/20'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined ${
                        latestAssessment.urgency === 'URGENT' || latestAssessment.urgency === 'SOON'
                          ? 'text-error'
                          : 'text-secondary'
                      }`}
                      style={{ fontSize: '20px' }}
                    >
                      {latestAssessment.urgency === 'URGENT'
                        ? 'emergency'
                        : latestAssessment.urgency === 'SOON'
                        ? 'schedule'
                        : 'visibility'}
                    </span>
                    <div>
                      <p
                        className={`text-label-md font-semibold ${
                          latestAssessment.urgency === 'URGENT' ||
                          latestAssessment.urgency === 'SOON'
                            ? 'text-error'
                            : 'text-secondary'
                        }`}
                      >
                        {latestAssessment.urgency === 'URGENT'
                          ? 'Immediate medical attention recommended'
                          : latestAssessment.urgency === 'SOON'
                          ? 'Schedule a checkup within 2–4 weeks'
                          : 'Monitor your health closely'}
                      </p>
                      {latestAssessment.urgencyText && (
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {latestAssessment.urgencyText}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/recommendations/${latestAssessment.id}`}
                      className="ml-auto text-label-sm text-primary-fixed-dim hover:text-primary-fixed transition-colors whitespace-nowrap"
                    >
                      View Plan →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Nav Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            {latestAssessment &&
              [
                {
                  href: `/engines/${latestAssessment.id}`,
                  icon: 'biotech',
                  label: 'Engine Comparison',
                  desc: '10 AI models',
                },
                {
                  href: `/detection/${latestAssessment.id}`,
                  icon: 'radar',
                  label: 'Early Detection',
                  desc: 'Anomaly scan',
                },
                {
                  href: `/trends/${latestAssessment.id}`,
                  icon: 'trending_up',
                  label: 'Risk Trends',
                  desc: 'Track changes',
                },
                {
                  href: `/recommendations/${latestAssessment.id}`,
                  icon: 'clinical_notes',
                  label: 'Recommendations',
                  desc: 'Care plan',
                },
                {
                  href: '/history',
                  icon: 'history',
                  label: 'History',
                  desc: 'All assessments',
                },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="surface-glass rounded-xl p-md flex items-center gap-3 hover:border-primary-fixed-dim/30 transition-all duration-200 group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-primary-fixed-dim/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-fixed-dim/20 transition-colors">
                      <span
                        className="material-symbols-outlined text-primary-fixed-dim"
                        style={{ fontSize: '18px' }}
                      >
                        {item.icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-label-sm font-semibold text-on-surface truncate">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">{item.desc}</p>
                    </div>
                    <span
                      className="material-symbols-outlined text-on-surface-variant ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ fontSize: '16px' }}
                    >
                      arrow_forward
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </>
      )}
    </div>
  )
}