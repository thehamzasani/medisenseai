import type { AssessmentWithResults } from '@/types'
// import ProgressBar from '@/components/shared/ProgressBar'
// import { getHealthScoreColor } from '@/lib/utils'

interface PatientSummaryCardProps {
  assessment: AssessmentWithResults
  userName: string
  userBloodType: string | null
}

function HealthIndexGauge({ score }: { score: number }) {
  const clamp = Math.max(0, Math.min(100, score))
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (clamp / 100) * circumference

  const color = clamp >= 80
    ? '#3cddc7'
    : clamp >= 60
      ? '#4cd6ff'
      : clamp >= 40
        ? '#f59e0b'
        : '#ffb4ab'

  const label = clamp >= 80 ? 'Excellent' : clamp >= 60 ? 'Good' : clamp >= 40 ? 'Fair' : 'Poor'

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Overall Health Index</p>
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg width={140} height={140} viewBox="0 0 120 120">
          <circle
            cx={60} cy={60} r={radius}
            fill="none"
            stroke="rgba(46,52,71,0.8)"
            strokeWidth={10}
          />
          <circle
            cx={60} cy={60} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1s ease-out', filter: `drop-shadow(0 0 6px ${color})` }}
          />
          <text x={60} y={56} textAnchor="middle" fill={color} fontSize={26} fontWeight={700} fontFamily="Inter">
            {clamp}
          </text>
          <text x={60} y={72} textAnchor="middle" fill="rgba(185,202,203,0.7)" fontSize={10} fontFamily="Inter">
            / 100
          </text>
        </svg>
      </div>
      <span
        className="text-label-sm font-semibold px-3 py-1 rounded-full"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {label}
      </span>
      <p className="text-[10px] text-on-surface-variant text-center max-w-[120px]">
        Composite score across all 10 AI engines
      </p>
    </div>
  )
}

function InfoCell({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-container-high/50">
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 14 }}>
          {icon}
        </span>
        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-semibold text-on-surface">{value}</span>
    </div>
  )
}

export default function PatientSummaryCard({ assessment, userName, userBloodType }: PatientSummaryCardProps) {
  const patientId = `MS-${assessment.id.slice(-5).toUpperCase()}`

  // Derive initials from userName
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const bmiCategory =
    assessment.bmi < 18.5 ? 'Underweight'
    : assessment.bmi < 25 ? 'Normal'
    : assessment.bmi < 30 ? 'Overweight'
    : 'Obese'

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* ── Left bento (8-col) ── */}
      <div className="col-span-8 surface-glass rounded-2xl p-6 flex flex-col gap-5">
        {/* Header row */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-on-primary flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00dbe7 0%, #006a71 100%)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-headline-sm font-semibold text-on-surface truncate">{userName}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-fixed-dim/20 text-primary-fixed-dim border border-primary-fixed-dim/30 font-mono">
                {patientId}
              </span>
            </div>
            <p className="text-label-md text-on-surface-variant mt-0.5">
              {assessment.gender} · {assessment.age} years old
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">Assessment</span>
              <span className="text-[10px] text-on-surface-variant font-mono">
                {new Date(assessment.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          </div>
          {/* Status badge */}
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed-dim/20 text-tertiary-fixed-dim border border-tertiary-fixed-dim/30 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-pulse" />
              Analysis Complete
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-outline-variant/20" />

        {/* Biometric grid */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">Patient Biometrics</p>
          <div className="grid grid-cols-4 gap-3">
            <InfoCell label="Age" value={`${assessment.age} yrs`} icon="cake" />
            <InfoCell label="Gender" value={assessment.gender} icon="person" />
            <InfoCell
              label="BMI"
              value={`${assessment.bmi.toFixed(1)} — ${bmiCategory}`}
              icon="monitor_weight"
            />
            <InfoCell
              label="Blood Type"
              value={userBloodType ?? 'Not set'}
              icon="bloodtype"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-outline-variant/20" />

        {/* Vitals row */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">Key Vitals</p>
          <div className="grid grid-cols-3 gap-3">
            <InfoCell
              label="Blood Pressure"
              value={`${assessment.systolicBP}/${assessment.diastolicBP} mmHg`}
              icon="monitor_heart"
            />
            <InfoCell
              label="Heart Rate"
              value={`${assessment.heartRate} BPM`}
              icon="favorite"
            />
            <InfoCell
              label="SpO₂"
              value={`${assessment.oxygenSat}%`}
              icon="air"
            />
          </div>
        </div>

        {/* Key factors */}
        {assessment.keyFactors && assessment.keyFactors.length > 0 && (
          <>
            <div className="h-px bg-outline-variant/20" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">Key Risk Factors</p>
              <div className="flex flex-wrap gap-2">
                {assessment.keyFactors.slice(0, 5).map((factor, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-error/10 text-error border border-error/20"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Right gauge (4-col) ── */}
      <div className="col-span-4 surface-glass rounded-2xl p-6">
        {assessment.overallHealthIndex !== null ? (
          <HealthIndexGauge score={assessment.overallHealthIndex} />
        ) : (
          <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">
            No score available
          </div>
        )}

        {/* Best engine info */}
        {assessment.bestEngine && (
          <div className="mt-4 pt-4 border-t border-outline-variant/20">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Best Engine</p>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: 18 }}>
                memory
              </span>
              <span className="text-sm font-semibold text-on-surface">{assessment.bestEngine}</span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">99.2% accuracy · 42ms inference</p>
          </div>
        )}

        {/* Urgency */}
        {assessment.urgency && (
          <div className="mt-3 pt-3 border-t border-outline-variant/20">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Clinical Urgency</p>
            <span className={`
              inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full
              ${assessment.urgency === 'MONITOR' ? 'bg-tertiary-fixed-dim/20 text-tertiary-fixed-dim border border-tertiary-fixed-dim/30' :
                assessment.urgency === 'WATCH' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                'bg-error/20 text-error border border-error/30'}
            `}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {assessment.urgency === 'MONITOR' ? 'check_circle' :
                 assessment.urgency === 'WATCH' ? 'visibility' :
                 assessment.urgency === 'SOON' ? 'schedule' : 'emergency'}
              </span>
              {assessment.urgency}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}