import { cookies } from 'next/headers'
import { db } from './db'

export const ANON_COOKIE = 'medisense_anon_id'

export const ANON_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
}

export async function getCurrentUser() {
  const cookieStore = cookies()
  const anonId = cookieStore.get(ANON_COOKIE)?.value
  if (!anonId) return null

  const user = await db.user.findUnique({ where: { id: anonId } })
  if (!user) return null

  return user
}

export async function getCurrentUserForApi() {
  const cookieStore = cookies()
  let anonId = cookieStore.get(ANON_COOKIE)?.value
  let isNew = false

  if (!anonId) {
    const { randomUUID } = await import('crypto')
    anonId = randomUUID()
    isNew = true
  }

  let user = await db.user.findUnique({ where: { id: anonId } })

  if (!user) {
    user = await db.user.create({
      data: {
        id: anonId,
        name: 'Guest',
        email: `guest-${anonId.slice(0, 8)}@medisense.local`,
      },
    })
    isNew = true
  }

  return { user, isNew, anonId }
}
