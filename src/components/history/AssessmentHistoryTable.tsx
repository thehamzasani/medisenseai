
'use client'

import { useRouter } from 'next/navigation'
import type { AssessmentWithResults } from '@/types'
import { formatDate } from '@/lib/utils'

interface AssessmentHistoryTableProps {
  assessments: AssessmentWithResults[]
}

const levelColors: Record<string, string> = {
  LOW: 'text-tertiary-fixed-dim bg-tertiary-fixed-dim/10',
  MEDIUM: 'text-secondary bg-secondary/10',
  HIGH: 'text-error bg-error/10',
  CRITICAL: 'text-error bg-error/20',
}

const levelDot: Record<string, string> = {
  LOW: 'bg-tertiary-fixed-dim',
  MEDIUM: 'bg-secondary',
  HIGH: 'bg-error animate-pulse',
  CRITICAL: 'bg-error animate-pulse',
}

function RiskDot({ level }: { level: string | null }) {
  if (!level) return <span className="text-on-surface-variant text-label-sm">—</span>
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${levelColors[level] ?? ''}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${levelDot[level] ?? 'bg-on-surface-variant'}`} />
      {level.charAt(0) + level.slice(1).toLowerCase()}
    </span>
  )
}

function HealthBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-on-surface-variant">—</span>
  const color = value >= 80 ? '#3cddc7' : value >= 60 ? '#a6e6ff' : value >= 40 ? '#f59e0b' : '#ffb4ab'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-label-sm font-semibold tabular-nums" style={{ color }}>{value}</span>
    </div>
  )
}

export default function AssessmentHistoryTable({ assessments }: AssessmentHistoryTableProps) {
  const router = useRouter()

  if (assessments.length === 0) {
    return (
      <div className="surface-glass rounded-2xl p-12 text-center">
        <span className="material-symbols-outlined text-primary-fixed-dim text-[48px] mb-4 block">history</span>
        <h3 className="text-headline-sm font-semibold text-on-surface mb-2">No assessments yet</h3>
        <p className="text-body-md text-on-surface-variant">Complete your first assessment to see history here.</p>
      </div>
    )
  }

  return (
    <div className="surface-glass rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
        <h3 className="text-headline-sm font-semibold text-on-surface">Assessment Records</h3>
        <span className="text-label-sm text-on-surface-variant">{assessments.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/10">
              {['Date', 'Health Score', 'BMI', 'Blood Pressure', 'Glucose', 'Risk Profile', 'Status', ''].map((col) => (
                <th
                  key={col}
                  className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr
                key={a.id}
                onClick={() => router.push(`/results/${a.id}`)}
                className="border-b border-outline-variant/10 hover:bg-surface-container-high/40 transition-colors cursor-pointer group"
              >
                {/* Date */}
                <td className="px-6 py-4">
                  <div>
                    <div className="text-label-md font-semibold text-on-surface group-hover:text-primary-fixed-dim transition-colors">
                      {formatDate(a.createdAt)}
                    </div>
                    {a.label && (
                      <div className="text-[11px] text-on-surface-variant mt-0.5">{a.label}</div>
                    )}
                  </div>
                </td>

                {/* Health Score */}
                <td className="px-6 py-4">
                  <HealthBar value={a.overallHealthIndex} />
                </td>

                {/* BMI */}
                <td className="px-6 py-4">
                  <span className="text-label-sm tabular-nums text-on-surface">{a.bmi.toFixed(1)}</span>
                </td>

                {/* BP */}
                <td className="px-6 py-4">
                  <span className="text-label-sm tabular-nums text-on-surface">
                    {a.systolicBP}/{a.diastolicBP}
                    <span className="text-on-surface-variant text-[10px] ml-1">mmHg</span>
                  </span>
                </td>

                {/* Glucose */}
                <td className="px-6 py-4">
                  <span className="text-label-sm tabular-nums text-on-surface">
                    {a.fastingGlucose}
                    <span className="text-on-surface-variant text-[10px] ml-1">mg/dL</span>
                  </span>
                </td>

                {/* Risk Profile — top 3 diseases */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    <RiskDot level={a.diabetesLevel} />
                    <RiskDot level={a.heartDiseaseLevel} />
                    <RiskDot level={a.hypertensionLevel} />
                  </div>
                </td>

                {/* Analysis status */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      a.analysisStatus === 'COMPLETE'
                        ? 'bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim'
                        : a.analysisStatus === 'FAILED'
                        ? 'bg-error/10 text-error'
                        : 'bg-secondary/10 text-secondary'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        a.analysisStatus === 'COMPLETE'
                          ? 'bg-tertiary-fixed-dim'
                          : a.analysisStatus === 'FAILED'
                          ? 'bg-error'
                          : 'bg-secondary animate-pulse'
                      }`}
                    />
                    {a.analysisStatus}
                  </span>
                </td>

                {/* Arrow */}
                <td className="px-6 py-4">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-fixed-dim transition-colors text-[20px]">
                    arrow_forward
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}