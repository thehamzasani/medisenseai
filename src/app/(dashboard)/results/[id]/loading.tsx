export default function ResultsLoading() {
  return (
    <div className="relative min-h-screen p-xl animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-surface-container-high rounded-full" />
          <div className="h-8 w-64 bg-surface-container-high rounded-xl" />
          <div className="h-4 w-80 bg-surface-container-high rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-surface-container-high rounded-xl" />
          <div className="h-10 w-32 bg-surface-container-high rounded-xl" />
        </div>
      </div>

      {/* Selector skeleton */}
      <div className="mb-6 h-10 w-72 bg-surface-container-high rounded-xl" />

      {/* Patient summary skeleton */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-8 bg-surface-container-high rounded-2xl h-64" />
        <div className="col-span-4 bg-surface-container-high rounded-2xl h-64" />
      </div>

      {/* Disease cards top row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-surface-container-high rounded-2xl h-48" />
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2 bg-surface-container-high rounded-2xl h-48" />
        <div className="col-span-1 bg-surface-container-high rounded-2xl h-48" />
      </div>

      {/* Kidney + Liver */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-high rounded-2xl h-40" />
        <div className="bg-surface-container-high rounded-2xl h-40" />
      </div>
    </div>
  )
}