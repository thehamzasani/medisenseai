'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ENGINE_DEFINITIONS } from '@/constants'
import type { ApiResponse, AssessmentWithResults } from '@/types'
import PersonalInfoStep from './steps/PersonalInfoStep'
import VitalSignsStep from './steps/VitalSignsStep'
import LabResultsStep from './steps/LabResultsStep'
import LifestyleStep from './steps/LifestyleStep'
import FamilyHistoryStep from './steps/FamilyHistoryStep'
import SymptomsStep from './steps/SymptomsStep'

// ─── Zod schema (mirrors src/app/api/assessment/route.ts assessmentSchema) ────
// NOTE: bloodType is intentionally NOT part of this schema — it lives on the
// User model and is edited only on the Profile page.
const assessmentSchema = z.object({
  age: z.number().int().min(1).max(120),
  gender: z.enum(['Male', 'Female', 'Other']),
  weight: z.number().min(10).max(500),
  height: z.number().min(50).max(300),
  bmi: z.number().min(5).max(100),

  systolicBP: z.number().int().min(60).max(250),
  diastolicBP: z.number().int().min(30).max(160),
  heartRate: z.number().int().min(30).max(220),
  oxygenSat: z.number().min(70).max(100),
  bodyTemperature: z.number().min(34).max(42),
  respiratoryRate: z.number().int().min(8).max(60),

  fastingGlucose: z.number().min(30).max(600),
  hba1c: z.number().min(2).max(20),
  cholesterol: z.number().min(50).max(600),
  hdl: z.number().min(10).max(200),
  ldl: z.number().min(10).max(500),
  triglycerides: z.number().min(20).max(2000),
  creatinine: z.number().min(0.1).max(20).nullable().optional(),
  egfr: z.number().min(1).max(200).nullable().optional(),
  altEnzyme: z.number().min(1).max(2000).nullable().optional(),
  vitaminD: z.number().min(1).max(200).nullable().optional(),

  isSmoker: z.boolean(),
  alcoholUse: z.boolean(),
  isSedentary: z.boolean(),
  exerciseFrequency: z.enum(['none', '1-2x', '3-4x', '5+x']),
  sleepHours: z.number().min(0).max(24),
  stressLevel: z.enum(['low', 'moderate', 'high', 'very_high']),
  dailySugarIntake: z.enum(['low', 'moderate', 'high']),
  highSaltDiet: z.boolean(),

  hasDiabetesFH: z.boolean(),
  hasHeartDiseaseFH: z.boolean(),
  hasHypertensionFH: z.boolean(),
  hasStrokeFH: z.boolean(),
  hasKidneyDiseaseFH: z.boolean(),
  hasCancerFH: z.boolean(),

  symptoms: z.array(z.string()).default([]),
  label: z.string().max(100).optional(),
})

export type AssessmentFormData = z.infer<typeof assessmentSchema>

const DEFAULT_VALUES: AssessmentFormData = {
  age: 0,
  gender: 'Male',
  weight: 0,
  height: 0,
  bmi: 0,
  systolicBP: 120,
  diastolicBP: 80,
  heartRate: 72,
  oxygenSat: 98,
  bodyTemperature: 36.8,
  respiratoryRate: 16,
  fastingGlucose: 90,
  hba1c: 5.4,
  cholesterol: 180,
  hdl: 55,
  ldl: 100,
  triglycerides: 120,
  creatinine: null,
  egfr: null,
  altEnzyme: null,
  vitaminD: null,
  isSmoker: false,
  alcoholUse: false,
  isSedentary: false,
  exerciseFrequency: 'none',
  sleepHours: 7,
  stressLevel: 'low',
  dailySugarIntake: 'low',
  highSaltDiet: false,
  hasDiabetesFH: false,
  hasHeartDiseaseFH: false,
  hasHypertensionFH: false,
  hasStrokeFH: false,
  hasKidneyDiseaseFH: false,
  hasCancerFH: false,
  symptoms: [],
}

interface StepConfig {
  id: number
  title: string
  icon: string
  fields: (keyof AssessmentFormData)[]
  component: React.ComponentType
}

const STEPS: StepConfig[] = [
  { id: 1, title: 'Personal Info', icon: 'person', fields: ['age', 'gender', 'weight', 'height', 'bmi'], component: PersonalInfoStep },
  { id: 2, title: 'Vital Signs', icon: 'monitor_heart', fields: ['systolicBP', 'diastolicBP', 'heartRate', 'oxygenSat', 'bodyTemperature', 'respiratoryRate'], component: VitalSignsStep },
  { id: 3, title: 'Lab Results', icon: 'biotech', fields: ['fastingGlucose', 'hba1c', 'cholesterol', 'hdl', 'ldl', 'triglycerides', 'creatinine', 'egfr', 'altEnzyme', 'vitaminD'], component: LabResultsStep },
  { id: 4, title: 'Lifestyle', icon: 'self_improvement', fields: ['isSmoker', 'alcoholUse', 'isSedentary', 'exerciseFrequency', 'sleepHours', 'stressLevel', 'dailySugarIntake', 'highSaltDiet'], component: LifestyleStep },
  { id: 5, title: 'Family History', icon: 'family_restroom', fields: ['hasDiabetesFH', 'hasHeartDiseaseFH', 'hasHypertensionFH', 'hasStrokeFH', 'hasKidneyDiseaseFH', 'hasCancerFH'], component: FamilyHistoryStep },
  { id: 6, title: 'Symptoms', icon: 'sick', fields: ['symptoms'], component: SymptomsStep },
]

type AnalysisPhase = 'idle' | 'submitting' | 'analyzing' | 'error'

export default function AssessmentWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [phase, setPhase] = useState<AnalysisPhase>('idle')
  const [enginesComplete, setEnginesComplete] = useState(0)
  const [visibleEngines, setVisibleEngines] = useState(0)

  const methods = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  const { trigger, handleSubmit } = methods

  const activeStepConfig = STEPS.find((s) => s.id === currentStep)!
  const StepComponent = activeStepConfig.component

  async function goNext() {
    const valid = await trigger(activeStepConfig.fields)
    if (!valid) {
      toast.error('Please correct the highlighted fields before continuing.')
      return
    }
    setCompletedSteps((prev) => new Set(prev).add(currentStep))
    if (currentStep < STEPS.length) setCurrentStep((s) => s + 1)
  }

  function goToStep(stepId: number) {
    if (stepId === currentStep) return
    if (stepId < currentStep || completedSteps.has(stepId - 1) || stepId === 1) {
      setCurrentStep(stepId)
    }
  }

  function goBack() {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  const onSubmit = useCallback(
    async (data: AssessmentFormData) => {
      setPhase('submitting')
      try {
        const createRes = await fetch('/api/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const createJson = (await createRes.json()) as ApiResponse<{ id: string }>
        if (!createRes.ok || !createJson.success || !createJson.data) {
          throw new Error(createJson.error ?? 'Failed to create assessment')
        }
        const assessmentId = createJson.data.id

        setPhase('analyzing')

        // Stagger the engine names appearing in the loading overlay
        ENGINE_DEFINITIONS.forEach((_, i) => {
          setTimeout(() => setVisibleEngines((v) => Math.max(v, i + 1)), i * 350)
        })

        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assessmentId }),
        })
        const analyzeJson = (await analyzeRes.json()) as ApiResponse<{
          assessmentId: string
          status: 'COMPLETE'
        }>
        if (!analyzeRes.ok || !analyzeJson.success) {
          throw new Error(analyzeJson.error ?? 'Analysis failed to start')
        }

        // Poll every 2s until analysis completes
        const poll = async (): Promise<void> => {
          const res = await fetch(`/api/assessment/${assessmentId}`)
          const json = (await res.json()) as ApiResponse<AssessmentWithResults>
          if (!res.ok || !json.success || !json.data) {
            throw new Error(json.error ?? 'Failed to fetch assessment status')
          }

          setEnginesComplete(json.data.engineResults?.length ?? 0)

          if (json.data.analysisStatus === 'COMPLETE') {
            router.push(`/results/${assessmentId}`)
            return
          }
          if (json.data.analysisStatus === 'FAILED') {
            throw new Error(json.data.analysisError ?? 'Analysis failed')
          }
          await new Promise((r) => setTimeout(r, 2000))
          return poll()
        }

        await poll()
      } catch (err) {
        setPhase('error')
        toast.error(err instanceof Error ? err.message : 'Something went wrong')
      }
    },
    [router]
  )

  const isLastStep = currentStep === STEPS.length
  const isAnalyzing = phase === 'submitting' || phase === 'analyzing'

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-lg">
        {/* Left tab nav */}
        <div className="col-span-3">
          <div className="surface-glass rounded-xl p-md space-y-2 sticky top-20">
            {STEPS.map((step) => {
              const isActive = step.id === currentStep
              const isCompleted = completedSteps.has(step.id) && !isActive
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStep(step.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all text-label-md',
                    isActive && 'btn-cyan',
                    isCompleted && 'bg-white/5 border border-primary/20 text-primary',
                    !isActive && !isCompleted && 'surface-glass text-on-surface-variant'
                  )}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isCompleted ? 'check_circle' : step.icon}
                  </span>
                  <span className="font-medium">{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right content */}
        <div className="col-span-9 space-y-lg">
          <div className="surface-glass rounded-xl p-xl">
            <StepComponent />
          </div>

          <div className="flex items-center justify-between gap-md">
            <button
              type="button"
              onClick={goBack}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-full surface-glass text-on-surface-variant disabled:opacity-30 transition-all"
            >
              Back
            </button>

            {!isLastStep ? (
              <button type="button" onClick={goNext} className="btn-cyan px-8 py-3 rounded-full">
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isAnalyzing}
                className="group relative flex-1 btn-cyan py-4 rounded-full flex items-center justify-center gap-2 overflow-hidden disabled:opacity-60"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <span className="material-symbols-outlined relative z-10">rocket_launch</span>
                <span className="relative z-10 font-bold">Run AI Analysis Across 10 Engines</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-lg">
          <div className="surface-glass rounded-2xl p-xl max-w-lg w-full text-center space-y-lg">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-primary-fixed-dim/40 animate-spin-slow flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary-fixed-dim">memory</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">
                Running 10 AI Engines in Parallel...
              </h3>
              <p className="text-body-md text-on-surface-variant mt-1">
                {enginesComplete}/10 engines complete...
              </p>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {ENGINE_DEFINITIONS.slice(0, visibleEngines).map((engine, i) => (
                <div
                  key={engine.name}
                  className="flex items-center gap-3 text-label-md text-on-surface-variant animate-in fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="material-symbols-outlined text-base text-primary-fixed-dim">
                    {i < enginesComplete ? 'check_circle' : 'progress_activity'}
                  </span>
                  <span>{engine.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </FormProvider>
  )
}