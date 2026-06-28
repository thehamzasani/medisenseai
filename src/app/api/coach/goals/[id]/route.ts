import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { AdherenceEntry } from '@/types'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const goal = await db.healthGoal.findUnique({ where: { id: params.id } })
  if (!goal || goal.userId !== session.user.id) {
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
        userId: session.user.id,
        type: 'goal_completed',
        content: `Goal completed: ${goal.title}`,
        metadata: { goalId: params.id, goalTitle: goal.title },
      },
    })
  }

  return NextResponse.json({ success: true })
}
