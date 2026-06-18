'use client'

import { toast } from 'sonner'

export default function EnginesPageFAB() {
  return (
    <button
      onClick={() => {
        toast.success('Neural Network model is already the active prediction engine.', {
          description: 'MediSense uses the highest-accuracy engine for all primary results.',
        })
      }}
      className="fixed bottom-10 right-10 btn-cyan flex items-center gap-2 px-6 py-3 shadow-lg z-50"
      aria-label="Deploy Best Model"
    >
      <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
      <span className="font-semibold">Deploy Best Model</span>
    </button>
  )
}