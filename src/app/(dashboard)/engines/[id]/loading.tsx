import LoadingSkeleton from '@/components/shared/LoadingSkeleton'

export default function EnginesLoading() {
  return (
    <div className="min-h-screen p-xl">
      {/* Header */}
      <div className="mb-8">
        <LoadingSkeleton height="h-4" width="w-36" rounded="rounded" className="mb-3" />
        <LoadingSkeleton height="h-9" width="w-72" rounded="rounded-lg" className="mb-2" />
        <LoadingSkeleton height="h-4" width="w-56" rounded="rounded" />
      </div>

      {/* Assessment selector */}
      <LoadingSkeleton height="h-12" width="w-full" rounded="rounded-xl" className="mb-6" />

      {/* Best model spotlight */}
      <div className="surface-glass rounded-2xl p-8 mb-6">
        <div className="flex items-center gap-8">
          <LoadingSkeleton height="h-32" width="w-32" rounded="rounded-full" />
          <div className="flex-1">
            <LoadingSkeleton height="h-4" width="w-40" rounded="rounded" className="mb-3" />
            <LoadingSkeleton height="h-7" width="w-56" rounded="rounded-lg" className="mb-2" />
            <LoadingSkeleton height="h-4" width="w-80" rounded="rounded" className="mb-6" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface-container-high/50 rounded-xl p-3">
                  <LoadingSkeleton height="h-3" width="w-16" rounded="rounded" className="mb-2" />
                  <LoadingSkeleton height="h-6" width="w-12" rounded="rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Engine cards grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={`surface-glass rounded-2xl p-5 ${i === 5 ? 'col-span-2' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <LoadingSkeleton height="h-8" width="w-8" rounded="rounded-lg" />
              <LoadingSkeleton height="h-6" width="w-14" rounded="rounded-full" />
            </div>
            <LoadingSkeleton height="h-5" width="w-28" rounded="rounded" className="mb-1" />
            <LoadingSkeleton height="h-3" width="w-full" rounded="rounded" className="mb-4" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex flex-col gap-1">
                  <LoadingSkeleton height="h-2.5" width="w-16" rounded="rounded" />
                  <LoadingSkeleton height="h-1.5" width="w-full" rounded="rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Metric table */}
      <div className="surface-glass rounded-2xl p-6">
        <LoadingSkeleton height="h-5" width="w-48" rounded="rounded" className="mb-4" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-outline-variant/20">
              <LoadingSkeleton height="h-4" width="w-32" rounded="rounded" />
              <LoadingSkeleton height="h-4" width="w-16" rounded="rounded" />
              <LoadingSkeleton height="h-4" width="w-16" rounded="rounded" />
              <LoadingSkeleton height="h-4" width="w-24" rounded="rounded" />
              <LoadingSkeleton height="h-6" width="w-16" rounded="rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}