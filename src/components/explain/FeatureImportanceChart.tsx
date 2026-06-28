'use client'

import type { DiseaseExplainability } from '@/types'

interface FeatureImportanceChartProps {
  disease: string
  explainability: DiseaseExplainability
}

const FEATURE_LABELS: Record<string, string> = {
  hba1c: 'HbA1c',
  fastingGlucose: 'Fasting Glucose',
  bmi: 'BMI',
  age: 'Age',
  systolicBP: 'Systolic BP',
  diastolicBP: 'Diastolic BP',
  heartRate: 'Heart Rate',
  cholesterol: 'Total Cholesterol',
  hdl: 'HDL',
  ldl: 'LDL',
  triglycerides: 'Triglycerides',
  creatinine: 'Creatinine',
  egfr: 'eGFR',
  altEnzyme: 'ALT Enzyme',
  vitaminD: 'Vitamin D',
  oxygenSat: 'Oxygen Saturation',
  sleepHours: 'Sleep Hours',
  stressLevel: 'Stress Level',
  exerciseFrequency: 'Exercise Frequency',
  isSmoker: 'Smoking',
  alcoholUse: 'Alcohol Use',
  dailySugarIntake: 'Sugar Intake',
  highSaltDiet: 'High Salt Diet',
  isSedentary: 'Sedentary Lifestyle',
}

export default function FeatureImportanceChart({ explainability }: FeatureImportanceChartProps) {
  const entries = Object.entries(explainability.featureImportance)
  if (entries.length === 0) {
    return (
      <div className="text-center py-6 text-on-surface-variant text-label-sm">
        Feature importance data not available for this disease.
      </div>
    )
  }

  const sorted = entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
  const maxAbs = Math.max(...sorted.map(([, v]) => Math.abs(v)), 0.01)

  return (
    <div className="space-y-2.5">
      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Feature Importance</p>
      {sorted.map(([key, value]) => {
        const label = FEATURE_LABELS[key.toLowerCase()] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
        const isPositive = value >= 0
        const barWidth = (Math.abs(value) / maxAbs) * 100
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-label-sm text-on-surface-variant w-28 shrink-0 text-right truncate" title={label}>
              {label}
            </span>
            <div className="flex-1 h-5 bg-surface-container-high rounded-md overflow-hidden relative flex">
              <div
                className="h-full rounded-md transition-all duration-500"
                style={{
                  width: `${barWidth}%`,
                  marginLeft: isPositive ? '50%' : `${50 - barWidth}%`,
                  background: isPositive
                    ? 'linear-gradient(90deg, #ff6b6b44, #ff6b6b)'
                    : 'linear-gradient(90deg, #3cddc7, #3cddc744)',
                }}
              />
            </div>
            <span className={`text-label-sm font-semibold tabular-nums w-12 text-right ${
              isPositive ? 'text-error' : 'text-tertiary-fixed-dim'
            }`}>
              {value.toFixed(2)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
