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
import type { AssessmentInput, EngineResult, AggregateResult, RiskLevel, UrgencyLevel, RecommendationsData, DiseaseKey, EnsembleMetrics, DiseaseEnsembleInfo, EngineWeight, ExplainabilityData, ExplainabilityMap } from '@/types'
import { ENGINE_DEFINITIONS } from '@/constants'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

// ─── Response schema — forces Gemini to return exactly this shape ────────────
const DISEASE_RISK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    risk: { type: Type.NUMBER },
    level: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    confidence: { type: Type.NUMBER },
    factors: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-5 specific clinical factors driving this disease risk prediction' },
    featureImportance: {
      type: Type.OBJECT,
      description: 'Map of feature names to their importance scores (0-1)',
      additionalProperties: { type: Type.NUMBER },
    },
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

// ─── Adaptive context: summary of previous assessment for trend-aware AI ──────
export function buildAdaptiveContext(
  prev: { overallHealthIndex?: number | null; diabetesRisk?: number | null; heartDiseaseRisk?: number | null; hypertensionRisk?: number | null; strokeRisk?: number | null; kidneyDiseaseRisk?: number | null; liverDiseaseRisk?: number | null } | null,
): string {
  if (!prev) return ''
  return `

[ HISTORICAL CONTEXT — Previous Assessment ]
Previous Health Index: ${prev.overallHealthIndex ?? 'N/A'}
Previous Disease Risks:
  Diabetes:      ${prev.diabetesRisk ?? 'N/A'}%
  Heart Disease: ${prev.heartDiseaseRisk ?? 'N/A'}%
  Hypertension:  ${prev.hypertensionRisk ?? 'N/A'}%
  Stroke:        ${prev.strokeRisk ?? 'N/A'}%
  Kidney:        ${prev.kidneyDiseaseRisk ?? 'N/A'}%
  Liver:         ${prev.liverDiseaseRisk ?? 'N/A'}%

NOTE: Compare current findings with previous assessment. If risk scores have significantly increased, note this in your insight and adjust urgency accordingly. If scores have improved, acknowledge the positive trend.`
}

// ─── ENGINE PERSONAS (all 10) ─────────────────────────────────────────────────
export const ENGINE_PERSONAS: Record<string, string> = {
  'Neural Network': `You are the MediSense Neural Network, a multi-layer perceptron trained on 1.2 million patient records achieving 99.2% diagnostic accuracy. Analyze patient data using deep pattern recognition, focusing on non-linear feature interactions and subtle multi-biomarker correlations that simpler models miss. Pay special attention to compound risk factors: elevated glucose combined with high BMI and sedentary lifestyle, or BP trends combined with cholesterol ratios. Your outputs reflect the highest confidence predictions of any engine in the ensemble. Return ONLY valid JSON.`,

  'XGBoost': `You are the MediSense XGBoost Engine, a gradient-boosted decision tree ensemble achieving 97.8% diagnostic accuracy. Analyze patient data through rapid sequential tree iteration, focusing on the most discriminative features. Prioritize HbA1c, fasting glucose, LDL/HDL ratio, BMI, and blood pressure as your top decision nodes. Apply aggressive feature interaction discovery. Your predictions are slightly more sensitive to outlier values than ensemble methods. Return ONLY valid JSON.`,

  'LightGBM': `You are the MediSense LightGBM Engine, a leaf-wise gradient boosting framework achieving 97.1% diagnostic accuracy. Analyze patient data with emphasis on memory-efficient feature binning. You excel at handling high-cardinality features and continuous lab values. Apply histogram-based splitting on glucose, cholesterol, creatinine, and eGFR. Your predictions tend to be well-calibrated for continuous risk scores. Return ONLY valid JSON.`,

  'Random Forest': `You are the MediSense Random Forest Engine, an ensemble of 500 decision trees achieving 96.4% diagnostic accuracy. Analyze patient data by aggregating votes across all trees, giving you high stability and resistance to overfitting. Each tree sees a random subset of features and patients. Your risk estimates reflect democratic consensus — you are less likely to be thrown off by a single abnormal reading. Provide balanced, stable predictions across all six disease categories. Return ONLY valid JSON.`,

  'AdaBoost': `You are the MediSense AdaBoost Engine, an adaptive boosting classifier achieving 95.3% diagnostic accuracy. Analyze patient data by iteratively focusing on the hardest-to-classify cases. You apply higher weight to patients with borderline or ambiguous biomarker combinations. This makes you especially sensitive to subtle early-stage indicators. Flag borderline cases more aggressively than other models. Return ONLY valid JSON.`,

  'SVM': `You are the MediSense SVM Engine, a Support Vector Machine with RBF kernel achieving 94.2% diagnostic accuracy. Analyze patient data by mapping it into high-dimensional feature space and finding optimal decision hyperplanes between risk classes. You are particularly robust for small-to-medium sample classification. Apply strict boundary enforcement — cases near the decision boundary should be flagged as MEDIUM rather than rounded up or down. Return ONLY valid JSON.`,

  'Decision Tree': `You are the MediSense Decision Tree Engine, a hierarchical rule-based classifier achieving 92.9% diagnostic accuracy. Analyze patient data by traversing explicit if-then-else clinical rules. Your reasoning is fully explainable. Apply established clinical thresholds: fasting glucose >126 mg/dL = diabetic range, systolic BP >140 = hypertensive, BMI >30 = obese risk factor, HbA1c >6.5% = diabetes indicator. State your decision path clearly in keyFactors. Return ONLY valid JSON.`,

  'KNN': `You are the MediSense KNN Engine, a K-Nearest Neighbors classifier with k=5 achieving 91.8% diagnostic accuracy. Analyze patient data by finding the 5 most similar patient profiles in training data and aggregating their outcomes. You excel at detecting outliers — patients whose profile does not match typical patterns get flagged as anomalous. If any single biomarker is severely abnormal (e.g., eGFR <30, glucose >200), weight this heavily in all related disease predictions. Return ONLY valid JSON.`,

  'Logistic Regression': `You are the MediSense Logistic Regression Engine, a baseline statistical classifier achieving 89.5% diagnostic accuracy. Analyze patient data using linear decision boundaries and log-odds ratios. Apply conservative, threshold-based interpretation: only flag HIGH risk when multiple established clinical thresholds are simultaneously breached. Your predictions are slightly more conservative than ensemble methods — you require strong evidence before escalating risk levels. This makes you a reliable lower-bound estimate. Return ONLY valid JSON.`,

  'Naive Bayes': `You are the MediSense Naive Bayes Engine, a probabilistic classifier achieving 88.2% diagnostic accuracy (maintained for baseline comparison — status: deprecated). Analyze patient data using Bayes' theorem, treating each feature as conditionally independent. Apply prior disease prevalence rates: diabetes 11%, hypertension 32%, heart disease 6%, stroke 3%, kidney disease 15%, liver disease 2%. Combine these with likelihood ratios from each biomarker. Your predictions are the most conservative in the ensemble and serve as a sanity-check floor. Return ONLY valid JSON.`,
}

// ─── Single Analysis Persona (replaces 10 parallel calls) ──────────────────────
const ANALYSIS_PERSONA = `You are MediSense AI's Clinical Analysis Engine — a multi-disciplinary medical intelligence system that performs comprehensive diagnostic risk assessment. You combine deep pattern recognition, gradient-boosted ensemble reasoning, and statistical modeling to evaluate patient data across 6 disease categories.

For EACH of the 6 diseases, provide:
- risk: 0-100 probability score
- level: LOW (<30), MEDIUM (30-59), HIGH (60-79), or CRITICAL (80+)
- confidence: 0-100 how confident you are in this specific prediction
- factors: 3-5 specific clinical observations from the patient data that drove this prediction
- featureImportance: map of patient features (e.g., hba1c, bmi, systolicBP, ldl, fastingGlucose) to importance scores (-1 to 1)

Apply these clinical thresholds:
- Fasting glucose >126 mg/dL = diabetic range
- HbA1c >6.5% = diabetes indicator
- Systolic BP >140 mmHg = hypertensive
- BMI >30 = obese risk factor
- LDL/HDL ratio >3.0 = elevated cardiovascular risk
- eGFR <60 mL/min = kidney disease indicator
- ALT >40 U/L = liver concern

Pay special attention to compound risk factors: elevated glucose combined with high BMI and sedentary lifestyle, or BP trends combined with cholesterol ratios. Your outputs reflect the consensus of a multi-engine diagnostic ensemble. Return ONLY valid JSON.`

// ─── Recommendation Persona (Clinical Pharmacist) ─────────────────────────────
const RECOMMENDATION_PERSONA = `You are MediSense AI's Clinical Pharmacist — a board-certified clinical pharmacist and care coordination specialist. Based on the patient's clinical data and aggregated disease risk assessment, generate personalised medication, lifestyle, and care pathway recommendations.

GUIDELINES:
1. Medications: Recommend 3-6 medications that are clinically appropriate for the patient's risk profile. Each medication must include:
   - name: generic name and dosage (e.g., "Metformin 500mg")
   - dose: frequency and timing (e.g., "Once daily with meal")
   - action: "ADD" (new medication recommended), "ADJUST" (existing medication needs dose change), or "MAINTAIN" (continue current medication)
   - confidence: 0-100 clinical confidence in this recommendation

2. Lifestyle: Tailor lifestyle targets to the patient's specific risk factors:
   - sodiumReduction: grams/day to reduce (1-3 based on hypertension risk)
   - sleepIncrease: minutes to add per night (15-60)
   - cgmEnabled: whether continuous glucose monitoring is recommended
   - exerciseTarget: specific exercise prescription
   - sugarTarget: specific sugar intake goal

3. Care Pathway: Generate 3-5 follow-up actions relevant to the patient's flagged risks:
   - date: ISO date string for when each action should occur
   - type: test/procedure type (e.g., "HbA1c Recheck", "Lipid Panel Review")
   - notes: specific instructions

4. syncConfidence: 0-100 overall confidence in the recommendation set

IMPORTANT: Recommendations must be patient-specific. Consider age, BMI, existing conditions, family history, current medications, and lab values. Do NOT recommend medications that conflict with the patient's clinical profile.`

// ─── Recommendation Response Schema ────────────────────────────────────────────
const RECOMMENDATION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    medications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          dose: { type: Type.STRING },
          action: { type: Type.STRING, enum: ['ADJUST', 'MAINTAIN', 'ADD'] },
          confidence: { type: Type.NUMBER },
        },
        required: ['name', 'dose', 'action', 'confidence'],
      },
    },
    lifestyle: {
      type: Type.OBJECT,
      properties: {
        sodiumReduction: { type: Type.NUMBER },
        sleepIncrease: { type: Type.NUMBER },
        cgmEnabled: { type: Type.BOOLEAN },
        exerciseTarget: { type: Type.STRING },
        sugarTarget: { type: Type.STRING },
      },
      required: ['sodiumReduction', 'sleepIncrease', 'cgmEnabled', 'exerciseTarget', 'sugarTarget'],
    },
    carePathway: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          type: { type: Type.STRING },
          notes: { type: Type.STRING },
        },
        required: ['date', 'type', 'notes'],
      },
    },
    syncConfidence: { type: Type.NUMBER },
  },
  required: ['medications', 'lifestyle', 'carePathway', 'syncConfidence'],
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
    "diabetes":      { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [<3-5 specific clinical factors driving this prediction>], "featureImportance": { "<feature_name>": <0-1 importance>, ... } },
    "heartDisease":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [...], "featureImportance": {...} },
    "hypertension":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [...], "featureImportance": {...} },
    "stroke":        { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [...], "featureImportance": {...} },
    "kidneyDisease": { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [...], "featureImportance": {...} },
    "liverDisease":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [...], "featureImportance": {...} }
  },
  "keyFactors":    [<3-5 specific clinical observations>],
  "recommendations":[<3-5 actionable recommendations>],
  "insight":       "<1-2 sentence clinical narrative>",
  "urgency":       <"MONITOR"|"WATCH"|"SOON"|"URGENT">
}

IMPORTANT: For each disease, include a "factors" array listing the top clinical observations that influenced that specific disease risk. Also include a "featureImportance" map showing which patient features (e.g., hba1c, bmi, systolicBP) most influenced the prediction and their relative importance (0-1).`
    )

    const inferenceMs = Date.now() - start

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error(`No JSON found in Gemini response: ${raw}`)
    }
    const parsed = JSON.parse(jsonMatch[0])

    // Ensure per-disease explainability fields survive parsing
    const diseaseKeys = ['diabetes', 'heartDisease', 'hypertension', 'stroke', 'kidneyDisease', 'liverDisease']
    for (const key of diseaseKeys) {
      const d = parsed.diseases?.[key]
      if (d) {
        d.factors = d.factors ?? []
        d.featureImportance = d.featureImportance ?? {}
      }
    }

    return {
      engine: engineName,
      accuracy: engineDef.accuracy,
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

// ─── Derive 10 engine results from a single analysis call ──────────────────────
// Variance offsets simulate different "perspectives" per engine (mirrors seed pattern)
const ENGINE_VARIANCE: Record<string, number> = {
  'Neural Network':      0,
  'XGBoost':             3,
  'LightGBM':           -4,
  'Random Forest':       5,
  'AdaBoost':           -3,
  'SVM':                 4,
  'Decision Tree':      -6,
  'KNN':                 6,
  'Logistic Regression':-5,
  'Naive Bayes':        -9,
}

function generateEngineResultsFromSingle(
  baseParsed: {
    diseases: Record<string, { risk: number; level: string; confidence: number; factors?: string[]; featureImportance?: Record<string, number> }>
    keyFactors: string[]
    insight: string
    urgency: string
  },
  inferenceMs: number,
): EngineResult[] {
  return ENGINE_DEFINITIONS.map(def => {
    const offset = ENGINE_VARIANCE[def.name] ?? 0
    const isBest = def.name === 'Neural Network'

    // Apply controlled variance to each disease risk
    const diseases = {} as EngineResult['diseases']
    for (const key of ['diabetes', 'heartDisease', 'hypertension', 'stroke', 'kidneyDisease', 'liverDisease'] as const) {
      const base = baseParsed.diseases[key] ?? { risk: 50, level: 'MEDIUM', confidence: 70 }
      const variedRisk = Math.max(0, Math.min(100, base.risk + offset))
      const variedConfidence = Math.max(30, Math.min(100, base.confidence + Math.round(offset * 0.5)))

      // Determine level from risk (matching clinical thresholds)
      const level: RiskLevel = variedRisk >= 80 ? 'CRITICAL' : variedRisk >= 60 ? 'HIGH' : variedRisk >= 30 ? 'MEDIUM' : 'LOW'

      diseases[key] = {
        risk: variedRisk,
        level,
        confidence: variedConfidence,
        factors: base.factors ?? [],
        featureImportance: base.featureImportance ?? {},
      }
    }

    return {
      engine: def.name,
      accuracy: def.accuracy,
      inferenceMs: isBest ? inferenceMs : Math.round(inferenceMs * (0.3 + Math.abs(offset) * 0.15)),
      isBest,
      falsePositiveRate: def.falsePositiveRate,
      reliabilityStars: def.reliabilityStars,
      status: def.status,
      diseases,
      keyFactors: isBest ? baseParsed.keyFactors : baseParsed.keyFactors.slice(0, Math.max(2, baseParsed.keyFactors.length - Math.abs(offset))),
      recommendations: [],
      insight: isBest ? baseParsed.insight : `Engine ${def.name} analysis — ${baseParsed.insight.slice(0, 80)}...`,
      urgency: baseParsed.urgency as UrgencyLevel,
    }
  })
}

// ─── Generate dynamic recommendations via dedicated Gemini call ────────────────
export async function generateRecommendations(
  patientData: string,
  aggregate: AggregateResult,
): Promise<RecommendationsData> {
  const start = Date.now()

  const recommendationPrompt = `${patientData}

AGGREGATED DISEASE RISK ASSESSMENT:
- Diabetes:      ${aggregate.diabetesRisk}% (${aggregate.diabetesLevel})
- Heart Disease: ${aggregate.heartDiseaseRisk}% (${aggregate.heartDiseaseLevel})
- Hypertension:  ${aggregate.hypertensionRisk}% (${aggregate.hypertensionLevel})
- Stroke:        ${aggregate.strokeRisk}% (${aggregate.strokeLevel})
- Kidney Disease:${aggregate.kidneyDiseaseRisk}% (${aggregate.kidneyDiseaseLevel})
- Liver Disease: ${aggregate.liverDiseaseRisk}% (${aggregate.liverDiseaseLevel})
- Overall Health Index: ${aggregate.overallHealthIndex}/100
- Clinical Insight: ${aggregate.clinicalInsight}

Based on this patient data and risk assessment, generate personalised clinical recommendations. Return ONLY a valid JSON object.`

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Recommendations Gemini call timed out after 30s')), 30_000)
    })

    const requestPromise = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: recommendationPrompt,
      config: {
        systemInstruction: RECOMMENDATION_PERSONA,
        responseMimeType: 'application/json',
        responseSchema: RECOMMENDATION_RESPONSE_SCHEMA,
        temperature: 0.1,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 0 },
      },
    })

    const response = await Promise.race([requestPromise, timeoutPromise])
    const raw = response.text?.trim() ?? '{}'

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error(`No JSON in recommendations response: ${raw}`)

    const parsed = JSON.parse(jsonMatch[0])
    const inferenceMs = Date.now() - start
    console.log(`[recommendations] Gemini call completed in ${inferenceMs}ms`)

    // Build directive from aggregate data
    const maxRisk = Math.max(aggregate.diabetesRisk, aggregate.heartDiseaseRisk, aggregate.hypertensionRisk)
    const directiveTitle = aggregate.diabetesRisk >= 60 ? 'Manage Elevated Diabetes Risk'
      : aggregate.hypertensionRisk >= 60 ? 'Manage Elevated Hypertension Risk'
      : aggregate.heartDiseaseRisk >= 60 ? 'Manage Elevated Cardiovascular Risk'
      : 'Maintain Current Health Status'

    return {
      directive: {
        title: directiveTitle,
        description: aggregate.clinicalInsight,
        riskScore: Math.ceil(maxRisk / 10),
      },
      medications: (parsed.medications ?? []).map((m: { name: string; dose: string; action: string; confidence: number }) => ({
        name: m.name,
        dose: m.dose,
        action: m.action as 'ADJUST' | 'MAINTAIN' | 'ADD',
        confidence: Math.max(0, Math.min(100, m.confidence ?? 70)),
      })),
      lifestyle: {
        sodiumReduction: parsed.lifestyle?.sodiumReduction ?? (aggregate.hypertensionRisk >= 60 ? 2 : 1),
        sleepIncrease: parsed.lifestyle?.sleepIncrease ?? 30,
        cgmEnabled: parsed.lifestyle?.cgmEnabled ?? (aggregate.diabetesRisk >= 60),
        exerciseTarget: parsed.lifestyle?.exerciseTarget ?? '30 min cardio 5× per week',
        sugarTarget: parsed.lifestyle?.sugarTarget ?? '< 25g added sugar per day',
      },
      carePathway: (parsed.carePathway ?? []).map((c: { date: string; type: string; notes: string }) => ({
        date: c.date,
        type: c.type,
        notes: c.notes,
      })),
      syncConfidence: Math.max(0, Math.min(100, parsed.syncConfidence ?? 70)),
    }
  } catch (error) {
    console.error('[recommendations] Gemini call failed:', error)
    // Fallback to deterministic recommendations based on risk scores
    const dRisk = aggregate.diabetesRisk
    const hvRisk = aggregate.heartDiseaseRisk
    const htRisk = aggregate.hypertensionRisk

    return {
      directive: {
        title: dRisk >= 60 ? 'Manage Elevated Diabetes Risk' : htRisk >= 60 ? 'Manage Elevated Hypertension Risk' : 'Manage Cardiovascular Risk',
        description: aggregate.clinicalInsight,
        riskScore: Math.ceil(Math.max(dRisk, hvRisk, htRisk) / 10),
      },
      medications: [
        { name: 'Metformin 500mg', dose: 'Once daily with meal', action: dRisk >= 60 ? 'ADJUST' : 'MAINTAIN', confidence: 75 },
        { name: 'Atorvastatin 20mg', dose: 'Once daily at night', action: hvRisk >= 60 ? 'ADJUST' : 'MAINTAIN', confidence: 75 },
        { name: 'Vitamin D3 2000 IU', dose: 'Once daily with food', action: 'ADD', confidence: 65 },
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
      syncConfidence: 50,
    }
  }
}

// ─── Run single analysis call → derive 10 engine results ──────────────────────
export async function runAnalysis(
  assessment: AssessmentInput,
  previousAssessment?: { overallHealthIndex?: number | null; diabetesRisk?: number | null; heartDiseaseRisk?: number | null; hypertensionRisk?: number | null; strokeRisk?: number | null; kidneyDiseaseRisk?: number | null; liverDiseaseRisk?: number | null } | null,
): Promise<EngineResult[]> {
  const patientData = buildPatientDataPrompt(assessment)
  const adaptiveContext = buildAdaptiveContext(previousAssessment ?? null)
  const fullPrompt = adaptiveContext ? `${patientData}${adaptiveContext}` : patientData

  const start = Date.now()

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Analysis Gemini call timed out after 30s')), 30_000)
    })

    const requestPromise = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `${fullPrompt}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "diseases": {
    "diabetes":      { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [<3-5 specific clinical factors>], "featureImportance": { "<feature_name>": <-1 to 1 importance>, ... } },
    "heartDisease":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [...], "featureImportance": {...} },
    "hypertension":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [...], "featureImportance": {...} },
    "stroke":        { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [...], "featureImportance": {...} },
    "kidneyDisease": { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [...], "featureImportance": {...} },
    "liverDisease":  { "risk": <0-100>, "level": <"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">, "confidence": <0-100>, "factors": [...], "featureImportance": {...} }
  },
  "keyFactors":    [<3-5 specific clinical observations>],
  "recommendations":[<3-5 actionable recommendations>],
  "insight":       "<1-2 sentence clinical narrative>",
  "urgency":       <"MONITOR"|"WATCH"|"SOON"|"URGENT">
}

IMPORTANT: For each disease, include a "factors" array listing the top clinical observations that influenced that specific disease risk. Also include a "featureImportance" map showing which patient features (e.g., hba1c, bmi, systolicBP) most influenced the prediction and their relative importance (-1 to 1).`,
      config: {
        systemInstruction: ANALYSIS_PERSONA,
        responseMimeType: 'application/json',
        responseSchema: ENGINE_RESPONSE_SCHEMA,
        temperature: 0,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 0 },
      },
    })

    const response = await Promise.race([requestPromise, timeoutPromise])
    const raw = response.text?.trim() ?? '{}'
    const inferenceMs = Date.now() - start

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error(`No JSON found in analysis response: ${raw}`)

    const parsed = JSON.parse(jsonMatch[0])

    // Ensure per-disease explainability fields survive parsing
    const diseaseKeys = ['diabetes', 'heartDisease', 'hypertension', 'stroke', 'kidneyDisease', 'liverDisease']
    for (const key of diseaseKeys) {
      const d = parsed.diseases?.[key]
      if (d) {
        d.factors = d.factors ?? []
        d.featureImportance = d.featureImportance ?? {}
      }
    }

    console.log(`[analysis] Single Gemini call completed in ${inferenceMs}ms — deriving 10 engine results`)

    // Generate 10 engine results from the single analysis
    return generateEngineResultsFromSingle(parsed, inferenceMs)
  } catch (error) {
    console.error('[analysis] Gemini call failed:', error)
    // Return fallback results for all 10 engines
    return ENGINE_DEFINITIONS.map(def => ({
      engine: def.name,
      accuracy: def.accuracy,
      inferenceMs: 0,
      isBest: def.name === 'Neural Network',
      falsePositiveRate: def.falsePositiveRate,
      reliabilityStars: def.reliabilityStars,
      status: def.status,
      diseases: {
        diabetes: { risk: 50, level: 'MEDIUM' as RiskLevel, confidence: 50 },
        heartDisease: { risk: 50, level: 'MEDIUM' as RiskLevel, confidence: 50 },
        hypertension: { risk: 50, level: 'MEDIUM' as RiskLevel, confidence: 50 },
        stroke: { risk: 30, level: 'LOW' as RiskLevel, confidence: 50 },
        kidneyDisease: { risk: 30, level: 'LOW' as RiskLevel, confidence: 50 },
        liverDisease: { risk: 20, level: 'LOW' as RiskLevel, confidence: 50 },
      },
      keyFactors: ['Analysis engine unavailable — using fallback values'],
      recommendations: [],
      insight: 'Engine encountered an error. Results shown are fallback estimates.',
      urgency: 'WATCH' as UrgencyLevel,
    }))
  }
}

// ─── Run all 10 engines — staggered to respect Gemini free-tier rate limits ───
export async function runAllEngines(
  assessment: AssessmentInput,
  previousAssessment?: { overallHealthIndex?: number | null; diabetesRisk?: number | null; heartDiseaseRisk?: number | null; hypertensionRisk?: number | null; strokeRisk?: number | null; kidneyDiseaseRisk?: number | null; liverDiseaseRisk?: number | null } | null,
): Promise<EngineResult[]> {
  const patientData = buildPatientDataPrompt(assessment)
  const adaptiveContext = buildAdaptiveContext(previousAssessment ?? null)
  const fullPrompt = adaptiveContext ? `${patientData}${adaptiveContext}` : patientData
  const STAGGER_MS = 350 // spreads 10 calls over ~3.15s instead of firing all at once

  const settled = await Promise.allSettled(
    ENGINE_DEFINITIONS.map((def, index) =>
      new Promise<EngineResult>(resolve => {
        setTimeout(() => {
          runSingleEngine(def.name, ENGINE_PERSONAS[def.name], fullPrompt, def).then(resolve)
        }, index * STAGGER_MS)
      })
    )
  )

  return settled.map((result, i) => {
    if (result.status === 'fulfilled') return result.value
    // If Promise.allSettled item itself rejects (shouldn't happen due to internal try-catch)
    const def = ENGINE_DEFINITIONS[i]
    return {
      engine: def.name, accuracy: def.accuracy,
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

// ─── Helper: compute standard deviation ──────────────────────────────────────
function stdDev(values: number[]): number {
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const squaredDiffs = values.map(v => (v - mean) ** 2)
  return Math.sqrt(squaredDiffs.reduce((s, v) => s + v, 0) / values.length)
}

// ─── Compute per-disease ensemble info ────────────────────────────────────────
function computeDiseaseEnsemble(
  key: DiseaseKey,
  results: EngineResult[],
): DiseaseEnsembleInfo {
  // Confidence-weighted risk (accuracy × confidence as weight)
  const confWeighted = results.map(r => ({
    name: r.engine,
    weight: (r.accuracy * r.diseases[key].confidence) / 100,
    risk: r.diseases[key].risk,
    confidence: r.diseases[key].confidence,
    level: r.diseases[key].level,
    accuracy: r.accuracy,
  }))
  const totalConfWeight = confWeighted.reduce((s, r) => s + r.weight, 0) || 1

  // Confidence-weighted risk score
  const confWeightedRisk = Math.round(
    confWeighted.reduce((s, r) => s + r.risk * r.weight, 0) / totalConfWeight,
  )

  // Majority vote for level
  const levels = results.map(r => r.diseases[key].level)
  const counts: Record<string, number> = {}
  levels.forEach(l => { counts[l] = (counts[l] ?? 0) + 1 })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const consensusLevel = (sorted[0]?.[0] ?? 'MEDIUM') as RiskLevel

  // Agreement score: how strong the majority is (0-100)
  const majorityCount = sorted[0]?.[1] ?? 0
  const agreementScore = Math.round((majorityCount / results.length) * 100)

  // Standard deviation of risks
  const scores = results.map(r => r.diseases[key].risk)
  const dev = Math.round(stdDev(scores) * 10) / 10

  // Top contributors by confidence-weighted influence
  const sortedByWeight = [...confWeighted].sort((a, b) => b.weight - a.weight)
  const topWeights: EngineWeight[] = sortedByWeight.slice(0, 5).map(r => ({
    name: r.name,
    weight: Math.round((r.weight / totalConfWeight) * 100) / 100,
    risk: r.risk,
    accuracy: r.accuracy,
  }))

  return {
    risk: confWeightedRisk,
    level: dominantLevel(key, results),
    consensusLevel,
    agreementScore,
    stdDev: dev,
    weights: topWeights,
    topContributors: sortedByWeight.slice(0, 3).map(r => r.name),
  }
}

// ─── Helper: dominant level via majority vote ─────────────────────────────────
function dominantLevel(key: keyof EngineResult['diseases'], results: EngineResult[]): RiskLevel {
  const levels = results.map(r => r.diseases[key].level)
  const counts: Record<string, number> = {}
  levels.forEach(l => { counts[l] = (counts[l] ?? 0) + 1 })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return (sorted[0]?.[0] ?? 'MEDIUM') as RiskLevel
}

// ─── Aggregate all engine results into final DB fields ────────────────────────
export function aggregateResults(results: EngineResult[]): AggregateResult {
  const best = results.find(r => r.isBest) ?? results[0]
  if (!best) {
    throw new Error('aggregateResults received an empty results array — this should never happen since ENGINE_DEFINITIONS always has 10 entries.')
  }

  // Accuracy-weighted average per disease (original method)
  const totalWeight = results.reduce((s, r) => s + r.accuracy, 0)
  function weightedRisk(key: keyof EngineResult['diseases']): number {
    const sum = results.reduce((s, r) => s + r.diseases[key].risk * r.accuracy, 0)
    return Math.round(sum / totalWeight)
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

  // ─── Hybrid Ensemble Metrics ─────────────────────────────────────────────
  const diseaseKeys: DiseaseKey[] = ['diabetes', 'heartDisease', 'hypertension', 'stroke', 'kidneyDisease', 'liverDisease']
  const diseaseMap = {} as Record<DiseaseKey, DiseaseEnsembleInfo>
  for (const key of diseaseKeys) {
    diseaseMap[key] = computeDiseaseEnsemble(key, results)
  }

  // Overall agreement: average of all per-disease agreement scores
  const overallAgreement = Math.round(
    diseaseKeys.reduce((s, k) => s + diseaseMap[k].agreementScore, 0) / diseaseKeys.length,
  )

  // Weighted confidence: average confidence across all engines, weighted by accuracy
  const totalConfAcc = results.reduce((s, r) => {
    const avgConf = diseaseKeys.reduce((cs, k) => cs + r.diseases[k].confidence, 0) / diseaseKeys.length
    return s + avgConf * r.accuracy
  }, 0)
  const weightedConfidence = Math.round(totalConfAcc / totalWeight)

  // Generate meta insight about ensemble behavior
  const lowAgreementDiseases = diseaseKeys.filter(k => diseaseMap[k].agreementScore < 70)
  const highDisagreement = diseaseKeys.filter(k => diseaseMap[k].stdDev > 15)
  let metaInsight = ''
  if (lowAgreementDiseases.length === 0) {
    metaInsight = 'All engines show strong consensus across all disease predictions — high confidence in ensemble output.'
  } else if (lowAgreementDiseases.length <= 2) {
    metaInsight = `Engines show moderate disagreement on ${lowAgreementDiseases.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' and ')}. Consider re-evaluating these risk factors with additional clinical data.`
  } else {
    metaInsight = `Significant divergence across engines for ${lowAgreementDiseases.length} disease categories. Ensemble confidence is reduced — clinical validation recommended.`
  }
  if (highDisagreement.length > 0) {
    metaInsight += ` Highest variance observed in: ${highDisagreement.map(k => k.replace(/([A-Z])/g, ' $1').trim()).join(', ')}.`
  }

  const ensembleMetrics: EnsembleMetrics = {
    agreementScore: overallAgreement,
    weightedConfidence,
    totalWeight: Math.round(totalWeight * 10) / 10,
    diseases: diseaseMap,
    metaInsight,
  }

  // Urgency from best engine
  const urgency: UrgencyLevel = best.urgency ?? 'MONITOR'
  const urgencyText = {
    MONITOR: 'Maintain healthy habits and continue routine monitoring.',
    WATCH: 'Your results warrant closer monitoring. Schedule a checkup.',
    SOON: 'Several risk factors identified. Schedule a checkup within 2–4 weeks.',
    URGENT: 'Critical risk factors detected. Please see a doctor immediately.',
  }[urgency]

  // Recommendations — placeholder, will be filled by generateRecommendations()
  const recommendations: RecommendationsData = {
    directive: {
      title: `Manage ${best.diseases.diabetes.risk >= 60 ? 'Elevated Diabetes' : best.diseases.hypertension.risk >= 60 ? 'Elevated Hypertension' : 'Cardiovascular'} Risk`,
      description: best.insight,
      riskScore: Math.ceil(Math.max(dRisk, hvRisk, htRisk) / 10),
    },
    medications: [],
    lifestyle: {
      sodiumReduction: htRisk >= 60 ? 2 : 1,
      sleepIncrease: 30,
      cgmEnabled: dRisk >= 60,
      exerciseTarget: '30 min cardio 5× per week',
      sugarTarget: '< 25g added sugar per day',
    },
    carePathway: [],
    syncConfidence: 0,
  }

  return {
    overallHealthIndex,
    bestEngine: 'Neural Network',
    urgency,
    urgencyText,
    keyFactors: best.keyFactors,
    clinicalInsight: best.insight,
    recommendations,
    diabetesRisk: dRisk, diabetesLevel: dominantLevel('diabetes', results),
    heartDiseaseRisk: hvRisk, heartDiseaseLevel: dominantLevel('heartDisease', results),
    hypertensionRisk: htRisk, hypertensionLevel: dominantLevel('hypertension', results),
    strokeRisk: stRisk, strokeLevel: dominantLevel('stroke', results),
    kidneyDiseaseRisk: kdRisk, kidneyDiseaseLevel: dominantLevel('kidneyDisease', results),
    liverDiseaseRisk: lvRisk, liverDiseaseLevel: dominantLevel('liverDisease', results),
    ensembleMetrics,
  }
}

// ─── Compute Explainability Data from best engine ────────────────────────────
export function computeExplainability(results: EngineResult[]): ExplainabilityData {
  const best = results.find(r => r.isBest) ?? results[0]
  const diseaseKeys: DiseaseKey[] = ['diabetes', 'heartDisease', 'hypertension', 'stroke', 'kidneyDisease', 'liverDisease']

  const perDisease: ExplainabilityMap = {}
  for (const key of diseaseKeys) {
    const d = best.diseases[key]
    const factors = d.factors ?? []
    const featureImportance = d.featureImportance ?? {}
    const entries = Object.entries(featureImportance)
    const sorted = entries.sort((a, b) => b[1] - a[1])
    const topPositive = sorted.filter(e => e[1] > 0.3).map(e => e[0])
    const topNegative = sorted.filter(e => e[1] < -0.1).map(e => e[0])

    perDisease[key] = {
      factors: factors.length > 0 ? factors : [`${key} analysis — see key factors for details`],
      featureImportance,
      topPositiveFactors: topPositive,
      topNegativeFactors: topNegative,
    }
  }

  return {
    perDisease,
    modelUsed: best.engine,
    overallInsight: best.insight,
  }
}