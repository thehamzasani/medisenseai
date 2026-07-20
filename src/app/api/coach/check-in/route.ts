import { NextResponse } from 'next/server'
import { getCurrentUserForApi, ANON_COOKIE, ANON_COOKIE_OPTIONS } from '@/lib/anonymous'
import { db } from '@/lib/db'
import { generateCoachMessage } from '@/lib/coach'
import type { CoachInteractionData } from '@/types'

export async function POST() {
  const { user, isNew, anonId } = await getCurrentUserForApi()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await db.user.findUnique({ where: { id: user.id } })
  const userName = dbUser?.name ?? 'Patient'

  const goals = await db.healthGoal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const adherenceRate = goals.length > 0
    ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100)
    : 0

  const streakDays = goals.filter(g => g.status === 'completed').length

  const assessments = await db.assessment.findMany({
    where: { userId: user.id, analysisStatus: 'COMPLETE' },
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
      userId: user.id,
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

  const postRes = NextResponse.json({ success: true, data })
  if (isNew) postRes.cookies.set(ANON_COOKIE, anonId, ANON_COOKIE_OPTIONS)
  return postRes
}

export async function GET() {
  const { user, isNew, anonId } = await getCurrentUserForApi()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const interactions = await db.coachInteraction.findMany({
    where: { userId: user.id },
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

  const getRes = NextResponse.json({ success: true, data })
  if (isNew) getRes.cookies.set(ANON_COOKIE, anonId, ANON_COOKIE_OPTIONS)
  return getRes
}
