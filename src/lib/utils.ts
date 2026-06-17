import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { RISK_COLORS } from '@/constants'
import type { AssessmentWithResults, EngineResult, RecommendationsData } from '@/types'

// ─── cn ───────────────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ─── formatDate ───────────────────────────────────────────────────────────────
// Returns "May 19, 2026"
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── formatRelativeTime ───────────────────────────────────────────────────────
// Returns "2h ago", "3 days ago", "Just now"
export function formatRelativeTime(date: Date | string): string {
  const d    = typeof date === 'string' ? new Date(date) : date
  const now  = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000) // seconds

  if (diff < 60)                    return 'Just now'
  if (diff < 3600)                  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)                 return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7)             return `${Math.floor(diff / 86400)} days ago`
  if (diff < 86400 * 30)            return `${Math.floor(diff / (86400 * 7))} weeks ago`
  if (diff < 86400 * 365)           return `${Math.floor(diff / (86400 * 30))} months ago`
  return `${Math.floor(diff / (86400 * 365))} years ago`
}

// ─── calculateBMI ─────────────────────────────────────────────────────────────
// weight in kg, height in cm → BMI rounded to 1 decimal
export function calculateBMI(weight: number, height: number): number {
  if (!height || !weight) return 0
  const heightM = height / 100
  return Math.round((weight / (heightM * heightM)) * 10) / 10
}

// ─── getRiskColor ─────────────────────────────────────────────────────────────
export function getRiskColor(level: string): { bg: string; text: string; border: string } {
  const key = level?.toUpperCase() as keyof typeof RISK_COLORS
  return (
    RISK_COLORS[key] ?? {
      bg: 'bg-surface-container-high',
      text: 'text-on-surface-variant',
      border: 'border-outline-variant',
    }
  )
}

// ─── getRiskLabel ─────────────────────────────────────────────────────────────
export function getRiskLabel(level: string): string {
  const map: Record<string, string> = {
    LOW:      'Low Risk',
    MEDIUM:   'Medium Risk',
    HIGH:     'High Risk',
    CRITICAL: 'Critical',
  }
  return map[level?.toUpperCase()] ?? 'Unknown'
}

// ─── getHealthScoreColor ──────────────────────────────────────────────────────
// ≥80 tertiary, ≥60 secondary, ≥40 amber, <40 error
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-tertiary-fixed-dim'
  if (score >= 60) return 'text-secondary'
  if (score >= 40) return 'text-amber-400'
  return 'text-error'
}

// ─── formatEngineAccuracy ─────────────────────────────────────────────────────
// 99.2 → "99.2%"
export function formatEngineAccuracy(accuracy: number): string {
  return `${accuracy.toFixed(1)}%`
}

// ─── toAssessmentWithResults ──────────────────────────────────────────────────
// Casts engineResults and recommendations from Prisma Json to typed objects,
// converts createdAt to ISO string.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toAssessmentWithResults(row: any): AssessmentWithResults {
  return {
    ...row,
    createdAt: row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : row.createdAt,
    engineResults: row.engineResults
      ? (row.engineResults as unknown as EngineResult[])
      : null,
    recommendations: row.recommendations
      ? (row.recommendations as unknown as RecommendationsData)
      : null,
  }
}