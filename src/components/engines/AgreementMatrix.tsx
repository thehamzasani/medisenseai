'use client'

import type { EnsembleMetrics, DiseaseKey } from '@/types'

interface AgreementMatrixProps {
  ensembleMetrics: EnsembleMetrics
  engineCount: number
}

const DISEASE_KEYS: DiseaseKey[] = ['diabetes', 'heartDisease', 'hypertension', 'stroke', 'kidneyDisease', 'liverDisease']
const DISEASE_LABELS: Record<DiseaseKey, string> = {
  diabetes: 'Diabetes',
  heartDisease: 'Heart',
  hypertension: 'HTN',
  stroke: 'Stroke',
  kidneyDisease: 'Kidney',
  liverDisease: 'Liver',
}

const DISEASE_ICONS: Record<DiseaseKey, string> = {
  diabetes: 'bloodtype',
  heartDisease: 'cardiology',
  hypertension: 'monitor_heart',
  stroke: 'neurology',
  kidneyDisease: 'water_drop',
  liverDisease: 'local_hospital',
}

export default function AgreementMatrix({ ensembleMetrics, engineCount }: AgreementMatrixProps) {
  // Compute overall ensemble stats
  const avgAgreement = ensembleMetrics.agreementScore
  const diseasesWithHighAgreement = DISEASE_KEYS.filter(k => ensembleMetrics.diseases[k].agreementScore >= 80).length
  const diseasesWithLowAgreement = DISEASE_KEYS.filter(k => ensembleMetrics.diseases[k].agreementScore < 60).length

  return (
    <div className="surface-glass rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]">grid_view</span>
        </div>
        <div>
          <h3 className="text-headline-sm font-semibold text-on-surface">Inter-Model Agreement</h3>
          <p className="text-label-sm text-on-surface-variant mt-0.5">Consensus analysis across {engineCount} engines</p>
        </div>
      </div>

      {/* Disease agreement grid */}
      <div className="grid grid-cols-6 gap-3 mb-5">
        {DISEASE_KEYS.map(key => {
          const info = ensembleMetrics.diseases[key]
          const isHigh = info.agreementScore >= 80
          const isMedium = info.agreementScore >= 60

          return (
            <div
              key={key}
              className={`rounded-xl p-3 text-center border transition-all ${
                isHigh
                  ? 'bg-tertiary-fixed-dim/10 border-tertiary-fixed-dim/30'
                  : isMedium
                  ? 'bg-secondary/10 border-secondary/30'
                  : 'bg-error/10 border-error/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] block mb-1" style={{
                color: isHigh ? '#3cddc7' : isMedium ? '#a6e6ff' : '#ffb4ab',
              }}>
                {DISEASE_ICONS[key]}
              </span>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">
                {DISEASE_LABELS[key]}
              </p>
              <p className={`text-headline-sm font-bold tabular-nums ${
                isHigh ? 'text-tertiary-fixed-dim' : isMedium ? 'text-secondary' : 'text-error'
              }`}>
                {info.agreementScore}%
              </p>
              <div className="mt-1.5 h-1 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${info.agreementScore}%`,
                    backgroundColor: isHigh ? '#3cddc7' : isMedium ? '#a6e6ff' : '#ffb4ab',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Score breakdown for each disease */}
      <div className="space-y-2 mb-5">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Per-Disease Breakdown</p>
        {DISEASE_KEYS.map(key => {
          const info = ensembleMetrics.diseases[key]
          return (
            <div key={key} className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-surface-container-low/30">
              <span className="text-label-sm text-on-surface w-24 shrink-0">{DISEASE_LABELS[key]}</span>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${info.agreementScore}%`,
                      backgroundColor: info.agreementScore >= 80 ? '#3cddc7' : info.agreementScore >= 60 ? '#a6e6ff' : '#ffb4ab',
                    }}
                  />
                </div>
                <span className="text-label-sm font-semibold text-on-surface tabular-nums w-10 text-right">{info.agreementScore}%</span>
              </div>
              <div className="flex items-center gap-1.5 w-20 justify-end">
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">{info.consensusLevel}</span>
                <span className="text-[9px] text-on-surface-variant">σ={info.stdDev}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-outline-variant/10">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Overall Agreement</p>
          <p className={`text-headline-md font-bold ${
            avgAgreement >= 80 ? 'text-tertiary-fixed-dim' : avgAgreement >= 60 ? 'text-secondary' : 'text-error'
          }`}>
            {avgAgreement}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Strong Consensus</p>
          <p className="text-headline-md font-bold text-tertiary-fixed-dim">{diseasesWithHighAgreement}/6</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Low Agreement</p>
          <p className="text-headline-md font-bold text-error">{diseasesWithLowAgreement}/6</p>
        </div>
      </div>

      {/* Meta insight */}
      {ensembleMetrics.metaInsight && (
        <div className="mt-4 p-3 rounded-xl bg-primary-fixed-dim/5 border border-primary-fixed-dim/10 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px] mt-0.5 shrink-0">insights</span>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">{ensembleMetrics.metaInsight}</p>
        </div>
      )}
    </div>
  )
}
