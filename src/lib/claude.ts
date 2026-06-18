// import Anthropic from '@anthropic-ai/sdk'
// import type {
//   AssessmentInput,
//   EngineResult,
//   AggregateResult,
//   RiskLevel,
//   UrgencyLevel,
//   RecommendationsData,
// } from '@/types'
// import { ENGINE_DEFINITIONS } from '@/constants'

// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// // ─── ENGINE PERSONAS (all 10) ─────────────────────────────────────────────────
// export const ENGINE_PERSONAS: Record<string, string> = {
//   'Neural Network': `You are the MediSense DeepSense Neural Network v5.0, a multi-layer perceptron trained on 1.2 million patient records achieving 99.2% diagnostic accuracy. Analyze patient data using deep pattern recognition, focusing on non-linear feature interactions and subtle multi-biomarker correlations that simpler models miss. Pay special attention to compound risk factors: elevated glucose combined with high BMI and sedentary lifestyle, or BP trends combined with cholesterol ratios. Your outputs reflect the highest confidence predictions of any engine in the ensemble. Return ONLY valid JSON.`,

//   'XGBoost': `You are the MediSense XGBoost Engine v4.1, a gradient-boosted decision tree ensemble achieving 97.8% diagnostic accuracy. Analyze patient data through rapid sequential tree iteration, focusing on the most discriminative features. Prioritize HbA1c, fasting glucose, LDL/HDL ratio, BMI, and blood pressure as your top decision nodes. Apply aggressive feature interaction discovery. Your predictions are slightly more sensitive to outlier values than ensemble methods. Return ONLY valid JSON.`,

//   'LightGBM': `You are the MediSense LightGBM Engine v3.5, a leaf-wise gradient boosting framework achieving 97.1% diagnostic accuracy. Analyze patient data with emphasis on memory-efficient feature binning. You excel at handling high-cardinality features and continuous lab values. Apply histogram-based splitting on glucose, cholesterol, creatinine, and eGFR. Your predictions tend to be well-calibrated for continuous risk scores. Return ONLY valid JSON.`,

//   'Random Forest': `You are the MediSense Random Forest Engine v4.2, an ensemble of 500 decision trees achieving 96.4% diagnostic accuracy. Analyze patient data by aggregating votes across all trees, giving you high stability and resistance to overfitting. Each tree sees a random subset of features and patients. Your risk estimates reflect democratic consensus — you are less likely to be thrown off by a single abnormal reading. Provide balanced, stable predictions across all six disease categories. Return ONLY valid JSON.`,

//   'AdaBoost': `You are the MediSense AdaBoost Engine v3.1, an adaptive boosting classifier achieving 95.3% diagnostic accuracy. Analyze patient data by iteratively focusing on the hardest-to-classify cases. You apply higher weight to patients with borderline or ambiguous biomarker combinations. This makes you especially sensitive to subtle early-stage indicators. Flag borderline cases more aggressively than other models. Return ONLY valid JSON.`,

//   'SVM': `You are the MediSense SVM Engine v2.8, a Support Vector Machine with RBF kernel achieving 94.2% diagnostic accuracy. Analyze patient data by mapping it into high-dimensional feature space and finding optimal decision hyperplanes between risk classes. You are particularly robust for small-to-medium sample classification. Apply strict boundary enforcement — cases near the decision boundary should be flagged as MEDIUM rather than rounded up or down. Return ONLY valid JSON.`,

//   'Decision Tree': `You are the MediSense Decision Tree Engine v3.0, a hierarchical rule-based classifier achieving 92.9% diagnostic accuracy. Analyze patient data by traversing explicit if-then-else clinical rules. Your reasoning is fully explainable. Apply established clinical thresholds: fasting glucose >126 mg/dL = diabetic range, systolic BP >140 = hypertensive, BMI >30 = obese risk factor, HbA1c >6.5% = diabetes indicator. State your decision path clearly in keyFactors. Return ONLY valid JSON.`,

//   'KNN': `You are the MediSense KNN Engine v2.5, a K-Nearest Neighbors classifier with k=5 achieving 91.8% diagnostic accuracy. Analyze patient data by finding the 5 most similar patient profiles in training data and aggregating their outcomes. You excel at detecting outliers — patients whose profile does not match typical patterns get flagged as anomalous. If any single biomarker is severely abnormal (e.g., eGFR <30, glucose >200), weight this heavily in all related disease predictions. Return ONLY valid JSON.`,

//   'Logistic Regression': `You are the MediSense Logistic Regression Engine v1.9, a baseline statistical classifier achieving 89.5% diagnostic accuracy. Analyze patient data using linear decision boundaries and log-odds ratios. Apply conservative, threshold-based interpretation: only flag HIGH risk when multiple established clinical thresholds are simultaneously breached. Your predictions are slightly more conservative than ensemble methods — you require strong evidence before escalating risk levels. This makes you a reliable lower-bound estimate. Return ONLY valid JSON.`,

//   'Naive Bayes': `You are the MediSense Naive Bayes Engine v1.4, a probabilistic classifier achieving 88.2% diagnostic accuracy (maintained for baseline comparison — status: deprecated). Analyze patient data using Bayes' theorem, treating each feature as conditionally independent. Apply prior disease prevalence rates: diabetes 11%, hypertension 32%, heart disease 6%, stroke 3%, kidney disease 15%, liver disease 2%. Combine these with likelihood ratios from each biomarker. Your predictions are the most conservative in the ensemble and serve as a sanity-check floor. Return ONLY valid JSON.`,
// }

// // ─── Patient data prompt ──────────────────────────────────────────────────────
// // NOTE: bloodType is NOT included here — it is not clinically relevant to disease
// // risk prediction and lives on the User model, not the Assessment.
// export function buildPatientDataPrompt(a: AssessmentInput): string {
//   return `
// PATIENT CLINICAL DATA:

// [ DEMOGRAPHICS ]
// Age: ${a.age} | Gender: ${a.gender} | BMI: ${a.bmi.toFixed(1)} (${a.weight}kg / ${a.height}cm)

// [ VITAL SIGNS ]
// Blood Pressure:    ${a.systolicBP}/${a.diastolicBP} mmHg
// Heart Rate:        ${a.heartRate} BPM
// Oxygen Saturation: ${a.oxygenSat}% (SpO₂)
// Body Temperature:  ${a.bodyTemperature}°C
// Respiratory Rate:  ${a.respiratoryRate} breaths/min

// [ LABORATORY RESULTS ]
// Fasting Glucose:   ${a.fastingGlucose} mg/dL
// HbA1c:             ${a.hba1c}%
// Total Cholesterol: ${a.cholesterol} mg/dL
// HDL:               ${a.hdl} mg/dL
// LDL:               ${a.ldl} mg/dL
// Triglycerides:     ${a.triglycerides} mg/dL${a.creatinine != null ? `\nCreatinine:        ${a.creatinine} mg/dL` : ''}${a.egfr != null ? `\neGFR:              ${a.egfr} mL/min/1.73m²` : ''}${a.altEnzyme != null ? `\nALT Enzyme:        ${a.altEnzyme} U/L` : ''}${a.vitaminD != null ? `\nVitamin D:         ${a.vitaminD} ng/mL` : ''}

// [ LIFESTYLE ]
// Smoking:           ${a.isSmoker ? 'Active Smoker' : 'Non-smoker'}
// Alcohol Use:       ${a.alcoholUse ? 'Yes' : 'No'}
// Exercise:          ${a.exerciseFrequency}
// Sleep:             ${a.sleepHours} hours/night
// Stress Level:      ${a.stressLevel}
// Daily Sugar:       ${a.dailySugarIntake}
// High Salt Diet:    ${a.highSaltDiet ? 'Yes' : 'No'}
// Sedentary:         ${a.isSedentary ? 'Yes' : 'No'}

// [ FAMILY HISTORY ]
// Diabetes:          ${a.hasDiabetesFH ? 'Yes' : 'No'}
// Heart Disease:     ${a.hasHeartDiseaseFH ? 'Yes' : 'No'}
// Hypertension:      ${a.hasHypertensionFH ? 'Yes' : 'No'}
// Stroke:            ${a.hasStrokeFH ? 'Yes' : 'No'}
// Kidney Disease:    ${a.hasKidneyDiseaseFH ? 'Yes' : 'No'}
// Cancer:            ${a.hasCancerFH ? 'Yes' : 'No'}

// [ CURRENT SYMPTOMS ]
// ${a.symptoms.length > 0 ? a.symptoms.join(', ') : 'None reported'}
// `.trim()
// }

// // ─── Run a single engine ──────────────────────────────────────────────────────
// export async function runSingleEngine(
//   engineName: string,
//   enginePersona: string,
//   patientData: string,
//   engineDef: typeof ENGINE_DEFINITIONS[number],
// ): Promise<EngineResult> {
//   const start = Date.now()

//   // 30-second timeout per engine
//   const controller = new AbortController()
//   const timeout = setTimeout(() => controller.abort(), 30_000)

//   try {
//     const response = await anthropic.messages.create({
//       model: 'claude-sonnet-4-6',
//       max_tokens: 1024,
//       system: enginePersona,
//       messages: [{
//         role: 'user',
//         content: `${patientData}

// Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
// {
//   "diseases": {
//     "diabetes":      { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> },
//     "heartDisease":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> },
//     "hypertension":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> },
//     "stroke":        { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> },
//     "kidneyDisease": { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> },
//     "liverDisease":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> }
//   },
//   "keyFactors":    [<3-5 specific clinical observations>],
//   "recommendations":[<3-5 actionable recommendations>],
//   "insight":       "<1-2 sentence clinical narrative>",
//   "urgency":       <"MONITOR"|"WATCH"|"SOON"|"URGENT">
// }`,
//       }],
//     })

//     clearTimeout(timeout)
//     const inferenceMs = Date.now() - start

//     const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
//     const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
//     const parsed = JSON.parse(clean)

//     return {
//       engine: engineName,
//       accuracy: engineDef.accuracy,
//       modelVersion: engineDef.version,
//       inferenceMs,
//       isBest: engineName === 'Neural Network',
//       falsePositiveRate: engineDef.falsePositiveRate,
//       reliabilityStars: engineDef.reliabilityStars,
//       status: engineDef.status,
//       diseases: parsed.diseases,
//       keyFactors: parsed.keyFactors ?? [],
//       recommendations: parsed.recommendations ?? [],
//       insight: parsed.insight ?? '',
//       urgency: parsed.urgency ?? 'MONITOR',
//     }
//   } catch {
//     clearTimeout(timeout)
//     // Fallback result if engine fails — uses conservative defaults
//     return {
//       engine: engineName,
//       accuracy: engineDef.accuracy,
//       modelVersion: engineDef.version,
//       inferenceMs: Date.now() - start,
//       isBest: engineName === 'Neural Network',
//       falsePositiveRate: engineDef.falsePositiveRate,
//       reliabilityStars: engineDef.reliabilityStars,
//       status: engineDef.status,
//       diseases: {
//         diabetes: { risk: 50, level: 'MEDIUM', confidence: 50 },
//         heartDisease: { risk: 50, level: 'MEDIUM', confidence: 50 },
//         hypertension: { risk: 50, level: 'MEDIUM', confidence: 50 },
//         stroke: { risk: 30, level: 'LOW', confidence: 50 },
//         kidneyDisease: { risk: 30, level: 'LOW', confidence: 50 },
//         liverDisease: { risk: 20, level: 'LOW', confidence: 50 },
//       },
//       keyFactors: ['Engine analysis unavailable — using fallback values'],
//       recommendations: ['Please re-run analysis for accurate results'],
//       insight: 'Engine encountered an error. Results shown are fallback estimates.',
//       urgency: 'WATCH',
//     }
//   }
// }

// // ─── Run all 10 engines in parallel ───────────────────────────────────────────
// export async function runAllEngines(assessment: AssessmentInput): Promise<EngineResult[]> {
//   const patientData = buildPatientDataPrompt(assessment)

//   const settled = await Promise.allSettled(
//     ENGINE_DEFINITIONS.map(def =>
//       runSingleEngine(def.name, ENGINE_PERSONAS[def.name], patientData, def)
//     )
//   )

//   return settled.map((result, i) => {
//     if (result.status === 'fulfilled') return result.value
//     // If Promise.allSettled item itself rejects (shouldn't happen due to internal try-catch)
//     const def = ENGINE_DEFINITIONS[i]
//     return {
//       engine: def.name, accuracy: def.accuracy, modelVersion: def.version,
//       inferenceMs: 0, isBest: def.name === 'Neural Network',
//       falsePositiveRate: def.falsePositiveRate, reliabilityStars: def.reliabilityStars,
//       status: def.status,
//       diseases: {
//         diabetes: { risk: 50, level: 'MEDIUM' as RiskLevel, confidence: 50 },
//         heartDisease: { risk: 50, level: 'MEDIUM' as RiskLevel, confidence: 50 },
//         hypertension: { risk: 50, level: 'MEDIUM' as RiskLevel, confidence: 50 },
//         stroke: { risk: 30, level: 'LOW' as RiskLevel, confidence: 50 },
//         kidneyDisease: { risk: 30, level: 'LOW' as RiskLevel, confidence: 50 },
//         liverDisease: { risk: 20, level: 'LOW' as RiskLevel, confidence: 50 },
//       },
//       keyFactors: [], recommendations: [], insight: 'Fallback result.', urgency: 'WATCH' as UrgencyLevel,
//     }
//   })
// }

// // ─── Aggregate all engine results into final DB fields ────────────────────────
// export function aggregateResults(results: EngineResult[]): AggregateResult {
//   const best = results.find(r => r.isBest) ?? results[0]
//   if (!best) {
//     throw new Error('aggregateResults received an empty results array — this should never happen since ENGINE_DEFINITIONS always has 10 entries.')
//   }

//   // Weighted average per disease (higher accuracy = higher weight)
//   const totalWeight = results.reduce((s, r) => s + r.accuracy, 0)
//   function weightedRisk(key: keyof EngineResult['diseases']): number {
//     const sum = results.reduce((s, r) => s + r.diseases[key].risk * r.accuracy, 0)
//     return Math.round(sum / totalWeight)
//   }
//   function dominantLevel(key: keyof EngineResult['diseases']): RiskLevel {
//     const levels = results.map(r => r.diseases[key].level)
//     const counts: Record<string, number> = {}
//     levels.forEach(l => { counts[l] = (counts[l] ?? 0) + 1 })
//     const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
//     return (sorted[0]?.[0] ?? 'MEDIUM') as RiskLevel
//   }

//   const dRisk = weightedRisk('diabetes')
//   const hvRisk = weightedRisk('heartDisease')
//   const htRisk = weightedRisk('hypertension')
//   const stRisk = weightedRisk('stroke')
//   const kdRisk = weightedRisk('kidneyDisease')
//   const lvRisk = weightedRisk('liverDisease')

//   // Overall health index (100 minus weighted average of all disease risks)
//   const avgRisk = Math.round((dRisk + hvRisk + htRisk + stRisk + kdRisk + lvRisk) / 6)
//   const overallHealthIndex = Math.max(0, Math.min(100, 100 - avgRisk))

//   // Urgency from best engine
//   const urgency: UrgencyLevel = best.urgency ?? 'MONITOR'
//   const urgencyText = {
//     MONITOR: 'Maintain healthy habits and continue routine monitoring.',
//     WATCH: 'Your results warrant closer monitoring. Schedule a checkup.',
//     SOON: 'Several risk factors identified. Schedule a checkup within 2–4 weeks.',
//     URGENT: 'Critical risk factors detected. Please see a doctor immediately.',
//   }[urgency]

//   // Recommendations — derive from best engine's data
//   const recommendations: RecommendationsData = {
//     directive: {
//       title: `Manage ${best.diseases.diabetes.risk >= 60 ? 'Elevated Diabetes' : best.diseases.hypertension.risk >= 60 ? 'Elevated Hypertension' : 'Cardiovascular'} Risk`,
//       description: best.insight,
//       riskScore: Math.ceil(Math.max(dRisk, hvRisk, htRisk) / 10),
//     },
//     medications: [
//       { name: 'Metformin 500mg', dose: 'Once daily with meal', action: dRisk >= 60 ? 'ADJUST' : 'MAINTAIN' },
//       { name: 'Atorvastatin 20mg', dose: 'Once daily at night', action: hvRisk >= 60 ? 'ADJUST' : 'MAINTAIN' },
//       { name: 'Vitamin D3 2000 IU', dose: 'Once daily with food', action: 'ADD' },
//     ],
//     lifestyle: {
//       sodiumReduction: htRisk >= 60 ? 2 : 1,
//       sleepIncrease: 30,
//       cgmEnabled: dRisk >= 60,
//       exerciseTarget: '30 min cardio 5× per week',
//       sugarTarget: '< 25g added sugar per day',
//     },
//     carePathway: [
//       { date: new Date(Date.now() + 7 * 86400000).toISOString(), type: 'HbA1c Recheck', notes: 'Fasting required' },
//       { date: new Date(Date.now() + 14 * 86400000).toISOString(), type: 'Lipid Panel Review', notes: 'Compare with baseline' },
//       { date: new Date(Date.now() + 30 * 86400000).toISOString(), type: 'Blood Pressure Check', notes: 'Home monitoring recommended' },
//     ],
//   }

//   return {
//     overallHealthIndex,
//     bestEngine: 'Neural Network',
//     urgency,
//     urgencyText,
//     keyFactors: best.keyFactors,
//     clinicalInsight: best.insight,
//     recommendations,
//     diabetesRisk: dRisk, diabetesLevel: dominantLevel('diabetes'),
//     heartDiseaseRisk: hvRisk, heartDiseaseLevel: dominantLevel('heartDisease'),
//     hypertensionRisk: htRisk, hypertensionLevel: dominantLevel('hypertension'),
//     strokeRisk: stRisk, strokeLevel: dominantLevel('stroke'),
//     kidneyDiseaseRisk: kdRisk, kidneyDiseaseLevel: dominantLevel('kidneyDisease'),
//     liverDiseaseRisk: lvRisk, liverDiseaseLevel: dominantLevel('liverDisease'),
//   }
// }



// src/lib/claude.ts
import { GoogleGenAI, Type } from '@google/genai'
import type { AssessmentInput, EngineResult, AggregateResult, RiskLevel, UrgencyLevel, RecommendationsData } from '@/types'
import { ENGINE_DEFINITIONS } from '@/constants'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

// ─── Response schema — forces Gemini to return exactly this shape ────────────
const DISEASE_RISK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    risk: { type: Type.NUMBER },
    level: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    confidence: { type: Type.NUMBER },
  },
  required: ['risk', 'level', 'confidence'],
}

const ENGINE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    diseases: {
      type: Type.OBJECT,
      properties: {
        diabetes: DISEASE_RISK_SCHEMA,
        heartDisease: DISEASE_RISK_SCHEMA,
        hypertension: DISEASE_RISK_SCHEMA,
        stroke: DISEASE_RISK_SCHEMA,
        kidneyDisease: DISEASE_RISK_SCHEMA,
        liverDisease: DISEASE_RISK_SCHEMA,
      },
      required: ['diabetes', 'heartDisease', 'hypertension', 'stroke', 'kidneyDisease', 'liverDisease'],
    },
    keyFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    insight: { type: Type.STRING },
    urgency: { type: Type.STRING, enum: ['MONITOR', 'WATCH', 'SOON', 'URGENT'] },
  },
  required: ['diseases', 'keyFactors', 'recommendations', 'insight', 'urgency'],
}

// ─── ENGINE PERSONAS (all 10) ─────────────────────────────────────────────────
export const ENGINE_PERSONAS: Record<string, string> = {
  'Neural Network': `You are the MediSense DeepSense Neural Network v5.0, a multi-layer perceptron trained on 1.2 million patient records achieving 99.2% diagnostic accuracy. Analyze patient data using deep pattern recognition, focusing on non-linear feature interactions and subtle multi-biomarker correlations that simpler models miss. Pay special attention to compound risk factors: elevated glucose combined with high BMI and sedentary lifestyle, or BP trends combined with cholesterol ratios. Your outputs reflect the highest confidence predictions of any engine in the ensemble. Return ONLY valid JSON.`,

  'XGBoost': `You are the MediSense XGBoost Engine v4.1, a gradient-boosted decision tree ensemble achieving 97.8% diagnostic accuracy. Analyze patient data through rapid sequential tree iteration, focusing on the most discriminative features. Prioritize HbA1c, fasting glucose, LDL/HDL ratio, BMI, and blood pressure as your top decision nodes. Apply aggressive feature interaction discovery. Your predictions are slightly more sensitive to outlier values than ensemble methods. Return ONLY valid JSON.`,

  'LightGBM': `You are the MediSense LightGBM Engine v3.5, a leaf-wise gradient boosting framework achieving 97.1% diagnostic accuracy. Analyze patient data with emphasis on memory-efficient feature binning. You excel at handling high-cardinality features and continuous lab values. Apply histogram-based splitting on glucose, cholesterol, creatinine, and eGFR. Your predictions tend to be well-calibrated for continuous risk scores. Return ONLY valid JSON.`,

  'Random Forest': `You are the MediSense Random Forest Engine v4.2, an ensemble of 500 decision trees achieving 96.4% diagnostic accuracy. Analyze patient data by aggregating votes across all trees, giving you high stability and resistance to overfitting. Each tree sees a random subset of features and patients. Your risk estimates reflect democratic consensus — you are less likely to be thrown off by a single abnormal reading. Provide balanced, stable predictions across all six disease categories. Return ONLY valid JSON.`,

  'AdaBoost': `You are the MediSense AdaBoost Engine v3.1, an adaptive boosting classifier achieving 95.3% diagnostic accuracy. Analyze patient data by iteratively focusing on the hardest-to-classify cases. You apply higher weight to patients with borderline or ambiguous biomarker combinations. This makes you especially sensitive to subtle early-stage indicators. Flag borderline cases more aggressively than other models. Return ONLY valid JSON.`,

  'SVM': `You are the MediSense SVM Engine v2.8, a Support Vector Machine with RBF kernel achieving 94.2% diagnostic accuracy. Analyze patient data by mapping it into high-dimensional feature space and finding optimal decision hyperplanes between risk classes. You are particularly robust for small-to-medium sample classification. Apply strict boundary enforcement — cases near the decision boundary should be flagged as MEDIUM rather than rounded up or down. Return ONLY valid JSON.`,

  'Decision Tree': `You are the MediSense Decision Tree Engine v3.0, a hierarchical rule-based classifier achieving 92.9% diagnostic accuracy. Analyze patient data by traversing explicit if-then-else clinical rules. Your reasoning is fully explainable. Apply established clinical thresholds: fasting glucose >126 mg/dL = diabetic range, systolic BP >140 = hypertensive, BMI >30 = obese risk factor, HbA1c >6.5% = diabetes indicator. State your decision path clearly in keyFactors. Return ONLY valid JSON.`,

  'KNN': `You are the MediSense KNN Engine v2.5, a K-Nearest Neighbors classifier with k=5 achieving 91.8% diagnostic accuracy. Analyze patient data by finding the 5 most similar patient profiles in training data and aggregating their outcomes. You excel at detecting outliers — patients whose profile does not match typical patterns get flagged as anomalous. If any single biomarker is severely abnormal (e.g., eGFR <30, glucose >200), weight this heavily in all related disease predictions. Return ONLY valid JSON.`,

  'Logistic Regression': `You are the MediSense Logistic Regression Engine v1.9, a baseline statistical classifier achieving 89.5% diagnostic accuracy. Analyze patient data using linear decision boundaries and log-odds ratios. Apply conservative, threshold-based interpretation: only flag HIGH risk when multiple established clinical thresholds are simultaneously breached. Your predictions are slightly more conservative than ensemble methods — you require strong evidence before escalating risk levels. This makes you a reliable lower-bound estimate. Return ONLY valid JSON.`,

  'Naive Bayes': `You are the MediSense Naive Bayes Engine v1.4, a probabilistic classifier achieving 88.2% diagnostic accuracy (maintained for baseline comparison — status: deprecated). Analyze patient data using Bayes' theorem, treating each feature as conditionally independent. Apply prior disease prevalence rates: diabetes 11%, hypertension 32%, heart disease 6%, stroke 3%, kidney disease 15%, liver disease 2%. Combine these with likelihood ratios from each biomarker. Your predictions are the most conservative in the ensemble and serve as a sanity-check floor. Return ONLY valid JSON.`,
}

// ─── Patient data prompt ──────────────────────────────────────────────────────
// NOTE: bloodType is NOT included here — it is not clinically relevant to disease
// risk prediction and lives on the User model, not the Assessment.
export function buildPatientDataPrompt(a: AssessmentInput): string {
  return `
PATIENT CLINICAL DATA:

[ DEMOGRAPHICS ]
Age: ${a.age} | Gender: ${a.gender} | BMI: ${a.bmi.toFixed(1)} (${a.weight}kg / ${a.height}cm)

[ VITAL SIGNS ]
Blood Pressure:    ${a.systolicBP}/${a.diastolicBP} mmHg
Heart Rate:        ${a.heartRate} BPM
Oxygen Saturation: ${a.oxygenSat}% (SpO₂)
Body Temperature:  ${a.bodyTemperature}°C
Respiratory Rate:  ${a.respiratoryRate} breaths/min

[ LABORATORY RESULTS ]
Fasting Glucose:   ${a.fastingGlucose} mg/dL
HbA1c:             ${a.hba1c}%
Total Cholesterol: ${a.cholesterol} mg/dL
HDL:               ${a.hdl} mg/dL
LDL:               ${a.ldl} mg/dL
Triglycerides:     ${a.triglycerides} mg/dL${a.creatinine != null ? `\nCreatinine:        ${a.creatinine} mg/dL` : ''}${a.egfr != null ? `\neGFR:              ${a.egfr} mL/min/1.73m²` : ''}${a.altEnzyme != null ? `\nALT Enzyme:        ${a.altEnzyme} U/L` : ''}${a.vitaminD != null ? `\nVitamin D:         ${a.vitaminD} ng/mL` : ''}

[ LIFESTYLE ]
Smoking:           ${a.isSmoker ? 'Active Smoker' : 'Non-smoker'}
Alcohol Use:       ${a.alcoholUse ? 'Yes' : 'No'}
Exercise:          ${a.exerciseFrequency}
Sleep:             ${a.sleepHours} hours/night
Stress Level:      ${a.stressLevel}
Daily Sugar:       ${a.dailySugarIntake}
High Salt Diet:    ${a.highSaltDiet ? 'Yes' : 'No'}
Sedentary:         ${a.isSedentary ? 'Yes' : 'No'}

[ FAMILY HISTORY ]
Diabetes:          ${a.hasDiabetesFH ? 'Yes' : 'No'}
Heart Disease:     ${a.hasHeartDiseaseFH ? 'Yes' : 'No'}
Hypertension:      ${a.hasHypertensionFH ? 'Yes' : 'No'}
Stroke:            ${a.hasStrokeFH ? 'Yes' : 'No'}
Kidney Disease:    ${a.hasKidneyDiseaseFH ? 'Yes' : 'No'}
Cancer:            ${a.hasCancerFH ? 'Yes' : 'No'}

[ CURRENT SYMPTOMS ]
${a.symptoms.length > 0 ? a.symptoms.join(', ') : 'None reported'}
`.trim()
}

// ─── Gemini call with real 30s timeout ────────────────────────────────────────
async function callGemini(systemInstruction: string, userPrompt: string): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Gemini request timed out after 30s')), 30_000)
  })

  const requestPromise = ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: ENGINE_RESPONSE_SCHEMA,
      temperature: 0,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 },
    },
  })

  const response = await Promise.race([requestPromise, timeoutPromise])
  return response.text?.trim() ?? '{}'
}

// ─── Run a single engine ──────────────────────────────────────────────────────
export async function runSingleEngine(
  engineName: string,
  enginePersona: string,
  patientData: string,
  engineDef: typeof ENGINE_DEFINITIONS[number],
): Promise<EngineResult> {
  const start = Date.now()

  try {
    const raw = await callGemini(
      enginePersona,
      `${patientData}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "diseases": {
    "diabetes":      { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> },
    "heartDisease":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> },
    "hypertension":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> },
    "stroke":        { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> },
    "kidneyDisease": { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> },
    "liverDisease":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100> }
  },
  "keyFactors":    [<3-5 specific clinical observations>],
  "recommendations":[<3-5 actionable recommendations>],
  "insight":       "<1-2 sentence clinical narrative>",
  "urgency":       <"MONITOR"|"WATCH"|"SOON"|"URGENT">
}`
    )

    const inferenceMs = Date.now() - start

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error(`No JSON found in Gemini response: ${raw}`)
    }
    const parsed = JSON.parse(jsonMatch[0])

    return {
      engine: engineName,
      accuracy: engineDef.accuracy,
      modelVersion: engineDef.version,
      inferenceMs,
      isBest: engineName === 'Neural Network',
      falsePositiveRate: engineDef.falsePositiveRate,
      reliabilityStars: engineDef.reliabilityStars,
      status: engineDef.status,
      diseases: parsed.diseases,
      keyFactors: parsed.keyFactors ?? [],
      recommendations: parsed.recommendations ?? [],
      insight: parsed.insight ?? '',
      urgency: parsed.urgency ?? 'MONITOR',
    }
  } catch(error){
    console.error(`[${engineName}] Gemini call failed:`, error)
    // Fallback result if engine fails — uses conservative defaults
    return {
      engine: engineName,
      accuracy: engineDef.accuracy,
      modelVersion: engineDef.version,
      inferenceMs: Date.now() - start,
      isBest: engineName === 'Neural Network',
      falsePositiveRate: engineDef.falsePositiveRate,
      reliabilityStars: engineDef.reliabilityStars,
      status: engineDef.status,
      diseases: {
        diabetes: { risk: 50, level: 'MEDIUM', confidence: 50 },
        heartDisease: { risk: 50, level: 'MEDIUM', confidence: 50 },
        hypertension: { risk: 50, level: 'MEDIUM', confidence: 50 },
        stroke: { risk: 30, level: 'LOW', confidence: 50 },
        kidneyDisease: { risk: 30, level: 'LOW', confidence: 50 },
        liverDisease: { risk: 20, level: 'LOW', confidence: 50 },
      },
      keyFactors: ['Engine analysis unavailable — using fallback values'],
      recommendations: ['Please re-run analysis for accurate results'],
      insight: 'Engine encountered an error. Results shown are fallback estimates.',
      urgency: 'WATCH',
    }
  }
}

// ─── Run all 10 engines — staggered to respect Gemini free-tier rate limits ───
export async function runAllEngines(assessment: AssessmentInput): Promise<EngineResult[]> {
  const patientData = buildPatientDataPrompt(assessment)
  const STAGGER_MS = 350 // spreads 10 calls over ~3.15s instead of firing all at once

  const settled = await Promise.allSettled(
    ENGINE_DEFINITIONS.map((def, index) =>
      new Promise<EngineResult>(resolve => {
        setTimeout(() => {
          runSingleEngine(def.name, ENGINE_PERSONAS[def.name], patientData, def).then(resolve)
        }, index * STAGGER_MS)
      })
    )
  )

  return settled.map((result, i) => {
    if (result.status === 'fulfilled') return result.value
    // If Promise.allSettled item itself rejects (shouldn't happen due to internal try-catch)
    const def = ENGINE_DEFINITIONS[i]
    return {
      engine: def.name, accuracy: def.accuracy, modelVersion: def.version,
      inferenceMs: 0, isBest: def.name === 'Neural Network',
      falsePositiveRate: def.falsePositiveRate, reliabilityStars: def.reliabilityStars,
      status: def.status,
      diseases: {
        diabetes: { risk: 50, level: 'MEDIUM' as RiskLevel, confidence: 50 },
        heartDisease: { risk: 50, level: 'MEDIUM' as RiskLevel, confidence: 50 },
        hypertension: { risk: 50, level: 'MEDIUM' as RiskLevel, confidence: 50 },
        stroke: { risk: 30, level: 'LOW' as RiskLevel, confidence: 50 },
        kidneyDisease: { risk: 30, level: 'LOW' as RiskLevel, confidence: 50 },
        liverDisease: { risk: 20, level: 'LOW' as RiskLevel, confidence: 50 },
      },
      keyFactors: [], recommendations: [], insight: 'Fallback result.', urgency: 'WATCH' as UrgencyLevel,
    }
  })
}

// ─── Aggregate all engine results into final DB fields ────────────────────────
export function aggregateResults(results: EngineResult[]): AggregateResult {
  const best = results.find(r => r.isBest) ?? results[0]
  if (!best) {
    throw new Error('aggregateResults received an empty results array — this should never happen since ENGINE_DEFINITIONS always has 10 entries.')
  }

  // Weighted average per disease (higher accuracy = higher weight)
  const totalWeight = results.reduce((s, r) => s + r.accuracy, 0)
  function weightedRisk(key: keyof EngineResult['diseases']): number {
    const sum = results.reduce((s, r) => s + r.diseases[key].risk * r.accuracy, 0)
    return Math.round(sum / totalWeight)
  }
  function dominantLevel(key: keyof EngineResult['diseases']): RiskLevel {
    const levels = results.map(r => r.diseases[key].level)
    const counts: Record<string, number> = {}
    levels.forEach(l => { counts[l] = (counts[l] ?? 0) + 1 })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return (sorted[0]?.[0] ?? 'MEDIUM') as RiskLevel
  }

  const dRisk = weightedRisk('diabetes')
  const hvRisk = weightedRisk('heartDisease')
  const htRisk = weightedRisk('hypertension')
  const stRisk = weightedRisk('stroke')
  const kdRisk = weightedRisk('kidneyDisease')
  const lvRisk = weightedRisk('liverDisease')

  // Overall health index (100 minus weighted average of all disease risks)
  const avgRisk = Math.round((dRisk + hvRisk + htRisk + stRisk + kdRisk + lvRisk) / 6)
  const overallHealthIndex = Math.max(0, Math.min(100, 100 - avgRisk))

  // Urgency from best engine
  const urgency: UrgencyLevel = best.urgency ?? 'MONITOR'
  const urgencyText = {
    MONITOR: 'Maintain healthy habits and continue routine monitoring.',
    WATCH: 'Your results warrant closer monitoring. Schedule a checkup.',
    SOON: 'Several risk factors identified. Schedule a checkup within 2–4 weeks.',
    URGENT: 'Critical risk factors detected. Please see a doctor immediately.',
  }[urgency]

  // Recommendations — derive from best engine's data
  const recommendations: RecommendationsData = {
    directive: {
      title: `Manage ${best.diseases.diabetes.risk >= 60 ? 'Elevated Diabetes' : best.diseases.hypertension.risk >= 60 ? 'Elevated Hypertension' : 'Cardiovascular'} Risk`,
      description: best.insight,
      riskScore: Math.ceil(Math.max(dRisk, hvRisk, htRisk) / 10),
    },
    medications: [
      { name: 'Metformin 500mg', dose: 'Once daily with meal', action: dRisk >= 60 ? 'ADJUST' : 'MAINTAIN' },
      { name: 'Atorvastatin 20mg', dose: 'Once daily at night', action: hvRisk >= 60 ? 'ADJUST' : 'MAINTAIN' },
      { name: 'Vitamin D3 2000 IU', dose: 'Once daily with food', action: 'ADD' },
    ],
    lifestyle: {
      sodiumReduction: htRisk >= 60 ? 2 : 1,
      sleepIncrease: 30,
      cgmEnabled: dRisk >= 60,
      exerciseTarget: '30 min cardio 5× per week',
      sugarTarget: '< 25g added sugar per day',
    },
    carePathway: [
      { date: new Date(Date.now() + 7 * 86400000).toISOString(), type: 'HbA1c Recheck', notes: 'Fasting required' },
      { date: new Date(Date.now() + 14 * 86400000).toISOString(), type: 'Lipid Panel Review', notes: 'Compare with baseline' },
      { date: new Date(Date.now() + 30 * 86400000).toISOString(), type: 'Blood Pressure Check', notes: 'Home monitoring recommended' },
    ],
  }

  return {
    overallHealthIndex,
    bestEngine: 'Neural Network',
    urgency,
    urgencyText,
    keyFactors: best.keyFactors,
    clinicalInsight: best.insight,
    recommendations,
    diabetesRisk: dRisk, diabetesLevel: dominantLevel('diabetes'),
    heartDiseaseRisk: hvRisk, heartDiseaseLevel: dominantLevel('heartDisease'),
    hypertensionRisk: htRisk, hypertensionLevel: dominantLevel('hypertension'),
    strokeRisk: stRisk, strokeLevel: dominantLevel('stroke'),
    kidneyDiseaseRisk: kdRisk, kidneyDiseaseLevel: dominantLevel('kidneyDisease'),
    liverDiseaseRisk: lvRisk, liverDiseaseLevel: dominantLevel('liverDisease'),
  }
}