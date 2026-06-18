import { EngineResult } from '@/types'
import { ENGINE_DEFINITIONS } from '@/constants'

interface EngineMetricTableProps {
  engineResults: EngineResult[]
}

export default function EngineMetricTable({ engineResults }: EngineMetricTableProps) {
  const rows = ENGINE_DEFINITIONS.map(def => {
    const result = engineResults.find(r => r.engine === def.name)
    return {
      def,
      result,
    }
  })

  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <span
            key={i}
            className="material-symbols-outlined text-[14px]"
            style={{
              color: i <= count ? '#00dbe7' : '#3a494b',
              fontVariationSettings: i <= count ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            star
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="surface-glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary-fixed-dim">table_chart</span>
        <div>
          <h3 className="text-label-md font-semibold text-on-surface">Comprehensive Metric Matrix</h3>
          <p className="text-[11px] text-on-surface-variant mt-0.5">All 10 engines — performance & reliability data</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="text-left px-6 py-3 text-label-sm text-on-surface-variant uppercase tracking-wider">Engine</th>
              <th className="text-left px-4 py-3 text-label-sm text-on-surface-variant uppercase tracking-wider">Version</th>
              <th className="text-right px-4 py-3 text-label-sm text-on-surface-variant uppercase tracking-wider">Accuracy</th>
              <th className="text-right px-4 py-3 text-label-sm text-on-surface-variant uppercase tracking-wider">Inference ms</th>
              <th className="text-right px-4 py-3 text-label-sm text-on-surface-variant uppercase tracking-wider">False Pos Rate</th>
              <th className="text-center px-4 py-3 text-label-sm text-on-surface-variant uppercase tracking-wider">Reliability</th>
              <th className="text-center px-4 py-3 text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ def, result }, idx) => {
              const isBest = def.name === 'Neural Network'
              const isDeprecated = def.status === 'deprecated'

              return (
                <tr
                  key={def.name}
                  className={`border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/30 ${
                    isBest ? 'bg-primary-fixed-dim/5' : ''
                  } ${idx % 2 === 1 ? 'bg-surface-container-lowest/20' : ''}`}
                >
                  {/* Engine name + icon */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isBest
                          ? 'bg-primary-fixed-dim/15 border border-primary-fixed-dim/30'
                          : 'bg-surface-container-low/70 border border-outline-variant/20'
                      }`}>
                        <span className={`material-symbols-outlined text-[16px] ${
                          isBest ? 'text-primary-fixed-dim' : 'text-on-surface-variant'
                        }`}>{def.icon}</span>
                      </div>
                      <div>
                        <div className={`text-label-md font-semibold ${isBest ? 'text-primary-fixed-dim' : 'text-on-surface'}`}>
                          {def.name}
                          {isBest && (
                            <span className="ml-2 text-[10px] bg-primary-fixed-dim/10 text-primary-fixed-dim border border-primary-fixed-dim/20 px-1.5 py-0.5 rounded-full font-semibold">
                              BEST
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Version */}
                  <td className="px-4 py-3">
                    <span className="text-label-sm text-on-surface-variant">{def.version}</span>
                  </td>

                  {/* Accuracy */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1 rounded-full bg-outline-variant/20 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${((def.accuracy - 85) / 15) * 100}%`,
                            background: isBest
                              ? 'linear-gradient(90deg, #006a71, #00dbe7)'
                              : 'rgba(0, 219, 231, 0.4)',
                          }}
                        />
                      </div>
                      <span className={`text-label-md font-semibold tabular-nums ${
                        isBest ? 'text-primary-fixed-dim' : 'text-on-surface'
                      }`}>
                        {def.accuracy}%
                      </span>
                    </div>
                  </td>

                  {/* Inference ms */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-label-md tabular-nums text-on-surface">
                      {result?.inferenceMs ?? def.inferenceMs}
                      <span className="text-on-surface-variant text-[11px] ml-0.5">ms</span>
                    </span>
                  </td>

                  {/* False positive rate */}
                  <td className="px-4 py-3 text-right">
                    <span className={`text-label-md tabular-nums font-semibold ${
                      def.falsePositiveRate < 1
                        ? 'text-tertiary-fixed-dim'
                        : def.falsePositiveRate < 2
                        ? 'text-secondary'
                        : 'text-error'
                    }`}>
                      {def.falsePositiveRate.toFixed(2)}%
                    </span>
                  </td>

                  {/* Reliability stars */}
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      {renderStars(def.reliabilityStars)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${
                      isDeprecated
                        ? 'text-error bg-error/10 border-error/20'
                        : 'text-tertiary-fixed-dim bg-tertiary-fixed-dim/10 border-tertiary-fixed-dim/20'
                    }`}>
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: isDeprecated ? '#ffb4ab' : '#3cddc7' }}
                      />
                      {def.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-outline-variant/20 flex items-center justify-between">
        <span className="text-[11px] text-on-surface-variant">
          {rows.length} engines evaluated · Neural Network selected as primary
        </span>
        <span className="text-[11px] text-primary-fixed-dim flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
          All engines operational
        </span>
      </div>
    </div>
  )
}