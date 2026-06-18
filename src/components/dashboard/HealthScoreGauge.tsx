// import { getHealthScoreColor } from '@/lib/utils'

interface HealthScoreGaugeProps {
  score: number
  size?: number
  label?: string
  showLabel?: boolean
}

export default function HealthScoreGauge({
  score,
  size = 128,
  label = 'Health Score',
  showLabel = true,
}: HealthScoreGaugeProps) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.max(0, Math.min(100, score))
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference

  // Track color: surface-container-high = #23293c
  // Progress: secondary = #a6e6ff
  const progressColor =
    clampedScore >= 80
      ? '#3cddc7'
      : clampedScore >= 60
      ? '#a6e6ff'
      : clampedScore >= 40
      ? '#f59e0b'
      : '#ffb4ab'

  const cx = size / 2
  const cy = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#23293c"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
          />
        </svg>
        {/* Centered score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold tabular-nums"
            style={{
              fontSize: size >= 128 ? '2rem' : '1.25rem',
              color: progressColor,
              lineHeight: 1,
            }}
          >
            {clampedScore}
          </span>
          {size >= 100 && (
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">
              /100
            </span>
          )}
        </div>
      </div>
      {showLabel && (
        <span className="text-label-sm text-on-surface-variant text-center">{label}</span>
      )}
    </div>
  )
}