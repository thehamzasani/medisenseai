import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export default async function DetectionIndexPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const latest = await db.assessment.findFirst({
    where: {
      userId: session.user.id,
      analysisStatus: 'COMPLETE',
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })

  if (!latest) redirect('/assessment/new')
  redirect(`/detection/${latest.id}`)
}