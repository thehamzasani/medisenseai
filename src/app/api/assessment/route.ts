import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { ApiResponse, AssessmentListItem, AnalysisStatus, RiskLevel } from '@/types'
import { assessmentSchema } from '@/lib/validations'
// ─── ZOD SCHEMA (no bloodType field — that belongs to /api/users/me) ─────────
// export const assessmentSchema = z.object({
//   // Personal
//   age: z.number().int().min(1).max(120),
//   gender: z.enum(['Male', 'Female', 'Other']),
//   weight: z.number().min(10).max(500), // kg
//   height: z.number().min(50).max(300), // cm
//   bmi: z.number().min(5).max(100),

//   // Vital signs
//   systolicBP: z.number().int().min(60).max(250),
//   diastolicBP: z.number().int().min(30).max(160),
//   heartRate: z.number().int().min(30).max(220),
//   oxygenSat: z.number().min(70).max(100),
//   bodyTemperature: z.number().min(34).max(42), // °C
//   respiratoryRate: z.number().int().min(8).max(60),

//   // Lab results
//   fastingGlucose: z.number().min(30).max(600),
//   hba1c: z.number().min(2).max(20),
//   cholesterol: z.number().min(50).max(600),
//   hdl: z.number().min(10).max(200),
//   ldl: z.number().min(10).max(500),
//   triglycerides: z.number().min(20).max(2000),
//   creatinine: z.number().min(0.1).max(20).nullable().optional(),
//   egfr: z.number().min(1).max(200).nullable().optional(),
//   altEnzyme: z.number().min(1).max(2000).nullable().optional(),
//   vitaminD: z.number().min(1).max(200).nullable().optional(),

//   // Lifestyle
//   isSmoker: z.boolean(),
//   alcoholUse: z.boolean(),
//   isSedentary: z.boolean(),
//   exerciseFrequency: z.enum(['none', '1-2x', '3-4x', '5+x']),
//   sleepHours: z.number().min(0).max(24),
//   stressLevel: z.enum(['low', 'moderate', 'high', 'very_high']),
//   dailySugarIntake: z.enum(['low', 'moderate', 'high']),
//   highSaltDiet: z.boolean(),

//   // Family history
//   hasDiabetesFH: z.boolean(),
//   hasHeartDiseaseFH: z.boolean(),
//   hasHypertensionFH: z.boolean(),
//   hasStrokeFH: z.boolean(),
//   hasKidneyDiseaseFH: z.boolean(),
//   hasCancerFH: z.boolean(),

//   // Symptoms
//   symptoms: z.array(z.string()).default([]),

//   // Optional label
//   label: z.string().max(100).optional(),
// })

export type AssessmentFormData = z.infer<typeof assessmentSchema>

// ─── GET: list user's assessments ─────────────────────────────────────────────
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db.assessment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      label: true,
      overallHealthIndex: true,
      analysisStatus: true,
      diabetesLevel: true,
      heartDiseaseLevel: true,
      hypertensionLevel: true,
    },
  })

  type AssessmentRow = {
    id: string
    createdAt: Date
    label: string | null
    overallHealthIndex: number | null
    analysisStatus: string
    diabetesLevel: string | null
    heartDiseaseLevel: string | null
    hypertensionLevel: string | null
  }

  const data: AssessmentListItem[] = rows.map((row: AssessmentRow) => ({
  id: row.id,
  createdAt: row.createdAt.toISOString(),
  label: row.label,
  overallHealthIndex: row.overallHealthIndex,
  analysisStatus: row.analysisStatus as AnalysisStatus,
  diabetesLevel: row.diabetesLevel as RiskLevel | null,
  heartDiseaseLevel: row.heartDiseaseLevel as RiskLevel | null,
  hypertensionLevel: row.hypertensionLevel as RiskLevel | null,
}))

  const response: ApiResponse<AssessmentListItem[]> = { success: true, data }
  return NextResponse.json(response)
}

// ─── POST: create a new assessment ────────────────────────────────────────────
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = assessmentSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }

  const input = parsed.data

  const created = await db.assessment.create({
    data: {
      userId: session.user.id,
      label: input.label ?? null,

      age: input.age,
      gender: input.gender,
      weight: input.weight,
      height: input.height,
      bmi: input.bmi,

      systolicBP: input.systolicBP,
      diastolicBP: input.diastolicBP,
      heartRate: input.heartRate,
      oxygenSat: input.oxygenSat,
      bodyTemperature: input.bodyTemperature,
      respiratoryRate: input.respiratoryRate,

      fastingGlucose: input.fastingGlucose,
      hba1c: input.hba1c,
      cholesterol: input.cholesterol,
      hdl: input.hdl,
      ldl: input.ldl,
      triglycerides: input.triglycerides,
      creatinine: input.creatinine ?? null,
      egfr: input.egfr ?? null,
      altEnzyme: input.altEnzyme ?? null,
      vitaminD: input.vitaminD ?? null,

      isSmoker: input.isSmoker,
      alcoholUse: input.alcoholUse,
      isSedentary: input.isSedentary,
      exerciseFrequency: input.exerciseFrequency,
      sleepHours: input.sleepHours,
      stressLevel: input.stressLevel,
      dailySugarIntake: input.dailySugarIntake,
      highSaltDiet: input.highSaltDiet,

      hasDiabetesFH: input.hasDiabetesFH,
      hasHeartDiseaseFH: input.hasHeartDiseaseFH,
      hasHypertensionFH: input.hasHypertensionFH,
      hasStrokeFH: input.hasStrokeFH,
      hasKidneyDiseaseFH: input.hasKidneyDiseaseFH,
      hasCancerFH: input.hasCancerFH,

      symptoms: input.symptoms,

      analysisStatus: 'PENDING',
    },
    select: { id: true },
  })

  const response: ApiResponse<{ id: string }> = { success: true, data: { id: created.id } }
  return NextResponse.json(response, { status: 201 })
}