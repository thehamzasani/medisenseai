'use client'

import { useFormContext } from 'react-hook-form'
import type { AssessmentFormData } from '../AssessmentWizard'

type RequiredLabField = 'fastingGlucose' | 'hba1c' | 'cholesterol' | 'hdl' | 'ldl' | 'triglycerides'
type OptionalLabField = 'creatinine' | 'egfr' | 'altEnzyme' | 'vitaminD'

interface RequiredFieldConfig {
  name: RequiredLabField
  label: string
  unit: string
  reference: string
  step: string
}

interface OptionalFieldConfig {
  name: OptionalLabField
  label: string
  unit: string
  reference: string
  step: string
}

const requiredFields: RequiredFieldConfig[] = [
  { name: 'fastingGlucose', label: 'Fasting Glucose', unit: 'mg/dL', reference: 'Normal: 70–99 mg/dL', step: '0.1' },
  { name: 'hba1c', label: 'HbA1c', unit: '%', reference: 'Normal: < 5.7%', step: '0.1' },
  { name: 'cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', reference: 'Desirable: < 200 mg/dL', step: '0.1' },
  { name: 'hdl', label: 'HDL', unit: 'mg/dL', reference: 'Optimal: > 60 mg/dL', step: '0.1' },
  { name: 'ldl', label: 'LDL', unit: 'mg/dL', reference: 'Optimal: < 100 mg/dL', step: '0.1' },
  { name: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', reference: 'Normal: < 150 mg/dL', step: '0.1' },
]

const optionalFields: OptionalFieldConfig[] = [
  { name: 'creatinine', label: 'Creatinine', unit: 'mg/dL', reference: 'Normal: 0.6–1.3 mg/dL', step: '0.01' },
  { name: 'egfr', label: 'eGFR', unit: 'mL/min/1.73m²', reference: 'Normal: > 90 mL/min/1.73m²', step: '0.1' },
  { name: 'altEnzyme', label: 'ALT Enzyme', unit: 'U/L', reference: 'Normal: 7–56 U/L', step: '0.1' },
  { name: 'vitaminD', label: 'Vitamin D', unit: 'ng/mL', reference: 'Sufficient: 30–100 ng/mL', step: '0.1' },
]

export default function LabResultsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AssessmentFormData>()

  return (
    <div className="space-y-lg">
      <div>
        <h3 className="text-headline-sm font-semibold text-on-surface mb-1">Lab Results</h3>
        <p className="text-body-md text-on-surface-variant">Blood panel and metabolic biomarkers</p>
      </div>

      <div>
        <p className="text-label-sm uppercase tracking-wider text-on-surface-variant mb-3">Required</p>
        <div className="grid grid-cols-2 gap-lg">
          {requiredFields.map((field) => (
            <div key={field.name}>
              <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
                {field.label} ({field.unit})
              </label>
              <input
                type="number"
                step={field.step}
                {...register(field.name, { valueAsNumber: true })}
                className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full"
              />
              <p className="text-[10px] text-on-surface-variant mt-1">{field.reference}</p>
              {errors[field.name] && (
                <p className="text-label-sm text-error mt-1">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-md border-t border-outline-variant/20">
        <p className="text-label-sm uppercase tracking-wider text-on-surface-variant mb-3">Optional</p>
        <div className="grid grid-cols-2 gap-lg">
          {optionalFields.map((field) => (
            <div key={field.name}>
              <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
                {field.label} ({field.unit}) <span className="text-on-surface-variant">(Optional)</span>
              </label>
              <input
                type="number"
                step={field.step}
                {...register(field.name, {
                  setValueAs: (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
                })}
                className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full"
              />
              <p className="text-[10px] text-on-surface-variant mt-1">{field.reference}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}