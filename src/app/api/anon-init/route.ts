import { NextResponse } from 'next/server'
import { ANON_COOKIE } from '@/lib/anonymous'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
}

async function createAnonymousUser() {
  const { randomUUID } = await import('crypto')
  const anonId = randomUUID()

  const { db } = await import('@/lib/db')
  await db.user.create({
    data: {
      id: anonId,
      name: 'Guest',
      email: `guest-${anonId.slice(0, 8)}@medisense.local`,
    },
  })

  return anonId
}

export async function GET(request: Request) {
  const anonId = await createAnonymousUser()

  const { searchParams } = new URL(request.url)
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const response = NextResponse.redirect(new URL(redirectTo, request.url))
  response.cookies.set(ANON_COOKIE, anonId, COOKIE_OPTIONS)
  return response
}

export async function POST() {
  const anonId = await createAnonymousUser()

  const response = NextResponse.json({ success: true })
  response.cookies.set(ANON_COOKIE, anonId, COOKIE_OPTIONS)
  return response
}
