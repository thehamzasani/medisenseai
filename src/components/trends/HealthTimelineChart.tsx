'use client'

import { useState } from 'react'
import type { AssessmentHistoryPoint, TimelinePredictionPoint } from '@/types'

interface HealthTimelineChartProps {
  historical: AssessmentHistoryPoint[]
  prediction: TimelinePredictionPoint[]
  confidenceUpper?: TimelinePredictionPoint[]
  confidenceLower?: TimelinePredictionPoint[]
  insight?: string
}

type MetricKey = 'overallHealthIndex' | 'diabetesRisk' | 'heartDiseaseRisk' | 'hypertensionRisk' | 'strokeRisk' | 'kidneyDiseaseRisk' | 'liverDiseaseRisk'

const METRICS: { key: MetricKey; label: string; color: string }[] = [
  { key: 'overallHealthIndex', label: 'Overall Health', color: '#00dbe7' },
  { key: 'diabetesRisk', label: 'Diabetes', color: '#ffb4ab' },
  { key: 'heartDiseaseRisk', label: 'Heart Disease', color: '#ff9b70' },
  { key: 'hypertensionRisk', label: 'Hypertension', color: '#f59e0b' },
  { key: 'strokeRisk', label: 'Stroke', color: '#a78bfa' },
  { key: 'kidneyDiseaseRisk', label: 'Kidney Disease', color: '#34d399' },
  { key: 'liverDiseaseRisk', label: 'Liver Disease', color: '#f472b6' },
]

function formatDateLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function HealthTimelineChart({
  historical,
  prediction,
  confidenceUpper,
  confidenceLower,
  insight,
}: HealthTimelineChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('overallHealthIndex')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const metric = METRICS.find(m => m.key === selectedMetric) ?? METRICS[0]
  const isInverse = selectedMetric !== 'overallHealthIndex'

  // Build combined data array: historical + prediction (with a separator)
  const historicalPoints = historical.map(h => ({
    date: h.date,
    value: h[selectedMetric] ?? 50,
    isHistorical: true as const,
    isPrediction: false as const,
  }))

  const predictionPoints = prediction.map(p => ({
    date: p.date,
    value: p[selectedMetric],
    isHistorical: false as const,
    isPrediction: true as const,
  }))

  const upperPoints = confidenceUpper?.map(p => p[selectedMetric]) ?? []
  const lowerPoints = confidenceLower?.map(p => p[selectedMetric]) ?? []

  const allPoints = [...historicalPoints, ...predictionPoints]
  const n = allPoints.length
  if (n === 0) return null

  const viewW = 1000
  const viewH = 280
  const padL = 48
  const padR = 24
  const padT = 24
  const padB = 44

  const chartW = viewW - padL - padR
  const chartH = viewH - padT - padB

  const allValues = allPoints.map(p => p.value)
  const allBounds = [...(upperPoints.length ? upperPoints : []), ...(lowerPoints.length ? lowerPoints : []), ...allValues]
  const dataMin = Math.min(...allBounds)
  const dataMax = Math.max(...allBounds)
  const range = dataMax - dataMin || 1
  const padRange = range * 0.1
  const yMin = Math.max(0, dataMin - padRange)
  const yMax = Math.min(100, dataMax + padRange)

  const getX = (i: number) => padL + (i / Math.max(n - 1, 1)) * chartW
  const getY = (v: number) => padT + chartH - ((v - yMin) / (yMax - yMin)) * chartH

  // Build paths
  const histLinePath = historicalPoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.value)}`
  ).join(' ')

  const histCount = historicalPoints.length
  const predLinePath = predictionPoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${getX(histCount + i)} ${getY(p.value)}`
  ).join(' ')

  // Confidence band path
  let bandPath = ''
  if (upperPoints.length && lowerPoints.length) {
    const upperPath = upperPoints.map((v, i) =>
      `${i === 0 ? 'M' : 'L'} ${getX(histCount + i)} ${getY(v)}`
    ).join(' ')
    const lowerPath = lowerPoints.map((v, i) =>
      `L ${getX(histCount + i)} ${getY(v)}`
    ).reverse().join(' ')
    bandPath = `${upperPath} ${lowerPath} Z`
  }

  const hovered = hoveredIdx !== null ? allPoints[hoveredIdx] : null

  // Y-axis ticks
  const yTicks = 5
  const yStep = (yMax - yMin) / yTicks

  return (
    <div className="surface-glass rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-headline-sm font-semibold text-on-surface">Health Timeline Forecast</h3>
          <p className="text-label-sm text-on-surface-variant mt-0.5">AI-predicted trajectory based on historical trends</p>
        </div>
        {insight && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-primary-fixed-dim/10 rounded-full border border-primary-fixed-dim/20">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[14px]">auto_awesome</span>
            <span className="text-[10px] text-primary-fixed-dim font-semibold uppercase tracking-wider">AI Projection</span>
          </div>
        )}
      </div>

      {/* Metric selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setSelectedMetric(m.key)}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${
              selectedMetric === m.key
                ? 'text-[#002022] shadow-sm'
                : 'text-on-surface-variant bg-surface-container-low border border-outline-variant/20 hover:text-on-surface'
            }`}
            style={selectedMetric === m.key ? { backgroundColor: m.color, color: '#002022' } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${viewW} ${viewH}`}
          className="w-full h-auto"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="predAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metric.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={metric.color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const v = yMin + yStep * i
            const y = getY(v)
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={viewW - padR} y2={y} stroke="rgba(58, 73, 75, 0.4)" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '4 4'} />
                <text x={padL - 8} y={y + 4} fill="rgba(185, 202, 203, 0.5)" fontSize="10" textAnchor="end" fontFamily="Inter">
                  {Math.round(v)}{isInverse ? '%' : ''}
                </text>
              </g>
            )
          })}

          {/* Separator line between historical and prediction */}
          {histCount > 0 && (
            <line
              x1={getX(histCount - 1)}
              y1={padT}
              x2={getX(histCount - 1)}
              y2={padT + chartH}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
              strokeDasharray="6 3"
            />
          )}

          {/* Confidence band */}
          {bandPath && (
            <path d={bandPath} fill={metric.color} opacity={0.1} />
          )}

          {/* Historical line */}
          {histLinePath && (
            <path d={histLinePath} fill="none" stroke={metric.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
          )}

          {/* Prediction line */}
          {predLinePath && (
            <path d={predLinePath} fill="none" stroke={metric.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 4" />
          )}

          {/* Historical data points */}
          {historicalPoints.map((p, i) => {
            const cx = getX(i)
            const cy = getY(p.value)
            const isHovered = hoveredIdx === i
            return (
              <g key={`hist-${i}`}>
                <rect x={cx - 20} y={padT} width={40} height={chartH} fill="transparent" onMouseEnter={() => setHoveredIdx(i)} style={{ cursor: 'crosshair' }} />
                <circle cx={cx} cy={cy} r={isHovered ? 6 : 3} fill={metric.color} stroke="#151b2d" strokeWidth="2" />
              </g>
            )
          })}

          {/* Prediction data points */}
          {predictionPoints.map((p, i) => {
            const idx = histCount + i
            const cx = getX(idx)
            const cy = getY(p.value)
            const isHovered = hoveredIdx === idx
            return (
              <g key={`pred-${i}`}>
                <rect x={cx - 20} y={padT} width={40} height={chartH} fill="transparent" onMouseEnter={() => setHoveredIdx(idx)} style={{ cursor: 'crosshair' }} />
                <circle cx={cx} cy={cy} r={isHovered ? 6 : 4} fill={metric.color} stroke="#151b2d" strokeWidth="2" opacity={0.85} />
              </g>
            )
          })}

          {/* Hover indicator line */}
          {hoveredIdx !== null && (
            <line x1={getX(hoveredIdx)} y1={padT} x2={getX(hoveredIdx)} y2={padT + chartH} stroke={metric.color} strokeWidth="1" strokeDasharray="4 4" opacity={0.4} />
          )}

          {/* X-axis labels */}
          {allPoints.filter((_p, i) => {
            if (n <= 8) return true
            return i % Math.ceil(n / 8) === 0 || i === n - 1
          }).map((p) => {
            const idx = allPoints.indexOf(p)
            return (
              <text key={idx} x={getX(idx)} y={viewH - 10} fill={hoveredIdx === idx ? metric.color : 'rgba(185, 202, 203, 0.6)'} fontSize="10" textAnchor="middle" fontFamily="Inter" fontWeight={hoveredIdx === idx ? '600' : '400'}>
                {formatDateLabel(p.date)}
              </text>
            )
          })}

          {/* Tooltip */}
          {hovered && hoveredIdx !== null && (() => {
            const cx = getX(hoveredIdx)
            const cy = getY(hovered.value)
            const tooltipX = cx > viewW - 200 ? cx - 190 : cx + 14
            const tooltipY = cy < 60 ? cy + 10 : cy - 70
            const isHistorical = hovered.isHistorical
            return (
              <g>
                <rect x={tooltipX} y={tooltipY} width={175} height={62} rx="8" fill="rgba(21, 27, 45, 0.95)" stroke={metric.color} strokeWidth="1" strokeOpacity="0.3" />
                <text x={tooltipX + 12} y={tooltipY + 18} fill={metric.color} fontSize="11" fontFamily="Inter" fontWeight="600">
                  {formatDateLabel(hovered.date)}
                </text>
                <text x={tooltipX + 12} y={tooltipY + 34} fill="#dce1fb" fontSize="11" fontFamily="Inter">
                  {metric.label}: <tspan fill={metric.color} fontWeight="600">{Math.round(hovered.value)}{isInverse ? '%' : ''}</tspan>
                </text>
                <text x={tooltipX + 12} y={tooltipY + 50} fill="rgba(185, 202, 203, 0.6)" fontSize="10" fontFamily="Inter">
                  {isHistorical ? 'Actual' : 'AI Predicted'}
                </text>
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 pt-3 border-t border-outline-variant/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 rounded-full bg-white/70" />
          <span className="text-[10px] text-on-surface-variant">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 rounded-full bg-white/70" style={{ backgroundImage: 'repeating-linear-gradient(to right, white 0, white 4px, transparent 4px, transparent 8px)' }} />
          <span className="text-[10px] text-on-surface-variant">AI Predicted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 rounded-sm" style={{ backgroundColor: metric.color, opacity: 0.15 }} />
          <span className="text-[10px] text-on-surface-variant">Confidence Band</span>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] text-on-surface-variant">
            Latest: <span className="text-primary-fixed-dim font-semibold">{Math.round(historicalPoints[historicalPoints.length - 1]?.value ?? 0)}{isInverse ? '%' : ''}</span>
            {' → '}Projected: <span className="font-semibold" style={{ color: metric.color }}>{Math.round(predictionPoints[predictionPoints.length - 1]?.value ?? 0)}{isInverse ? '%' : ''}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
