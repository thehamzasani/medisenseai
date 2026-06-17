import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import type { ApiResponse } from '@/types'

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      const error = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error },
        { status: 400 },
      )
    }

    const { name, email, password } = parsed.data

    // Check if email is already taken
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true },
    })

    return NextResponse.json<ApiResponse<{ userId: string }>>(
      { success: true, data: { userId: user.id } },
      { status: 201 },
    )
  } catch (err) {
    console.error('[register] error:', err)
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}