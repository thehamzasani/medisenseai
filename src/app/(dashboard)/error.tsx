'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Dashboard Error]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-error-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-surface-container/10 blur-[120px] rounded-full" />
      </div>

      <div className="surface-glass rounded-2xl p-10 max-w-md w-full text-center">
        {/* Error icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 border border-error/20">
            <span className="material-symbols-outlined text-[32px] text-error">
              error
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">
          Something went wrong
        </h2>

        {/* Message */}
        <p className="text-body-md text-on-surface-variant mb-2">
          An unexpected error occurred while loading this page.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="text-[11px] text-on-surface-variant/60 font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}
        {!error.digest && <div className="mb-6" />}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-cyan px-6 py-2.5 text-label-md font-bold rounded-full"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-2.5 text-label-md font-medium text-on-surface-variant border border-outline-variant rounded-full hover:border-primary-fixed-dim/40 hover:text-primary transition-all duration-200"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}