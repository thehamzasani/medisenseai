import { redirect } from 'next/navigation'

export default function LoginPage() {
  redirect('/api/anon-init?redirect=%2Fdashboard')
}
