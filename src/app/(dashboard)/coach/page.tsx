'use client'

import { useState, useEffect, useCallback } from 'react'
import type { HealthGoalData, CoachInteractionData, CoachProgressData } from '@/types'
import GoalCard from '@/components/coach/GoalCard'
import CoachProgressComparison from '@/components/coach/CoachProgressComparison'
import CoachMessageCard from '@/components/coach/CoachMessageCard'

export default function CoachPage() {
  const [goals, setGoals] = useState<HealthGoalData[]>([])
  const [messages, setMessages] = useState<CoachInteractionData[]>([])
  const [progress, setProgress] = useState<CoachProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkInLoading, setCheckInLoading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [goalsRes, messagesRes, progressRes] = await Promise.all([
        fetch('/api/coach/goals'),
        fetch('/api/coach/check-in'),
        fetch('/api/coach/progress'),
      ])
      const [goalsJson, messagesJson, progressJson] = await Promise.all([
        goalsRes.json(), messagesRes.json(), progressRes.json(),
      ])
      if (goalsJson.success) setGoals(goalsJson.data ?? [])
      if (messagesJson.success) setMessages(messagesJson.data ?? [])
      if (progressJson.success) setProgress(progressJson.data ?? null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCheckIn = async () => {
    setCheckInLoading(true)
    try {
      const res = await fetch('/api/coach/check-in', { method: 'POST' })
      const json = await res.json()
      if (json.success && json.data) {
        setMessages(prev => [json.data, ...prev])
      }
    } finally {
      setCheckInLoading(false)
    }
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const hasData = !loading && goals.length > 0

  return (
    <div className="p-xl relative min-h-screen">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">favorite</span>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
            Preventive Health Coach
          </span>
        </div>
        <h1 className="text-headline-lg font-bold text-on-surface">Your Health Journey</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Track goals, log progress, and get AI-powered guidance
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-primary-fixed-dim/30 animate-spin-slow" />
        </div>
      ) : !hasData ? (
        <div className="surface-glass rounded-2xl p-12 text-center max-w-lg mx-auto mt-10">
          <span className="material-symbols-outlined text-primary-fixed-dim text-5xl mb-4 block">favorite</span>
          <h2 className="text-headline-md font-semibold text-on-surface mb-2">No Health Goals Yet</h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Complete an AI-powered assessment to get personalized health goals and coaching.
          </p>
          <a href="/assessment/new" className="btn-cyan inline-flex items-center gap-2 px-6 py-3">
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Start Assessment
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Left column: messages */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <CoachMessageCard
              messages={messages}
              onRequestCheckIn={handleCheckIn}
              isLoading={checkInLoading}
            />
          </div>

          {/* Right column: goals + progress */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Stats bar */}
            {progress && (
              <div className="grid grid-cols-4 gap-3">
                <div className="surface-glass rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Active Goals</p>
                  <p className="text-headline-sm font-bold text-primary-fixed-dim">{progress.activeGoals}</p>
                </div>
                <div className="surface-glass rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Completed</p>
                  <p className="text-headline-sm font-bold text-tertiary-fixed-dim">{progress.completedGoals}</p>
                </div>
                <div className="surface-glass rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Adherence</p>
                  <p className={`text-headline-sm font-bold ${
                    progress.adherenceRate >= 70 ? 'text-tertiary-fixed-dim' : progress.adherenceRate >= 40 ? 'text-secondary' : 'text-error'
                  }`}>
                    {progress.adherenceRate}%
                  </p>
                </div>
                <div className="surface-glass rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Streak</p>
                  <p className="text-headline-sm font-bold text-on-surface">{progress.streakDays}d</p>
                </div>
              </div>
            )}

            {/* Progress comparison */}
            {progress && <CoachProgressComparison progress={progress} />}

            {/* Active goals */}
            {activeGoals.length > 0 && (
              <div>
                <h2 className="text-label-md font-semibold text-on-surface uppercase tracking-wider mb-3">
                  Active Goals ({activeGoals.length})
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {activeGoals.map(g => (
                    <GoalCard key={g.id} goal={g} onUpdate={fetchData} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed goals */}
            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-label-md font-semibold text-on-surface uppercase tracking-wider mb-3">
                  Completed ({completedGoals.length})
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {completedGoals.map(g => (
                    <GoalCard key={g.id} goal={g} onUpdate={fetchData} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
