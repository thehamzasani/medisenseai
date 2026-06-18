import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// Routes that require an authenticated session
const PROTECTED_PAGE_PREFIXES = [
  '/dashboard',
  '/assessment',
  '/results',
  '/engines',
  '/detection',
  '/trends',
  '/recommendations',
  '/history',
  '/profile',
]

// Public pages — no auth needed
const PUBLIC_PAGES = ['/', '/login', '/register']

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl
  const session = req.auth

  // ── API routes ─────────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    // NextAuth's own routes are always public
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next()
    }

    // All other API routes require a valid session
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )
    }

    return NextResponse.next()
  }

  // ── Public pages ───────────────────────────────────────────────────────────
  if (PUBLIC_PAGES.includes(pathname)) {
    return NextResponse.next()
  }

  // ── Protected dashboard pages ──────────────────────────────────────────────
  const isProtected = PROTECTED_PAGE_PREFIXES.some(prefix =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  if (isProtected && !session?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  // Run middleware on all routes except Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}