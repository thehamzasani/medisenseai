'use client'

import { useState } from 'react'
import type { RecommendationsData } from '@/types'
import { formatDate } from '@/lib/utils'

interface Props {
  recommendations: RecommendationsData
}

export default function CarePathwayTimeline({ recommendations }: Props) {
  const [alertSensitivity, setAlertSensitivity] = useState(65)
  const [activeStep, setActiveStep] = useState(0)
  const { carePathway } = recommendations

  const sensitivityLabel =
    alertSensitivity >= 80 ? 'High — Alert on minor changes'
    : alertSensitivity >= 50 ? 'Medium — Alert on significant changes'
    : 'Low — Alert on critical changes only'

  const stepColors = [
    'border-primary-fixed-dim bg-primary-fixed-dim/20 text-primary-fixed-dim',
    'border-secondary bg-secondary/20 text-secondary',
    'border-tertiary-fixed-dim bg-tertiary-fixed-dim/20 text-tertiary-fixed-dim',
  ]

  const stepIcons = ['biotech', 'bloodtype', 'monitor_heart']

  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now()
    const days = Math.max(0, Math.ceil(diff / 86400000))
    return days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`
  }

  return (
    <div className="surface-glass rounded-2xl p-6 flex flex-col h-full relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary text-lg">
            timeline
          </span>
        </div>
        <div>
          <p className="text-label-sm uppercase tracking-[0.15em] text-on-surface-variant">
            Care Pathway
          </p>
          <p className="text-label-md text-on-surface font-semibold">
            Clinical Timeline
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-label-sm text-on-surface-variant">Milestones</p>
          <p className="text-label-md font-bold text-on-surface">{carePathway.length}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 mb-6">
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary-fixed-dim/50 via-secondary/30 to-tertiary-fixed-dim/20" />

          <div className="space-y-4">
            {carePathway.map((step, i) => {
              const colorClass = stepColors[i % stepColors.length]
              const icon = stepIcons[i % stepIcons.length]
              const isActive = i === activeStep
              const isPast = i < activeStep

              return (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`w-full text-left pl-16 pr-4 py-5 rounded-xl border transition-all duration-300 relative ${
                    isActive
                      ? 'bg-surface-container/60 border-outline-variant/40 shadow-lg'
                      : isPast
                        ? 'bg-surface-container/20 border-outline-variant/10 opacity-60'
                        : 'bg-surface-container/30 border-outline-variant/20 hover:border-outline-variant/40'
                  }`}
                >
                  {/* Step indicator */}
                  <div
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${
                      isPast
                        ? 'border-tertiary-fixed-dim bg-tertiary-fixed-dim/30'
                        : isActive
                          ? colorClass.split(' ').filter(c => c.startsWith('border-')).join(' ') + ' bg-surface'
                          : 'border-outline-variant bg-surface-container'
                    }`}
                  >
                    {isPast ? (
                      <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontSize: '10px' }}>
                        check
                      </span>
                    ) : isActive ? (
                      <div className="w-2 h-2 rounded-full bg-primary-fixed-dim" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '14px' }}>
                          {icon}
                        </span>
                        <p className="text-label-md font-semibold text-on-surface">
                          {step.type}
                        </p>
                      </div>
                      <p className="text-label-sm text-on-surface-variant mb-2">
                        {step.notes}
                      </p>
                      {isActive && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 bg-surface-container rounded border border-outline-variant/20 text-on-surface-variant">
                            Fasting required
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-surface-container rounded border border-outline-variant/20 text-on-surface-variant">
                            30 min appointment
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-label-sm font-semibold text-on-surface">
                        {daysUntil(step.date)}
                      </p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {formatDate(step.date)}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Progress summary */}
      <div className="bg-surface-container/40 rounded-xl p-4 border border-outline-variant/20 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-label-sm text-on-surface-variant">Pathway Progress</span>
          <span className="text-label-sm font-semibold text-on-surface">
            {activeStep}/{carePathway.length} milestones
          </span>
        </div>
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-fixed-dim to-secondary transition-all duration-700"
            style={{ width: `${(activeStep / carePathway.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Alert Sensitivity Slider */}
      <div className="bg-surface-container/40 rounded-xl p-5 border border-outline-variant/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary-fixed-dim text-base">
            notifications_active
          </span>
          <p className="text-label-md font-semibold text-on-surface">Alert Sensitivity</p>
        </div>
        <p className="text-label-sm text-on-surface-variant mb-4">
          {sensitivityLabel}
        </p>

        <div className="relative mb-3">
          <input
            type="range"
            min={0}
            max={100}
            value={alertSensitivity}
            onChange={e => setAlertSensitivity(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex justify-between text-[10px] text-on-surface-variant">
          <span>Low</span>
          <span
            className="font-semibold tabular-nums"
            style={{
              color: alertSensitivity >= 70 ? '#ffb4ab' : alertSensitivity >= 40 ? '#00dbe7' : '#3cddc7',
            }}
          >
            {alertSensitivity}%
          </span>
          <span>High</span>
        </div>

        {/* Sensitivity zones */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${alertSensitivity}%`,
              background:
                alertSensitivity >= 70
                  ? 'linear-gradient(90deg, #3cddc7, #ffb4ab)'
                  : alertSensitivity >= 40
                    ? 'linear-gradient(90deg, #3cddc7, #00dbe7)'
                    : 'linear-gradient(90deg, #3cddc7, #59f2dc)',
            }}
          />
        </div>

        {alertSensitivity >= 80 && (
          <div className="mt-3 p-2.5 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-[10px] text-error">
              High sensitivity may generate frequent notifications. Consider Medium for daily use.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}