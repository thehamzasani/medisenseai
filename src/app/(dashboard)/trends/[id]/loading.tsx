// src/app/(dashboard)/trends/[id]/loading.tsx
export default function TrendsLoading() {
  return (
    <div className="p-xl space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-surface-container-high rounded" />
          <div className="h-8 w-64 bg-surface-container-high rounded" />
          <div className="h-4 w-80 bg-surface-container-high rounded" />
        </div>
        <div className="h-10 w-48 bg-surface-container-high rounded-lg" />
      </div>

      {/* Chart */}
      <div className="h-72 bg-surface-container-high rounded-2xl" />

      {/* 3 cards */}
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 bg-surface-container-high rounded-2xl" />
        ))}
      </div>

      {/* Table + heatmap */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 h-80 bg-surface-container-high rounded-2xl" />
        <div className="col-span-4 h-80 bg-surface-container-high rounded-2xl" />
      </div>
    </div>
  )
}