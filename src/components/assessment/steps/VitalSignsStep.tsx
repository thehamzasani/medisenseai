'use client'

import { useFormContext } from 'react-hook-form'
import type { AssessmentFormData } from '../AssessmentWizard'

type VitalSliderField = 'systolicBP' | 'diastolicBP' | 'heartRate'

interface SliderConfig {
  name: VitalSliderField
  label: string
  min: number
  max: number
  step: number
  unit: string
}

const sliders: SliderConfig[] = [
  { name: 'systolicBP', label: 'Systolic BP', min: 80, max: 200, step: 1, unit: 'mmHg' },
  { name: 'diastolicBP', label: 'Diastolic BP', min: 40, max: 130, step: 1, unit: 'mmHg' },
  { name: 'heartRate', label: 'Heart Rate', min: 40, max: 200, step: 1, unit: 'BPM' },
]

export default function VitalSignsStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<AssessmentFormData>()

  const oxygenSat = watch('oxygenSat') ?? 95
  const spo2Percent = Math.min(100, Math.max(0, ((oxygenSat - 80) / 20) * 100))

  return (
    <div className="space-y-lg">
      <div>
        <h3 className="text-headline-sm font-semibold text-on-surface mb-1">Vital Signs</h3>
        <p className="text-body-md text-on-surface-variant">Cardiovascular and respiratory measurements</p>
      </div>

      <div className="space-y-xl">
        {sliders.map((slider) => {
          const value = watch(slider.name) ?? slider.min
          return (
            <div key={slider.name}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                  {slider.label}
                </label>
                <span className="text-headline-md text-primary-fixed-dim font-bold tabular-nums">
                  {value} <span className="text-body-md text-on-surface-variant">{slider.unit}</span>
                </span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                {...register(slider.name, { valueAsNumber: true })}
              />
            </div>
          )
        })}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-label-sm uppercase tracking-wider text-on-surface-variant">
              SpO₂ (Oxygen Saturation)
            </label>
            <span className="text-headline-md text-primary-fixed-dim font-bold tabular-nums">
              {oxygenSat.toFixed(1)} <span className="text-body-md text-on-surface-variant">%</span>
            </span>
          </div>
          <input
            type="range"
            min={80}
            max={100}
            step={0.1}
            {...register('oxygenSat', { valueAsNumber: true })}
          />
          <div className="relative h-2 w-full rounded-full overflow-hidden mt-3 flex">
            <div className="flex-[10] bg-error/60" />
            <div className="flex-[5] bg-secondary/60" />
            <div className="flex-[5] bg-tertiary-fixed-dim/60" />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-on-surface border-2 border-primary-fixed-dim"
              style={{ left: `${spo2Percent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
            <span>Critical &lt;90%</span>
            <span>Caution 90–95%</span>
            <span>Normal &gt;95%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-lg pt-md border-t border-outline-variant/20">
        <div>
          <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
            Body Temperature (°C)
          </label>
          <input
            type="number"
            step="0.1"
            min={34}
            max={42}
            {...register('bodyTemperature', { valueAsNumber: true })}
            placeholder="e.g. 36.8"
            className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full"
          />
          {errors.bodyTemperature && (
            <p className="text-label-sm text-error mt-1">{errors.bodyTemperature.message}</p>
          )}
        </div>

        <div>
          <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
            Respiratory Rate (breaths/min)
          </label>
          <input
            type="number"
            min={8}
            max={60}
            {...register('respiratoryRate', { valueAsNumber: true })}
            placeholder="e.g. 16"
            className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full"
          />
          {errors.respiratoryRate && (
            <p className="text-label-sm text-error mt-1">{errors.respiratoryRate.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}