import LoadingSkeleton from '@/components/shared/LoadingSkeleton'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen p-xl">
      {/* Header */}
      <div className="mb-8">
        <LoadingSkeleton height="h-4" width="w-36" rounded="rounded" className="mb-3" />
        <LoadingSkeleton height="h-9" width="w-56" rounded="rounded-lg" className="mb-2" />
        <LoadingSkeleton height="h-4" width="w-72" rounded="rounded" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Avatar card */}
          <div className="surface-glass rounded-2xl p-8 flex flex-col items-center gap-4">
            <LoadingSkeleton height="h-28" width="w-28" rounded="rounded-full" />
            <LoadingSkeleton height="h-6" width="w-40" rounded="rounded-lg" />
            <LoadingSkeleton height="h-4" width="w-48" rounded="rounded" />
            <LoadingSkeleton height="h-4" width="w-32" rounded="rounded" />
            <LoadingSkeleton height="h-8" width="w-36" rounded="rounded-full" />
          </div>

          {/* Stats card */}
          <div className="surface-glass rounded-2xl p-6">
            <LoadingSkeleton height="h-5" width="w-28" rounded="rounded" className="mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface-container-high/50 rounded-xl p-3 flex flex-col items-center gap-1.5">
                  <LoadingSkeleton height="h-8" width="w-10" rounded="rounded-lg" />
                  <LoadingSkeleton height="h-3" width="w-12" rounded="rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick info */}
          <div className="surface-glass rounded-2xl p-6">
            <LoadingSkeleton height="h-5" width="w-24" rounded="rounded" className="mb-4" />
            <div className="flex flex-col divide-y divide-outline-variant/20">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <LoadingSkeleton height="h-4" width="w-20" rounded="rounded" />
                  <LoadingSkeleton height="h-4" width="w-16" rounded="rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Personal info form */}
          <div className="surface-glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <LoadingSkeleton height="h-10" width="w-10" rounded="rounded-xl" />
              <div>
                <LoadingSkeleton height="h-5" width="w-44" rounded="rounded" className="mb-1.5" />
                <LoadingSkeleton height="h-3" width="w-56" rounded="rounded" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <LoadingSkeleton height="h-3" width="w-24" rounded="rounded" />
                  <LoadingSkeleton height="h-9" width="w-full" rounded="rounded" />
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <LoadingSkeleton height="h-11" width="w-36" rounded="rounded-full" />
            </div>
          </div>

          {/* Change password */}
          <div className="surface-glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <LoadingSkeleton height="h-10" width="w-10" rounded="rounded-xl" />
              <div>
                <LoadingSkeleton height="h-5" width="w-36" rounded="rounded" className="mb-1.5" />
                <LoadingSkeleton height="h-3" width="w-52" rounded="rounded" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-x-8 gap-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <LoadingSkeleton height="h-3" width="w-24" rounded="rounded" />
                  <LoadingSkeleton height="h-9" width="w-full" rounded="rounded" />
                </div>
              ))}
            </div>

            <LoadingSkeleton height="h-16" width="w-full" rounded="rounded-xl" className="mt-4" />

            <div className="flex justify-end mt-6">
              <LoadingSkeleton height="h-11" width="w-40" rounded="rounded-full" />
            </div>
          </div>

          {/* Danger zone */}
          <div className="surface-glass rounded-2xl p-8 border border-error/10">
            <div className="flex items-center gap-3 mb-4">
              <LoadingSkeleton height="h-10" width="w-10" rounded="rounded-xl" />
              <div>
                <LoadingSkeleton height="h-5" width="w-28" rounded="rounded" className="mb-1.5" />
                <LoadingSkeleton height="h-3" width="w-40" rounded="rounded" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-high/20 flex items-center justify-between">
              <div>
                <LoadingSkeleton height="h-4" width="w-28" rounded="rounded" className="mb-1.5" />
                <LoadingSkeleton height="h-3" width="w-56" rounded="rounded" />
              </div>
              <LoadingSkeleton height="h-10" width="w-32" rounded="rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}