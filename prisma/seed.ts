import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─── Helper: build a full 10-engine result array ─────────────────────────────
// Base values come from Neural Network; each other engine applies a variance offset.
function buildEngineResults(
  nnDiabetes: number,
  nnHeart: number,
  nnHypertension: number,
  nnStroke: number,
  nnKidney: number,
  nnLiver: number,
  urgency: 'MONITOR' | 'WATCH' | 'SOON' | 'URGENT',
  insight: string,
  keyFactors: string[],
) {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

  function level(risk: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (risk >= 75) return 'HIGH'
    if (risk >= 50) return 'MEDIUM'
    return 'LOW'
  }

  const engines = [
    { name: 'Neural Network',      version: 'v5.0 DeepSense', accuracy: 99.2, fpr: 0.12, stars: 5, status: 'stable',      isBest: true,  v: 0   },
    { name: 'XGBoost',             version: 'v4.1',           accuracy: 97.8, fpr: 0.45, stars: 4, status: 'stable',      isBest: false, v: 3   },
    { name: 'LightGBM',            version: 'v3.5',           accuracy: 97.1, fpr: 0.62, stars: 4, status: 'stable',      isBest: false, v: -4  },
    { name: 'Random Forest',       version: 'v4.2',           accuracy: 96.4, fpr: 0.81, stars: 4, status: 'stable',      isBest: false, v: 5   },
    { name: 'AdaBoost',            version: 'v3.1',           accuracy: 95.3, fpr: 1.10, stars: 4, status: 'stable',      isBest: false, v: -3  },
    { name: 'SVM',                 version: 'v2.8',           accuracy: 94.2, fpr: 1.35, stars: 4, status: 'stable',      isBest: false, v: 4   },
    { name: 'Decision Tree',       version: 'v3.0',           accuracy: 92.9, fpr: 1.82, stars: 3, status: 'stable',      isBest: false, v: -6  },
    { name: 'KNN',                 version: 'v2.5',           accuracy: 91.8, fpr: 2.14, stars: 3, status: 'stable',      isBest: false, v: 6   },
    { name: 'Logistic Regression', version: 'v1.9',           accuracy: 89.5, fpr: 2.91, stars: 3, status: 'stable',      isBest: false, v: -5  },
    { name: 'Naive Bayes',         version: 'v1.4',           accuracy: 88.2, fpr: 4.10, stars: 2, status: 'deprecated',  isBest: false, v: -9  },
  ]

  const inferenceMsMap: Record<string, number> = {
    'Neural Network': 42, XGBoost: 12, LightGBM: 8, 'Random Forest': 35,
    AdaBoost: 28, SVM: 55, 'Decision Tree': 5, KNN: 18,
    'Logistic Regression': 3, 'Naive Bayes': 2,
  }

  return engines.map((e) => {
    const d  = clamp(nnDiabetes + e.v)
    const hv = clamp(nnHeart + e.v)
    const ht = clamp(nnHypertension + e.v)
    const st = clamp(nnStroke + Math.round(e.v * 0.7))
    const kd = clamp(nnKidney + Math.round(e.v * 0.6))
    const lv = clamp(nnLiver + Math.round(e.v * 0.5))

    return {
      engine:            e.name,
      accuracy:          e.accuracy,
      modelVersion:      e.version,
      inferenceMs:       inferenceMsMap[e.name] ?? 20,
      isBest:            e.isBest,
      falsePositiveRate: e.fpr,
      reliabilityStars:  e.stars,
      status:            e.status,
      diseases: {
        diabetes:      { risk: d,  level: level(d),  confidence: parseFloat((96.1 - (100 - e.accuracy) * 0.5).toFixed(1)) },
        heartDisease:  { risk: hv, level: level(hv), confidence: parseFloat((94.2 - (100 - e.accuracy) * 0.5).toFixed(1)) },
        hypertension:  { risk: ht, level: level(ht), confidence: parseFloat((91.5 - (100 - e.accuracy) * 0.4).toFixed(1)) },
        stroke:        { risk: st, level: level(st), confidence: parseFloat((88.3 - (100 - e.accuracy) * 0.4).toFixed(1)) },
        kidneyDisease: { risk: kd, level: level(kd), confidence: parseFloat((95.0 - (100 - e.accuracy) * 0.3).toFixed(1)) },
        liverDisease:  { risk: lv, level: level(lv), confidence: parseFloat((92.1 - (100 - e.accuracy) * 0.3).toFixed(1)) },
      },
      keyFactors,
      recommendations: [
        'Reduce refined carbohydrate and sugar intake',
        'Engage in 30 minutes of moderate aerobic exercise 5× per week',
        'Monitor blood pressure daily at consistent times',
        'Schedule follow-up HbA1c test in 3 months',
        'Consult a registered dietitian for personalised meal planning',
      ],
      insight,
      urgency,
    }
  })
}

// ─── Helper: build RecommendationsData ───────────────────────────────────────
function buildRecommendations(
  directiveTitle: string,
  directiveDescription: string,
  riskScore: number,
  diabetesRisk: number,
  hypertensionRisk: number,
  heartRisk: number,
) {
  const now = Date.now()
  return {
    directive: {
      title:       directiveTitle,
      description: directiveDescription,
      riskScore,
    },
    medications: [
      {
        name:   'Metformin 500mg',
        dose:   'Once daily with meal',
        action: diabetesRisk >= 60 ? 'ADJUST' : 'MAINTAIN',
      },
      {
        name:   'Atorvastatin 20mg',
        dose:   'Once daily at night',
        action: heartRisk >= 60 ? 'ADJUST' : 'MAINTAIN',
      },
      {
        name:   'Vitamin D3 2000 IU',
        dose:   'Once daily with food',
        action: 'ADD',
      },
    ],
    lifestyle: {
      sodiumReduction: hypertensionRisk >= 60 ? 2 : 1,
      sleepIncrease:   30,
      cgmEnabled:      diabetesRisk >= 60,
      exerciseTarget:  '30 min cardio 5× per week',
      sugarTarget:     '< 25g added sugar per day',
    },
    carePathway: [
      {
        date:  new Date(now + 7  * 86_400_000).toISOString(),
        type:  'HbA1c Recheck',
        notes: 'Fasting required',
      },
      {
        date:  new Date(now + 14 * 86_400_000).toISOString(),
        type:  'Lipid Panel Review',
        notes: 'Compare with baseline',
      },
      {
        date:  new Date(now + 30 * 86_400_000).toISOString(),
        type:  'Blood Pressure Check',
        notes: 'Home monitoring recommended',
      },
    ],
  }
}

async function main() {
  console.log('🌱  Seeding MediSense AI database…')

  // ── Demo user ──────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Demo@123456', 12)

  const user = await prisma.user.upsert({
    where:  { email: 'demo@medisense.ai' },
    update: {},
    create: {
      name:      'Dr. Hamza Sani',
      email:     'demo@medisense.ai',
      password:  hashedPassword,
      bloodType: 'O+',
      gender:    'Male',
      dateOfBirth: new Date('1982-03-15'),
    },
  })

  console.log(`✅  User created: ${user.email}`)

  // ── Delete existing assessments for idempotent re-seeding ─────────────────
  await prisma.assessment.deleteMany({ where: { userId: user.id } })

  // ══════════════════════════════════════════════════════════════════════════
  // ASSESSMENT 1 — Moderate Risk (overallHealthIndex: 72)
  // Patient: age 42, male, BMI 26.5, glucose 115, BP 128/84, HbA1c 6.1%
  // ══════════════════════════════════════════════════════════════════════════

  const a1KeyFactors = [
    'Fasting glucose 115 mg/dL — pre-diabetic range',
    'Family history of diabetes',
    'HbA1c 6.1% approaching diagnostic threshold',
    'Systolic BP 128 mmHg — elevated',
    'Moderate stress level contributing to metabolic risk',
  ]
  const a1Insight =
    'Patient presents with pre-diabetic indicators and mild hypertension. Lifestyle modification is strongly recommended before pharmacological intervention.'
  const a1EngineResults = buildEngineResults(62, 38, 55, 22, 18, 12, 'WATCH', a1Insight, a1KeyFactors)
  const a1Recommendations = buildRecommendations(
    'Manage Elevated Diabetes Risk',
    'Pre-diabetic indicators combined with elevated blood pressure require immediate lifestyle intervention. A structured diet and exercise programme should be initiated within two weeks.',
    6,
    62, 55, 38,
  )

  const assessment1 = await prisma.assessment.create({
    data: {
      userId:    user.id,
      createdAt: new Date('2026-05-01T08:00:00Z'),
      label:     'Routine Metabolic Screening',

      // Personal
      age: 42, gender: 'Male', weight: 78, height: 171.5, bmi: 26.5,

      // Vitals
      systolicBP: 128, diastolicBP: 84, heartRate: 74, oxygenSat: 97.5,
      bodyTemperature: 36.8, respiratoryRate: 16,

      // Labs
      fastingGlucose: 115, hba1c: 6.1, cholesterol: 202, hdl: 48, ldl: 128,
      triglycerides: 168, creatinine: 1.0, egfr: 82, altEnzyme: 32, vitaminD: 22,

      // Lifestyle
      isSmoker: false, alcoholUse: false, isSedentary: false,
      exerciseFrequency: '1-2x', sleepHours: 6.5, stressLevel: 'moderate',
      dailySugarIntake: 'moderate', highSaltDiet: false,

      // Family history
      hasDiabetesFH: true, hasHeartDiseaseFH: false, hasHypertensionFH: true,
      hasStrokeFH: false, hasKidneyDiseaseFH: false, hasCancerFH: false,

      // Symptoms
      symptoms: ['fatigue', 'frequent_urination'],

      // AI Results
      analysisStatus:    'COMPLETE',
      engineResults:     a1EngineResults,
      bestEngine:        'Neural Network',
      overallHealthIndex: 72,

      // Aggregated (Neural Network values)
      diabetesRisk:       62, diabetesLevel:       'MEDIUM',
      heartDiseaseRisk:   38, heartDiseaseLevel:   'LOW',
      hypertensionRisk:   55, hypertensionLevel:   'MEDIUM',
      strokeRisk:         22, strokeLevel:         'LOW',
      kidneyDiseaseRisk:  18, kidneyDiseaseLevel:  'LOW',
      liverDiseaseRisk:   12, liverDiseaseLevel:   'LOW',

      urgency:         'WATCH',
      urgencyText:     'Your results warrant closer monitoring. Schedule a checkup.',
      keyFactors:      a1KeyFactors,
      clinicalInsight: a1Insight,
      recommendations: a1Recommendations,
    },
  })
  console.log(`✅  Assessment 1 created: ${assessment1.id} (overallHealthIndex: 72)`)

  // ══════════════════════════════════════════════════════════════════════════
  // ASSESSMENT 2 — Lower Risk (overallHealthIndex: 84)
  // Patient: age 35, female, BMI 25.1, glucose 99, BP 118/76, HbA1c 5.2%
  // ══════════════════════════════════════════════════════════════════════════

  const a2KeyFactors = [
    'All metabolic markers within normal range',
    'Healthy BMI and cardiovascular profile',
    'Regular physical activity reducing disease risk',
    'Adequate sleep and low stress levels noted',
    'No significant family history risk factors',
  ]
  const a2Insight =
    'Patient demonstrates excellent metabolic health with all biomarkers within optimal ranges. Continued lifestyle maintenance is the primary clinical recommendation.'
  const a2EngineResults = buildEngineResults(28, 18, 32, 10, 12, 8, 'MONITOR', a2Insight, a2KeyFactors)
  const a2Recommendations = buildRecommendations(
    'Maintain Cardiovascular Wellness',
    'All indicators point to excellent baseline health. Continue current lifestyle practices and maintain annual screening schedule.',
    2,
    28, 32, 18,
  )

  const assessment2 = await prisma.assessment.create({
    data: {
      userId:    user.id,
      createdAt: new Date('2026-05-15T10:00:00Z'),
      label:     'Annual Wellness Check',

      // Personal
      age: 35, gender: 'Female', weight: 62, height: 157, bmi: 25.1,

      // Vitals
      systolicBP: 118, diastolicBP: 76, heartRate: 68, oxygenSat: 98.5,
      bodyTemperature: 36.6, respiratoryRate: 14,

      // Labs
      fastingGlucose: 99, hba1c: 5.2, cholesterol: 175, hdl: 62, ldl: 98,
      triglycerides: 105, creatinine: 0.8, egfr: 98, altEnzyme: 22, vitaminD: 38,

      // Lifestyle
      isSmoker: false, alcoholUse: false, isSedentary: false,
      exerciseFrequency: '3-4x', sleepHours: 7.5, stressLevel: 'low',
      dailySugarIntake: 'low', highSaltDiet: false,

      // Family history
      hasDiabetesFH: false, hasHeartDiseaseFH: false, hasHypertensionFH: false,
      hasStrokeFH: false, hasKidneyDiseaseFH: false, hasCancerFH: false,

      // Symptoms
      symptoms: [],

      // AI Results
      analysisStatus:    'COMPLETE',
      engineResults:     a2EngineResults,
      bestEngine:        'Neural Network',
      overallHealthIndex: 84,

      // Aggregated (Neural Network values)
      diabetesRisk:       28, diabetesLevel:       'LOW',
      heartDiseaseRisk:   18, heartDiseaseLevel:   'LOW',
      hypertensionRisk:   32, hypertensionLevel:   'LOW',
      strokeRisk:         10, strokeLevel:         'LOW',
      kidneyDiseaseRisk:  12, kidneyDiseaseLevel:  'LOW',
      liverDiseaseRisk:    8, liverDiseaseLevel:   'LOW',

      urgency:         'MONITOR',
      urgencyText:     'Maintain healthy habits and continue routine monitoring.',
      keyFactors:      a2KeyFactors,
      clinicalInsight: a2Insight,
      recommendations: a2Recommendations,
    },
  })
  console.log(`✅  Assessment 2 created: ${assessment2.id} (overallHealthIndex: 84)`)

  // ══════════════════════════════════════════════════════════════════════════
  // ASSESSMENT 3 — Higher Risk (overallHealthIndex: 58)
  // Patient: age 56, male, BMI 28.3, glucose 132, BP 142/92, HbA1c 6.8%
  // Smoker, alcohol use, sedentary, high salt, FH: diabetes + heart + hypertension
  // ══════════════════════════════════════════════════════════════════════════

  const a3KeyFactors = [
    'Fasting glucose 132 mg/dL — diabetic range',
    'HbA1c 6.8% — diagnostic threshold for diabetes',
    'Systolic BP 142 mmHg — Stage 1 hypertension',
    'Active smoker with sedentary lifestyle',
    'Triple family history: diabetes, heart disease, hypertension',
    'Elevated LDL 148 mg/dL with low HDL 38 mg/dL',
  ]
  const a3Insight =
    'Patient presents with multiple converging high-risk factors including confirmed diabetic glucose range, Stage 1 hypertension, active smoking, and a strong family history. Immediate clinical intervention is required.'
  const a3EngineResults = buildEngineResults(78, 65, 74, 42, 38, 28, 'SOON', a3Insight, a3KeyFactors)
  const a3Recommendations = buildRecommendations(
    'Manage Elevated Diabetes & Hypertension Risk',
    'Critical convergence of metabolic and cardiovascular risk factors detected. Immediate pharmacological review and intensive lifestyle intervention programme initiation are required within the next two weeks.',
    8,
    78, 74, 65,
  )

  const assessment3 = await prisma.assessment.create({
    data: {
      userId:    user.id,
      createdAt: new Date('2026-06-01T09:00:00Z'),
      label:     'Comprehensive Cardiac Risk Assessment',

      // Personal
      age: 56, gender: 'Male', weight: 88, height: 176.4, bmi: 28.3,

      // Vitals
      systolicBP: 142, diastolicBP: 92, heartRate: 82, oxygenSat: 96.0,
      bodyTemperature: 37.1, respiratoryRate: 18,

      // Labs
      fastingGlucose: 132, hba1c: 6.8, cholesterol: 228, hdl: 38, ldl: 148,
      triglycerides: 242, creatinine: 1.2, egfr: 68, altEnzyme: 48, vitaminD: 16,

      // Lifestyle
      isSmoker: true, alcoholUse: true, isSedentary: true,
      exerciseFrequency: 'none', sleepHours: 5.5, stressLevel: 'high',
      dailySugarIntake: 'high', highSaltDiet: true,

      // Family history
      hasDiabetesFH: true, hasHeartDiseaseFH: true, hasHypertensionFH: true,
      hasStrokeFH: false, hasKidneyDiseaseFH: false, hasCancerFH: false,

      // Symptoms
      symptoms: ['fatigue', 'frequent_urination', 'excessive_thirst', 'shortness_of_breath', 'headache'],

      // AI Results
      analysisStatus:    'COMPLETE',
      engineResults:     a3EngineResults,
      bestEngine:        'Neural Network',
      overallHealthIndex: 58,

      // Aggregated (Neural Network values)
      diabetesRisk:       78, diabetesLevel:       'HIGH',
      heartDiseaseRisk:   65, heartDiseaseLevel:   'MEDIUM',
      hypertensionRisk:   74, hypertensionLevel:   'HIGH',
      strokeRisk:         42, strokeLevel:         'MEDIUM',
      kidneyDiseaseRisk:  38, kidneyDiseaseLevel:  'LOW',
      liverDiseaseRisk:   28, liverDiseaseLevel:   'LOW',

      urgency:         'SOON',
      urgencyText:     'Several risk factors identified. Schedule a checkup within 2–4 weeks.',
      keyFactors:      a3KeyFactors,
      clinicalInsight: a3Insight,
      recommendations: a3Recommendations,
    },
  })
  console.log(`✅  Assessment 3 created: ${assessment3.id} (overallHealthIndex: 58)`)

  console.log('\n🎉  Seeding complete!')
  console.log('────────────────────────────────────────')
  console.log('  Demo credentials:')
  console.log('  Email:    demo@medisense.ai')
  console.log('  Password: Demo@123456')
  console.log('────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })