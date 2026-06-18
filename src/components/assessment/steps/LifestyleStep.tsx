'use client'

import { useFormContext } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { EXERCISE_FREQUENCY_OPTIONS, STRESS_LEVEL_OPTIONS, SUGAR_INTAKE_OPTIONS } from '@/constants'
import type { AssessmentFormData } from '../AssessmentWizard'

type LifestyleToggleField = 'isSmoker' | 'alcoholUse' | 'isSedentary' | 'highSaltDiet'

interface ToggleConfig {
  name: LifestyleToggleField
  label: string
  icon: string
  description: string
}

const toggles: ToggleConfig[] = [
  { name: 'isSmoker', label: 'Active Smoker', icon: 'smoking_rooms', description: 'Currently uses tobacco products' },
  { name: 'alcoholUse', label: 'Alcohol Consumption', icon: 'local_bar', description: 'Regular alcohol intake' },
  { name: 'isSedentary', label: 'Sedentary Lifestyle', icon: 'weekend', description: 'Limited daily physical activity' },
  { name: 'highSaltDiet', label: 'High Salt Diet', icon: 'restaurant', description: 'Frequent high-sodium meals' },
]

export default function LifestyleStep() {
  const { register, watch, setValue } = useFormContext<AssessmentFormData>()
  const sleepHours = watch('sleepHours') ?? 7

  return (
    <div className="space-y-lg">
      <div>
        <h3 className="text-headline-sm font-semibold text-on-surface mb-1">Lifestyle Factors</h3>
        <p className="text-body-md text-on-surface-variant">Habits and daily routine that influence long-term risk</p>
      </div>

      <div className="grid grid-cols-2 gap-md">
        {toggles.map((toggle) => {
          const active = watch(toggle.name)
          return (
            <button
              key={toggle.name}
              type="button"
              onClick={() => setValue(toggle.name, !active, { shouldValidate: true })}
              className={cn(
                'lifestyle-card text-left border border-outline-variant/20 rounded-xl p-lg transition-all',
                active && 'active'
              )}
            >
              <span className="material-symbols-outlined text-2xl mb-2 block">{toggle.icon}</span>
              <p className="text-label-md font-semibold text-on-surface">{toggle.label}</p>
              <p className="text-[11px] text-on-surface-variant mt-1">{toggle.description}</p>
            </button>
          )
        })}
      </div>

      <div className="pt-md border-t border-outline-variant/20">
        <div className="flex items-center justify-between mb-2">
          <label className="text-label-sm uppercase tracking-wider text-on-surface-variant">
            Sleep Hours
          </label>
          <span className="text-headline-md text-primary-fixed-dim font-bold tabular-nums">
            {sleepHours} <span className="text-body-md text-on-surface-variant">hrs/night</span>
          </span>
        </div>
        <input
          type="range"
          min={3}
          max={12}
          step={0.5}
          {...register('sleepHours', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-3 gap-lg pt-md border-t border-outline-variant/20">
        <div>
          <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
            Exercise Frequency
          </label>
          <select
            {...register('exerciseFrequency')}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary-fixed-dim focus:outline-none w-full"
          >
            {EXERCISE_FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface-container-low">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
            Stress Level
          </label>
          <select
            {...register('stressLevel')}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary-fixed-dim focus:outline-none w-full"
          >
            {STRESS_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface-container-low">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
            Daily Sugar Intake
          </label>
          <select
            {...register('dailySugarIntake')}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary-fixed-dim focus:outline-none w-full"
          >
            {SUGAR_INTAKE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface-container-low">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}