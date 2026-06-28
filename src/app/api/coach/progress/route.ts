import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { CoachProgressData } from '@/types'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const goals = await db.healthGoal.findMany({
    where: { userId: session.user.id },
  })

  const completedGoals = goals.filter(g => g.status === 'completed').length
  const activeGoals = goals.filter(g => g.status === 'active').length
  const missedGoals = goals.filter(g => g.status === 'missed').length
  const totalGoals = goals.length
  const adherenceRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  // Calculate streak (consecutive days with at least one adherence log entry)
  const allLogs = goals.flatMap(g => {
    const log = g.adherenceLog as unknown as { date: string }[] | null
    return log?.map(l => new Date(l.date).toDateString()) ?? []
  })
  const uniqueDays = Array.from(new Set(allLogs)).sort()
  let streakDays = 0
  for (let i = uniqueDays.length - 1; i >= 0; i--) {
    const expected = new Date()
    expected.setDate(expected.getDate() - (uniqueDays.length - 1 - i))
    if (uniqueDays[i] === expected.toDateString()) {
      streakDays++
    } else {
      break
    }
  }

  // Get latest 2 completed assessments for health comparison
  const assessments = await db.assessment.findMany({
    where: { userId: session.user.id, analysisStatus: 'COMPLETE' },
    orderBy: { createdAt: 'desc' },
    take: 2,
  })

  const current = assessments[0]
  const previous = assessments[1]

  const currentIndex = current?.overallHealthIndex ?? null
  const previousIndex = previous?.overallHealthIndex ?? null
  const healthDelta = currentIndex != null && previousIndex != null ? currentIndex - previousIndex : null

  const biomarkerChanges = [
    { label: 'Fasting Glucose', current: current?.fastingGlucose ?? null, previous: previous?.fastingGlucose ?? null, unit: 'mg/dL', isImproving: false },
    { label: 'HbA1c', current: current?.hba1c ?? null, previous: previous?.hba1c ?? null, unit: '%', isImproving: false },
    { label: 'Systolic BP', current: current?.systolicBP ?? null, previous: previous?.systolicBP ?? null, unit: 'mmHg', isImproving: false },
    { label: 'Diastolic BP', current: current?.diastolicBP ?? null, previous: previous?.diastolicBP ?? null, unit: 'mmHg', isImproving: false },
    { label: 'Cholesterol', current: current?.cholesterol ?? null, previous: previous?.cholesterol ?? null, unit: 'mg/dL', isImproving: false },
    { label: 'BMI', current: current?.bmi ?? null, previous: previous?.bmi ?? null, unit: 'kg/m²', isImproving: false },
  ].map(b => ({
    ...b,
    delta: b.current != null && b.previous != null ? Math.round((b.current - b.previous) * 10) / 10 : null,
    isImproving: b.current != null && b.previous != null ? b.current < b.previous : false,
  }))

  const progress: CoachProgressData = {
    totalGoals,
    completedGoals,
    activeGoals,
    missedGoals,
    adherenceRate,
    streakDays,
    currentHealthIndex: currentIndex,
    previousHealthIndex: previousIndex,
    healthDelta,
    biomarkerChanges,
  }

  return NextResponse.json({ success: true, data: progress })
}
