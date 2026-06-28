import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { toAssessmentWithResults } from '@/lib/utils'
import type { AssessmentHistoryPoint, TimelinePredictionData, TimelinePredictionPoint } from '@/types'
import AssessmentSelector from '@/components/assessment/AssessmentSelector'
import CumulativeRiskChart from '@/components/trends/CumulativeRiskChart'

import VarianceTable from '@/components/trends/VarianceTable'
import RiskHeatmap from '@/components/trends/RiskHeatmap'
import HealthTimelineChart from '@/components/trends/HealthTimelineChart'
import TimelineForecastPanel from '@/components/trends/TimelineForecastPanel'
import DiseaseTrendCard from '@/components/trends/DiseaseTrendCard'
import ClientTimelineTrigger from './ClientTimelineTrigger'

interface Props {
  params: { id: string }
}

export default async function TrendsPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const raw = await db.assessment.findUnique({ where: { id: params.id } })
  if (!raw || raw.userId !== session.user.id) notFound()
  const assessment = toAssessmentWithResults(raw)

  // Fetch all completed assessments for historical trend data
  const allRaw = await db.assessment.findMany({
    where: { userId: session.user.id, analysisStatus: 'COMPLETE' },
    orderBy: { createdAt: 'asc' },
  })
  const allAssessments = allRaw.map(toAssessmentWithResults)

  const history: AssessmentHistoryPoint[] = allAssessments.map(a => ({
    date: a.createdAt,
    overallHealthIndex: a.overallHealthIndex,
    diabetesRisk: a.diabetesRisk,
    heartDiseaseRisk: a.heartDiseaseRisk,
    hypertensionRisk: a.hypertensionRisk,
    strokeRisk: a.strokeRisk,
    kidneyDiseaseRisk: a.kidneyDiseaseRisk,
    liverDiseaseRisk: a.liverDiseaseRisk,
  }))

  // Check for existing timeline prediction
  const existingPrediction = await db.timelinePrediction.findFirst({
    where: { userId: session.user.id, baseAssessmentId: params.id },
    orderBy: { createdAt: 'desc' },
  })

  let predictionData: TimelinePredictionData | null = null
  if (existingPrediction) {
    const scores = existingPrediction.predictedScores as unknown as TimelinePredictionPoint[]
    const ci = existingPrediction.confidenceInterval as unknown as { upper: TimelinePredictionPoint[]; lower: TimelinePredictionPoint[] } | null
    predictionData = {
      baseAssessmentId: existingPrediction.baseAssessmentId,
      predictedScores: scores,
      confidenceInterval: ci ?? undefined,
      modelVersion: existingPrediction.modelVersion,
      insight: '',
      projectionMonths: scores.length,
    }
  }

  // Compute sparkline data for each disease from history
  const diseaseSparklines = {
    heartDisease: history.map(h => h.heartDiseaseRisk ?? 40),
    diabetes: history.map(h => h.diabetesRisk ?? 50),
    hypertension: history.map(h => h.hypertensionRisk ?? 45),
    stroke: history.map(h => h.strokeRisk ?? 25),
    kidneyDisease: history.map(h => h.kidneyDiseaseRisk ?? 20),
    liverDisease: history.map(h => h.liverDiseaseRisk ?? 15),
  }

  const hasRiskData = assessment.analysisStatus === 'COMPLETE'
  const risk = (val: number | null) => val ?? 50

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

      {!hasRiskData ? (
        <div className="surface-glass rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-4 block">trending_up</span>
          <h2 className="text-headline-md font-semibold text-on-surface mb-2">Analysis Required</h2>
          <p className="text-body-md text-on-surface-variant">Complete the AI analysis on this assessment to view trend data.</p>
        </div>
      ) : (
        <>
          {/* Dynamic Health Timeline — AI-predicted forecast */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              {predictionData ? (
                <HealthTimelineChart
                  historical={history}
                  prediction={predictionData.predictedScores}
                  confidenceUpper={predictionData.confidenceInterval?.upper}
                  confidenceLower={predictionData.confidenceInterval?.lower}
                  insight={predictionData.insight}
                />
              ) : (
                <CumulativeRiskChart
                  overallHealthIndex={assessment.overallHealthIndex}
                  createdAt={assessment.createdAt}
                />
              )}
            </div>
            <div className="col-span-12 lg:col-span-4">
              {predictionData ? (
                <TimelineForecastPanel
                  prediction={predictionData}
                  historical={history}
                />
              ) : (
                <div className="surface-glass rounded-2xl p-6 flex flex-col items-center justify-center h-full gap-4">
                  <span className="material-symbols-outlined text-primary-fixed-dim text-3xl">auto_awesome</span>
                  <div className="text-center">
                    <h3 className="text-headline-sm font-semibold text-on-surface mb-1">AI Forecast Available</h3>
                    <p className="text-label-sm text-on-surface-variant mb-4">Generate a 6-month health trajectory prediction powered by Neural Network analysis of your historical data.</p>
                    <ClientTimelineTrigger
                      assessmentId={params.id}
                      label="Generate Forecast"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6 Disease Trend Cards with AI-predicted values */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">monitor_heart</span>
              <h2 className="text-label-md font-semibold text-on-surface uppercase tracking-wider">Disease Risk Trends</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <DiseaseTrendCard
                title="Cardiovascular"
                icon="cardiology"
                currentRisk={risk(assessment.heartDiseaseRisk)}
                predictedRisk={predictionData?.predictedScores[predictionData.predictedScores.length - 1]?.heartDiseaseRisk ?? risk(assessment.heartDiseaseRisk)}
                historicalRisks={diseaseSparklines.heartDisease}
                upperBound={predictionData?.confidenceInterval?.upper?.[predictionData.confidenceInterval.upper.length - 1]?.heartDiseaseRisk}
                lowerBound={predictionData?.confidenceInterval?.lower?.[predictionData.confidenceInterval.lower.length - 1]?.heartDiseaseRisk}
                level={assessment.heartDiseaseLevel}
              />
              <DiseaseTrendCard
                title="Diabetes"
                icon="bloodtype"
                currentRisk={risk(assessment.diabetesRisk)}
                predictedRisk={predictionData?.predictedScores[predictionData.predictedScores.length - 1]?.diabetesRisk ?? risk(assessment.diabetesRisk)}
                historicalRisks={diseaseSparklines.diabetes}
                upperBound={predictionData?.confidenceInterval?.upper?.[predictionData.confidenceInterval.upper.length - 1]?.diabetesRisk}
                lowerBound={predictionData?.confidenceInterval?.lower?.[predictionData.confidenceInterval.lower.length - 1]?.diabetesRisk}
                level={assessment.diabetesLevel}
              />
              <DiseaseTrendCard
                title="Hypertension"
                icon="monitor_heart"
                currentRisk={risk(assessment.hypertensionRisk)}
                predictedRisk={predictionData?.predictedScores[predictionData.predictedScores.length - 1]?.hypertensionRisk ?? risk(assessment.hypertensionRisk)}
                historicalRisks={diseaseSparklines.hypertension}
                upperBound={predictionData?.confidenceInterval?.upper?.[predictionData.confidenceInterval.upper.length - 1]?.hypertensionRisk}
                lowerBound={predictionData?.confidenceInterval?.lower?.[predictionData.confidenceInterval.lower.length - 1]?.hypertensionRisk}
                level={assessment.hypertensionLevel}
              />
              <DiseaseTrendCard
                title="Stroke"
                icon="neurology"
                currentRisk={risk(assessment.strokeRisk)}
                predictedRisk={predictionData?.predictedScores[predictionData.predictedScores.length - 1]?.strokeRisk ?? risk(assessment.strokeRisk)}
                historicalRisks={diseaseSparklines.stroke}
                upperBound={predictionData?.confidenceInterval?.upper?.[predictionData.confidenceInterval.upper.length - 1]?.strokeRisk}
                lowerBound={predictionData?.confidenceInterval?.lower?.[predictionData.confidenceInterval.lower.length - 1]?.strokeRisk}
                level={assessment.strokeLevel}
              />
              <DiseaseTrendCard
                title="Kidney Disease"
                icon="water_drop"
                currentRisk={risk(assessment.kidneyDiseaseRisk)}
                predictedRisk={predictionData?.predictedScores[predictionData.predictedScores.length - 1]?.kidneyDiseaseRisk ?? risk(assessment.kidneyDiseaseRisk)}
                historicalRisks={diseaseSparklines.kidneyDisease}
                upperBound={predictionData?.confidenceInterval?.upper?.[predictionData.confidenceInterval.upper.length - 1]?.kidneyDiseaseRisk}
                lowerBound={predictionData?.confidenceInterval?.lower?.[predictionData.confidenceInterval.lower.length - 1]?.kidneyDiseaseRisk}
                level={assessment.kidneyDiseaseLevel}
              />
              <DiseaseTrendCard
                title="Liver Disease"
                icon="local_hospital"
                currentRisk={risk(assessment.liverDiseaseRisk)}
                predictedRisk={predictionData?.predictedScores[predictionData.predictedScores.length - 1]?.liverDiseaseRisk ?? risk(assessment.liverDiseaseRisk)}
                historicalRisks={diseaseSparklines.liverDisease}
                upperBound={predictionData?.confidenceInterval?.upper?.[predictionData.confidenceInterval.upper.length - 1]?.liverDiseaseRisk}
                lowerBound={predictionData?.confidenceInterval?.lower?.[predictionData.confidenceInterval.lower.length - 1]?.liverDiseaseRisk}
                level={assessment.liverDiseaseLevel}
              />
            </div>
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
        </>
      )}
    </div>
  )
}