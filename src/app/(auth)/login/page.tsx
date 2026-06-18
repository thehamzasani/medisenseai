import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="surface-glass rounded-2xl p-8 w-full max-w-md animate-pulse">
        <div className="h-8 bg-surface-container-high rounded mb-6" />
        <div className="h-10 bg-surface-container-high rounded mb-4" />
        <div className="h-10 bg-surface-container-high rounded mb-4" />
        <div className="h-10 bg-surface-container-high rounded" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}