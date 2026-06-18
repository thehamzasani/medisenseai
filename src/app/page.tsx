// src/app/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  const features = [
    {
      icon:        'memory',
      title:       '10 AI Engines',
      description: 'Neural Network, XGBoost, LightGBM, Random Forest and 6 more models run in parallel for maximum accuracy.',
      color:       'text-primary-fixed-dim',
      bg:          'bg-primary-fixed-dim/10',
      border:      'border-primary-fixed-dim/20',
    },
    {
      icon:        'biotech',
      title:       '6 Disease Predictions',
      description: 'Simultaneous risk assessment for Diabetes, Heart Disease, Hypertension, Stroke, Kidney Disease, and Liver Disease.',
      color:       'text-secondary-fixed-dim',
      bg:          'bg-secondary-fixed-dim/10',
      border:      'border-secondary-fixed-dim/20',
    },
    {
      icon:        'bolt',
      title:       'Real-time Analysis',
      description: 'All 10 engines run in parallel via Promise.allSettled — results delivered in seconds, not minutes.',
      color:       'text-tertiary-fixed-dim',
      bg:          'bg-tertiary-fixed-dim/10',
      border:      'border-tertiary-fixed-dim/20',
    },
  ]

  const stats = [
    { value: '99.2%', label: 'Neural Network Accuracy' },
    { value: '10',    label: 'AI Engines' },
    { value: '6',     label: 'Diseases Predicted' },
    { value: '<45ms', label: 'Avg Inference Time' },
  ]

  return (
    <div className="relative min-h-screen bg-background flex flex-col overflow-hidden">

      {/* ── Atmospheric background ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-primary-container/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-secondary-container/5 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-tertiary-container/3 blur-[120px] rounded-full" />
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-fixed-dim text-2xl">medical_services</span>
          <span className="text-headline-sm font-bold gradient-text">MediSense AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 rounded-full border border-outline-variant text-on-surface hover:border-primary-fixed-dim hover:text-primary-fixed-dim transition-colors text-sm font-semibold"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="btn-cyan px-5 py-2 text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-fixed-dim/10 border border-primary-fixed-dim/20 text-primary-fixed-dim text-label-sm mb-8">
          <span className="material-symbols-outlined text-sm">verified</span>
          Clinical Intelligence Platform v3.0
        </div>

        {/* Headline */}
        <h1 className="text-display-lg font-bold mb-6 max-w-4xl leading-tight">
          <span className="gradient-text">AI-Powered</span>
          <br />
          <span className="text-on-surface">Disease Prediction</span>
          <br />
          <span className="text-on-surface-variant text-headline-lg font-semibold">& Health Intelligence</span>
        </h1>

        {/* Subheadline */}
        <p className="text-body-lg text-on-surface-variant max-w-2xl mb-12 leading-relaxed">
          MediSense AI runs your health data through 10 machine learning engines simultaneously,
          delivering clinical-grade risk predictions across 6 disease categories in seconds.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 mb-20">
          <Link
            href="/register"
            className="btn-cyan px-8 py-3.5 text-base flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">rocket_launch</span>
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-full border border-outline-variant text-on-surface hover:border-primary-fixed-dim hover:text-primary-fixed-dim transition-all text-base font-semibold"
          >
            Sign In
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-6 mb-20 max-w-3xl w-full">
          {stats.map(s => (
            <div
              key={s.label}
              className="surface-glass rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold gradient-text mb-1">{s.value}</div>
              <div className="text-label-sm text-on-surface-variant">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-6 max-w-5xl w-full mb-20">
          {features.map(f => (
            <div
              key={f.title}
              className="surface-glass rounded-2xl p-6 text-left border border-outline-variant/10 hover:border-primary-fixed-dim/20 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                <span className={`material-symbols-outlined ${f.color} text-xl`}>{f.icon}</span>
              </div>
              <h3 className="text-headline-sm font-semibold text-on-surface mb-2">{f.title}</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Demo hint */}
        <div className="surface-glass rounded-xl px-6 py-4 border border-outline-variant/10 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-sm text-primary-fixed-dim mr-1 align-middle">info</span>
          Demo account available — login with{' '}
          <code className="text-primary-fixed-dim bg-primary-fixed-dim/10 px-1.5 py-0.5 rounded text-xs">
            demo@medisense.ai
          </code>
          {' / '}
          <code className="text-primary-fixed-dim bg-primary-fixed-dim/10 px-1.5 py-0.5 rounded text-xs">
            Demo@123456
          </code>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-outline-variant/10 px-8 py-6 text-center text-on-surface-variant text-label-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="material-symbols-outlined text-sm text-primary-fixed-dim">medical_services</span>
          <span className="text-primary-fixed-dim font-semibold">MediSense AI</span>
        </div>
        <p>AI-powered health intelligence for clinical decision support.</p>
        <p className="mt-1 text-outline text-[11px]">
          Not a substitute for professional medical advice. For educational and research purposes only.
        </p>
      </footer>
    </div>
  )
}