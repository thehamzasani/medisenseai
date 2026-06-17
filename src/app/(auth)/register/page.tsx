'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormState {
  name:            string
  email:           string
  password:        string
  confirmPassword: string
}

interface FieldErrors {
  name?:            string
  email?:           string
  password?:        string
  confirmPassword?: string
}

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState<FormState>({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors,      setErrors]      = useState<FieldErrors>({})
  const [apiError,    setApiError]    = useState('')
  const [isLoading,   setIsLoading]   = useState(false)

  function validate(): boolean {
    const e: FieldErrors = {}
    if (!form.name || form.name.trim().length < 2)
      e.name = 'Full name must be at least 2 characters.'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Please enter a valid email address.'
    if (!form.password || form.password.length < 8)
      e.password = 'Password must be at least 8 characters.'
    else if (!/[A-Z]/.test(form.password))
      e.password = 'Password must contain at least one uppercase letter.'
    else if (!/[a-z]/.test(form.password))
      e.password = 'Password must contain at least one lowercase letter.'
    else if (!/[0-9]/.test(form.password))
      e.password = 'Password must contain at least one number.'
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     form.name.trim(),
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setApiError(data.error ?? 'Registration failed. Please try again.')
      } else {
        router.push('/login?registered=1')
      }
    } catch {
      setApiError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function field(key: keyof FormState) {
    return {
      value:    form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value })),
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="surface-glass rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="gradient-text text-headline-md font-bold mb-2">
            Create Account
          </h2>
          <p className="text-on-surface-variant text-body-md">
            Start your clinical intelligence journey
          </p>
        </div>

        {/* API error */}
        {apiError && (
          <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-label-md flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              {...field('name')}
              required
              autoComplete="name"
              placeholder="Dr. Jane Smith"
              className="w-full border-b border-outline focus:border-primary-fixed-dim bg-transparent text-on-surface py-2 focus:outline-none transition-colors placeholder:text-on-surface-variant/40 text-body-md"
            />
            {errors.name && (
              <p className="text-error text-label-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              {...field('email')}
              required
              autoComplete="email"
              placeholder="doctor@clinic.com"
              className="w-full border-b border-outline focus:border-primary-fixed-dim bg-transparent text-on-surface py-2 focus:outline-none transition-colors placeholder:text-on-surface-variant/40 text-body-md"
            />
            {errors.email && (
              <p className="text-error text-label-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                {...field('password')}
                required
                autoComplete="new-password"
                placeholder="Min 8 chars, uppercase, number"
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
            {errors.password && (
              <p className="text-error text-label-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                {...field('confirmPassword')}
                required
                autoComplete="new-password"
                placeholder="Repeat your password"
                className="w-full border-b border-outline focus:border-primary-fixed-dim bg-transparent text-on-surface py-2 pr-10 focus:outline-none transition-colors placeholder:text-on-surface-variant/40 text-body-md"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute right-0 bottom-2 text-on-surface-variant hover:text-primary-fixed-dim transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-xl">
                  {showConfirm ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-error text-label-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-cyan w-full py-3 text-label-md font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">
                  progress_activity
                </span>
                Creating Account…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">
                  person_add
                </span>
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-on-surface-variant text-label-md mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary-fixed-dim hover:text-primary-container transition-colors font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}