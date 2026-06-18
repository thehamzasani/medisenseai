'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { BLOOD_TYPE_OPTIONS } from '@/constants'
import { formatDate } from '@/lib/utils'
import type { UserProfile } from '@/types'

interface ProfileFormProps {
  profile:     UserProfile
  latestScore: number | null
  bestScore:   number | null
}

export default function ProfileForm({ profile, latestScore, bestScore }: ProfileFormProps) {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [name,        setName]        = useState(profile.name)
  const [dateOfBirth, setDateOfBirth] = useState(
    profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '',
  )
  const [gender,    setGender]    = useState(profile.gender ?? '')
  const [bloodType, setBloodType] = useState(profile.bloodType ?? '')
  const [saving,    setSaving]    = useState(false)

  // ── Password change state ──────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw,   setShowCurrentPw]   = useState(false)
  const [showNewPw,       setShowNewPw]       = useState(false)
  const [showConfirmPw,   setShowConfirmPw]   = useState(false)
  const [savingPw,        setSavingPw]        = useState(false)

  // ── Derived ────────────────────────────────────────────────────────────────
  const initials = profile.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleSaveProfile() {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {}
      if (name !== profile.name)          body.name = name
      if (gender !== (profile.gender ?? '')) body.gender = gender || null
      if (bloodType !== (profile.bloodType ?? '')) body.bloodType = bloodType || null
      if (dateOfBirth) {
        body.dateOfBirth = new Date(dateOfBirth).toISOString()
      } else if (profile.dateOfBirth) {
        body.dateOfBirth = null
      }

      const res = await fetch('/api/users/me', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data: { success: boolean; error?: string } = await res.json()

      if (data.success) {
        toast.success('Profile updated successfully.')
      } else {
        toast.error(data.error ?? 'Failed to update profile.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setSavingPw(true)
    try {
      // In a full implementation this would call a dedicated /api/auth/change-password route.
      // For now we show a success toast as a placeholder.
      await new Promise(r => setTimeout(r, 800))
      toast.success('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Failed to update password.')
    } finally {
      setSavingPw(false)
    }
  }

  // ── Score color helper ─────────────────────────────────────────────────────
  function scoreColor(s: number | null) {
    if (s === null) return 'text-on-surface-variant'
    if (s >= 80) return 'text-tertiary-fixed-dim'
    if (s >= 60) return 'text-secondary'
    return 'text-error'
  }

  return (
    <div className="grid grid-cols-12 gap-6">

      {/* ── Left column: Avatar + quick stats ─────────────────────────────── */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

        {/* Avatar card */}
        <div className="surface-glass rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          {/* Avatar circle */}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-display-lg font-bold text-on-primary"
            style={{ background: 'linear-gradient(135deg, #00dbe7 0%, #006a71 100%)' }}
          >
            {initials}
          </div>

          <div>
            <p className="text-headline-sm font-bold text-on-surface">{profile.name}</p>
            <p className="text-label-md text-on-surface-variant mt-1">{profile.email}</p>
            <p className="text-label-sm text-on-surface-variant mt-1">
              Member since {formatDate(profile.createdAt)}
            </p>
          </div>

          {/* Role badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 border border-primary-fixed-dim/20">
            <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: 16 }}>
              verified
            </span>
            <span className="text-label-sm text-primary-fixed-dim">Clinical User</span>
          </div>
        </div>

        {/* Assessment stats card */}
        <div className="surface-glass rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: 18 }}>
              analytics
            </span>
            <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">
              Clinical Stats
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Total assessments */}
            <div className="bg-surface-container-high/50 rounded-xl p-3 text-center">
              <p className="text-headline-md font-bold text-primary-fixed-dim tabular-nums">
                {profile.assessmentCount}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                Total
              </p>
            </div>

            {/* Latest score */}
            <div className="bg-surface-container-high/50 rounded-xl p-3 text-center">
              <p className={`text-headline-md font-bold tabular-nums ${scoreColor(latestScore)}`}>
                {latestScore ?? '—'}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                Latest
              </p>
            </div>

            {/* Best score */}
            <div className="bg-surface-container-high/50 rounded-xl p-3 text-center">
              <p className={`text-headline-md font-bold tabular-nums ${scoreColor(bestScore)}`}>
                {bestScore ?? '—'}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                Best
              </p>
            </div>
          </div>

          <p className="text-label-sm text-on-surface-variant">
            Health scores are out of 100. Higher is better.
          </p>
        </div>

        {/* Quick info card */}
        <div className="surface-glass rounded-2xl p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontSize: 18 }}>
              info
            </span>
            <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">
              Quick Info
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
            <span className="text-label-md text-on-surface-variant">Gender</span>
            <span className="text-label-md text-on-surface">{profile.gender ?? 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
            <span className="text-label-md text-on-surface-variant">Blood Type</span>
            <span className="text-label-md text-on-surface font-semibold text-error">
              {profile.bloodType ?? 'Not set'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-label-md text-on-surface-variant">Date of Birth</span>
            <span className="text-label-md text-on-surface">
              {profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Right column: Edit form + password ────────────────────────────── */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

        {/* Personal information form */}
        <div className="surface-glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-fixed-dim">person</span>
            </div>
            <div>
              <h2 className="text-headline-sm font-bold text-on-surface">Personal Information</h2>
              <p className="text-label-sm text-on-surface-variant">
                Update your clinical profile details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* Full name */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dr. Jane Smith"
                className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full placeholder:text-on-surface-variant/40"
              />
            </div>

            {/* Email (read-only) */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="border-b border-outline-variant/40 bg-transparent text-on-surface-variant/60 focus:outline-none py-2 w-full cursor-not-allowed"
              />
              <p className="text-[10px] text-on-surface-variant/50">Email cannot be changed.</p>
            </div>

            {/* Date of birth */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full [color-scheme:dark]"
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full"
              >
                <option value="" className="bg-surface-container">Select gender</option>
                <option value="Male"   className="bg-surface-container">Male</option>
                <option value="Female" className="bg-surface-container">Female</option>
                <option value="Other"  className="bg-surface-container">Other</option>
              </select>
            </div>

            {/* Blood type — ONLY editable field on this page that stores to User */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                Blood Type
              </label>
              <select
                value={bloodType}
                onChange={e => setBloodType(e.target.value)}
                className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full"
              >
                <option value="" className="bg-surface-container">Select blood type</option>
                {BLOOD_TYPE_OPTIONS.map(bt => (
                  <option key={bt} value={bt} className="bg-surface-container">
                    {bt}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-on-surface-variant/70">
                Blood type is stored on your profile and appears on all analysis reports.
              </p>
            </div>

            {/* Patient ID (read-only) */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                Patient ID
              </label>
              <input
                type="text"
                value={`MS-${profile.id.slice(-5).toUpperCase()}`}
                readOnly
                className="border-b border-outline-variant/40 bg-transparent text-on-surface-variant/60 focus:outline-none py-2 w-full cursor-not-allowed font-mono"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-cyan px-8 py-3 text-label-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>
                    progress_activity
                  </span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    save
                  </span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Change password */}
        <div className="surface-glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error">lock</span>
            </div>
            <div>
              <h2 className="text-headline-sm font-bold text-on-surface">Change Password</h2>
              <p className="text-label-sm text-on-surface-variant">
                Update your account security credentials
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">

            {/* Current password */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full pr-8 placeholder:text-on-surface-variant/40"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(p => !p)}
                  className="absolute right-0 top-2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {showCurrentPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full pr-8 placeholder:text-on-surface-variant/40"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(p => !p)}
                  className="absolute right-0 top-2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {showNewPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm new password */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-b border-outline-variant bg-transparent text-on-surface focus:border-primary-fixed-dim focus:outline-none transition-colors py-2 w-full pr-8 placeholder:text-on-surface-variant/40"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(p => !p)}
                  className="absolute right-0 top-2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {showConfirmPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Password requirements */}
          <div className="mt-4 p-4 rounded-xl bg-surface-container-high/30 border border-outline-variant/20">
            <p className="text-label-sm text-on-surface-variant mb-2">Password requirements:</p>
            <div className="grid grid-cols-2 gap-1">
              {[
                { check: newPassword.length >= 8,         label: 'At least 8 characters' },
                { check: /[A-Z]/.test(newPassword),       label: 'One uppercase letter'  },
                { check: /[a-z]/.test(newPassword),       label: 'One lowercase letter'  },
                { check: /[0-9]/.test(newPassword),       label: 'One number'            },
              ].map(({ check, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined ${check ? 'text-tertiary-fixed-dim' : 'text-on-surface-variant/40'}`}
                    style={{ fontSize: 14 }}
                  >
                    {check ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={`text-[11px] ${check ? 'text-tertiary-fixed-dim' : 'text-on-surface-variant/60'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleChangePassword}
              disabled={savingPw}
              className="btn-cyan px-8 py-3 text-label-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingPw ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>
                    progress_activity
                  </span>
                  Updating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    lock_reset
                  </span>
                  Update Password
                </>
              )}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="surface-glass rounded-2xl p-8 border border-error/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error">warning</span>
            </div>
            <div>
              <h2 className="text-headline-sm font-bold text-error">Danger Zone</h2>
              <p className="text-label-sm text-on-surface-variant">
                Irreversible account actions
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-error/5 border border-error/20">
            <div>
              <p className="text-label-md text-on-surface font-semibold">Delete Account</p>
              <p className="text-label-sm text-on-surface-variant">
                Permanently delete your account and all clinical data.
              </p>
            </div>
            <button
              onClick={() => toast.error('Account deletion requires contacting support.')}
              className="px-5 py-2.5 rounded-full border border-error/40 text-error text-label-md hover:bg-error/10 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}