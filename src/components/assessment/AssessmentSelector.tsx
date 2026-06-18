'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import type { AssessmentListItem } from '@/types'

interface AssessmentSelectorProps {
  currentId: string
  basePath: string
}

export default function AssessmentSelector({ currentId, basePath }: AssessmentSelectorProps) {
  const router = useRouter()
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/assessment')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setAssessments(data.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function formatOption(a: AssessmentListItem): string {
    const date = formatDate(a.createdAt)
    const score = a.overallHealthIndex !== null ? `Health Score: ${a.overallHealthIndex}` : a.analysisStatus
    return `${date} — ${score}`
  }

  if (loading) {
    return (
      <div className="h-10 w-72 bg-surface-container-high animate-pulse rounded-xl" />
    )
  }

  if (assessments.length === 0) return null

  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
        swap_horiz
      </span>
      <div className="relative">
        <select
          value={currentId}
          onChange={e => {
            const newId = e.target.value
            if (newId && newId !== currentId) {
              router.push(`${basePath}/${newId}`)
            }
          }}
          className="
            appearance-none
            bg-surface-container-low
            border border-outline-variant/40
            text-on-surface text-sm
            rounded-xl
            pl-4 pr-10 py-2.5
            focus:border-primary-fixed-dim focus:outline-none
            cursor-pointer
            transition-colors
            hover:border-outline-variant
            min-w-[280px]
          "
        >
          {assessments.map(a => (
            <option key={a.id} value={a.id}>
              {formatOption(a)}
            </option>
          ))}
        </select>
        <span
          className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
          style={{ fontSize: 18 }}
        >
          expand_more
        </span>
      </div>
    </div>
  )
}