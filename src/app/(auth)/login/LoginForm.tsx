'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/dashboard'

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [error,       setError]       = useState('')
  const [isLoading,   setIsLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="surface-glass rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="gradient-text text-headline-md font-bold mb-2">
            Welcome Back
          </h2>
          <p className="text-on-surface-variant text-body-md">
            Sign in to your clinical dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-label-md flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="doctor@clinic.com"
              className="w-full border-b border-outline focus:border-primary-fixed-dim bg-transparent text-on-surface py-2 focus:outline-none transition-colors placeholder:text-on-surface-variant/40 text-body-md"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border-b border-outline focus:border-primary-fixed-dim bg-transparent text-on-surface py-2 pr-10 focus:outline-none transition-colors placeholder:text-on-surface-variant/40 text-body-md"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-0 bottom-2 text-on-surface-variant hover:text-primary-fixed-dim transition-colors"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-cyan w-full py-3 text-label-md font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">
                  progress_activity
                </span>
                Signing In…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">login</span>
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo hint */}
        <div className="mt-6 p-3 rounded-lg bg-primary-fixed-dim/5 border border-primary-fixed-dim/10">
          <p className="text-label-sm text-on-surface-variant text-center">
            <span className="text-primary-fixed-dim font-semibold">Demo:</span>{' '}
            demo@medisense.ai{' '}
            <span className="text-on-surface-variant/60">/</span>{' '}
            Demo@123456
          </p>
        </div>

        {/* Register link */}
        <p className="text-center text-on-surface-variant text-label-md mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-primary-fixed-dim hover:text-primary-container transition-colors font-semibold"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}