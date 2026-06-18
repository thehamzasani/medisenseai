export default function DashboardLoading() {
  return (
    <div className="min-h-screen p-xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="w-32 h-3 rounded bg-surface-container-high mb-3" />
        <div className="w-72 h-9 rounded-lg bg-surface-container-high mb-2" />
        <div className="w-96 h-5 rounded bg-surface-container-high" />
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="surface-glass rounded-xl p-lg flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high" />
            <div className="w-20 h-8 rounded bg-surface-container-high" />
            <div className="w-28 h-3 rounded bg-surface-container-high" />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Risk grid */}
        <div className="col-span-12 lg:col-span-5">
          <div className="w-40 h-4 rounded bg-surface-container-high mb-3" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="surface-glass rounded-xl p-md flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high" />
                  <div className="w-16 h-5 rounded-full bg-surface-container-high" />
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container-high" />
                <div className="flex justify-between">
                  <div className="w-10 h-5 rounded bg-surface-container-high" />
                  <div className="w-24 h-3 rounded bg-surface-container-high" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="col-span-12 lg:col-span-4">
          <div className="w-32 h-4 rounded bg-surface-container-high mb-3" />
          <div className="surface-glass rounded-xl p-lg h-[220px] flex items-end gap-3 px-6 pb-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-surface-container-high"
                style={{ height: `${40 + Math.random() * 120}px` }}
              />
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="col-span-12 lg:col-span-3">
          <div className="w-36 h-4 rounded bg-surface-container-high mb-3" />
          <div className="surface-glass rounded-xl p-lg flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="w-full h-4 rounded bg-surface-container-high" />
                  <div className="w-20 h-3 rounded bg-surface-container-high" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}