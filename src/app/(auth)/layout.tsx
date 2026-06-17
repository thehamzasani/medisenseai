import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
      </div>

      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="gradient-text text-headline-lg font-bold tracking-tight">
          MediSense AI
        </h1>
        <p className="text-on-surface-variant text-label-sm uppercase tracking-widest mt-1">
          Clinical Intelligence
        </p>
      </div>

      {children}
    </div>
  )
}