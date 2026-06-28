import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateCoachMessage } from '@/lib/coach'
import type { CoachInteractionData } from '@/types'

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  const userName = user?.name ?? 'Patient'

  const goals = await db.healthGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const adherenceRate = goals.length > 0
    ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100)
    : 0

  const streakDays = goals.filter(g => g.status === 'completed').length

  const assessments = await db.assessment.findMany({
    where: { userId: session.user.id, analysisStatus: 'COMPLETE' },
    orderBy: { createdAt: 'desc' },
    take: 2,
  })
  const healthDelta = assessments.length >= 2
    ? (assessments[0].overallHealthIndex ?? 0) - (assessments[1].overallHealthIndex ?? 0)
    : null

  const message = await generateCoachMessage(
    userName,
    goals.map(g => ({ title: g.title, status: g.status })),
    adherenceRate,
    streakDays,
    healthDelta,
  )

  const interaction = await db.coachInteraction.create({
    data: {
      userId: session.user.id,
      type: 'check_in',
      content: message,
      metadata: { generatedAt: new Date().toISOString() },
    },
  })

  const data: CoachInteractionData = {
    id: interaction.id,
    userId: interaction.userId,
    type: interaction.type,
    content: interaction.content,
    metadata: interaction.metadata as Record<string, unknown> | null,
    createdAt: interaction.createdAt.toISOString(),
  }

  return NextResponse.json({ success: true, data })
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const interactions = await db.coachInteraction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const data: CoachInteractionData[] = interactions.map(i => ({
    id: i.id,
    userId: i.userId,
    type: i.type,
    content: i.content,
    metadata: i.metadata as Record<string, unknown> | null,
    createdAt: i.createdAt.toISOString(),
  }))

  return NextResponse.json({ success: true, data })
}
