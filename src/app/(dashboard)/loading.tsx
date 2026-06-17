
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Page header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-surface-container-high rounded-lg mb-2" />
        <div className="h-4 w-48 bg-surface-container-high/60 rounded-lg" />
      </div>

      {/* Stats cards skeleton — 4 columns */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="surface-glass rounded-xl p-lg h-32 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-surface-container-high rounded-lg" />
              <div className="h-3 w-24 bg-surface-container-high rounded" />
            </div>
            <div className="h-7 w-20 bg-surface-container-high rounded" />
            <div className="h-3 w-16 bg-surface-container-high/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main content area skeleton */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* Risk profile grid */}
        <div className="col-span-8 surface-glass rounded-xl p-lg h-72">
          <div className="h-5 w-40 bg-surface-container-high rounded mb-4" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-surface-container-high/50 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Activity timeline */}
        <div className="col-span-4 surface-glass rounded-xl p-lg h-72">
          <div className="h-5 w-32 bg-surface-container-high rounded mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-3 w-3 rounded-full bg-surface-container-high mt-1 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 bg-surface-container-high rounded" />
                  <div className="h-2.5 w-20 bg-surface-container-high/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend chart skeleton */}
      <div className="surface-glass rounded-xl p-lg h-56">
        <div className="h-5 w-44 bg-surface-container-high rounded mb-4" />
        <div className="flex items-end gap-3 h-32">
          {[60, 80, 45, 90, 70, 85].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-surface-container-high rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}