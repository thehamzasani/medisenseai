import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AssessmentWizard from '@/components/assessment/AssessmentWizard'

export default async function NewAssessmentPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="relative">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      <div className="mb-lg">
        <h1 className="text-headline-lg font-bold text-on-surface">New Clinical Assessment</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Complete all six steps to run a full analysis across 10 AI diagnostic engines.
        </p>
      </div>

      <AssessmentWizard />
    </div>
  )
}