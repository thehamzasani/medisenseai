'use client'

import { useState } from 'react'
import type { HealthGoalData, GoalCategory } from '@/types'

interface GoalCardProps {
  goal: HealthGoalData
  onUpdate: () => void
}

const CATEGORY_CONFIG: Record<GoalCategory, { icon: string; color: string }> = {
  medication: { icon: 'medication', color: '#60a5fa' },
  lifestyle: { icon: 'bedtime', color: '#a78bfa' },
  exercise: { icon: 'directions_run', color: '#34d399' },
  diet: { icon: 'restaurant', color: '#f59e0b' },
  monitoring: { icon: 'monitor_heart', color: '#f472b6' },
}

export default function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(false)

  const config = CATEGORY_CONFIG[goal.category as GoalCategory] ?? CATEGORY_CONFIG.lifestyle
  const isActive = goal.status === 'active'
  const isCompleted = goal.status === 'completed'

  const logCount = goal.adherenceLog?.length ?? 0

  const handleStatusChange = async (status: string) => {
    setUpdating(true)
    try {
      await fetch(`/api/coach/goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      onUpdate()
    } finally {
      setUpdating(false)
    }
  }

  const handleLogAdherence = async () => {
    if (!note.trim()) return
    setUpdating(true)
    try {
      await fetch(`/api/coach/goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adherenceEntry: { date: new Date().toISOString(), value: 'logged', note: note.trim() },
        }),
      })
      setNote('')
      onUpdate()
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className={`surface-glass rounded-xl p-4 border transition-all ${
      isCompleted ? 'border-tertiary-fixed-dim/30 opacity-70' : isActive ? 'border-primary-fixed-dim/20' : 'border-outline-variant/20'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}15` }}>
            <span className="material-symbols-outlined text-[18px]" style={{ color: config.color }}>{config.icon}</span>
          </div>
          <div>
            <h4 className="text-label-md font-semibold text-on-surface">{goal.title}</h4>
            <p className="text-[10px] text-on-surface-variant mt-0.5 capitalize">{goal.category}</p>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
          isCompleted ? 'bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim border border-tertiary-fixed-dim/20'
          : isActive ? 'bg-primary-fixed-dim/10 text-primary-fixed-dim border border-primary-fixed-dim/20'
          : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20'
        }`}>
          {goal.status}
        </span>
      </div>

      <p className="text-label-sm text-on-surface-variant mb-3">{goal.description}</p>

      {goal.targetValue && (
        <div className="flex items-center gap-2 mb-3 text-[10px] text-on-surface-variant">
          <span className="material-symbols-outlined text-[12px]">flag</span>
          Target: {goal.targetValue}{goal.unit ? ` ${goal.unit}` : ''}
        </div>
      )}

      {/* Adherence log count */}
      {logCount > 0 && (
        <div className="text-[10px] text-primary-fixed-dim mb-2">
          {logCount} log{logCount !== 1 ? 's' : ''} recorded
        </div>
      )}

      {/* Actions */}
      {isActive && (
        <div className="space-y-2 pt-3 border-t border-outline-variant/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Log progress (e.g., '30 min walk done')"
              className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-1.5 text-label-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary-fixed-dim/50"
            />
            <button
              onClick={handleLogAdherence}
              disabled={updating || !note.trim()}
              className="px-3 py-1.5 rounded-lg bg-primary-fixed-dim/10 text-primary-fixed-dim text-label-sm font-semibold hover:bg-primary-fixed-dim/20 transition-colors disabled:opacity-50"
            >
              Log
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={updating}
              className="flex-1 px-3 py-1.5 rounded-lg bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim text-[10px] font-semibold hover:bg-tertiary-fixed-dim/20 transition-colors disabled:opacity-50"
            >
              Mark Complete
            </button>
            <button
              onClick={() => handleStatusChange('dismissed')}
              disabled={updating}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-[10px] font-semibold hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
