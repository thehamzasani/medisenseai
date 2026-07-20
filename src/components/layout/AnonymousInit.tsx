'use client'

import { useEffect } from 'react'

export default function AnonymousInit() {
  useEffect(() => {
    const hasCookie = document.cookie
      .split('; ')
      .some(row => row.startsWith('medisense_anon_id='))

    if (!hasCookie) {
      fetch('/api/anon-init', { method: 'POST' }).catch(() => {})
    }
  }, [])

  return null
}
