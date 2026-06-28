'use client'

import { useState } from 'react'
import { formatRelativeTime } from '@/lib/utils'
import type { CoachInteractionData } from '@/types'

interface CoachMessageCardProps {
  messages: CoachInteractionData[]
  onRequestCheckIn: () => Promise<void>
  isLoading: boolean
}

const MESSAGE_ICONS: Record<string, string> = {
  check_in: 'chat',
  recommendation: 'clinical_notes',
  goal_created: 'add_task',
  goal_completed: 'check_circle',
  motivation: 'auto_awesome',
  progress_update: 'trending_up',
}

export default function CoachMessageCard({ messages, onRequestCheckIn, isLoading }: CoachMessageCardProps) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? messages : messages.slice(0, 5)

  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed-dim/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]">forum</span>
          </div>
          <div>
            <h3 className="text-headline-sm font-semibold text-on-surface">Health Coach</h3>
            <p className="text-label-sm text-on-surface-variant mt-0.5">AI-powered check-ins & guidance</p>
          </div>
        </div>
        <button
          onClick={onRequestCheckIn}
          disabled={isLoading}
          className="btn-cyan px-4 py-2 text-label-sm font-semibold flex items-center gap-1.5 disabled:opacity-60"
        >
          <span className={`material-symbols-outlined text-[14px] ${isLoading ? 'animate-spin' : ''}`}>
            {isLoading ? 'refresh' : 'auto_awesome'}
          </span>
          {isLoading ? 'Thinking...' : 'Check-In'}
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-8 text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl mb-2 block">forum</span>
          <p className="text-label-sm">No check-ins yet. Ask your Health Coach for a check-in!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(msg => {
            const icon = MESSAGE_ICONS[msg.type] ?? 'chat'
            const isCheckIn = msg.type === 'check_in'
            return (
              <div key={msg.id} className={`p-3 rounded-xl flex items-start gap-3 ${
                isCheckIn ? 'bg-primary-fixed-dim/5 border border-primary-fixed-dim/10' : 'bg-surface-container-low/50 border border-outline-variant/10'
              }`}>
                <span className={`material-symbols-outlined text-[16px] mt-0.5 shrink-0 ${
                  isCheckIn ? 'text-primary-fixed-dim' : 'text-on-surface-variant'
                }`}>
                  {icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-label-sm text-on-surface leading-relaxed">{msg.content}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">{formatRelativeTime(msg.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {messages.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-label-sm text-primary-fixed-dim hover:text-primary-fixed transition-colors w-full text-center"
        >
          {showAll ? 'Show less' : `Show all ${messages.length} messages`}
        </button>
      )}
    </div>
  )
}
