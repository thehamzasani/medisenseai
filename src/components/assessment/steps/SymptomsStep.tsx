'use client'

import { useFormContext } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { SYMPTOMS } from '@/constants'
import type { AssessmentFormData } from '../AssessmentWizard'

export default function SymptomsStep() {
  const { watch, setValue } = useFormContext<AssessmentFormData>()
  const symptoms = watch('symptoms') ?? []

  function toggleSymptom(id: string) {
    const next = symptoms.includes(id)
      ? symptoms.filter((s) => s !== id)
      : [...symptoms, id]
    setValue('symptoms', next, { shouldValidate: true })
  }

  return (
    <div className="space-y-lg">
      <div>
        <h3 className="text-headline-sm font-semibold text-on-surface mb-1">Current Symptoms</h3>
        <p className="text-body-md text-on-surface-variant">Select any symptoms currently being experienced</p>
      </div>

      <div className="grid grid-cols-4 gap-md">
        {SYMPTOMS.map((symptom) => {
          const active = symptoms.includes(symptom.id)
          return (
            <button
              key={symptom.id}
              type="button"
              onClick={() => toggleSymptom(symptom.id)}
              className={cn(
                'symptom-card border border-outline-variant/20 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center gap-2 text-center',
                active && 'active'
              )}
            >
              <span className={cn('material-symbols-outlined text-2xl', symptom.color)}>
                {symptom.icon}
              </span>
              <span className="text-label-sm text-on-surface">{symptom.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}