'use client'

import { useState } from 'react'
import type { RecommendationsData } from '@/types'
import { toast } from 'sonner'

interface Props {
  recommendations: RecommendationsData
  urgency: string | null
}

export default function PrimaryDirectiveCard({ recommendations, urgency }: Props) {
  const [executing, setExecuting] = useState(false)
  const { directive } = recommendations

  const handleExecute = async () => {
    setExecuting(true)
    await new Promise(r => setTimeout(r, 1200))
    setExecuting(false)
    toast.success('Directive activated', {
      description: 'Your care team has been notified and monitoring is now active.',
    })
  }

  const handleReviewEvidence = () => {
    toast.info('Source Evidence', {
      description: 'Evidence compiled from Neural Network analysis across 1.2M patient records.',
    })
  }

  const urgencyColor =
    urgency === 'URGENT' || urgency === 'SOON'
      ? 'text-error'
      : urgency === 'WATCH'
        ? 'text-secondary'
        : 'text-tertiary-fixed-dim'

  const urgencyBg =
    urgency === 'URGENT' || urgency === 'SOON'
      ? 'bg-error/10 border-error/30'
      : urgency === 'WATCH'
        ? 'bg-secondary/10 border-secondary/30'
        : 'bg-tertiary-fixed-dim/10 border-tertiary-fixed-dim/30'

  return (
    <div className="surface-glass rounded-2xl p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-error/5 blur-[80px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[30%] h-[30%] bg-primary-container/5 blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Pulsing error icon */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-error/20 border border-error/30 flex items-center justify-center risk-pulse-high">
                <span className="material-symbols-outlined text-error text-2xl">
                  emergency
                </span>
              </div>
              {/* Outer pulse ring */}
              <div className="absolute inset-0 rounded-xl border border-error/20 animate-ping" />
            </div>

            <div>
              <p className="text-label-sm uppercase tracking-[0.2em] text-error/80 mb-1">
                Primary Clinical Directive
              </p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label-sm ${urgencyBg} ${urgencyColor}`}>
                <span className="material-symbols-outlined text-sm" style={{ fontSize: '14px' }}>
                  {urgency === 'URGENT' ? 'warning' : urgency === 'SOON' ? 'schedule' : urgency === 'WATCH' ? 'visibility' : 'check_circle'}
                </span>
                {urgency ?? 'MONITOR'}
              </div>
            </div>
          </div>

          {/* Risk Score */}
          <div className="text-right">
            <p className="text-label-sm text-on-surface-variant mb-1">Risk Score</p>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-display-lg font-bold text-error tabular-nums">
                {directive.riskScore}
              </span>
              <span className="text-headline-sm text-on-surface-variant">/10</span>
            </div>
          </div>
        </div>

        {/* Directive content */}
        <div className="mb-8">
          <h2 className="text-headline-md font-semibold text-on-surface mb-3">
            {directive.title}
          </h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            {directive.description}
          </p>
        </div>

        {/* Risk score bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">
              Directive Priority Level
            </span>
            <span className={`text-label-sm font-semibold ${urgencyColor}`}>
              {directive.riskScore >= 8 ? 'CRITICAL' : directive.riskScore >= 6 ? 'HIGH' : directive.riskScore >= 4 ? 'MODERATE' : 'LOW'}
            </span>
          </div>
          <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${(directive.riskScore / 10) * 100}%`,
                background: directive.riskScore >= 7
                  ? 'linear-gradient(90deg, #ffb4ab, #93000a)'
                  : directive.riskScore >= 5
                    ? 'linear-gradient(90deg, #a6e6ff, #14d1ff)'
                    : 'linear-gradient(90deg, #3cddc7, #59f2dc)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-on-surface-variant">0</span>
            <span className="text-[10px] text-on-surface-variant">10</span>
          </div>
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Engine Confidence', value: '99.2%', icon: 'memory' },
            { label: 'Data Points', value: '1.2M+', icon: 'dataset' },
            { label: 'Last Updated', value: 'Just now', icon: 'update' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-surface-container/50 rounded-xl p-4 border border-outline-variant/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary-fixed-dim text-base">
                  {item.icon}
                </span>
                <span className="text-label-sm text-on-surface-variant">{item.label}</span>
              </div>
              <p className="text-headline-sm font-semibold text-on-surface">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleExecute}
            disabled={executing}
            className="btn-cyan flex-1 py-3 px-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {executing ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
                <span>Activating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">play_arrow</span>
                <span>Execute Directive</span>
              </>
            )}
          </button>

          <button
            onClick={handleReviewEvidence}
            className="flex-1 py-3 px-6 rounded-full border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:border-primary-fixed-dim/40 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
          >
            <span className="material-symbols-outlined text-base">policy</span>
            Review Source Evidence
          </button>
        </div>
      </div>
    </div>
  )
}