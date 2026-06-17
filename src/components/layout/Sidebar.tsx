'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { NAV_ITEMS } from '@/constants'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string): boolean {
    // Special handling: /assessment/new should only match that exact path
    if (href === '/assessment/new') return pathname === '/assessment/new'
    // For /results, /engines, etc. — match the segment
    if (href === '/results') return pathname.startsWith('/results')
    if (href === '/engines') return pathname.startsWith('/engines')
    if (href === '/detection') return pathname.startsWith('/detection')
    if (href === '/trends') return pathname.startsWith('/trends')
    if (href === '/recommendations') return pathname.startsWith('/recommendations')
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-surface/70 backdrop-blur-xl border-r border-outline-variant/10">
      {/* Logo */}
      <div className="flex flex-col gap-0.5 px-6 py-6 border-b border-outline-variant/10">
        <span className="text-headline-md font-bold text-primary-fixed-dim tracking-tight">
          MediSense AI
        </span>
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
          Clinical Intelligence v2.0
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-label-md font-medium transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-secondary-container to-primary-container text-on-secondary-container rounded-lg mx-0'
                  : 'text-on-surface-variant hover:text-primary hover:bg-white/5 hover:scale-[1.01] mx-0'
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[20px]',
                  active ? 'text-on-secondary-container' : ''
                )}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* New Analysis button */}
      <div className="px-4 pb-4 border-t border-outline-variant/10 pt-4">
        <button
          onClick={() => router.push('/assessment/new')}
          className="btn-cyan w-full py-3 rounded-xl text-label-md font-bold flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          New Analysis
        </button>
      </div>

      {/* Bottom links */}
      <div className="px-4 pb-6 space-y-1 border-t border-outline-variant/10 pt-3">
        <Link
          href="/support"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-label-md text-on-surface-variant hover:text-primary hover:bg-white/5 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          Support
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-label-md text-on-surface-variant hover:text-primary hover:bg-white/5 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
          Account
        </Link>
      </div>
    </aside>
  )
}