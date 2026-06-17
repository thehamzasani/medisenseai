import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// @ts-ignore: allow global CSS import in layout
import './globals.css'
import Providers from '@/components/layout/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MediSense AI | Clinical Intelligence',
  description:
    'AI-powered disease prediction and health monitoring platform. Run 10 clinical AI engines in parallel for comprehensive health risk assessment.',
  keywords: ['health AI', 'disease prediction', 'clinical intelligence', 'medical AI'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Material Symbols Outlined — Google Fonts CDN */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-background text-on-surface font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}