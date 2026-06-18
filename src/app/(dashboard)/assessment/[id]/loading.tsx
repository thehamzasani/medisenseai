import LoadingSkeleton from '@/components/shared/LoadingSkeleton'

export default function AssessmentRedirectLoading() {
  return (
    <div className="min-h-screen p-xl flex items-center justify-center">
      <div className="surface-glass rounded-2xl p-12 flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="w-16 h-16 rounded-full border-4 border-primary-fixed-dim/30 border-t-primary-fixed-dim animate-spin" />
        <div>
          <LoadingSkeleton height="h-6" width="w-48" rounded="rounded-lg" className="mx-auto mb-2" />
          <LoadingSkeleton height="h-4" width="w-36" rounded="rounded" className="mx-auto" />
        </div>
      </div>
    </div>
  )
}