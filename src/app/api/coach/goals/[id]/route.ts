import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { getCurrentUserForApi, ANON_COOKIE, ANON_COOKIE_OPTIONS } from '@/lib/anonymous'
import { db } from '@/lib/db'
import type { AdherenceEntry } from '@/types'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { user, isNew, anonId } = await getCurrentUserForApi()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const goal = await db.healthGoal.findUnique({ where: { id: params.id } })
  if (!goal || goal.userId !== user.id) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  let body: {
    status?: string
    currentValue?: string
    adherenceEntry?: AdherenceEntry
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}

  if (body.status) {
    updateData.status = body.status
    if (body.status === 'completed') {
      updateData.completedAt = new Date()
    }
  }

  if (body.currentValue !== undefined) {
    updateData.currentValue = body.currentValue
  }

  if (body.adherenceEntry) {
    const log = (goal.adherenceLog as unknown as AdherenceEntry[]) ?? []
    log.push(body.adherenceEntry)
    updateData.adherenceLog = log as unknown as Prisma.InputJsonValue
  }

  await db.healthGoal.update({
    where: { id: params.id },
    data: updateData,
  })

  // Create coach interaction for status changes
  if (body.status === 'completed') {
    await db.coachInteraction.create({
      data: {
        userId: user.id,
        type: 'goal_completed',
        content: `Goal completed: ${goal.title}`,
        metadata: { goalId: params.id, goalTitle: goal.title },
      },
    })
  }

  const res = NextResponse.json({ success: true })
  if (isNew) res.cookies.set(ANON_COOKIE, anonId, ANON_COOKIE_OPTIONS)
  return res
}
