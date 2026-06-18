import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toAssessmentWithResults } from '@/lib/utils'
import AssessmentSelector from '@/components/assessment/AssessmentSelector'
import PrimaryDirectiveCard from '@/components/recommendations/PrimaryDirectiveCard'
import MedicationSyncCard from '@/components/recommendations/MedicationSyncCard'
import LifestyleEngineCard from '@/components/recommendations/LifestyleEngineCard'
import CarePathwayTimeline from '@/components/recommendations/CarePathwayTimeline'
import ConsultFAB from '../ConsultFAB'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `Recommendations — MediSense AI`,
  }
}

export default async function RecommendationsPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const raw = await db.assessment.findUnique({
    where: { id: params.id },
  })

  if (!raw) notFound()
  if (raw.userId !== session.user.id) notFound()

  const assessment = toAssessmentWithResults(raw)

  if (assessment.analysisStatus === 'PENDING' || assessment.analysisStatus === 'RUNNING') {
    return (
      <div className="p-xl">
        {/* Atmospheric background */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-primary-fixed-dim/30 animate-spin-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-fixed-dim text-3xl">
                clinical_notes
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-headline-md font-semibold text-on-surface mb-2">
              Generating Recommendations
            </p>
            <p className="text-body-md text-on-surface-variant">
              AI analysis in progress — recommendations will appear when complete.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (assessment.analysisStatus === 'FAILED') {
    return (
      <div className="p-xl">
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-error/5 blur-[120px] rounded-full" />
        </div>
        <div className="max-w-lg mx-auto mt-24 surface-glass rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-error text-5xl mb-4 block">
            error
          </span>
          <h2 className="text-headline-md font-semibold text-on-surface mb-2">
            Analysis Failed
          </h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            {assessment.analysisError ?? 'The AI analysis could not be completed.'}
          </p>
          <a href="/assessment/new" className="btn-cyan inline-flex items-center gap-2 px-6 py-3">
            <span className="material-symbols-outlined text-base">add_circle</span>
            Start New Assessment
          </a>
        </div>
      </div>
    )
  }

  // No recommendations data guard
  if (!assessment.recommendations) {
    return (
      <div className="p-xl">
        <div className="max-w-lg mx-auto mt-24 surface-glass rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-4 block">
            clinical_notes
          </span>
          <h2 className="text-headline-md font-semibold text-on-surface mb-2">
            No Recommendations Available
          </h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Recommendations are generated as part of the AI analysis. Please run a new assessment.
          </p>
          <a href="/assessment/new" className="btn-cyan inline-flex items-center gap-2 px-6 py-3">
            <span className="material-symbols-outlined text-base">add_circle</span>
            New Assessment
          </a>
        </div>
      </div>
    )
  }

  const recommendations = assessment.recommendations

  return (
    <div className="p-xl relative">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[30%] w-[25%] h-[25%] bg-tertiary-fixed-dim/3 blur-[100px] rounded-full" />
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-primary-fixed-dim rounded-full animate-pulse" />
              <p className="text-label-sm uppercase tracking-[0.2em] text-primary-fixed-dim">
                AI-Powered
              </p>
            </div>
            <h1 className="text-headline-lg font-bold text-on-surface mb-2">
              Personalized Recommendations
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Clinical directives generated by Neural Network analysis
            </p>
          </div>

          {/* Urgency badge */}
          {assessment.urgency && (
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-label-md font-semibold ${
                assessment.urgency === 'URGENT' || assessment.urgency === 'SOON'
                  ? 'bg-error/10 border-error/30 text-error'
                  : assessment.urgency === 'WATCH'
                    ? 'bg-secondary/10 border-secondary/30 text-secondary'
                    : 'bg-tertiary-fixed-dim/10 border-tertiary-fixed-dim/30 text-tertiary-fixed-dim'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {assessment.urgency === 'URGENT' ? 'emergency' : assessment.urgency === 'SOON' ? 'schedule' : assessment.urgency === 'WATCH' ? 'visibility' : 'check_circle'}
              </span>
              {assessment.urgency}
              {assessment.urgencyText && (
                <span className="text-label-sm font-normal hidden md:inline">
                  — {assessment.urgencyText}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assessment Selector */}
      <div className="mb-6">
        <AssessmentSelector currentId={params.id} basePath="/recommendations" />
      </div>

      {/* Key factors strip */}
      {assessment.keyFactors.length > 0 && (
        <div className="surface-glass rounded-xl p-4 mb-6 flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="material-symbols-outlined text-primary-fixed-dim text-base">
              warning
            </span>
            <span className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">
              Key Factors
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {assessment.keyFactors.map((factor, i) => (
              <span
                key={i}
                className="text-label-sm px-3 py-1 bg-surface-container rounded-full border border-outline-variant/20 text-on-surface-variant whitespace-nowrap"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top row: PrimaryDirectiveCard (col-span-8) + MedicationSyncCard (col-span-4) */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 lg:col-span-8">
          <PrimaryDirectiveCard
            recommendations={recommendations}
            urgency={assessment.urgency}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <MedicationSyncCard recommendations={recommendations} />
        </div>
      </div>

      {/* Bottom row: LifestyleEngineCard (col-span-7) + CarePathwayTimeline (col-span-5) */}
      <div className="grid grid-cols-12 gap-6 mb-24">
        <div className="col-span-12 lg:col-span-7">
          <LifestyleEngineCard recommendations={recommendations} />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <CarePathwayTimeline recommendations={recommendations} />
        </div>
      </div>

      {/* Consult Clinical AI FAB */}
      <ConsultFAB />
    </div>
  )
}