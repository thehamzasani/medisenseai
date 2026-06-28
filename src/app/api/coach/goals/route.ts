import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { HealthGoalData, GoalStatus, GoalCategory, AdherenceEntry } from '@/types'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const goals = await db.healthGoal.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  const data: HealthGoalData[] = goals.map(g => ({
    id: g.id,
    userId: g.userId,
    assessmentId: g.assessmentId,
    category: g.category as GoalCategory,
    title: g.title,
    description: g.description,
    targetValue: g.targetValue,
    currentValue: g.currentValue,
    unit: g.unit,
    startDate: g.startDate.toISOString(),
    targetDate: g.targetDate?.toISOString() ?? null,
    completedAt: g.completedAt?.toISOString() ?? null,
    status: g.status as GoalStatus,
    adherenceLog: (g.adherenceLog as unknown as AdherenceEntry[]) ?? [],
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  }))

  return NextResponse.json({ success: true, data })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    assessmentId: string
    category: string
    title: string
    description: string
    targetValue?: string
    unit?: string
    targetDate?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const goal = await db.healthGoal.create({
    data: {
      userId: session.user.id,
      assessmentId: body.assessmentId,
      category: body.category,
      title: body.title,
      description: body.description,
      targetValue: body.targetValue ?? null,
      unit: body.unit ?? null,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      adherenceLog: [],
    },
  })

  return NextResponse.json({
    success: true,
    data: { id: goal.id },
  })
}
