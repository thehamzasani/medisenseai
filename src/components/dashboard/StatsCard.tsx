import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface StatsCardProps {
  icon: string
  label: string
  value: ReactNode
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  className?: string
}

export default function StatsCard({
  icon,
  label,
  value,
  change,
  changeType = 'neutral',
  className,
}: StatsCardProps) {
  const changeColor =
    changeType === 'positive'
      ? 'text-tertiary-fixed-dim'
      : changeType === 'negative'
      ? 'text-error'
      : 'text-on-surface-variant'

  const changeIcon =
    changeType === 'positive'
      ? 'trending_up'
      : changeType === 'negative'
      ? 'trending_down'
      : 'remove'

  return (
    <div
      className={cn(
        'surface-glass rounded-xl p-lg flex flex-col gap-3 relative overflow-hidden group transition-all duration-300',
        className
      )}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed-dim/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />

      {/* Icon row */}
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-primary-fixed-dim/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: '20px' }}>
            {icon}
          </span>
        </div>
        {change && (
          <div className={cn('flex items-center gap-1', changeColor)}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {changeIcon}
            </span>
            <span className="text-label-sm font-semibold">{change}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex flex-col gap-1">
        <div className="text-headline-md font-bold text-on-surface tabular-nums">{value}</div>
        <div className="text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</div>
      </div>
    </div>
  )
}