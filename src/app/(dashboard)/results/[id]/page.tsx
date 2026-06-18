import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toAssessmentWithResults } from '@/lib/utils'
import AssessmentSelector from '@/components/assessment/AssessmentSelector'
import PatientSummaryCard from '@/components/results/PatientSummaryCard'
import DiseasePredictionCard from '@/components/results/DiseasePredictionCard'
import ClinicalInsightCard from '@/components/results/ClinicalInsightCard'
import { ENGINE_DEFINITIONS } from '@/constants'

interface Props {
  params: { id: string }
}

// Disease config for prediction cards
const DISEASE_CARDS = [
  { key: 'diabetes',      label: 'Diabetes',       icon: 'water_drop'       },
  { key: 'hypertension',  label: 'Hypertension',   icon: 'monitor_heart'    },
  { key: 'stroke',        label: 'Stroke',         icon: 'neurology'        },
  { key: 'heartDisease',  label: 'Heart Disease',  icon: 'cardiology'       },
  { key: 'kidneyDisease', label: 'Kidney Disease', icon: 'kidney'           },
  { key: 'liverDisease',  label: 'Liver Disease',  icon: 'medical_services' },
] as const

export default async function ResultsPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Fetch assessment
  const raw = await db.assessment.findUnique({
    where: { id: params.id },
  })

  if (!raw) notFound()
  if (raw.userId !== session.user.id) notFound()

  const assessment = toAssessmentWithResults(raw)

  // Separately fetch user blood type + name (blood type lives on User, not Assessment)
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { bloodType: true, name: true },
  })

  const userName = user?.name ?? session.user.name ?? 'Patient'
  const userBloodType = user?.bloodType ?? null

  // ── RUNNING state ──────────────────────────────────────────────────────────
  if (assessment.analysisStatus === 'RUNNING' || assessment.analysisStatus === 'PENDING') {
    return (
      <div className="relative min-h-screen p-xl">
        {/* Atmospheric bg */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-2xl mx-auto mt-20">
          <div className="surface-glass rounded-2xl p-10 text-center">
            {/* Spinning ring */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary-fixed-dim/30 animate-spin-slow" />
              <div className="absolute inset-4 rounded-full border-2 border-primary-fixed-dim/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: 32 }}>
                  memory
                </span>
              </div>
            </div>

            <h2 className="text-headline-md font-semibold text-on-surface mb-2">
              AI Engines Running
            </h2>
            <p className="text-on-surface-variant mb-6">
              10 clinical AI engines are analyzing your data in parallel...
            </p>

            <div className="grid grid-cols-2 gap-2 text-left">
              {ENGINE_DEFINITIONS.map((eng) => (
                <div key={eng.name} className="flex items-center gap-2 text-[11px] text-on-surface-variant p-2 rounded-lg bg-surface-container-high/50">
                  <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: 14 }}>
                    {eng.icon}
                  </span>
                  <span>{eng.name}</span>
                  <span className="ml-auto text-primary-fixed-dim/60">{eng.accuracy}%</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-on-surface-variant mt-6">
              This page will auto-refresh when analysis is complete
            </p>

            {/* Auto-refresh script */}
            <script
              dangerouslySetInnerHTML={{
                __html: `setTimeout(() => location.reload(), 3000)`,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // ── FAILED state ───────────────────────────────────────────────────────────
  if (assessment.analysisStatus === 'FAILED') {
    return (
      <div className="relative min-h-screen p-xl">
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-error-container/5 blur-[120px] rounded-full" />
        </div>
        <div className="max-w-2xl mx-auto mt-20">
          <div className="surface-glass rounded-2xl p-10 text-center border border-error/20">
            <span className="material-symbols-outlined text-error mb-4 block" style={{ fontSize: 48 }}>
              error
            </span>
            <h2 className="text-headline-md font-semibold text-on-surface mb-2">Analysis Failed</h2>
            <p className="text-on-surface-variant mb-2">
              The AI analysis encountered an error and could not complete.
            </p>
            {assessment.analysisError && (
              <p className="text-xs text-error/70 font-mono mb-6 p-3 rounded-lg bg-error/10">
                {assessment.analysisError}
              </p>
            )}
            <a
              href="/assessment/new"
              className="btn-cyan inline-flex items-center gap-2 px-6 py-2.5 text-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
              New Assessment
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Get best engine results for disease cards ──────────────────────────────
  const bestEngineResult = assessment.engineResults?.find(e => e.isBest)
    ?? assessment.engineResults?.[0]
    ?? null

  // ── COMPLETE state — main results view ────────────────────────────────────
  return (
    <div className="relative min-h-screen p-xl">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: 16 }}>
              psychology
            </span>
            <p className="text-[10px] uppercase tracking-widest text-primary-fixed-dim font-semibold">
              AI Predictive Analysis
            </p>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">AI Predictive Results</h1>
          <p className="text-on-surface-variant mt-1">
            10-engine ensemble analysis · Neural Network selected as primary
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Export PDF button — placeholder, wired in Task 14 */}
          <button className="
            flex items-center gap-2 px-4 py-2.5 rounded-xl
            border border-outline-variant/40 text-on-surface-variant text-sm
            hover:border-primary-fixed-dim/50 hover:text-primary-fixed-dim
            transition-all duration-200
          ">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
            Export PDF
          </button>

          {/* Consult MD button */}
          <button className="
            flex items-center gap-2 px-4 py-2.5 rounded-xl
            border border-primary-fixed-dim/40 text-primary-fixed-dim text-sm
            hover:bg-primary-fixed-dim/10
            transition-all duration-200
          ">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>local_hospital</span>
            Consult MD
          </button>
        </div>
      </div>

      {/* ── Assessment selector ── */}
      <div className="mb-6">
        <AssessmentSelector currentId={params.id} basePath="/results" />
      </div>

      {/* ── Patient summary bento (grid-cols-12) ── */}
      <div className="mb-6">
        <PatientSummaryCard
          assessment={assessment}
          userName={userName}
          userBloodType={userBloodType}
        />
      </div>

      {/* ── Disease prediction cards ── */}
      <div className="space-y-4">
        {/* Top row: Diabetes, Hypertension, Stroke */}
        <div className="grid grid-cols-3 gap-4">
          {(['diabetes', 'hypertension', 'stroke'] as const).map(key => {
            const cfg = DISEASE_CARDS.find(d => d.key === key)!
            const risk = bestEngineResult?.diseases[key] ?? null
            const topRisk = {
              risk: assessment[`${key}Risk`] ?? risk?.risk ?? 0,
              level: assessment[`${key}Level`] ?? risk?.level ?? null,
              confidence: risk?.confidence ?? 90,
            }
            return (
              <DiseasePredictionCard
                key={key}
                disease={cfg.label}
                icon={cfg.icon}
                risk={topRisk as { risk: number; level: import('@/types').RiskLevel; confidence: number }}
                modelName={assessment.bestEngine ?? 'Neural Network'}
                modelVersion="v5.0"
              />
            )
          })}
        </div>

        {/* Bottom row: Heart Disease (wide col-span-2) + Clinical Insight */}
        <div className="grid grid-cols-3 gap-4">
          {/* Heart Disease — wide */}
          <div className="col-span-2">
            <DiseasePredictionCard
              disease="Heart Disease"
              icon="cardiology"
              risk={{
                risk: assessment.heartDiseaseRisk ?? bestEngineResult?.diseases.heartDisease.risk ?? 0,
                level: assessment.heartDiseaseLevel ?? bestEngineResult?.diseases.heartDisease.level ?? null,
                confidence: bestEngineResult?.diseases.heartDisease.confidence ?? 90,
              } as { risk: number; level: import('@/types').RiskLevel; confidence: number }}
              modelName={assessment.bestEngine ?? 'Neural Network'}
              modelVersion="v5.0"
              wide
            />
          </div>

          {/* Clinical Insight */}
          <div className="col-span-1">
            <ClinicalInsightCard assessment={assessment} />
          </div>
        </div>

        {/* Kidney + Liver */}
        <div className="grid grid-cols-2 gap-4">
          {(['kidneyDisease', 'liverDisease'] as const).map(key => {
            const cfg = DISEASE_CARDS.find(d => d.key === key)!
            const riskPct = assessment[`${key}Risk`] ?? bestEngineResult?.diseases[key].risk ?? 0
            const riskLvl = assessment[`${key}Level`] ?? bestEngineResult?.diseases[key].level ?? null
            const conf = bestEngineResult?.diseases[key].confidence ?? 90
            return (
              <DiseasePredictionCard
                key={key}
                disease={cfg.label}
                icon={cfg.icon}
                risk={{ risk: riskPct, level: riskLvl, confidence: conf } as { risk: number; level: import('@/types').RiskLevel; confidence: number }}
                modelName={assessment.bestEngine ?? 'Neural Network'}
                modelVersion="v5.0"
              />
            )
          })}
        </div>
      </div>

      {/* ── Floating Action Button ── */}
      <div className="fixed bottom-10 right-10 z-50">
        <a
          href={`/recommendations/${params.id}`}
          className="
            btn-cyan
            flex items-center gap-2
            px-5 py-3
            text-sm font-bold
            shadow-[0_0_30px_rgba(0,219,231,0.3)]
          "
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            clinical_notes
          </span>
          View Recommendations
        </a>
      </div>
    </div>
  )
}