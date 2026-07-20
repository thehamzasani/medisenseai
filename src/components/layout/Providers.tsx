'use client'

import { Toaster } from 'sonner'
import AnonymousInit from './AnonymousInit'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnonymousInit />
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
    </>
  )
}
