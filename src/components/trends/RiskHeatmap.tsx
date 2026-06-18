'use client'

import { useState } from 'react'

interface RiskHeatmapProps {
  overallHealthIndex: number | null
  createdAt: string
}

function generateCells(health: number, createdAt: string): Array<{ day: string; value: number; date: string }> {
  const base = new Date(createdAt)
  const cells = []

  for (let i = 27; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(d.getDate() - i)
    // Simulate day-level health variation
    const noise = (Math.sin(i * 1.3) * 8 + Math.cos(i * 2.1) * 5)
    const val = Math.max(20, Math.min(100, health + noise))
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    cells.push({
      day: dayNames[d.getDay()],
      value: Math.round(val),
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })
  }

  return cells
}

function getHeatColor(value: number): { bg: string; border: string } {
  if (value >= 80) return { bg: 'rgba(60, 221, 199, 0.7)', border: 'rgba(60, 221, 199, 0.9)' }
  if (value >= 65) return { bg: 'rgba(0, 219, 231, 0.5)', border: 'rgba(0, 219, 231, 0.7)' }
  if (value >= 50) return { bg: 'rgba(166, 230, 255, 0.35)', border: 'rgba(166, 230, 255, 0.5)' }
  if (value >= 35) return { bg: 'rgba(255, 180, 171, 0.3)', border: 'rgba(255, 180, 171, 0.5)' }
  return { bg: 'rgba(255, 180, 171, 0.6)', border: 'rgba(255, 180, 171, 0.8)' }
}

export default function RiskHeatmap({ overallHealthIndex, createdAt }: RiskHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ idx: number; x: number; y: number } | null>(null)

  const health = overallHealthIndex ?? 72
  const cells = generateCells(health, createdAt)

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="surface-glass rounded-2xl p-6 h-full">
      <div className="mb-5">
        <h3 className="text-headline-sm font-semibold text-on-surface">Health Heatmap</h3>
        <p className="text-label-sm text-on-surface-variant mt-0.5">28-day activity grid</p>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-1">
        {dayLabels.map((d) => (
          <div key={d} className="text-center text-[10px] text-on-surface-variant font-semibold">
            {d}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-7 gap-1.5 relative">
        {cells.map((cell, i) => {
          const colors = getHeatColor(cell.value)
          const isHovered = tooltip?.idx === i
          return (
            <div
              key={i}
              className="aspect-square rounded-lg cursor-pointer transition-all duration-150"
              style={{
                background: colors.bg,
                border: `1px solid ${isHovered ? colors.border : 'rgba(58,73,75,0.3)'}`,
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                boxShadow: isHovered ? `0 0 8px ${colors.border}` : 'none',
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setTooltip({ idx: i, x: rect.left, y: rect.top })
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          )
        })}

        {/* Tooltip */}
        {tooltip !== null && cells[tooltip.idx] && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              bottom: `${Math.floor(tooltip.idx / 7) === 3 ? '100%' : 'auto'}`,
              top: Math.floor(tooltip.idx / 7) < 3 ? '100%' : 'auto',
              left: `${(tooltip.idx % 7) * (100 / 7)}%`,
            }}
          >
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap ml-2 mt-1">
              <div className="text-label-sm font-semibold text-on-surface">{cells[tooltip.idx].date}</div>
              <div className="text-label-sm text-primary-fixed-dim">Health: {cells[tooltip.idx].value}</div>
            </div>
          </div>
        )}
      </div>

      {/* Color legend */}
      <div className="mt-5 space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Health Score Legend</div>
        <div className="flex items-center gap-2">
          {[
            { label: '80+', bg: 'rgba(60,221,199,0.7)' },
            { label: '65+', bg: 'rgba(0,219,231,0.5)' },
            { label: '50+', bg: 'rgba(166,230,255,0.35)' },
            { label: '35+', bg: 'rgba(255,180,171,0.3)' },
            { label: '<35', bg: 'rgba(255,180,171,0.6)' },
          ].map(({ label, bg }) => (
            <div key={label} className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded"
                style={{ background: bg, border: '1px solid rgba(58,73,75,0.4)' }}
              />
              <span className="text-[10px] text-on-surface-variant">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-outline-variant/10 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">Avg Score</div>
          <div className="text-headline-sm font-bold text-primary-fixed-dim">
            {Math.round(cells.reduce((s, c) => s + c.value, 0) / cells.length)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">Best Day</div>
          <div className="text-headline-sm font-bold text-tertiary-fixed-dim">
            {Math.max(...cells.map((c) => c.value))}
          </div>
        </div>
      </div>
    </div>
  )
}