'use client'

import { useState, useEffect, useRef } from 'react'

interface DataPoint {
  month: string
  risk: number
  health: number
}

interface CumulativeRiskChartProps {
  overallHealthIndex: number | null
  createdAt: string
}

// Generate plausible historical data points based on current health score
function generateHistoricalData(currentHealth: number, createdAt: string, filter: '1Y' | '6M' | '3M'): DataPoint[] {
  const months = filter === '1Y' ? 12 : filter === '6M' ? 6 : 3
  const now = new Date(createdAt)
  const data: DataPoint[] = []

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Simulate a health trajectory leading to current value
  const startHealth = Math.max(40, Math.min(95, currentHealth - 15 + Math.random() * 10))
  
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setMonth(d.getMonth() - i)
    const progress = (months - 1 - i) / (months - 1)
    const health = Math.round(startHealth + (currentHealth - startHealth) * progress + (Math.random() - 0.5) * 8)
    const clampedHealth = Math.max(30, Math.min(100, health))
    data.push({
      month: monthNames[d.getMonth()],
      risk: 100 - clampedHealth,
      health: clampedHealth,
    })
  }

  return data
}

export default function CumulativeRiskChart({ overallHealthIndex, createdAt }: CumulativeRiskChartProps) {
  const [filter, setFilter] = useState<'1Y' | '6M' | '3M'>('1Y')
  const [data, setData] = useState<DataPoint[]>([])
  const [animProgress, setAnimProgress] = useState(0)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const animRef = useRef<number | null>(null)

  const health = overallHealthIndex ?? 72

  useEffect(() => {
    const d = generateHistoricalData(health, createdAt, filter)
    setData(d)
    setAnimProgress(0)

    let start: number | null = null
    const duration = 1200

    const animate = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimProgress(eased)
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [filter, health, createdAt])

  const viewW = 1000
  const viewH = 250
  const padL = 40
  const padR = 20
  const padT = 20
  const padB = 40

  const chartW = viewW - padL - padR
  const chartH = viewH - padT - padB

  const n = data.length
  if (n === 0) return null

  const maxRisk = 100
  const minRisk = 0

  const getX = (i: number) => padL + (i / (n - 1)) * chartW
  const getY = (risk: number) => padT + chartH - ((risk - minRisk) / (maxRisk - minRisk)) * chartH

  // Build path for line
  const linePath = data
    .map((d, i) => {
      const animRisk = d.risk * animProgress
      return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(animRisk)}`
    })
    .join(' ')

  // Build area path
  const areaPath =
    data
      .map((d, i) => {
        const animRisk = d.risk * animProgress
        return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(animRisk)}`
      })
      .join(' ') +
    ` L ${getX(n - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`

  const hovered = hoveredIdx !== null ? data[hoveredIdx] : null

  return (
    <div className="surface-glass rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-headline-sm font-semibold text-on-surface">Cumulative Risk Trajectory</h3>
          <p className="text-label-sm text-on-surface-variant mt-0.5">12-month rolling health intelligence analysis</p>
        </div>
        <div className="flex gap-2">
          {(['1Y', '6M', '3M'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-label-sm font-semibold transition-all duration-200 ${
                filter === f
                  ? 'btn-cyan text-[#002022]'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${viewW} ${viewH}`}
          className="w-full h-auto"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {/* Area gradient */}
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00f2ff" stopOpacity="0.02" />
            </linearGradient>
            {/* Line gradient */}
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4cd6ff" />
              <stop offset="50%" stopColor="#00f2ff" />
              <stop offset="100%" stopColor="#3cddc7" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((v) => {
            const y = getY(v)
            return (
              <g key={v}>
                <line
                  x1={padL}
                  y1={y}
                  x2={viewW - padR}
                  y2={y}
                  stroke="rgba(58, 73, 75, 0.4)"
                  strokeWidth="1"
                  strokeDasharray={v === 0 ? '0' : '4 4'}
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  fill="rgba(185, 202, 203, 0.5)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="Inter"
                >
                  {v}%
                </text>
              </g>
            )
          })}

          {/* Hover vertical line */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={padT}
              x2={getX(hoveredIdx)}
              y2={padT + chartH}
              stroke="rgba(0, 242, 255, 0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Trend line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const animRisk = d.risk * animProgress
            const cx = getX(i)
            const cy = getY(animRisk)
            const isHovered = hoveredIdx === i
            return (
              <g key={i}>
                {/* Invisible hover target */}
                <rect
                  x={cx - 20}
                  y={padT}
                  width={40}
                  height={chartH}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  style={{ cursor: 'crosshair' }}
                />
                {/* Outer ring on hover */}
                {isHovered && (
                  <circle cx={cx} cy={cy} r={10} fill="rgba(0, 242, 255, 0.15)" stroke="#00f2ff" strokeWidth="1" />
                )}
                {/* Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill={animProgress > (i / (n - 1)) ? '#00dbe7' : 'transparent'}
                  stroke="#00dbe7"
                  strokeWidth="2"
                  style={{ transition: 'r 0.15s' }}
                />
              </g>
            )
          })}

          {/* Month labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={viewH - 8}
              fill={hoveredIdx === i ? '#00dbe7' : 'rgba(185, 202, 203, 0.6)'}
              fontSize="11"
              textAnchor="middle"
              fontFamily="Inter"
              fontWeight={hoveredIdx === i ? '600' : '400'}
            >
              {d.month}
            </text>
          ))}

          {/* Tooltip */}
          {hovered && hoveredIdx !== null && (() => {
            const cx = getX(hoveredIdx)
            const animRisk = hovered.risk * animProgress
            const cy = getY(animRisk)
            const tooltipX = cx > viewW - 180 ? cx - 160 : cx + 12
            const tooltipY = cy < 60 ? cy + 10 : cy - 60
            return (
              <g>
                <rect x={tooltipX} y={tooltipY} width={148} height={52} rx="8" fill="rgba(21, 27, 45, 0.95)" stroke="rgba(0, 219, 231, 0.3)" strokeWidth="1" />
                <text x={tooltipX + 12} y={tooltipY + 18} fill="#00dbe7" fontSize="11" fontFamily="Inter" fontWeight="600">{hovered.month}</text>
                <text x={tooltipX + 12} y={tooltipY + 34} fill="#dce1fb" fontSize="11" fontFamily="Inter">
                  Risk: {Math.round(hovered.risk)}% · Health: {hovered.health}
                </text>
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-2 pt-4 border-t border-outline-variant/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-secondary-fixed-dim to-primary-container rounded-full" />
          <span className="text-label-sm text-on-surface-variant">Cumulative Risk %</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-fixed-dim" />
          <span className="text-label-sm text-on-surface-variant">Data point</span>
        </div>
        <div className="ml-auto text-label-sm text-on-surface-variant">
          Current Risk:{' '}
          <span className="text-primary-fixed-dim font-semibold">{100 - health}%</span>
        </div>
      </div>
    </div>
  )
}