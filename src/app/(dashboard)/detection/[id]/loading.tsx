import LoadingSkeleton from '@/components/shared/LoadingSkeleton'

export default function DetectionLoading() {
  return (
    <div className="min-h-screen p-xl">
      {/* Header */}
      <div className="mb-8">
        <LoadingSkeleton height="h-4" width="w-44" rounded="rounded" className="mb-3" />
        <LoadingSkeleton height="h-9" width="w-80" rounded="rounded-lg" className="mb-2" />
        <LoadingSkeleton height="h-4" width="w-60" rounded="rounded" />
      </div>

      {/* Assessment selector */}
      <LoadingSkeleton height="h-12" width="w-full" rounded="rounded-xl" className="mb-6" />

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Anomaly detection panel */}
        <div className="col-span-7 surface-glass rounded-2xl p-6 h-[560px] flex flex-col">
          <LoadingSkeleton height="h-5" width="w-40" rounded="rounded" className="mb-4" />
          <div className="flex-1 relative rounded-xl overflow-hidden bg-surface-container-high/30">
            {/* Radar grid shimmer */}
            <div className="absolute inset-0 animate-pulse opacity-30"
                 style={{
                   backgroundImage: 'radial-gradient(circle, rgba(0,219,231,0.2) 1px, transparent 1px)',
                   backgroundSize: '30px 30px',
                 }}
            />
            {/* Spinning ring placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-primary-fixed-dim/20 animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-5 flex flex-col gap-6">
          {/* Condition confidence */}
          <div className="surface-glass rounded-2xl p-6 flex-1">
            <LoadingSkeleton height="h-5" width="w-40" rounded="rounded" className="mb-4" />
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <LoadingSkeleton height="h-4" width="w-32" rounded="rounded" />
                    <LoadingSkeleton height="h-4" width="w-12" rounded="rounded" />
                  </div>
                  <LoadingSkeleton height="h-2" width="w-full" rounded="rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Urgent intervention */}
          <div className="surface-glass rounded-2xl p-6 flex-1">
            <LoadingSkeleton height="h-5" width="w-36" rounded="rounded" className="mb-4" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-container-high/30 flex items-start gap-3">
                  <LoadingSkeleton height="h-6" width="w-6" rounded="rounded" />
                  <div className="flex-1">
                    <LoadingSkeleton height="h-4" width="w-36" rounded="rounded" className="mb-1.5" />
                    <LoadingSkeleton height="h-3" width="w-48" rounded="rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Genetic marker grid */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-glass rounded-2xl p-5">
            <LoadingSkeleton height="h-5" width="w-24" rounded="rounded" className="mb-2" />
            <LoadingSkeleton height="h-3" width="w-full" rounded="rounded" className="mb-4" />
            <LoadingSkeleton height="h-2" width="w-full" rounded="rounded-full" className="mb-2" />
            <LoadingSkeleton height="h-6" width="w-16" rounded="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}