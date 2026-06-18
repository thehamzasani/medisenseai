import { cn } from '@/lib/utils'
import { RISK_COLORS } from '@/constants'
import type { RiskLevel } from '@/types'

interface RiskBadgeProps {
  level: RiskLevel | null | undefined
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW:      'Low Risk',
  MEDIUM:   'Medium Risk',
  HIGH:     'High Risk',
  CRITICAL: 'Critical',
}

export default function RiskBadge({ level, size = 'md', className }: RiskBadgeProps) {
  if (!level) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 rounded-full border font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs',
        'bg-surface-container-high text-on-surface-variant border-outline-variant/30',
        className
      )}>
        <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? 10 : size === 'lg' ? 16 : 12 }}>
          help
        </span>
        Unknown
      </span>
    )
  }

  const colors = RISK_COLORS[level]
  const isHighRisk = level === 'HIGH' || level === 'CRITICAL'

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border font-semibold',
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs',
      colors.bg,
      colors.text,
      colors.border,
      isHighRisk && 'risk-pulse-high',
      className
    )}>
      <span
        className={cn('material-symbols-outlined', colors.text)}
        style={{ fontSize: size === 'sm' ? 10 : size === 'lg' ? 16 : 12 }}
      >
        {level === 'LOW' ? 'check_circle' : level === 'MEDIUM' ? 'warning' : level === 'HIGH' ? 'error' : 'emergency'}
      </span>
      {RISK_LABELS[level]}
    </span>
  )
}