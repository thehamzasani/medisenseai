'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { AssessmentListItem } from '@/types'
import { formatDate } from '@/lib/utils'

interface HealthTrendChartProps {
  assessments: AssessmentListItem[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  const score = payload[0].value

  return (
    <div className="surface-glass rounded-xl p-md border border-primary-fixed-dim/20 shadow-xl">
      <p className="text-label-sm text-on-surface-variant mb-1">{label}</p>
      <p className="text-headline-sm font-bold text-primary-fixed-dim tabular-nums">
        {score} <span className="text-label-sm font-normal text-on-surface-variant">/ 100</span>
      </p>
      <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-wider">
        Health Score
      </p>
    </div>
  )
}

export default function HealthTrendChart({ assessments }: HealthTrendChartProps) {
  const completed = assessments
    .filter((a) => a.analysisStatus === 'COMPLETE' && a.overallHealthIndex != null)
    .slice(-6)
    .reverse()

  if (completed.length < 2) {
    return (
      <div className="surface-glass rounded-xl p-lg flex flex-col items-center justify-center h-[220px]">
        <span className="material-symbols-outlined text-on-surface-variant mb-3" style={{ fontSize: '40px' }}>
          bar_chart
        </span>
        <p className="text-body-md text-on-surface-variant text-center">
          Complete at least 2 assessments to see your health trend
        </p>
        <p className="text-label-sm text-on-surface-variant/60 mt-1">
          {completed.length} / 2 assessments complete
        </p>
      </div>
    )
  }

  const data = completed.map((a) => ({
    date: formatDate(a.createdAt).split(',')[0], // "May 19"
    score: a.overallHealthIndex ?? 0,
    id: a.id,
  }))

  return (
    <div className="surface-glass rounded-xl p-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-label-md font-semibold text-on-surface uppercase tracking-wider">
            Health Score Trend
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-0.5">Last {data.length} assessments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary-fixed-dim" />
          <span className="text-[10px] text-on-surface-variant">Health Index</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={32} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(185,202,203,0.07)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: '#b9cacb', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#b9cacb', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,219,231,0.05)' }} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.score >= 80
                    ? '#3cddc7'
                    : entry.score >= 60
                    ? '#00dbe7'
                    : entry.score >= 40
                    ? '#f59e0b'
                    : '#ffb4ab'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}