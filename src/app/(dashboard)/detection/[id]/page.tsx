import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toAssessmentWithResults } from '@/lib/utils'
import AssessmentSelector from '@/components/assessment/AssessmentSelector'
import AnomalyDetectionPanel from '@/components/detection/AnomalyDetectionPanel'
import ConditionConfidenceCard from '@/components/detection/ConditionConfidenceCard'
import UrgentInterventionCard from '@/components/detection/UrgentInterventionCard'
import GeneticMarkerGrid from '@/components/detection/GeneticMarkerGrid'
import { RISK_COLORS } from '@/constants'

interface Props {
  params: { id: string }
}

export default async function DetectionPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const raw = await db.assessment.findUnique({
    where: { id: params.id },
  })

  if (!raw) notFound()
  if (raw.userId !== session.user.id) redirect('/history')

  const assessment = toAssessmentWithResults(raw)

  if (assessment.analysisStatus === 'PENDING' || assessment.analysisStatus === 'RUNNING') {
    redirect(`/results/${params.id}`)
  }

  if (assessment.analysisStatus === 'FAILED') {
    return (
      <div className="p-xl">
        <div className="surface-glass rounded-2xl p-10 text-center max-w-lg mx-auto">
          <span className="material-symbols-outlined text-error text-5xl mb-4 block">error</span>
          <h2 className="text-headline-md text-on-surface mb-2">Analysis Failed</h2>
          <p className="text-on-surface-variant text-body-md mb-6">
            {assessment.analysisError ?? 'An error occurred during AI analysis.'}
          </p>
          <a href="/assessment/new" className="btn-cyan px-6 py-3 inline-block">
            Run New Assessment
          </a>
        </div>
      </div>
    )
  }

  const urgency = assessment.urgency ?? 'MONITOR'
  const healthIndex = assessment.overallHealthIndex ?? 0

  const activeRiskCount = [
    assessment.diabetesLevel,
    assessment.heartDiseaseLevel,
    assessment.hypertensionLevel,
    assessment.strokeLevel,
    assessment.kidneyDiseaseLevel,
    assessment.liverDiseaseLevel,
  ].filter(l => l === 'HIGH' || l === 'CRITICAL').length

  return (
    <div className="p-xl space-y-6 relative">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-error font-semibold bg-error/10 px-3 py-1 rounded-full border border-error/20">
              Diagnostic Level: High Stakes
            </span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface mb-1">
            Early Disease Detection
          </h1>
          <p className="text-body-md text-on-surface-variant">
            AI-powered anomaly detection and sub-clinical risk identification
          </p>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-4">
          <div className="surface-glass rounded-xl px-5 py-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Health Index</p>
            <p className={`text-headline-md font-bold ${
              healthIndex >= 80 ? 'text-tertiary-fixed-dim'
              : healthIndex >= 60 ? 'text-secondary'
              : healthIndex >= 40 ? 'text-amber-400'
              : 'text-error'
            }`}>
              {healthIndex}
            </p>
          </div>
          <div className="surface-glass rounded-xl px-5 py-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Active Risks</p>
            <p className={`text-headline-md font-bold ${activeRiskCount > 0 ? 'text-error' : 'text-tertiary-fixed-dim'}`}>
              {activeRiskCount}
            </p>
          </div>
          <div className={`surface-glass rounded-xl px-5 py-3 text-center border ${
            urgency === 'URGENT' || urgency === 'SOON'
              ? 'border-error/30'
              : urgency === 'WATCH'
              ? 'border-secondary/30'
              : 'border-tertiary-fixed-dim/30'
          }`}>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Urgency</p>
            <p className={`text-label-md font-bold ${
              urgency === 'URGENT' || urgency === 'SOON'
                ? 'text-error'
                : urgency === 'WATCH'
                ? 'text-secondary'
                : 'text-tertiary-fixed-dim'
            }`}>
              {urgency}
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Selector */}
      <AssessmentSelector currentId={params.id} basePath="/detection" />

      {/* Disease risk summary strip */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'Diabetes', risk: assessment.diabetesRisk, level: assessment.diabetesLevel },
          { label: 'Heart', risk: assessment.heartDiseaseRisk, level: assessment.heartDiseaseLevel },
          { label: 'Hypertension', risk: assessment.hypertensionRisk, level: assessment.hypertensionLevel },
          { label: 'Stroke', risk: assessment.strokeRisk, level: assessment.strokeLevel },
          { label: 'Kidney', risk: assessment.kidneyDiseaseRisk, level: assessment.kidneyDiseaseLevel },
          { label: 'Liver', risk: assessment.liverDiseaseRisk, level: assessment.liverDiseaseLevel },
        ].map((d) => {
          const colors = d.level ? RISK_COLORS[d.level] : RISK_COLORS.LOW
          return (
            <div key={d.label} className={`surface-glass rounded-xl p-3 border ${colors.border}`}>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">{d.label}</p>
              <p className={`text-headline-sm font-bold ${colors.text}`}>{d.risk ?? 0}%</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-semibold`}>
                {d.level ?? 'N/A'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Main 12-col grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Anomaly Detection Panel — col-span-7 */}
        <AnomalyDetectionPanel assessment={assessment} />

        {/* Right column — col-span-5 */}
        <div className="col-span-5 space-y-5">
          <ConditionConfidenceCard assessment={assessment} />
          <UrgentInterventionCard assessment={assessment} />
        </div>
      </div>

      {/* Genetic Marker Grid — full width */}
      <GeneticMarkerGrid assessment={assessment} />

      {/* Clinical note */}
      {assessment.clinicalInsight && (
        <div className="surface-glass rounded-2xl p-5 border border-primary-fixed-dim/10">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary-fixed-dim text-xl flex-shrink-0 mt-0.5">
              auto_awesome
            </span>
            <div>
              <p className="text-label-sm uppercase tracking-widest text-primary-fixed-dim mb-2">
                Neural Network Clinical Insight
              </p>
              <p className="text-body-md text-on-surface leading-relaxed">
                {assessment.clinicalInsight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-10 right-10 z-50">
        <button
          className="w-14 h-14 rounded-full btn-cyan flex items-center justify-center shadow-2xl"
          title="Detection Scan"
          style={{ boxShadow: '0 0 30px rgba(0, 219, 231, 0.4)' }}
        >
          <span className="material-symbols-outlined text-2xl">flare</span>
        </button>
      </div>
    </div>
  )
}