'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { calculateBMI } from '@/lib/utils'
import type { AssessmentFormData } from '../AssessmentWizard'

export default function PersonalInfoStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AssessmentFormData>()

  const weight = watch('weight')
  const height = watch('height')
  const bmi = watch('bmi')

  useEffect(() => {
    if (weight && height && weight > 0 && height > 0) {
      const calculated = calculateBMI(weight, height)
      setValue('bmi', calculated, { shouldValidate: true })
    }
  }, [weight, height, setValue])

  return (
    <div className="space-y-lg">
      <div>
        <h3 className="text-headline-sm font-semibold text-on-surface mb-1">Personal Information</h3>
        <p className="text-body-md text-on-surface-variant">Basic demographic and anthropometric data</p>
      </div>

      <div className="grid grid-cols-2 gap-lg">
        <div>
          <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
            Age
          </label>
          <input
            type="number"
            {...register('age', { valueAsNumber: true })}
            placeholder="e.g. 42"
            className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full"
          />
          {errors.age && <p className="text-label-sm text-error mt-1">{errors.age.message}</p>}
        </div>

        <div>
          <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
            Gender
          </label>
          <select
            {...register('gender')}
            className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full"
          >
            <option value="Male" className="bg-surface-container-low">Male</option>
            <option value="Female" className="bg-surface-container-low">Female</option>
            <option value="Other" className="bg-surface-container-low">Other</option>
          </select>
          {errors.gender && <p className="text-label-sm text-error mt-1">{errors.gender.message}</p>}
        </div>

        <div>
          <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('weight', { valueAsNumber: true })}
            placeholder="e.g. 78.5"
            className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full"
          />
          {errors.weight && <p className="text-label-sm text-error mt-1">{errors.weight.message}</p>}
        </div>

        <div>
          <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
            Height (cm)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('height', { valueAsNumber: true })}
            placeholder="e.g. 175"
            className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full"
          />
          {errors.height && <p className="text-label-sm text-error mt-1">{errors.height.message}</p>}
        </div>
      </div>

      <input type="hidden" {...register('bmi', { valueAsNumber: true })} />

      <div className="surface-glass rounded-xl p-lg border border-primary-fixed-dim/30 glow-cyan">
        <p className="text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">
          Calculated Body Mass Index
        </p>
        <p className="text-display-lg font-bold text-primary-fixed-dim tabular-nums">
          {bmi && bmi > 0 ? bmi.toFixed(1) : '—'}
          <span className="text-body-md text-on-surface-variant ml-2">kg/m²</span>
        </p>
      </div>
    </div>
  )
}