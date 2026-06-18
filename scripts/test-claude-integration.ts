import 'dotenv/config'
import { runSingleEngine, ENGINE_PERSONAS, buildPatientDataPrompt } from '../src/lib/claude'
import { ENGINE_DEFINITIONS } from '../src/constants'
import type { AssessmentInput } from '../src/types'

const samplePatient: AssessmentInput = {
  age: 42, gender: 'Male', weight: 85, height: 178, bmi: 26.8,
  systolicBP: 128, diastolicBP: 84, heartRate: 76, oxygenSat: 97.5,
  bodyTemperature: 36.8, respiratoryRate: 16,
  fastingGlucose: 115, hba1c: 6.1, cholesterol: 210, hdl: 42, ldl: 130, triglycerides: 180,
  creatinine: null, egfr: null, altEnzyme: null, vitaminD: null,
  isSmoker: false, alcoholUse: false, isSedentary: true,
  exerciseFrequency: '1-2x', sleepHours: 6.5, stressLevel: 'moderate',
  dailySugarIntake: 'moderate', highSaltDiet: false,
  hasDiabetesFH: true, hasHeartDiseaseFH: false, hasHypertensionFH: false,
  hasStrokeFH: false, hasKidneyDiseaseFH: false, hasCancerFH: false,
  symptoms: ['fatigue'],
}

async function main() {
  const patientData = buildPatientDataPrompt(samplePatient)
  const def = ENGINE_DEFINITIONS.find(d => d.name === 'Neural Network')!

  console.log('Running Neural Network engine against sample patient...\n')
  const result = await runSingleEngine('Neural Network', ENGINE_PERSONAS['Neural Network'], patientData, def)

  console.log(JSON.stringify(result, null, 2))

  if (result.insight.includes('Engine encountered an error')) {
    console.error('\n❌ This is a FALLBACK result — the real Gemini call failed silently.')
    process.exit(1)
  }
  console.log('\n✅ Real engine result returned successfully.')
}

main()