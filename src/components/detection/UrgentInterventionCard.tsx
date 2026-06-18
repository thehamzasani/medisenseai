import type { AssessmentWithResults } from '@/types'

interface Props {
  assessment: AssessmentWithResults
}

export default function UrgentInterventionCard({ assessment }: Props) {
  const urgency = assessment.urgency ?? 'MONITOR'
  const isUrgent = urgency === 'URGENT' || urgency === 'SOON'
  const recs = assessment.recommendations

  const actionItems = recs?.directive
    ? [
        recs.directive.title,
        recs.lifestyle?.exerciseTarget ?? 'Increase physical activity',
      ]
    : [
        'Schedule a clinical consultation',
        'Monitor vital signs regularly',
      ]

  if (!isUrgent) {
    return (
      <div className="surface-glass rounded-2xl p-5 border border-secondary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary-fixed-dim text-xl">
              monitor_heart
            </span>
          </div>
          <div>
            <p className="text-label-sm uppercase tracking-widest text-secondary-fixed-dim">
              Monitoring Active
            </p>
            <p className="text-[10px] text-on-surface-variant">
              {urgency === 'MONITOR' ? 'Maintain healthy habits' : 'Monitor closely'}
            </p>
          </div>
          <div className="ml-auto">
            <div className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary-fixed-dim text-sm">
                check_circle
              </span>
              <span className="text-label-sm text-secondary-fixed-dim font-semibold">
                Status: {urgency === 'MONITOR' ? 'Stable' : 'Watch'}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              {urgency === 'MONITOR'
                ? 'All monitored parameters remain within acceptable clinical ranges. Continue current health regimen.'
                : 'Some parameters warrant closer monitoring. Schedule a checkup within the next 4 weeks.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {actionItems.map((item, i) => (
              <div key={i} className="bg-surface-container-high rounded-lg p-2.5">
                <span className="material-symbols-outlined text-secondary-fixed-dim text-sm block mb-1">
                  {i === 0 ? 'task_alt' : 'directions_run'}
                </span>
                <p className="text-[10px] text-on-surface-variant leading-tight">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
          <span className="text-[10px] text-on-surface-variant">Next Review</span>
          <span className="text-label-sm text-secondary-fixed-dim font-semibold">
            {urgency === 'MONITOR' ? 'Annual Checkup' : '4 Weeks'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-glass rounded-2xl p-5 border border-error/30 glow-error">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-error text-xl risk-pulse-high">
            emergency
          </span>
        </div>
        <div>
          <p className="text-label-sm uppercase tracking-widest text-error">
            {urgency === 'URGENT' ? 'Urgent Intervention' : 'Action Required Soon'}
          </p>
          <p className="text-[10px] text-on-surface-variant">
            {urgency === 'URGENT'
              ? 'Immediate medical attention recommended'
              : 'Schedule checkup within 2–4 weeks'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-error/5 border border-error/20 rounded-xl p-3">
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            {assessment.urgencyText ?? 'Critical risk factors detected. Please consult a healthcare provider.'}
          </p>
        </div>

        <div className="space-y-2">
          {actionItems.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2 bg-error/5 border border-error/10 rounded-lg p-3"
            >
              <span className="material-symbols-outlined text-error text-sm mt-0.5 flex-shrink-0">
                {i === 0 ? 'priority_high' : 'medical_services'}
              </span>
              <p className="text-[11px] text-on-surface leading-tight">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-error/20">
        <button className="w-full py-2.5 rounded-lg bg-error/10 border border-error/30 text-error text-label-sm font-semibold hover:bg-error/20 transition-colors">
          <span className="material-symbols-outlined text-sm mr-1 align-middle">local_hospital</span>
          Find Nearest Clinic
        </button>
      </div>
    </div>
  )
}