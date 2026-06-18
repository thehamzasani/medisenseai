import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { ApiResponse, UserProfile } from '@/types'


const userProfileSchema = z.object({
  name:        z.string().min(2).max(80).optional(),
  dateOfBirth: z.string().datetime().nullable().optional(),
  gender:      z.enum(['Male', 'Female', 'Other']).nullable().optional(),
  bloodType:   z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).nullable().optional(),
})


export async function GET(): Promise<NextResponse<ApiResponse<UserProfile>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id:          true,
        name:        true,
        email:       true,
        image:       true,
        dateOfBirth: true,
        gender:      true,
        bloodType:   true,
        createdAt:   true,
        _count: {
          select: { assessments: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const profile: UserProfile = {
      id:              user.id,
      name:            user.name,
      email:           user.email,
      image:           user.image,
      dateOfBirth:     user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
      gender:          user.gender,
      bloodType:       user.bloodType,
      createdAt:       user.createdAt.toISOString(),
      assessmentCount: user._count.assessments,
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('[GET /api/users/me]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}


export async function PATCH(request: Request): Promise<NextResponse<ApiResponse<UserProfile>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body: unknown = await request.json()
    const parsed = userProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    const { name, dateOfBirth, gender, bloodType } = parsed.data

    // Build update payload — only include defined fields
    const updateData: {
      name?: string
      dateOfBirth?: Date | null
      gender?: string | null
      bloodType?: string | null
    } = {}

    if (name       !== undefined) updateData.name       = name
    if (gender     !== undefined) updateData.gender     = gender
    if (bloodType  !== undefined) updateData.bloodType  = bloodType
    if (dateOfBirth !== undefined) {
      updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data:  updateData,
      select: {
        id:          true,
        name:        true,
        email:       true,
        image:       true,
        dateOfBirth: true,
        gender:      true,
        bloodType:   true,
        createdAt:   true,
        _count: {
          select: { assessments: true },
        },
      },
    })

    const profile: UserProfile = {
      id:              updated.id,
      name:            updated.name,
      email:           updated.email,
      image:           updated.image,
      dateOfBirth:     updated.dateOfBirth ? updated.dateOfBirth.toISOString() : null,
      gender:          updated.gender,
      bloodType:       updated.bloodType,
      createdAt:       updated.createdAt.toISOString(),
      assessmentCount: updated._count.assessments,
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('[PATCH /api/users/me]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}