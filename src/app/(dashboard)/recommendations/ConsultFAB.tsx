'use client'

import { useState } from 'react'

export default function ConsultFAB() {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="fixed bottom-10 right-10 z-50 flex items-center justify-end">
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          window.open('https://www.healthgrades.com/find-a-doctor', '_blank')
        }}
        className="btn-cyan flex items-center gap-2 py-3 px-4 rounded-full shadow-lg overflow-hidden transition-all duration-300"
        style={{ maxWidth: hovered ? '200px' : '52px' }}
        aria-label="Consult Clinical AI"
      >
        <span className="material-symbols-outlined flex-shrink-0">support_agent</span>
        <span
          className="whitespace-nowrap font-semibold text-label-md overflow-hidden transition-all duration-300"
          style={{ opacity: hovered ? 1 : 0, width: hovered ? 'auto' : 0 }}
        >
          Consult Clinical AI
        </span>
      </button>
    </div>
  )
}