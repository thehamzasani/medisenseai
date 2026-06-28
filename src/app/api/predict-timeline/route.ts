import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { predictTimeline } from '@/lib/timeline'
import type { AssessmentHistoryPoint, ApiResponse, TimelinePredictionData } from '@/types'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { assessmentId?: string; projectionMonths?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { assessmentId, projectionMonths } = body
  if (!assessmentId) {
    return NextResponse.json({ success: false, error: 'assessmentId is required' }, { status: 400 })
  }

  // Verify assessment belongs to user
  const assessment = await db.assessment.findUnique({ where: { id: assessmentId } })
  if (!assessment || assessment.userId !== session.user.id) {
    return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 })
  }

  if (assessment.analysisStatus !== 'COMPLETE') {
    return NextResponse.json({ success: false, error: 'Assessment analysis must be complete before generating timeline' }, { status: 400 })
  }

  try {
    // Fetch all completed assessments for this user (ordered by date)
    const allAssessments = await db.assessment.findMany({
      where: { userId: session.user.id, analysisStatus: 'COMPLETE' },
      orderBy: { createdAt: 'asc' },
    })

    const history: AssessmentHistoryPoint[] = allAssessments.map(a => ({
      date: a.createdAt.toISOString(),
      overallHealthIndex: a.overallHealthIndex,
      diabetesRisk: a.diabetesRisk,
      heartDiseaseRisk: a.heartDiseaseRisk,
      hypertensionRisk: a.hypertensionRisk,
      strokeRisk: a.strokeRisk,
      kidneyDiseaseRisk: a.kidneyDiseaseRisk,
      liverDiseaseRisk: a.liverDiseaseRisk,
    }))

    const months = Math.min(Math.max(projectionMonths ?? 6, 1), 12)
    const prediction = await predictTimeline(history, assessmentId, months)

    // Store in database
    await db.timelinePrediction.create({
      data: {
        userId: session.user.id,
        baseAssessmentId: assessmentId,
        predictedScores: prediction.predictedScores as unknown as Prisma.InputJsonValue,
        confidenceInterval: prediction.confidenceInterval as unknown as Prisma.InputJsonValue,
        modelVersion: prediction.modelVersion,
      },
    })

    const response: ApiResponse<TimelinePredictionData> = {
      success: true,
      data: prediction,
    }

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during timeline prediction'
    console.error('[predict-timeline] Error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// GET: fetch the most recent timeline prediction for an assessment
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const assessmentId = searchParams.get('assessmentId')

  if (!assessmentId) {
    return NextResponse.json({ success: false, error: 'assessmentId query param is required' }, { status: 400 })
  }

  const prediction = await db.timelinePrediction.findFirst({
    where: {
      userId: session.user.id,
      baseAssessmentId: assessmentId,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!prediction) {
    return NextResponse.json({ success: false, data: null })
  }

  const data: TimelinePredictionData = {
    baseAssessmentId: prediction.baseAssessmentId,
    predictedScores: prediction.predictedScores as unknown as TimelinePredictionData['predictedScores'],
    confidenceInterval: prediction.confidenceInterval as unknown as TimelinePredictionData['confidenceInterval'],
    modelVersion: prediction.modelVersion,
    insight: '',
    projectionMonths: (prediction.predictedScores as unknown as TimelinePredictionData['predictedScores']).length,
  }

  return NextResponse.json({ success: true, data })
}
