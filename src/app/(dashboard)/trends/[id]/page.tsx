import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { toAssessmentWithResults } from '@/lib/utils'
import AssessmentSelector from '@/components/assessment/AssessmentSelector'
import CumulativeRiskChart from '@/components/trends/CumulativeRiskChart'
import RiskComparisonCard from '@/components/trends/RiskComparisonCard'
import VarianceTable from '@/components/trends/VarianceTable'
import RiskHeatmap from '@/components/trends/RiskHeatmap'

interface Props {
  params: { id: string }
}

export default async function TrendsPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const raw = await db.assessment.findUnique({ where: { id: params.id } })
  if (!raw || raw.userId !== session.user.id) notFound()
  const assessment = toAssessmentWithResults(raw)

  return (
    <div className="p-xl space-y-8 relative">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">trending_up</span>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
              Risk Intelligence
            </span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">Risk Trends Analysis</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Longitudinal risk trajectory and predictive health forecasting
          </p>
        </div>

        {/* Assessment selector */}
        <div className="shrink-0">
          <AssessmentSelector currentId={params.id} basePath="/trends" />
        </div>
      </div>

      {/* Cumulative Risk Chart — full width */}
      <CumulativeRiskChart
        overallHealthIndex={assessment.overallHealthIndex}
        createdAt={assessment.createdAt}
      />

      {/* 3 Risk Comparison Cards */}
      <div className="grid grid-cols-3 gap-6">
        <RiskComparisonCard
          title="Cardiovascular"
          icon="cardiology"
          currentRisk={assessment.heartDiseaseRisk}
          level={assessment.heartDiseaseLevel}
          sparklineData={[
            Math.max(0, (assessment.heartDiseaseRisk ?? 40) - 12),
            Math.max(0, (assessment.heartDiseaseRisk ?? 40) - 6),
            Math.max(0, (assessment.heartDiseaseRisk ?? 40) + 3),
            Math.max(0, (assessment.heartDiseaseRisk ?? 40) - 2),
            assessment.heartDiseaseRisk ?? 40,
          ]}
        />
        <RiskComparisonCard
          title="Diabetes"
          icon="bloodtype"
          currentRisk={assessment.diabetesRisk}
          level={assessment.diabetesLevel}
          sparklineData={[
            Math.max(0, (assessment.diabetesRisk ?? 50) - 8),
            Math.max(0, (assessment.diabetesRisk ?? 50) - 3),
            Math.max(0, (assessment.diabetesRisk ?? 50) + 5),
            Math.max(0, (assessment.diabetesRisk ?? 50) + 2),
            assessment.diabetesRisk ?? 50,
          ]}
        />
        <RiskComparisonCard
          title="Hypertension"
          icon="monitor_heart"
          currentRisk={assessment.hypertensionRisk}
          level={assessment.hypertensionLevel}
          sparklineData={[
            Math.max(0, (assessment.hypertensionRisk ?? 45) - 10),
            Math.max(0, (assessment.hypertensionRisk ?? 45) - 4),
            Math.max(0, (assessment.hypertensionRisk ?? 45) + 4),
            Math.max(0, (assessment.hypertensionRisk ?? 45) - 1),
            assessment.hypertensionRisk ?? 45,
          ]}
        />
      </div>

      {/* Variance Table + Risk Heatmap */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <VarianceTable
            keyFactors={assessment.keyFactors}
            createdAt={assessment.createdAt}
          />
        </div>
        <div className="col-span-4">
          <RiskHeatmap
            overallHealthIndex={assessment.overallHealthIndex}
            createdAt={assessment.createdAt}
          />
        </div>
      </div>

      {/* Additional risk rows */}
      <div className="grid grid-cols-3 gap-6">
        <RiskComparisonCard
          title="Stroke"
          icon="neurology"
          currentRisk={assessment.strokeRisk}
          level={assessment.strokeLevel}
          sparklineData={[
            Math.max(0, (assessment.strokeRisk ?? 25) - 5),
            Math.max(0, (assessment.strokeRisk ?? 25) + 2),
            Math.max(0, (assessment.strokeRisk ?? 25) - 3),
            Math.max(0, (assessment.strokeRisk ?? 25) + 1),
            assessment.strokeRisk ?? 25,
          ]}
        />
        <RiskComparisonCard
          title="Kidney Disease"
          icon="water_drop"
          currentRisk={assessment.kidneyDiseaseRisk}
          level={assessment.kidneyDiseaseLevel}
          sparklineData={[
            Math.max(0, (assessment.kidneyDiseaseRisk ?? 20) - 4),
            Math.max(0, (assessment.kidneyDiseaseRisk ?? 20) + 3),
            Math.max(0, (assessment.kidneyDiseaseRisk ?? 20) - 2),
            Math.max(0, (assessment.kidneyDiseaseRisk ?? 20) + 1),
            assessment.kidneyDiseaseRisk ?? 20,
          ]}
        />
        <RiskComparisonCard
          title="Liver Disease"
          icon="local_hospital"
          currentRisk={assessment.liverDiseaseRisk}
          level={assessment.liverDiseaseLevel}
          sparklineData={[
            Math.max(0, (assessment.liverDiseaseRisk ?? 15) - 3),
            Math.max(0, (assessment.liverDiseaseRisk ?? 15) + 2),
            Math.max(0, (assessment.liverDiseaseRisk ?? 15) - 1),
            Math.max(0, (assessment.liverDiseaseRisk ?? 15) + 2),
            assessment.liverDiseaseRisk ?? 15,
          ]}
        />
      </div>
    </div>
  )
}