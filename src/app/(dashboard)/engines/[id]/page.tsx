import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toAssessmentWithResults } from '@/lib/utils'
import { ENGINE_DEFINITIONS } from '@/constants'
import AssessmentSelector from '@/components/assessment/AssessmentSelector'
import BestModelSpotlight from '@/components/engines/BestModelSpotlight'
import EngineCard from '@/components/engines/EngineCard'
import EngineMetricTable from '@/components/engines/EngineMetricTable'
import EnginesPageFAB from '@/components/engines/EnginesPageFAB'
import EnsembleWeightChart from '@/components/engines/EnsembleWeightChart'
import AgreementMatrix from '@/components/engines/AgreementMatrix'

interface Props {
  params: { id: string }
}

export default async function EnginesPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const raw = await db.assessment.findUnique({
    where: { id: params.id },
  })

  if (!raw) redirect('/history')
  if (raw.userId !== session.user.id) redirect('/dashboard')

  const assessment = toAssessmentWithResults(raw)
  const hasEnsemble = assessment.analysisStatus === 'COMPLETE' && assessment.ensembleMetrics

  const engineResults = assessment.engineResults ?? []
  const bestEngineResult = engineResults.find(r => r.isBest)

  // Remaining 9 engines (all except Neural Network)
  const otherEngines = ENGINE_DEFINITIONS.filter(def => def.name !== 'Neural Network')

  return (
    <div className="p-xl min-h-screen">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">biotech</span>
          <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">
            AI Model Comparison
          </span>
        </div>
        <h1 className="text-headline-lg font-bold text-on-surface">Engine Comparison</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          10 parallel AI models analyzed this assessment — review individual performance below.
        </p>
      </div>

      {/* Assessment selector */}
      <div className="mb-6">
        <AssessmentSelector currentId={params.id} basePath="/engines" />
      </div>

      {/* Best Model Spotlight */}
      <div className="mb-8">
        <BestModelSpotlight engineResult={bestEngineResult} />
      </div>

      {/* ─── Hybrid AI Ensemble Section ──────────────────────────────────── */}
      {hasEnsemble && (
        <>
          <div className="flex items-center gap-3 mb-5 mt-10">
            <div className="h-px flex-1 bg-outline-variant/20" />
            <span className="text-label-sm text-on-surface-variant uppercase tracking-widest px-3">
              Hybrid AI Ensemble
            </span>
            <div className="h-px flex-1 bg-outline-variant/20" />
          </div>

          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 lg:col-span-7">
              <EnsembleWeightChart ensembleMetrics={assessment.ensembleMetrics!} />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <AgreementMatrix
                ensembleMetrics={assessment.ensembleMetrics!}
                engineCount={engineResults.length}
              />
            </div>
          </div>
        </>
      )}

      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-outline-variant/20" />
        <span className="text-label-sm text-on-surface-variant uppercase tracking-widest px-3">
          Remaining 9 Engines
        </span>
        <div className="h-px flex-1 bg-outline-variant/20" />
      </div>

      {/* 9 Engine cards grid — Decision Tree is wide (col-span-2) */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {otherEngines.map(def => {
          const result = engineResults.find(r => r.engine === def.name)
          const isDecisionTree = def.name === 'Decision Tree'

          const fallbackResult = {
            engine: def.name,
            accuracy: def.accuracy,
            modelVersion: def.version,
            inferenceMs: def.inferenceMs,
            isBest: false,
            falsePositiveRate: def.falsePositiveRate,
            reliabilityStars: def.reliabilityStars,
            status: def.status,
            diseases: {
              diabetes:      { risk: 0, level: 'LOW' as const,    confidence: 0 },
              heartDisease:  { risk: 0, level: 'LOW' as const,    confidence: 0 },
              hypertension:  { risk: 0, level: 'LOW' as const,    confidence: 0 },
              stroke:        { risk: 0, level: 'LOW' as const,    confidence: 0 },
              kidneyDisease: { risk: 0, level: 'LOW' as const,    confidence: 0 },
              liverDisease:  { risk: 0, level: 'LOW' as const,    confidence: 0 },
            },
            keyFactors:      [],
            recommendations: [],
            insight:         '',
            urgency:         'MONITOR' as const,
          }

          return (
            <EngineCard
              key={def.name}
              result={result ?? fallbackResult}
              icon={def.icon}
              wide={isDecisionTree}
            />
          )
        })}
      </div>

      {/* Metric table */}
      <div className="mb-24">
        <EngineMetricTable engineResults={engineResults} />
      </div>

      {/* FAB */}
      <EnginesPageFAB />
    </div>
  )
}