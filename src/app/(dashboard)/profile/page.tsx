import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import ProfileForm from './ProfileForm'
import type { UserProfile } from '@/types'

export const metadata = {
  title: 'Profile | MediSense AI',
  description: 'Manage your clinical profile and personal settings',
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

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
      assessments: {
        select: { overallHealthIndex: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!user) redirect('/login')

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

  // Compute best and latest health scores
  const scores = user.assessments
    .map(a => a.overallHealthIndex)
    .filter((s): s is number => s !== null)

  const latestScore = scores[0] ?? null
  const bestScore   = scores.length > 0 ? Math.max(...scores) : null

  return (
    <div className="min-h-screen p-xl">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary-fixed-dim text-label-sm">
            manage_accounts
          </span>
          <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">
            Clinical Profile
          </span>
        </div>
        <h1 className="text-headline-lg font-bold text-on-surface">
          Account <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Manage your personal information and clinical preferences.
        </p>
      </div>

      <ProfileForm
        profile={profile}
        latestScore={latestScore}
        bestScore={bestScore}
      />
    </div>
  )
}