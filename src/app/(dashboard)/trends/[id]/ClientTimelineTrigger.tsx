'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  assessmentId: string
  label?: string
}

export default function ClientTimelineTrigger({ assessmentId, label = 'Generate Forecast' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/predict-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, projectionMonths: 6 }),
      })

      const json = await res.json()

      if (!json.success) {
        setError(json.error ?? 'Failed to generate forecast')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn-cyan px-5 py-2.5 text-label-sm font-semibold flex items-center gap-2 mx-auto transition-all disabled:opacity-60"
      >
        <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
          {loading ? 'refresh' : 'auto_awesome'}
        </span>
        {loading ? 'Analyzing Trends...' : label}
      </button>
      {error && (
        <p className="text-[11px] text-error mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
