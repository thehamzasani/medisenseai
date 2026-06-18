import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Atmospheric background blur circles */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-tertiary-container/3 blur-[100px] rounded-full" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Top Nav */}
      <TopNav />

      {/* Main content */}
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-xl">
          {children}
        </div>
      </main>
    </div>
  )
}