import type { RecommendationsData } from '@/types'
import { toast } from 'sonner'

interface Props {
  recommendations: RecommendationsData
}

const actionConfig = {
  ADJUST: {
    bg: 'bg-secondary/20',
    text: 'text-secondary',
    border: 'border-secondary/30',
    icon: 'tune',
  },
  MAINTAIN: {
    bg: 'bg-tertiary-fixed-dim/20',
    text: 'text-tertiary-fixed-dim',
    border: 'border-tertiary-fixed-dim/30',
    icon: 'check_circle',
  },
  ADD: {
    bg: 'bg-primary-fixed-dim/20',
    text: 'text-primary-fixed-dim',
    border: 'border-primary-fixed-dim/30',
    icon: 'add_circle',
  },
}

export default function MedicationSyncCard({ recommendations }: Props) {
  const { medications } = recommendations

  const handleUpdatePrescription = () => {
    if (typeof window !== 'undefined') {
      // Client-only toast — this component renders on server, button click is client
    }
  }

  return (
    <div className="surface-glass rounded-2xl p-6 flex flex-col h-full relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim/5 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-fixed-dim/20 border border-primary-fixed-dim/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-fixed-dim text-lg">
            medication
          </span>
        </div>
        <div>
          <p className="text-label-sm uppercase tracking-[0.15em] text-on-surface-variant">
            Medication Sync
          </p>
          <p className="text-label-md text-on-surface font-semibold">
            Protocol Review
          </p>
        </div>
        <div className="ml-auto">
          <div className="w-2 h-2 bg-primary-fixed-dim rounded-full animate-pulse" />
        </div>
      </div>

      {/* Sync status bar */}
      <div className="bg-surface-container/50 rounded-xl p-3 mb-6 border border-outline-variant/20 flex items-center gap-3">
        <span className="material-symbols-outlined text-tertiary-fixed-dim text-base">
          sync
        </span>
        <div className="flex-1">
          <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-fixed-dim to-primary-container"
              style={{ width: '78%' }}
            />
          </div>
        </div>
        <span className="text-label-sm text-tertiary-fixed-dim font-semibold">78%</span>
      </div>

      {/* Medications list */}
      <div className="flex-1 space-y-4 mb-6">
        {medications.map((med, i) => {
          const config = actionConfig[med.action]
          return (
            <div
              key={i}
              className="bg-surface-container/40 rounded-xl p-4 border border-outline-variant/20 hover:border-outline-variant/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-label-md font-semibold text-on-surface mb-0.5">
                    {med.name}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">{med.dose}</p>
                </div>
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-label-sm font-semibold ${config.bg} ${config.text} ${config.border}`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '12px' }}
                  >
                    {config.icon}
                  </span>
                  {med.action}
                </div>
              </div>

              {/* Med-specific indicator */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: med.action === 'MAINTAIN' ? '85%' : med.action === 'ADJUST' ? '55%' : '20%',
                      background: med.action === 'MAINTAIN'
                        ? 'linear-gradient(90deg, #3cddc7, #59f2dc)'
                        : med.action === 'ADJUST'
                          ? 'linear-gradient(90deg, #4cd6ff, #14d1ff)'
                          : 'linear-gradient(90deg, #00dbe7, #006a71)',
                    }}
                  />
                </div>
                <span className="text-[10px] text-on-surface-variant tabular-nums">
                  {med.action === 'MAINTAIN' ? '85%' : med.action === 'ADJUST' ? '55%' : '20%'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Last sync info */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-surface-container/30 rounded-lg border border-outline-variant/10">
        <span className="material-symbols-outlined text-on-surface-variant text-sm">
          schedule
        </span>
        <span className="text-label-sm text-on-surface-variant">
          Last synced: <span className="text-on-surface">Just now</span>
        </span>
        <div className="ml-auto w-2 h-2 bg-tertiary-fixed-dim rounded-full" />
      </div>

      {/* Update button */}
      <UpdatePrescriptionButton />
    </div>
  )
}

// Separate client component for the interactive button
function UpdatePrescriptionButton() {
  'use client'
  return (
    <button
      onClick={() => {
        // Dynamic import of toast to avoid SSR issues
        import('sonner').then(({ toast }) => {
          toast.success('Prescription updated', {
            description: 'Medication protocol has been synchronized with your care team.',
          })
        })
      }}
      className="w-full btn-cyan py-3 px-4 flex items-center justify-center gap-2 text-label-md"
    >
      <span className="material-symbols-outlined text-base">sync</span>
      Update Prescription
    </button>
  )
}