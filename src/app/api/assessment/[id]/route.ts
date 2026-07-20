import { NextResponse } from 'next/server'
import { getCurrentUserForApi, ANON_COOKIE, ANON_COOKIE_OPTIONS } from '@/lib/anonymous'
import { db } from '@/lib/db'
import { toAssessmentWithResults } from '@/lib/utils'
import type { ApiResponse, AssessmentWithResults } from '@/types'

interface Params {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  const { user, isNew, anonId } = await getCurrentUserForApi()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const row = await db.assessment.findUnique({
    where: { id: params.id },
  })

  if (!row) {
    return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 })
  }

  if (row.userId !== user.id) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const data: AssessmentWithResults = toAssessmentWithResults(row)

  const response: ApiResponse<AssessmentWithResults> = { success: true, data }
  const res = NextResponse.json(response)
  if (isNew) res.cookies.set(ANON_COOKIE, anonId, ANON_COOKIE_OPTIONS)
  return res
}