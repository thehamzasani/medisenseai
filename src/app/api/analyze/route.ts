import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { runAllEngines, aggregateResults, computeExplainability } from '@/lib/claude'
import type { AssessmentInput, ApiResponse, TrendDirection, RiskDelta } from '@/types'

// type JsonInputValue =
//   | string
//   | number
//   | boolean
//   | null
//   | JsonInputValue[]
//   | { [key: string]: JsonInputValue | undefined }

// ─── Rate limiting for /api/analyze (in-memory, dev-only) ────────────────────
// Warning: In-memory rate limiting resets on cold starts / serverless restarts.
// For production on Vercel, replace with a Redis-backed rate limiter (e.g.
// Upstash @upstash/ratelimit). For local development, the in-memory Map works fine.
const analysisCount = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = analysisCount.get(userId)
  if (!entry || entry.resetAt < now) {
    analysisCount.set(userId, { count: 1, resetAt: now + 3_600_000 })
    return true
  }
  if (entry.count >= 3) return false
  entry.count++
  return true
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { assessmentId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { assessmentId } = body
  if (!assessmentId) {
    return NextResponse.json({ success: false, error: 'assessmentId is required' }, { status: 400 })
  }

  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Rate limit exceeded: maximum 3 analyses per hour. This in-memory limit is for development only — production deployments on Vercel should use a Redis-backed rate limiter (e.g. Upstash @upstash/ratelimit) since in-memory counters reset on cold starts.',
      },
      { status: 429 }
    )
  }

  const existing = await db.assessment.findUnique({ where: { id: assessmentId } })

  if (!existing) {
    return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 })
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const startTime = Date.now()
  console.log(`[analyze] Starting analysis for assessment ${assessmentId} at ${new Date(startTime).toISOString()}`)

  await db.assessment.update({
    where: { id: assessmentId },
    data: { analysisStatus: 'RUNNING' },
  })

  try {
    const assessmentInput: AssessmentInput = {
      age: existing.age,
      gender: existing.gender,
      weight: existing.weight,
      height: existing.height,
      bmi: existing.bmi,
      systolicBP: existing.systolicBP,
      diastolicBP: existing.diastolicBP,
      heartRate: existing.heartRate,
      oxygenSat: existing.oxygenSat,
      bodyTemperature: existing.bodyTemperature,
      respiratoryRate: existing.respiratoryRate,
      fastingGlucose: existing.fastingGlucose,
      hba1c: existing.hba1c,
      cholesterol: existing.cholesterol,
      hdl: existing.hdl,
      ldl: existing.ldl,
      triglycerides: existing.triglycerides,
      creatinine: existing.creatinine,
      egfr: existing.egfr,
      altEnzyme: existing.altEnzyme,
      vitaminD: existing.vitaminD,
      isSmoker: existing.isSmoker,
      alcoholUse: existing.alcoholUse,
      isSedentary: existing.isSedentary,
      exerciseFrequency: existing.exerciseFrequency as AssessmentInput['exerciseFrequency'],
      sleepHours: existing.sleepHours,
      stressLevel: existing.stressLevel as AssessmentInput['stressLevel'],
      dailySugarIntake: existing.dailySugarIntake as AssessmentInput['dailySugarIntake'],
      highSaltDiet: existing.highSaltDiet,
      hasDiabetesFH: existing.hasDiabetesFH,
      hasHeartDiseaseFH: existing.hasHeartDiseaseFH,
      hasHypertensionFH: existing.hasHypertensionFH,
      hasStrokeFH: existing.hasStrokeFH,
      hasKidneyDiseaseFH: existing.hasKidneyDiseaseFH,
      hasCancerFH: existing.hasCancerFH,
      symptoms: existing.symptoms,
    }

    // ── Fetch previous completed assessment for adaptive risk monitoring ───
    const prevAssessment = await db.assessment.findFirst({
      where: {
        userId: session.user.id,
        id: { not: assessmentId },
        analysisStatus: 'COMPLETE',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        overallHealthIndex: true,
        diabetesRisk: true,
        heartDiseaseRisk: true,
        hypertensionRisk: true,
        strokeRisk: true,
        kidneyDiseaseRisk: true,
        liverDiseaseRisk: true,
      },
    })

    const engineResults = await runAllEngines(assessmentInput, prevAssessment)

    engineResults.forEach(r => {
      console.log(`[analyze] Engine "${r.engine}" completed in ${r.inferenceMs}ms`)
    })

    const aggregate = aggregateResults(engineResults)
    const explainability = computeExplainability(engineResults)

    // ── Compute risk deltas from previous assessment ──────────────────────
    const computeTrend = (prev: number | null, curr: number): { delta: number; trend: TrendDirection } => {
      if (prev === null) return { delta: 0, trend: 'stable' }
      const delta = Math.round((curr - prev) * 10) / 10
      const absDelta = Math.abs(delta)
      const trend: TrendDirection =
        absDelta < 3 ? 'stable'
        : delta > 0 ? 'worsening'
        : 'improving'
      return { delta, trend }
    }

    const riskDelta: RiskDelta = {
      diabetes:      { current: aggregate.diabetesRisk,      previous: prevAssessment?.diabetesRisk      ?? 0, ...computeTrend(prevAssessment?.diabetesRisk      ?? null, aggregate.diabetesRisk)      },
      heartDisease:  { current: aggregate.heartDiseaseRisk,  previous: prevAssessment?.heartDiseaseRisk  ?? 0, ...computeTrend(prevAssessment?.heartDiseaseRisk  ?? null, aggregate.heartDiseaseRisk)  },
      hypertension:  { current: aggregate.hypertensionRisk,  previous: prevAssessment?.hypertensionRisk  ?? 0, ...computeTrend(prevAssessment?.hypertensionRisk  ?? null, aggregate.hypertensionRisk)  },
      stroke:        { current: aggregate.strokeRisk,        previous: prevAssessment?.strokeRisk        ?? 0, ...computeTrend(prevAssessment?.strokeRisk        ?? null, aggregate.strokeRisk)        },
      kidneyDisease: { current: aggregate.kidneyDiseaseRisk, previous: prevAssessment?.kidneyDiseaseRisk ?? 0, ...computeTrend(prevAssessment?.kidneyDiseaseRisk ?? null, aggregate.kidneyDiseaseRisk) },
      liverDisease:  { current: aggregate.liverDiseaseRisk,  previous: prevAssessment?.liverDiseaseRisk  ?? 0, ...computeTrend(prevAssessment?.liverDiseaseRisk  ?? null, aggregate.liverDiseaseRisk)  },
    }

    await db.assessment.update({
      where: { id: assessmentId },
      data: {
        engineResults: engineResults as unknown as Prisma.InputJsonValue,
        bestEngine: aggregate.bestEngine,
        overallHealthIndex: aggregate.overallHealthIndex,

        diabetesRisk: aggregate.diabetesRisk,
        diabetesLevel: aggregate.diabetesLevel,
        heartDiseaseRisk: aggregate.heartDiseaseRisk,
        heartDiseaseLevel: aggregate.heartDiseaseLevel,
        hypertensionRisk: aggregate.hypertensionRisk,
        hypertensionLevel: aggregate.hypertensionLevel,
        strokeRisk: aggregate.strokeRisk,
        strokeLevel: aggregate.strokeLevel,
        kidneyDiseaseRisk: aggregate.kidneyDiseaseRisk,
        kidneyDiseaseLevel: aggregate.kidneyDiseaseLevel,
        liverDiseaseRisk: aggregate.liverDiseaseRisk,
        liverDiseaseLevel: aggregate.liverDiseaseLevel,

        urgency: aggregate.urgency,
        urgencyText: aggregate.urgencyText,
        keyFactors: aggregate.keyFactors,
        recommendations: aggregate.recommendations as unknown as Prisma.InputJsonValue,
        clinicalInsight: aggregate.clinicalInsight,
        ensembleMetrics: aggregate.ensembleMetrics as unknown as Prisma.InputJsonValue,
        explainability: explainability as unknown as Prisma.InputJsonValue,
        riskDelta: riskDelta as unknown as Prisma.InputJsonValue,

        analysisStatus: 'COMPLETE',
        analysisError: null,
      },
    })

    // Auto-create health goals from recommendations
    if (aggregate.recommendations) {
      const goals = createHealthGoals(session.user.id, assessmentId, aggregate)
      for (const goal of goals) {
        await db.healthGoal.create({ data: goal }).catch(e => console.error('[analyze] Failed to create goal:', e))
      }
      await db.coachInteraction.create({
        data: {
          userId: session.user.id,
          type: 'recommendation',
          content: `New health goals created from assessment analysis — ${goals.length} areas identified for improvement.`,
          metadata: { assessmentId, goalCount: goals.length },
        },
      }).catch(e => console.error('[analyze] Failed to create coach interaction:', e))
    }

    const totalMs = Date.now() - startTime
    console.log(`[analyze] Analysis complete for assessment ${assessmentId} in ${totalMs}ms`)

    const response: ApiResponse<{ assessmentId: string; status: 'COMPLETE' }> = {
      success: true,
      data: { assessmentId, status: 'COMPLETE' },
    }
    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during analysis'
    console.error(`[analyze] Analysis failed for assessment ${assessmentId}:`, message)

    await db.assessment.update({
      where: { id: assessmentId },
      data: {
        analysisStatus: 'FAILED',
        analysisError: message,
      },
    })

    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ─── Auto-create Health Goals from aggregate recommendations ─────────────────
function createHealthGoals(
  userId: string,
  assessmentId: string,
  aggregate: import('@/types').AggregateResult,
): Array<Prisma.HealthGoalUncheckedCreateInput> {
  const goals: Prisma.HealthGoalUncheckedCreateInput[] = []

  const recs = aggregate.recommendations
  if (!recs) return goals

  // Medication goals
  for (const med of recs.medications) {
    if (med.action === 'ADD' || med.action === 'ADJUST') {
      goals.push({
        userId,
        assessmentId,
        category: 'medication',
        title: `Take ${med.name}`,
        description: `${med.dose}. Action: ${med.action}`,
        targetValue: med.action === 'ADD' ? 'Started' : 'Adjusted',
        unit: null,
        adherenceLog: [] as unknown as Prisma.InputJsonValue,
      })
    }
  }

  // Lifestyle goals
  const ls = recs.lifestyle
  if (ls.sodiumReduction > 0) {
    goals.push({
      userId,
      assessmentId,
      category: 'diet',
      title: 'Reduce Sodium Intake',
      description: `Reduce daily sodium by ${ls.sodiumReduction}g per day`,
      targetValue: `${ls.sodiumReduction}g reduction`,
      unit: 'g',
      adherenceLog: [] as unknown as Prisma.InputJsonValue,
    })
  }
  if (ls.sleepIncrease > 0) {
    goals.push({
      userId,
      assessmentId,
      category: 'lifestyle',
      title: 'Improve Sleep Duration',
      description: `Increase sleep by ${ls.sleepIncrease} minutes per night`,
      targetValue: `+${ls.sleepIncrease} min`,
      unit: 'min',
      adherenceLog: [] as unknown as Prisma.InputJsonValue,
    })
  }
  if (ls.exerciseTarget) {
    goals.push({
      userId,
      assessmentId,
      category: 'exercise',
      title: 'Reach Exercise Target',
      description: ls.exerciseTarget,
      targetValue: ls.exerciseTarget,
      unit: null,
      adherenceLog: [] as unknown as Prisma.InputJsonValue,
    })
  }
  if (ls.sugarTarget) {
    goals.push({
      userId,
      assessmentId,
      category: 'diet',
      title: 'Limit Added Sugar',
      description: ls.sugarTarget,
      targetValue: ls.sugarTarget,
      unit: null,
      adherenceLog: [] as unknown as Prisma.InputJsonValue,
    })
  }

  // Care pathway monitoring goals
  for (const step of recs.carePathway) {
    goals.push({
      userId,
      assessmentId,
      category: 'monitoring',
      title: step.type,
      description: step.notes,
      targetValue: step.date,
      unit: null,
      adherenceLog: [] as unknown as Prisma.InputJsonValue,
    })
  }

  return goals
}