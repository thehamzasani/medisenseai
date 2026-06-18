import LoadingSkeleton from '@/components/shared/LoadingSkeleton'

export default function NewAssessmentLoading() {
  return (
    <div className="min-h-screen p-xl">
      {/* Header */}
      <div className="mb-8">
        <LoadingSkeleton height="h-4" width="w-40" rounded="rounded" className="mb-3" />
        <LoadingSkeleton height="h-9" width="w-72" rounded="rounded-lg" className="mb-2" />
        <LoadingSkeleton height="h-4" width="w-80" rounded="rounded" />
      </div>

      {/* Wizard layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left step nav */}
        <div className="col-span-3 surface-glass rounded-2xl p-6 flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high/30">
              <LoadingSkeleton height="h-8" width="w-8" rounded="rounded-lg" />
              <div className="flex-1 flex flex-col gap-1.5">
                <LoadingSkeleton height="h-3" width="w-24" rounded="rounded" />
                <LoadingSkeleton height="h-2" width="w-16" rounded="rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Right step content */}
        <div className="col-span-9 surface-glass rounded-2xl p-8">
          <LoadingSkeleton height="h-6" width="w-48" rounded="rounded-lg" className="mb-2" />
          <LoadingSkeleton height="h-4" width="w-72" rounded="rounded" className="mb-8" />

          <div className="grid grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <LoadingSkeleton height="h-3" width="w-24" rounded="rounded" />
                <LoadingSkeleton height="h-10" width="w-full" rounded="rounded-lg" />
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-between items-center">
            <LoadingSkeleton height="h-11" width="w-28" rounded="rounded-full" />
            <LoadingSkeleton height="h-11" width="w-28" rounded="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}