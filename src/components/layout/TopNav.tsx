'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function TopNav() {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Derive initials from user name
  const name = session?.user?.name ?? 'User'
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="fixed top-0 right-0 z-30 flex h-16 w-[calc(100%-16rem)] items-center justify-between px-6 bg-surface/70 backdrop-blur-lg border-b border-white/10">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assessments, results..."
          className="w-full rounded-full bg-surface-container-low border border-outline-variant/20 pl-9 pr-4 py-2 text-label-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-fixed-dim transition-colors"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 ml-6">
        {/* System status badge */}
        <div className="hidden md:flex items-center gap-1.5 bg-primary-fixed-dim/10 border border-primary-fixed-dim/20 rounded-full px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-tertiary-fixed-dim animate-pulse" />
          <span className="text-[11px] font-semibold text-primary-fixed-dim uppercase tracking-wider">
            System Status: Optimal
          </span>
        </div>

        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary-fixed-dim/30 transition-all duration-200">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {/* Red dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error border-2 border-surface" />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-on-primary shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #00dbe7 0%, #006a71 100%)',
                }}
              >
                {initials}
              </div>
              <div className="hidden md:flex flex-col leading-tight text-left">
                <span className="text-label-md font-semibold text-on-surface">
                  {name}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Clinical User
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              expand_more
            </span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 surface-glass rounded-xl border border-outline-variant/20 shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="text-label-sm font-semibold text-on-surface truncate">{name}</p>
                <p className="text-[10px] text-on-surface-variant truncate">{session?.user?.email ?? ''}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-label-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                  Profile
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-label-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">dashboard</span>
                  Dashboard
                </Link>
              </div>
              <div className="border-t border-outline-variant/10 py-1">
                <button
                  onClick={() => signOut({ redirect: false }).then(() => { window.location.href = '/login' })}
                  className="flex items-center gap-2 px-4 py-2 text-label-sm text-error hover:bg-error/10 transition-colors w-full text-left"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}