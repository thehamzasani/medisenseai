'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(21, 27, 45, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 219, 231, 0.2)',
            color: '#dce1fb',
          },
        }}
      />
    </SessionProvider>
  )
}