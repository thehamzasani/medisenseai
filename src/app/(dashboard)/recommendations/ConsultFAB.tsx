'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function ConsultFAB() {
  const [hovered, setHovered] = useState(false)

  const handleConsult = () => {
    toast.success('Clinical AI Consultation', {
      description: 'Your consultation request has been queued. A summary will be sent to your registered provider.',
      duration: 5000,
    })
  }

  return (
    <div className="fixed bottom-10 right-10 z-50 flex items-center justify-end">
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleConsult}
        className="btn-cyan flex items-center gap-0 py-3 pl-4 pr-4 transition-all duration-500 ease-in-out overflow-hidden"
        style={{
          maxWidth: hovered ? '280px' : '52px',
          borderRadius: '9999px',
          whiteSpace: 'nowrap',
        }}
      >
        <span className="material-symbols-outlined text-xl flex-shrink-0">
          psychology
        </span>
        <span
          className="overflow-hidden transition-all duration-500 ml-2"
          style={{
            maxWidth: hovered ? '200px' : '0px',
            opacity: hovered ? 1 : 0,
          }}
        >
          Consult Clinical AI
        </span>
      </button>
    </div>
  )
}