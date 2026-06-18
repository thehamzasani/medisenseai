
export default function HistoryLoading() {
  return (
    <div className="p-xl space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-3 w-32 bg-surface-container-high rounded" />
        <div className="h-8 w-56 bg-surface-container-high rounded" />
        <div className="h-4 w-80 bg-surface-container-high rounded" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 h-80 bg-surface-container-high rounded-2xl" />
        <div className="col-span-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[92px] bg-surface-container-high rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="h-96 bg-surface-container-high rounded-2xl" />

      {/* Neural insight card */}
      <div className="h-40 bg-surface-container-high rounded-2xl" />
    </div>
  )
}