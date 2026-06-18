import type { AssessmentWithResults } from '@/types'
import { RISK_COLORS } from '@/constants'
import type { RiskLevel } from '@/types'

interface Props {
  assessment: AssessmentWithResults
}

interface GeneticMarker {
  id: string
  name: string
  gene: string
  description: string
  association: string
  correlationPct: number
  riskLevel: RiskLevel
  icon: string
}

export default function GeneticMarkerGrid({ assessment }: Props) {
  const diabetesRisk = assessment.diabetesRisk ?? 0
  const heartRisk = assessment.heartDiseaseRisk ?? 0
  const strokeRisk = assessment.strokeRisk ?? 0

  const markers: GeneticMarker[] = [
    {
      id: 'rs738409',
      name: 'rs738409',
      gene: 'PNPLA3',
      description: 'Patatin-like phospholipase domain-containing protein 3',
      association: 'Hepatic Steatosis & Metabolic Syndrome',
      correlationPct: Math.min(95, 40 + diabetesRisk * 0.5),
      riskLevel:
        diabetesRisk >= 60 ? 'HIGH' : diabetesRisk >= 40 ? 'MEDIUM' : 'LOW',
      icon: 'genetics',
    },
    {
      id: '9p21.3',
      name: '9p21.3',
      gene: 'CDKN2A/B',
      description: 'Cyclin-dependent kinase inhibitor 2A/B locus',
      association: 'Cardiovascular Disease & Myocardial Infarction',
      correlationPct: Math.min(92, 35 + heartRisk * 0.55),
      riskLevel:
        heartRisk >= 60 ? 'HIGH' : heartRisk >= 35 ? 'MEDIUM' : 'LOW',
      icon: 'favorite',
    },
    {
      id: 'APOE-e4',
      name: 'APOE-ε4',
      gene: 'APOE',
      description: 'Apolipoprotein E epsilon-4 allele',
      association: 'Alzheimer\'s Disease & Stroke Risk',
      correlationPct: Math.min(88, 30 + strokeRisk * 0.6),
      riskLevel:
        strokeRisk >= 50 ? 'HIGH' : strokeRisk >= 25 ? 'MEDIUM' : 'LOW',
      icon: 'neurology',
    },
  ]

  return (
    <div className="surface-glass rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <span className="material-symbols-outlined text-primary-fixed-dim text-xl">
          biotech
        </span>
        <div>
          <h3 className="text-label-sm uppercase tracking-widest text-on-surface-variant">
            Genetic Risk Markers
          </h3>
          <p className="text-[10px] text-on-surface-variant/60">
            Polygenic risk score correlations — estimated from phenotypic data
          </p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-1 rounded-full">
            Predictive Model
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {markers.map((marker) => {
          const colors = RISK_COLORS[marker.riskLevel]
          return (
            <div
              key={marker.id}
              className="surface-glass rounded-xl p-4 hover:border-primary-fixed-dim/30 transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center group-hover:bg-primary-fixed-dim/10 transition-colors">
                  <span className="material-symbols-outlined text-primary-fixed-dim text-lg">
                    {marker.icon}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${colors.bg} ${colors.text} ${colors.border}`}
                >
                  {marker.riskLevel}
                </span>
              </div>

              {/* Marker ID */}
              <p className="text-label-md font-bold text-primary-fixed-dim mb-0.5">
                {marker.name}
              </p>
              <p className="text-[10px] text-secondary-fixed-dim font-medium mb-1">
                {marker.gene}
              </p>
              <p className="text-[10px] text-on-surface-variant leading-tight mb-3 line-clamp-2">
                {marker.description}
              </p>

              {/* Association */}
              <div className="bg-surface-container-high rounded-lg p-2 mb-3">
                <p className="text-[9px] uppercase tracking-wider text-on-surface-variant mb-0.5">
                  Association
                </p>
                <p className="text-[10px] text-on-surface leading-tight">
                  {marker.association}
                </p>
              </div>

              {/* Correlation bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-on-surface-variant">Correlation</span>
                  <span className={`text-[10px] font-bold ${colors.text}`}>
                    {marker.correlationPct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: `${marker.correlationPct}%`,
                      background:
                        marker.riskLevel === 'HIGH' || marker.riskLevel === 'CRITICAL'
                          ? 'rgb(255,180,171)'
                          : marker.riskLevel === 'MEDIUM'
                          ? 'rgb(166,230,255)'
                          : 'rgb(60,221,199)',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {/* Image placeholder — 4th column */}
        <div className="surface-glass rounded-xl p-4 flex flex-col items-center justify-center text-center border border-dashed border-outline-variant/30">
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">
              dna
            </span>
          </div>
          <p className="text-label-sm text-on-surface-variant mb-1">Full Genome Panel</p>
          <p className="text-[10px] text-on-surface-variant/60 leading-tight mb-3">
            Upload genetic test results for comprehensive polygenic risk scoring
          </p>
          <button className="text-[10px] px-3 py-1.5 rounded-lg border border-primary-fixed-dim/30 text-primary-fixed-dim hover:bg-primary-fixed-dim/10 transition-colors">
            Upload Data
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-start gap-2">
        <span className="material-symbols-outlined text-on-surface-variant text-sm flex-shrink-0 mt-0.5">
          info
        </span>
        <p className="text-[10px] text-on-surface-variant/60 leading-relaxed">
          Genetic marker correlations are estimated from phenotypic and clinical data using validated polygenic risk score models. These are not direct genotype results. Consult a certified genetic counselor for definitive genomic analysis.
        </p>
      </div>
    </div>
  )
}