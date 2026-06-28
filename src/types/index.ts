
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
  factors?:            string[]          // per-disease explainable factors (XAI)
  featureImportance?:  Record<string, number> // per-disease feature importance (XAI)
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
  // ── Hybrid Ensemble Metrics ──────────────────────────────────────────────
  ensembleMetrics: EnsembleMetrics
}

// ─── Disease key (shared across multiple features) ───────────────────────────
export type DiseaseKey = 'diabetes' | 'heartDisease' | 'hypertension' | 'stroke' | 'kidneyDisease' | 'liverDisease'

// ─── Explainable AI — per-disease attribution ─────────────────────────────────
export interface DiseaseExplainability {
  factors:            string[]              // e.g. ["HbA1c 7.2% exceeds threshold", "BMI 31.2"]
  featureImportance:  Record<string, number> // e.g. { "hba1c": 0.35, "bmi": 0.25 }
  topPositiveFactors: string[]              // factors that increased risk
  topNegativeFactors: string[]              // factors that decreased risk
}

export type ExplainabilityMap = Partial<Record<DiseaseKey, DiseaseExplainability>>

export interface ExplainabilityData {
  perDisease:      ExplainabilityMap
  modelUsed:       string
  overallInsight:  string
}

// ─── Hybrid Ensemble metrics (per-assessment) ─────────────────────────────────
export interface DiseaseEnsembleInfo {
  risk:               number
  level:              RiskLevel
  consensusLevel:     RiskLevel          // majority vote across engines
  agreementScore:     number             // 0-100, how well engines agree
  stdDev:             number             // standard deviation of risk scores
  weights:            EngineWeight[]      // top contributing engines
  topContributors:    string[]           // top 3 engine names
}

export interface EngineWeight {
  name:     string
  weight:   number // 0-1
  risk:     number
  accuracy: number
}

export interface EnsembleMetrics {
  agreementScore:     number                // overall ensemble agreement 0-100
  weightedConfidence: number                // confidence-weighted score
  totalWeight:        number                // sum of all engine weights
  diseases:           Record<DiseaseKey, DiseaseEnsembleInfo>
  metaInsight:        string                // AI insight about ensemble behavior
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
  ensembleMetrics:    EnsembleMetrics | null
  explainability:     ExplainabilityData | null
  riskDelta:          RiskDelta | null
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

// ─── Dynamic Health Timeline ──────────────────────────────────────────────────
export interface TimelinePredictionPoint {
  date:               string // ISO date string
  overallHealthIndex: number
  diabetesRisk:       number
  heartDiseaseRisk:   number
  hypertensionRisk:   number
  strokeRisk:         number
  kidneyDiseaseRisk:  number
  liverDiseaseRisk:   number
}

export interface TimelinePredictionData {
  baseAssessmentId:    string
  predictedScores:     TimelinePredictionPoint[]
  confidenceInterval?: {
    upper: TimelinePredictionPoint[]
    lower: TimelinePredictionPoint[]
  }
  modelVersion:        string
  insight:             string // AI-generated narrative about the projected trajectory
  projectionMonths:    number
}

export interface AssessmentHistoryPoint {
  date:               string
  overallHealthIndex: number | null
  diabetesRisk:       number | null
  heartDiseaseRisk:   number | null
  hypertensionRisk:   number | null
  strokeRisk:         number | null
  kidneyDiseaseRisk:  number | null
  liverDiseaseRisk:   number | null
}

// ─── Preventive Health Coach ──────────────────────────────────────────────────
export type GoalCategory = 'medication' | 'lifestyle' | 'exercise' | 'diet' | 'monitoring'
export type GoalStatus = 'active' | 'completed' | 'missed' | 'dismissed'

export interface AdherenceEntry {
  date:  string
  value: string
  note?: string
}

export interface HealthGoalData {
  id:            string
  userId:        string
  assessmentId:  string
  category:      GoalCategory
  title:         string
  description:   string
  targetValue:   string | null
  currentValue:  string | null
  unit:          string | null
  startDate:     string
  targetDate:    string | null
  completedAt:   string | null
  status:        GoalStatus
  adherenceLog:  AdherenceEntry[]
  createdAt:     string
  updatedAt:     string
}

export interface CoachInteractionData {
  id:        string
  userId:    string
  type:      string
  content:   string
  metadata:  Record<string, unknown> | null
  createdAt: string
}

export interface CoachProgressData {
  totalGoals:          number
  completedGoals:      number
  activeGoals:         number
  missedGoals:         number
  adherenceRate:       number // percentage
  streakDays:          number
  currentHealthIndex:  number | null
  previousHealthIndex: number | null
  healthDelta:         number | null
  biomarkerChanges:    Array<{
    label: string
    current: number | null
    previous: number | null
    delta: number | null
    unit: string
    isImproving: boolean
  }>
}

export interface CoachMessage {
  id:        string
  type:      string
  content:   string
  createdAt: string
}

// ─── Adaptive Risk Monitoring ─────────────────────────────────────────────────
export type TrendDirection = 'improving' | 'stable' | 'worsening'

export interface RiskDelta {
  diabetes:      { current: number; previous: number; delta: number; trend: TrendDirection }
  heartDisease:  { current: number; previous: number; delta: number; trend: TrendDirection }
  hypertension:  { current: number; previous: number; delta: number; trend: TrendDirection }
  stroke:        { current: number; previous: number; delta: number; trend: TrendDirection }
  kidneyDisease: { current: number; previous: number; delta: number; trend: TrendDirection }
  liverDisease:  { current: number; previous: number; delta: number; trend: TrendDirection }
}

// ─── API response wrapper ─────────────────────────────────────────────────────
export type ApiResponse<T> = {
  success: boolean
  data?:   T
  error?:  string
}