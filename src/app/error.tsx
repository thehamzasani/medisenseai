'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Global Error]', error)
  }, [error])

  return (
    <html>
      <body className="bg-background min-h-screen flex items-center justify-center font-sans">
        <div className="relative overflow-hidden">
          {/* Atmospheric background */}
          <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-error-container/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 blur-[120px] rounded-full" />
          </div>

          <div
            className="text-center px-8 py-12 rounded-2xl max-w-lg mx-4"
            style={{
              background: 'rgba(21, 27, 45, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 180, 171, 0.2)',
            }}
          >
            <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-error text-3xl">error</span>
            </div>

            <h1 className="text-2xl font-bold text-on-surface mb-2">Something went wrong</h1>
            <p className="text-on-surface-variant text-base mb-6 leading-relaxed">
              An unexpected error occurred. Our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && error?.message && (
              <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-left">
                <p className="text-error text-xs font-mono break-all">{error.message}</p>
                {error.digest && (
                  <p className="text-outline text-xs mt-1">Digest: {error.digest}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #00dbe7 0%, #006a71 100%)',
                  color: '#002022',
                }}
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  refresh
                </span>
                Try Again
              </button>
              <a
                href="/dashboard"
                className="px-6 py-2.5 rounded-full border border-outline-variant text-on-surface hover:border-primary-fixed-dim hover:text-primary-fixed-dim transition-colors text-sm font-semibold"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}