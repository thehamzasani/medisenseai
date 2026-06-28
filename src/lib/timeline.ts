import { GoogleGenAI, Type } from '@google/genai'
import type { AssessmentHistoryPoint, TimelinePredictionData, TimelinePredictionPoint } from '@/types'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const TIMELINE_POINT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    date: { type: Type.STRING },
    overallHealthIndex: { type: Type.NUMBER },
    diabetesRisk: { type: Type.NUMBER },
    heartDiseaseRisk: { type: Type.NUMBER },
    hypertensionRisk: { type: Type.NUMBER },
    strokeRisk: { type: Type.NUMBER },
    kidneyDiseaseRisk: { type: Type.NUMBER },
    liverDiseaseRisk: { type: Type.NUMBER },
  },
  required: ['date', 'overallHealthIndex', 'diabetesRisk', 'heartDiseaseRisk', 'hypertensionRisk', 'strokeRisk', 'kidneyDiseaseRisk', 'liverDiseaseRisk'],
}

const TIMELINE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    predictedScores: {
      type: Type.ARRAY,
      items: TIMELINE_POINT_SCHEMA,
    },
    confidenceInterval: {
      type: Type.OBJECT,
      properties: {
        upper: { type: Type.ARRAY, items: TIMELINE_POINT_SCHEMA },
        lower: { type: Type.ARRAY, items: TIMELINE_POINT_SCHEMA },
      },
      required: ['upper', 'lower'],
    },
    insight: { type: Type.STRING },
  },
  required: ['predictedScores', 'confidenceInterval', 'insight'],
}

export function buildTimelinePrompt(
  history: AssessmentHistoryPoint[],
  projectionMonths: number,
): string {
  const rows = history
    .map(h => `Date: ${h.date} | Overall: ${h.overallHealthIndex ?? 'N/A'} | Diabetes: ${h.diabetesRisk ?? 'N/A'}% | Heart: ${h.heartDiseaseRisk ?? 'N/A'}% | Hypertension: ${h.hypertensionRisk ?? 'N/A'}% | Stroke: ${h.strokeRisk ?? 'N/A'}% | Kidney: ${h.kidneyDiseaseRisk ?? 'N/A'}% | Liver: ${h.liverDiseaseRisk ?? 'N/A'}%`)
    .join('\n')

  return `
PATIENT HEALTH HISTORY (${history.length} assessment(s) in chronological order):

${rows}

TASK: Analyze the historical trends in this patient's health data and predict their health trajectory for the next ${projectionMonths} months.

For each future month, predict:
- overallHealthIndex (0-100, higher = healthier)
- Risk scores for 6 diseases (0-100 each): diabetes, heartDisease, hypertension, stroke, kidneyDisease, liverDisease

Consider:
1. Linear and non-linear trends in each risk factor
2. Whether the patient is improving, stable, or declining
3. The momentum of recent assessments (last 2 carry more weight)
4. Realistic clinical progression patterns
5. Provide confidence intervals (upper and lower bounds) that widen with time to reflect growing uncertainty

Return exactly ${projectionMonths} prediction points, one per month starting 1 month from the latest assessment date.

Also provide a brief clinical insight summarizing the projected trajectory.
`.trim()
}

export async function predictTimeline(
  history: AssessmentHistoryPoint[],
  baseAssessmentId: string,
  projectionMonths: number = 6,
): Promise<TimelinePredictionData> {
  const userPrompt = buildTimelinePrompt(history, projectionMonths)

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Gemini timeline request timed out after 30s')), 30_000)
  })

  try {
    const requestPromise = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: 'You are MediSense Neural Network v5.0 — a predictive health forecasting AI. Analyze longitudinal patient data to project future health trajectories with confidence intervals. Return ONLY valid JSON matching the specified schema.',
        responseMimeType: 'application/json',
        responseSchema: TIMELINE_RESPONSE_SCHEMA,
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    })

    const response = await Promise.race([requestPromise, timeoutPromise])
    const raw = response.text?.trim() ?? '{}'

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error(`No JSON found in Gemini response: ${raw}`)
    const parsed = JSON.parse(jsonMatch[0])

    const now = new Date()
    const predictedScores: TimelinePredictionPoint[] = parsed.predictedScores.map(
      (p: TimelinePredictionPoint, i: number) => {
        const d = new Date(now)
        d.setMonth(d.getMonth() + i + 1)
        return {
          date: p.date || d.toISOString(),
          overallHealthIndex: clamp(p.overallHealthIndex, 0, 100),
          diabetesRisk: clamp(p.diabetesRisk, 0, 100),
          heartDiseaseRisk: clamp(p.heartDiseaseRisk, 0, 100),
          hypertensionRisk: clamp(p.hypertensionRisk, 0, 100),
          strokeRisk: clamp(p.strokeRisk, 0, 100),
          kidneyDiseaseRisk: clamp(p.kidneyDiseaseRisk, 0, 100),
          liverDiseaseRisk: clamp(p.liverDiseaseRisk, 0, 100),
        }
      },
    )

    const upperScores = (parsed.confidenceInterval?.upper ?? []).map((p: TimelinePredictionPoint, i: number) => ({
      date: predictedScores[i]?.date ?? p.date,
      overallHealthIndex: clamp(p.overallHealthIndex, 0, 100),
      diabetesRisk: clamp(p.diabetesRisk, 0, 100),
      heartDiseaseRisk: clamp(p.heartDiseaseRisk, 0, 100),
      hypertensionRisk: clamp(p.hypertensionRisk, 0, 100),
      strokeRisk: clamp(p.strokeRisk, 0, 100),
      kidneyDiseaseRisk: clamp(p.kidneyDiseaseRisk, 0, 100),
      liverDiseaseRisk: clamp(p.liverDiseaseRisk, 0, 100),
    }))

    const lowerScores = (parsed.confidenceInterval?.lower ?? []).map((p: TimelinePredictionPoint, i: number) => ({
      date: predictedScores[i]?.date ?? p.date,
      overallHealthIndex: clamp(p.overallHealthIndex, 0, 100),
      diabetesRisk: clamp(p.diabetesRisk, 0, 100),
      heartDiseaseRisk: clamp(p.heartDiseaseRisk, 0, 100),
      hypertensionRisk: clamp(p.hypertensionRisk, 0, 100),
      strokeRisk: clamp(p.strokeRisk, 0, 100),
      kidneyDiseaseRisk: clamp(p.kidneyDiseaseRisk, 0, 100),
      liverDiseaseRisk: clamp(p.liverDiseaseRisk, 0, 100),
    }))

    return {
      baseAssessmentId,
      predictedScores,
      confidenceInterval: { upper: upperScores, lower: lowerScores },
      modelVersion: `${GEMINI_MODEL}-timeline-v1`,
      insight: parsed.insight ?? 'Health trajectory analysis completed.',
      projectionMonths,
    }
  } catch (error) {
    console.error('[timeline] Gemini prediction failed:', error)
    // Fallback: generate synthetic conservative predictions based on last known values
    const last = history[history.length - 1]
    const baseIndex = last?.overallHealthIndex ?? 70
    const predictedScores: TimelinePredictionPoint[] = Array.from({ length: projectionMonths }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() + i + 1)
      const drift = (i + 1) * 1.5
      return {
        date: d.toISOString(),
        overallHealthIndex: clamp(baseIndex - drift, 0, 100),
        diabetesRisk: clamp((last?.diabetesRisk ?? 30) + drift, 0, 100),
        heartDiseaseRisk: clamp((last?.heartDiseaseRisk ?? 30) + drift, 0, 100),
        hypertensionRisk: clamp((last?.hypertensionRisk ?? 30) + drift, 0, 100),
        strokeRisk: clamp((last?.strokeRisk ?? 20) + drift * 0.8, 0, 100),
        kidneyDiseaseRisk: clamp((last?.kidneyDiseaseRisk ?? 20) + drift * 0.8, 0, 100),
        liverDiseaseRisk: clamp((last?.liverDiseaseRisk ?? 20) + drift * 0.8, 0, 100),
      }
    })

    const widen = (p: TimelinePredictionPoint, mult: number): TimelinePredictionPoint => ({
      ...p,
      overallHealthIndex: clamp(p.overallHealthIndex + 5 * mult, 0, 100),
      diabetesRisk: clamp(p.diabetesRisk + 3 * mult, 0, 100),
      heartDiseaseRisk: clamp(p.heartDiseaseRisk + 3 * mult, 0, 100),
      hypertensionRisk: clamp(p.hypertensionRisk + 3 * mult, 0, 100),
      strokeRisk: clamp(p.strokeRisk + 2 * mult, 0, 100),
      kidneyDiseaseRisk: clamp(p.kidneyDiseaseRisk + 2 * mult, 0, 100),
      liverDiseaseRisk: clamp(p.liverDiseaseRisk + 2 * mult, 0, 100),
    })

    return {
      baseAssessmentId,
      predictedScores,
      confidenceInterval: {
        upper: predictedScores.map((p, i) => widen(p, i + 1)),
        lower: predictedScores.map((p, i) => widen(p, -(i + 1))),
      },
      modelVersion: `${GEMINI_MODEL}-timeline-v1-fallback`,
      insight: 'Prediction engine encountered an error. Results shown are conservative estimates based on latest assessment data. Re-run for AI-powered projections.',
      projectionMonths,
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
