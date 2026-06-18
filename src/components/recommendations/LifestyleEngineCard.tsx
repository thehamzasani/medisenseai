import type { RecommendationsData } from '@/types'

interface Props {
  recommendations: RecommendationsData
}

export default function LifestyleEngineCard({ recommendations }: Props) {
  const { lifestyle } = recommendations

  return (
    <div className="surface-glass rounded-2xl p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[35%] h-[35%] bg-tertiary-fixed-dim/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-tertiary-fixed-dim/20 border border-tertiary-fixed-dim/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-tertiary-fixed-dim text-lg">
            self_improvement
          </span>
        </div>
        <div>
          <p className="text-label-sm uppercase tracking-[0.15em] text-on-surface-variant">
            Lifestyle Engine
          </p>
          <p className="text-label-md text-on-surface font-semibold">
            Behavioral Modifications
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-tertiary-fixed-dim/10 border border-tertiary-fixed-dim/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-tertiary-fixed-dim rounded-full animate-pulse" />
          <span className="text-label-sm text-tertiary-fixed-dim font-semibold">Active</span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Sodium Reduction Card */}
        <div className="bg-surface-container/50 rounded-xl p-5 border border-outline-variant/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-secondary/20 border border-secondary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-sm">
                water_drop
              </span>
            </div>
            <p className="text-label-sm font-semibold text-on-surface">Sodium Reduction</p>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-headline-md font-bold text-secondary tabular-nums">
                -{lifestyle.sodiumReduction}g
              </span>
              <span className="text-label-sm text-on-surface-variant">/ day</span>
            </div>
            <p className="text-label-sm text-on-surface-variant mt-1">
              Reduce daily sodium intake
            </p>
          </div>

          {/* Visual indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-on-surface-variant">
              <span>Current</span>
              <span>Target</span>
            </div>
            <div className="relative h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-error/60 to-secondary"
                style={{ width: lifestyle.sodiumReduction >= 2 ? '70%' : '50%' }}
              />
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-error">High</span>
              <span className="text-tertiary-fixed-dim">Optimal</span>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-secondary/10 border border-secondary/20 rounded-lg">
            <p className="text-[10px] text-secondary leading-relaxed">
              Target: {lifestyle.sodiumReduction >= 2 ? '&lt;2g' : '&lt;3g'} sodium/day. Avoid processed foods and restaurant meals.
            </p>
          </div>
        </div>

        {/* Sleep Window Card */}
        <div className="bg-surface-container/50 rounded-xl p-5 border border-outline-variant/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed-dim/20 border border-primary-fixed-dim/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-fixed-dim text-sm">
                bedtime
              </span>
            </div>
            <p className="text-label-sm font-semibold text-on-surface">Sleep Window</p>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-headline-md font-bold text-primary-fixed-dim tabular-nums">
                +{lifestyle.sleepIncrease}
              </span>
              <span className="text-label-sm text-on-surface-variant">min / night</span>
            </div>
            <p className="text-label-sm text-on-surface-variant mt-1">
              Increase sleep duration
            </p>
          </div>

          {/* Sleep arc visualization */}
          <div className="relative h-16 flex items-center justify-center mb-2">
            <svg viewBox="0 0 120 60" className="w-full h-full">
              {/* Background arc */}
              <path
                d="M 10 55 A 50 50 0 0 1 110 55"
                fill="none"
                stroke="#23293c"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Progress arc */}
              <path
                d="M 10 55 A 50 50 0 0 1 110 55"
                fill="none"
                stroke="#00dbe7"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="157"
                strokeDashoffset={Math.max(0, 157 - (lifestyle.sleepIncrease / 120) * 157)}
              />
              {/* Label */}
              <text x="60" y="48" textAnchor="middle" fill="#dce1fb" fontSize="10" fontWeight="600">
                {7 + lifestyle.sleepIncrease / 60}h target
              </text>
            </svg>
          </div>

          <div className="p-2.5 bg-primary-fixed-dim/10 border border-primary-fixed-dim/20 rounded-lg">
            <p className="text-[10px] text-primary-fixed-dim leading-relaxed">
              Sleep 10:30 PM – 6:30 AM. Consistent schedule improves metabolic health.
            </p>
          </div>
        </div>
      </div>

      {/* Exercise Target */}
      <div className="bg-surface-container/40 rounded-xl p-5 border border-outline-variant/20 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-base">
              directions_run
            </span>
            <p className="text-label-md font-semibold text-on-surface">Exercise Protocol</p>
          </div>
          <span className="text-label-sm text-tertiary-fixed-dim font-semibold bg-tertiary-fixed-dim/10 border border-tertiary-fixed-dim/20 px-3 py-1 rounded-full">
            Active
          </span>
        </div>
        <p className="text-body-md text-on-surface mb-3">{lifestyle.exerciseTarget}</p>
        <div className="grid grid-cols-5 gap-1.5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, 5).map((day, i) => (
            <div
              key={day}
              className={`rounded-lg p-2 text-center border transition-all ${
                i < 3
                  ? 'bg-tertiary-fixed-dim/20 border-tertiary-fixed-dim/40'
                  : 'bg-surface-container-high border-outline-variant/20'
              }`}
            >
              <p className="text-[10px] text-on-surface-variant mb-1">{day}</p>
              <span
                className="material-symbols-outlined text-sm"
                style={{
                  fontSize: '14px',
                  color: i < 3 ? '#3cddc7' : '#3a494b',
                }}
              >
                {i < 3 ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sugar Target */}
      <div className="bg-surface-container/40 rounded-xl p-4 border border-outline-variant/20 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-secondary text-base">
            cake
          </span>
          <p className="text-label-md font-semibold text-on-surface">Sugar Target</p>
        </div>
        <p className="text-label-sm text-on-surface-variant mb-3">{lifestyle.sugarTarget}</p>
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-tertiary-fixed-dim to-secondary"
            style={{ width: '40%' }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-on-surface-variant">
          <span>Current intake</span>
          <span>Target met: 40%</span>
        </div>
      </div>

      {/* CGM Toggle */}
      <div className="bg-surface-container/40 rounded-xl p-5 border border-outline-variant/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed-dim/20 border border-primary-fixed-dim/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-fixed-dim text-lg">
                glucose
              </span>
            </div>
            <div>
              <p className="text-label-md font-semibold text-on-surface">
                Continuous Glucose Monitor
              </p>
              <p className="text-label-sm text-on-surface-variant">
                Real-time metabolic tracking
              </p>
            </div>
          </div>

          {/* CGM Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={lifestyle.cgmEnabled}
              className="sr-only peer"
              readOnly
            />
            <div className="w-12 h-6 bg-surface-container-high rounded-full peer peer-checked:bg-primary-container/40 peer-checked:border-primary-fixed-dim/50 border border-outline-variant/30 transition-all duration-300 relative">
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-on-surface-variant rounded-full transition-all duration-300 ${
                  lifestyle.cgmEnabled ? 'translate-x-6 !bg-primary-fixed-dim' : ''
                }`}
              />
            </div>
          </label>
        </div>

        {lifestyle.cgmEnabled && (
          <div className="mt-4 p-3 bg-primary-fixed-dim/10 border border-primary-fixed-dim/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-fixed-dim rounded-full animate-pulse" />
              <p className="text-label-sm text-primary-fixed-dim">
                CGM monitoring recommended — elevated diabetes risk detected
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}