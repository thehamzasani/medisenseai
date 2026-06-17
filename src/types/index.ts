
// ─── Enums ────────────────────────────────────────────────────────────────────
export type RiskLevel      = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type UrgencyLevel   = 'MONITOR' | 'WATCH' | 'SOON' | 'URGENT'
export type AnalysisStatus = 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED'

// ─── Lifestyle enums ──────────────────────────────────────────────────────────
export type ExerciseFrequency = 'none' | '1-2x' | '3-4x' | '5+x'
export type StressLevel       = 'low' | 'moderate' | 'high' | 'very_high'
export type SugarIntake       = 'low' | 'moderate' | 'high'

// ─── Disease risk ─────────────────────────────────────────────────────────────
export interface DiseaseRisk {
  risk:       number   // 0-100
  level:      RiskLevel
  confidence: number   // 0-100
}

// ─── Engine result (one per engine, stored as JSON array) ─────────────────────
export interface EngineResult {
  engine:            string
  accuracy:          number
  modelVersion:      string
  inferenceMs:       number
  isBest:            boolean
  diseases: {
    diabetes:      DiseaseRisk
    heartDisease:  DiseaseRisk
    hypertension:  DiseaseRisk
    stroke:        DiseaseRisk
    kidneyDisease: DiseaseRisk
    liverDisease:  DiseaseRisk
  }
  keyFactors:        string[]
  recommendations:   string[]
  insight:           string
  urgency:           UrgencyLevel
  falsePositiveRate: number
  reliabilityStars:  number
  status:            'stable' | 'deprecated'
}

// ─── Aggregation result (returned by aggregateResults()) ──────────────────────
export interface AggregateResult {
  overallHealthIndex: number
  bestEngine:         string
  urgency:            UrgencyLevel
  urgencyText:        string
  keyFactors:         string[]
  clinicalInsight:    string
  recommendations:    RecommendationsData
  diabetesRisk:       number
  diabetesLevel:      RiskLevel
  heartDiseaseRisk:   number
  heartDiseaseLevel:  RiskLevel
  hypertensionRisk:   number
  hypertensionLevel:  RiskLevel
  strokeRisk:         number
  strokeLevel:        RiskLevel
  kidneyDiseaseRisk:  number
  kidneyDiseaseLevel: RiskLevel
  liverDiseaseRisk:   number
  liverDiseaseLevel:  RiskLevel
}

// ─── Recommendations structure (stored as JSON in DB) ─────────────────────────
export interface RecommendationsData {
  directive: {
    title:       string
    description: string
    riskScore:   number   // 1-10
  }
  medications: Array<{
    name:   string
    dose:   string
    action: 'ADJUST' | 'MAINTAIN' | 'ADD'
  }>
  lifestyle: {
    sodiumReduction: number   // grams/day to reduce
    sleepIncrease:   number   // minutes to add
    cgmEnabled:      boolean
    exerciseTarget:  string
    sugarTarget:     string
  }
  carePathway: Array<{
    date:  string   // ISO date string
    type:  string
    notes: string
  }>
}

// ─── Assessment input (fields submitted by the user in the wizard) ─────────────
// NOTE: bloodType is intentionally NOT here — it lives on User, not per-assessment.
export interface AssessmentInput {
  // Personal
  age:    number
  gender: string
  weight: number
  height: number
  bmi:    number
  // Vitals
  systolicBP:      number
  diastolicBP:     number
  heartRate:       number
  oxygenSat:       number
  bodyTemperature: number
  respiratoryRate: number
  // Labs
  fastingGlucose: number
  hba1c:          number
  cholesterol:    number
  hdl:            number
  ldl:            number
  triglycerides:  number
  creatinine:     number | null
  egfr:           number | null
  altEnzyme:      number | null
  vitaminD:       number | null
  // Lifestyle
  isSmoker:          boolean
  alcoholUse:        boolean
  isSedentary:       boolean
  exerciseFrequency: ExerciseFrequency
  sleepHours:        number
  stressLevel:       StressLevel
  dailySugarIntake:  SugarIntake
  highSaltDiet:      boolean
  // Family history
  hasDiabetesFH:      boolean
  hasHeartDiseaseFH:  boolean
  hasHypertensionFH:  boolean
  hasStrokeFH:        boolean
  hasKidneyDiseaseFH: boolean
  hasCancerFH:        boolean
  // Symptoms
  symptoms: string[]
}

// ─── Full assessment with results (returned by API) ───────────────────────────
export interface AssessmentWithResults extends AssessmentInput {
  id:             string
  userId:         string
  createdAt:      string
  label:          string | null
  // AI results
  engineResults:      EngineResult[] | null
  bestEngine:         string | null
  overallHealthIndex: number | null
  diabetesRisk:       number | null
  diabetesLevel:      RiskLevel | null
  heartDiseaseRisk:   number | null
  heartDiseaseLevel:  RiskLevel | null
  hypertensionRisk:   number | null
  hypertensionLevel:  RiskLevel | null
  strokeRisk:         number | null
  strokeLevel:        RiskLevel | null
  kidneyDiseaseRisk:  number | null
  kidneyDiseaseLevel: RiskLevel | null
  liverDiseaseRisk:   number | null
  liverDiseaseLevel:  RiskLevel | null
  urgency:            UrgencyLevel | null
  urgencyText:        string | null
  keyFactors:         string[]
  recommendations:    RecommendationsData | null
  clinicalInsight:    string | null
  analysisStatus:     AnalysisStatus
  analysisError:      string | null
}

// ─── Lightweight list item (for selectors and tables) ─────────────────────────
export interface AssessmentListItem {
  id:                 string
  createdAt:          string
  label:              string | null
  overallHealthIndex: number | null
  analysisStatus:     AnalysisStatus
  diabetesLevel:      RiskLevel | null
  heartDiseaseLevel:  RiskLevel | null
  hypertensionLevel:  RiskLevel | null
}

// ─── User profile (for Profile page + PatientSummaryCard) ─────────────────────
export interface UserProfile {
  id:          string
  name:        string
  email:       string
  image:       string | null
  dateOfBirth: string | null
  gender:      string | null
  bloodType:   string | null
  createdAt:   string
  assessmentCount: number
}

// ─── API response wrapper ─────────────────────────────────────────────────────
export type ApiResponse<T> = {
  success: boolean
  data?:   T
  error?:  string
}