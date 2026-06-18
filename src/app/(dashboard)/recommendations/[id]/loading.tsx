import LoadingSkeleton from '@/components/shared/LoadingSkeleton'

export default function RecommendationsLoading() {
  return (
    <div className="min-h-screen p-xl">
      {/* Header */}
      <div className="mb-8">
        <LoadingSkeleton height="h-4" width="w-44" rounded="rounded" className="mb-3" />
        <LoadingSkeleton height="h-9" width="w-72" rounded="rounded-lg" className="mb-2" />
        <LoadingSkeleton height="h-4" width="w-56" rounded="rounded" />
      </div>

      {/* Assessment selector */}
      <LoadingSkeleton height="h-12" width="w-full" rounded="rounded-xl" className="mb-6" />

      {/* Top row: primary directive + medication sync */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Primary directive */}
        <div className="col-span-8 surface-glass rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <LoadingSkeleton height="h-16" width="w-16" rounded="rounded-2xl" />
            <div className="flex-1">
              <LoadingSkeleton height="h-3" width="w-40" rounded="rounded" className="mb-3" />
              <LoadingSkeleton height="h-7" width="w-72" rounded="rounded-lg" className="mb-3" />
              <LoadingSkeleton height="h-4" width="w-full" rounded="rounded" className="mb-1.5" />
              <LoadingSkeleton height="h-4" width="w-4/5" rounded="rounded" className="mb-6" />
              <div className="flex items-center gap-3">
                <LoadingSkeleton height="h-12" width="w-40" rounded="rounded-full" />
                <LoadingSkeleton height="h-12" width="w-48" rounded="rounded-full" />
                <LoadingSkeleton height="h-10" width="w-16" rounded="rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Medication sync */}
        <div className="col-span-4 surface-glass rounded-2xl p-6">
          <LoadingSkeleton height="h-5" width="w-36" rounded="rounded" className="mb-4" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/30">
                <div className="flex-1">
                  <LoadingSkeleton height="h-4" width="w-28" rounded="rounded" className="mb-1.5" />
                  <LoadingSkeleton height="h-3" width="w-36" rounded="rounded" />
                </div>
                <LoadingSkeleton height="h-6" width="w-16" rounded="rounded-full" />
              </div>
            ))}
          </div>
          <LoadingSkeleton height="h-11" width="w-full" rounded="rounded-full" className="mt-4" />
        </div>
      </div>

      {/* Bottom row: lifestyle + care pathway */}
      <div className="grid grid-cols-12 gap-6">
        {/* Lifestyle engine */}
        <div className="col-span-7 surface-glass rounded-2xl p-6">
          <LoadingSkeleton height="h-5" width="w-36" rounded="rounded" className="mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-surface-container-high/30 rounded-xl p-4">
                <LoadingSkeleton height="h-4" width="w-28" rounded="rounded" className="mb-3" />
                <LoadingSkeleton height="h-8" width="w-16" rounded="rounded-lg" className="mb-2" />
                <LoadingSkeleton height="h-3" width="w-full" rounded="rounded" />
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-surface-container-high/30 flex items-center justify-between">
            <LoadingSkeleton height="h-4" width="w-32" rounded="rounded" />
            <LoadingSkeleton height="h-6" width="w-12" rounded="rounded-full" />
          </div>
        </div>

        {/* Care pathway */}
        <div className="col-span-5 surface-glass rounded-2xl p-6">
          <LoadingSkeleton height="h-5" width="w-36" rounded="rounded" className="mb-4" />
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <LoadingSkeleton height="h-3" width="w-3" rounded="rounded-full" />
                  {i < 2 && <div className="w-px h-12 bg-surface-container-high mt-1" />}
                </div>
                <div className="flex-1">
                  <LoadingSkeleton height="h-3" width="w-24" rounded="rounded" className="mb-1.5" />
                  <LoadingSkeleton height="h-4" width="w-36" rounded="rounded" className="mb-1.5" />
                  <LoadingSkeleton height="h-3" width="w-48" rounded="rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <LoadingSkeleton height="h-4" width="w-32" rounded="rounded" className="mb-2" />
            <LoadingSkeleton height="h-4" width="w-full" rounded="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}