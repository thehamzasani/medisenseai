import { cn } from '@/lib/utils'
import type { RiskLevel } from '@/types'

interface ProgressBarProps {
  value: number           // 0-100
  level?: RiskLevel | null
  glow?: boolean
  height?: 'xs' | 'sm' | 'md'
  className?: string
  showValue?: boolean
  animated?: boolean
}

const LEVEL_COLORS: Record<string, string> = {
  LOW:      'bg-tertiary-fixed-dim',
  MEDIUM:   'bg-secondary-fixed-dim',
  HIGH:     'bg-error',
  CRITICAL: 'bg-error',
}

const GLOW_COLORS: Record<string, string> = {
  LOW:      'shadow-[0_0_8px_rgba(60,221,199,0.5)]',
  MEDIUM:   'shadow-[0_0_8px_rgba(76,214,255,0.5)]',
  HIGH:     'shadow-[0_0_8px_rgba(255,180,171,0.5)]',
  CRITICAL: 'shadow-[0_0_12px_rgba(255,180,171,0.7)]',
}

export default function ProgressBar({
  value,
  level,
  glow = false,
  height = 'sm',
  className,
  showValue = false,
  animated = false,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value))
  const barColor = level ? (LEVEL_COLORS[level] ?? 'bg-primary-fixed-dim') : 'bg-primary-fixed-dim'
  const glowClass = glow && level ? (GLOW_COLORS[level] ?? '') : ''

  const heightClass = height === 'xs' ? 'h-1' : height === 'md' ? 'h-3' : 'h-2'

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-full bg-surface-container-highest overflow-hidden', heightClass)}>
        <div
          className={cn(
            'h-full rounded-full transition-all',
            animated ? 'duration-1000 ease-out' : 'duration-300',
            barColor,
            glowClass
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showValue && (
        <div className="mt-1 text-right text-[10px] text-on-surface-variant tabular-nums">
          {clampedValue}%
        </div>
      )}
    </div>
  )
}