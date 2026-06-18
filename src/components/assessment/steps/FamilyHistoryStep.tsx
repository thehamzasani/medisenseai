'use client'

import { useFormContext } from 'react-hook-form'
import { cn } from '@/lib/utils'
import type { AssessmentFormData } from '../AssessmentWizard'

type FamilyHistoryField =
  | 'hasDiabetesFH'
  | 'hasHypertensionFH'
  | 'hasHeartDiseaseFH'
  | 'hasStrokeFH'
  | 'hasKidneyDiseaseFH'
  | 'hasCancerFH'

interface ToggleConfig {
  name: FamilyHistoryField
  label: string
  icon: string
}

const conditions: ToggleConfig[] = [
  { name: 'hasDiabetesFH', label: 'Diabetes', icon: 'bloodtype' },
  { name: 'hasHypertensionFH', label: 'Hypertension', icon: 'monitor_heart' },
  { name: 'hasHeartDiseaseFH', label: 'Heart Disease', icon: 'cardiology' },
  { name: 'hasStrokeFH', label: 'Stroke', icon: 'neurology' },
  { name: 'hasKidneyDiseaseFH', label: 'Kidney Disease', icon: 'water_drop' },
  { name: 'hasCancerFH', label: 'Cancer', icon: 'personal_injury' },
]

export default function FamilyHistoryStep() {
  const { watch, setValue } = useFormContext<AssessmentFormData>()

  return (
    <div className="space-y-lg">
      <div>
        <h3 className="text-headline-sm font-semibold text-on-surface mb-1">Family History</h3>
        <p className="text-body-md text-on-surface-variant">Hereditary conditions present in immediate family</p>
      </div>

      <div className="grid grid-cols-3 gap-md">
        {conditions.map((condition) => {
          const active = watch(condition.name)
          return (
            <button
              key={condition.name}
              type="button"
              onClick={() => setValue(condition.name, !active, { shouldValidate: true })}
              className={cn(
                'lifestyle-card text-left border border-outline-variant/20 rounded-xl p-lg transition-all',
                active && 'active'
              )}
            >
              <span className="material-symbols-outlined text-2xl mb-2 block">{condition.icon}</span>
              <p className="text-label-md font-semibold text-on-surface">{condition.label}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}