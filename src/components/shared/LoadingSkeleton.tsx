import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  height?:    string
  width?:     string
  rounded?:   string
}

export default function LoadingSkeleton({
  className,
  height  = 'h-4',
  width   = 'w-full',
  rounded = 'rounded',
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-surface-container-high animate-pulse',
        height,
        width,
        rounded,
        className,
      )}
    />
  )
}