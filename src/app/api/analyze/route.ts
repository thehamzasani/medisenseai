import { NextResponse } from 'next/server'
// import type { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { runAllEngines, aggregateResults } from '@/lib/claude'
import type { AssessmentInput, ApiResponse } from '@/types'

type JsonInputValue =
  | string
  | number
  | boolean
  | null
  | JsonInputValue[]
  | { [key: string]: JsonInputValue | undefined }

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

    const engineResults = await runAllEngines(assessmentInput)

    engineResults.forEach(r => {
      console.log(`[analyze] Engine "${r.engine}" completed in ${r.inferenceMs}ms`)
    })

    const aggregate = aggregateResults(engineResults)

    await db.assessment.update({
      where: { id: assessmentId },
      data: {
        engineResults: engineResults as unknown as JsonInputValue,
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
        recommendations: aggregate.recommendations as unknown as JsonInputValue,
        clinicalInsight: aggregate.clinicalInsight,

        analysisStatus: 'COMPLETE',
        analysisError: null,
      },
    })

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