import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'surface-glass rounded-xl p-lg',
        hover && 'cursor-pointer transition-all duration-300',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}