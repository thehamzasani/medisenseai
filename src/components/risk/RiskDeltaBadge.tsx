'use client'

import type { TrendDirection } from '@/types'
import { cn } from '@/lib/utils'

interface RiskDeltaBadgeProps {
  delta: number
  trend: TrendDirection
  className?: string
  size?: 'sm' | 'md'
}

export default function RiskDeltaBadge({ delta, trend, className, size = 'sm' }: RiskDeltaBadgeProps) {
  if (trend === 'stable') {
    return (
      <span className={cn(
        'inline-flex items-center gap-0.5 font-semibold',
        size === 'sm' ? 'text-[10px]' : 'text-xs',
        'text-on-surface-variant',
        className,
      )}>
        <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? 10 : 12 }}>remove</span>
        stable
      </span>
    )
  }

  const isWorsening = trend === 'worsening'

  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 font-semibold rounded-md px-1.5 py-0.5',
      size === 'sm' ? 'text-[10px]' : 'text-xs',
      isWorsening
        ? 'text-error bg-error/10'
        : 'text-tertiary-fixed-dim bg-tertiary-fixed-dim/10',
      className,
    )}>
      <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? 10 : 12 }}>
        {isWorsening ? 'trending_up' : 'trending_down'}
      </span>
      {isWorsening ? '+' : ''}{delta.toFixed(1)}
    </span>
  )
}
