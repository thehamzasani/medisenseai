import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const startedAt = Date.now()

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startedAt) / 1000),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startedAt) / 1000),
        error: error instanceof Error ? error.message : 'Database connection failed',
      },
      { status: 503 }
    )
  }
}