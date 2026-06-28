import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toAssessmentWithResults } from '@/lib/utils'
import AssessmentSelector from '@/components/assessment/AssessmentSelector'
import FeatureImportanceChart from '@/components/explain/FeatureImportanceChart'
import DiseaseFactorBreakdown from '@/components/explain/DiseaseFactorBreakdown'
import type { DiseaseKey } from '@/types'

interface Props {
  params: { id: string }
}

const DISEASE_CONFIG: Record<DiseaseKey, { label: string; icon: string }> = {
  diabetes: { label: 'Diabetes', icon: 'water_drop' },
  heartDisease: { label: 'Heart Disease', icon: 'cardiology' },
  hypertension: { label: 'Hypertension', icon: 'monitor_heart' },
  stroke: { label: 'Stroke', icon: 'neurology' },
  kidneyDisease: { label: 'Kidney Disease', icon: 'kidney' },
  liverDisease: { label: 'Liver Disease', icon: 'medical_services' },
}

export default async function ExplainPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const raw = await db.assessment.findUnique({ where: { id: params.id } })
  if (!raw || raw.userId !== session.user.id) notFound()

  const assessment = toAssessmentWithResults(raw)
  const explainability = assessment.explainability
  const hasData = assessment.analysisStatus === 'COMPLETE' && explainability

  return (
    <div className="p-xl relative min-h-screen">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">insights</span>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
            Explainable AI
          </span>
        </div>
        <h1 className="text-headline-lg font-bold text-on-surface">Prediction Explanation</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Understand what factors drove each disease risk prediction
        </p>
      </div>

      <AssessmentSelector currentId={params.id} basePath="/explain" />

      {!hasData ? (
        <div className="surface-glass rounded-2xl p-12 text-center mt-6">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-4 block">insights</span>
          <h2 className="text-headline-md font-semibold text-on-surface mb-2">Explainability Data Unavailable</h2>
          <p className="text-body-md text-on-surface-variant">
            Complete an AI analysis to see per-disease factor attribution.
          </p>
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          {/* Overall insight */}
          {explainability.overallInsight && (
            <div className="surface-glass rounded-2xl p-5 border border-primary-fixed-dim/10 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary-fixed-dim text-xl flex-shrink-0 mt-0.5">auto_awesome</span>
              <div>
                <p className="text-label-sm uppercase tracking-widest text-primary-fixed-dim mb-1">
                  {explainability.modelUsed} — Clinical Insight
                </p>
                <p className="text-body-md text-on-surface leading-relaxed">{explainability.overallInsight}</p>
              </div>
            </div>
          )}

          {/* Per-disease breakdowns */}
          <div className="space-y-6">
            <h2 className="text-headline-sm font-semibold text-on-surface">Per-Disease Factor Attribution</h2>

            {Object.entries(DISEASE_CONFIG).map(([key, cfg]) => {
              const diseaseKey = key as DiseaseKey
              const exp = explainability.perDisease[diseaseKey]
              if (!exp) return null

              const riskKey = `${diseaseKey}Risk` as keyof typeof assessment
              const levelKey = `${diseaseKey}Level` as keyof typeof assessment
              const riskVal = assessment[riskKey] as number | null ?? 0
              const levelVal = assessment[levelKey] as string | null ?? null
              return (
                <div key={key} className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-5">
                    <DiseaseFactorBreakdown
                      disease={cfg.label}
                      icon={cfg.icon}
                      risk={riskVal}
                      level={levelVal}
                      explainability={exp}
                    />
                  </div>
                  <div className="col-span-12 lg:col-span-7">
                    <div className="surface-glass rounded-2xl p-6">
                      {Object.keys(exp.featureImportance).length > 0 ? (
                        <FeatureImportanceChart
                          disease={cfg.label}
                          explainability={exp}
                        />
                      ) : (
                        <div className="text-center py-10 text-on-surface-variant text-label-sm">
                          <span className="material-symbols-outlined text-3xl mb-2 block">bar_chart</span>
                          Feature importance data not available for this disease prediction.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
