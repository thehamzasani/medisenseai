import type { AssessmentWithResults } from '@/types'

interface VarianceTableProps {
  keyFactors: string[]
  createdAt: string
  assessment: AssessmentWithResults
}

interface VarianceRow {
  triggerEvent: string
  date: string
  metricShift: string
  riskImpact: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'ACTIVE' | 'RESOLVED' | 'MONITORING'
}

function riskLevelToImpact(level: string | null): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (level === 'CRITICAL' || level === 'HIGH') return 'HIGH'
  if (level === 'MEDIUM') return 'MEDIUM'
  return 'LOW'
}

function buildVarianceFromAssessment(a: AssessmentWithResults, baseDate: Date): VarianceRow[] {
  const rows: VarianceRow[] = []

  const addRow = (label: string, value: number | null, unit: string, normalMin: number, normalMax: number, level: string | null, daysAgo: number) => {
    if (value === null) return
    const isAbove = value > normalMax
    const isBelow = value < normalMin
    if (!isAbove && !isBelow) return

    const diff = isAbove ? value - normalMax : normalMin - value
    const dir = isAbove ? '↑' : '↓'
    const d = new Date(baseDate.getTime() - daysAgo * 86400000)
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    rows.push({
      triggerEvent: label,
      date: dateStr,
      metricShift: `${dir} ${diff > 0 ? '+' : ''}${Math.round(diff)} ${unit}`,
      riskImpact: riskLevelToImpact(level),
      status: riskLevelToImpact(level) === 'HIGH' ? 'ACTIVE' : 'MONITORING',
    })
  }

  addRow('Fasting glucose elevation', a.fastingGlucose, 'mg/dL', 70, 100, a.diabetesRisk && a.diabetesRisk >= 60 ? 'HIGH' : 'MEDIUM', 5)
  addRow('HbA1c above threshold', a.hba1c, '%', 4.0, 5.7, a.diabetesRisk && a.diabetesRisk >= 60 ? 'HIGH' : 'MEDIUM', 10)
  addRow('Systolic BP elevation', a.systolicBP, 'mmHg', 90, 120, a.hypertensionRisk && a.hypertensionRisk >= 60 ? 'HIGH' : 'MEDIUM', 8)
  addRow('Diastolic BP elevation', a.diastolicBP, 'mmHg', 60, 80, a.hypertensionRisk && a.hypertensionRisk >= 60 ? 'HIGH' : 'MEDIUM', 12)
  addRow('Elevated heart rate', a.heartRate, 'BPM', 60, 100, a.heartDiseaseRisk && a.heartDiseaseRisk >= 60 ? 'HIGH' : 'MEDIUM', 15)
  addRow('Cholesterol above range', a.cholesterol, 'mg/dL', 0, 200, a.heartDiseaseRisk && a.heartDiseaseRisk >= 60 ? 'HIGH' : 'MEDIUM', 18)
  addRow('LDL cholesterol elevated', a.ldl, 'mg/dL', 0, 100, a.heartDiseaseRisk && a.heartDiseaseRisk >= 60 ? 'HIGH' : 'MEDIUM', 20)
  addRow('Creatinine above range', a.creatinine, 'mg/dL', 0.6, 1.2, a.kidneyDiseaseRisk && a.kidneyDiseaseRisk >= 60 ? 'HIGH' : 'MEDIUM', 22)
  addRow('ALT enzyme elevation', a.altEnzyme, 'U/L', 0, 40, a.liverDiseaseRisk && a.liverDiseaseRisk >= 60 ? 'HIGH' : 'MEDIUM', 25)

  return rows.slice(0, 5)
}

function parseVarianceRows(keyFactors: string[], createdAt: string, assessment: AssessmentWithResults): VarianceRow[] {
  const baseDate = new Date(createdAt)

  const assessmentRows = buildVarianceFromAssessment(assessment, baseDate)

  const factorRows: VarianceRow[] = keyFactors.slice(0, 5).map((factor, i) => {
    const daysAgo = (i + 1) * 7
    const d = new Date(baseDate.getTime() - daysAgo * 86400000)
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const upper = factor.toUpperCase()
    let riskImpact: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
    if (upper.includes('HIGH') || upper.includes('ELEVATED') || upper.includes('CRITICAL')) riskImpact = 'HIGH'
    else if (upper.includes('MODERATE') || upper.includes('APPROACHING') || upper.includes('BORDERLINE')) riskImpact = 'MEDIUM'

    let status: 'ACTIVE' | 'RESOLVED' | 'MONITORING' = 'MONITORING'
    if (riskImpact === 'HIGH') status = 'ACTIVE'
    else if (i > 2) status = 'RESOLVED'

    const metricMatch = factor.match(/\d+\.?\d*\s*(?:mg\/dL|%|mmHg|BPM|U\/L)/i)
    const metricShift = metricMatch ? `↑ ${metricMatch[0]}` : '↑ Detected'

    return { triggerEvent: factor, date: dateStr, metricShift, riskImpact, status }
  })

  const seen = new Set<string>()
  const merged: VarianceRow[] = []
  for (const row of [...assessmentRows, ...factorRows]) {
    const key = row.triggerEvent.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(row)
    }
  }

  return merged.length >= 3 ? merged.slice(0, 5) : [
    ...merged,
    ...assessmentRows.filter(r => !seen.has(r.triggerEvent.toLowerCase())).slice(0, 3 - merged.length),
  ].slice(0, 5)
}

const impactStyles: Record<string, string> = {
  HIGH: 'bg-error/20 text-error border border-error/30',
  MEDIUM: 'bg-secondary/20 text-secondary border border-secondary/30',
  LOW: 'bg-tertiary-fixed-dim/20 text-tertiary-fixed-dim border border-tertiary-fixed-dim/30',
}

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-error/10 text-error',
  MONITORING: 'bg-secondary/10 text-secondary',
  RESOLVED: 'bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim',
}

const statusDots: Record<string, string> = {
  ACTIVE: 'bg-error animate-pulse',
  MONITORING: 'bg-secondary',
  RESOLVED: 'bg-tertiary-fixed-dim',
}

export default function VarianceTable({ keyFactors, createdAt, assessment }: VarianceTableProps) {
  const rows = parseVarianceRows(keyFactors, createdAt, assessment)

  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-headline-sm font-semibold text-on-surface">Risk Variance Analysis</h3>
          <p className="text-label-sm text-on-surface-variant mt-0.5">Trigger events and metric deviations</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-lg">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">analytics</span>
          <span className="text-label-sm text-on-surface-variant">{rows.length} events</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/20">
              {['Trigger Event', 'Date', 'Metric Shift', 'Risk Impact', 'Status'].map((col) => (
                <th
                  key={col}
                  className="text-left pb-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold pr-4"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-outline-variant/10 hover:bg-surface-container-high/30 transition-colors"
              >
                {/* Trigger Event */}
                <td className="py-4 pr-4">
                  <div className="flex items-start gap-2 max-w-[260px]">
                    <span className="material-symbols-outlined text-primary-fixed-dim text-[14px] mt-0.5 shrink-0">
                      warning_amber
                    </span>
                    <span className="text-label-sm text-on-surface leading-relaxed">{row.triggerEvent}</span>
                  </div>
                </td>

                {/* Date */}
                <td className="py-4 pr-4">
                  <span className="text-label-sm text-on-surface-variant tabular-nums whitespace-nowrap">{row.date}</span>
                </td>

                {/* Metric Shift */}
                <td className="py-4 pr-4">
                  <span className="text-label-sm font-semibold text-error tabular-nums whitespace-nowrap">
                    {row.metricShift}
                  </span>
                </td>

                {/* Risk Impact */}
                <td className="py-4 pr-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${impactStyles[row.riskImpact]}`}>
                    {row.riskImpact}
                  </span>
                </td>

                {/* Status */}
                <td className="py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[row.status]}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusDots[row.status]}`} />
                    {row.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {(['ACTIVE', 'MONITORING', 'RESOLVED'] as const).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${statusDots[s]}`} />
              <span className="text-[10px] text-on-surface-variant">{s}</span>
            </div>
          ))}
        </div>
        <span className="text-[10px] text-on-surface-variant">
          Last updated: {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  )
}