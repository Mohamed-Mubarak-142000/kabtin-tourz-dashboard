import { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AnimatedOutlet() {
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
    )
  }, [location.pathname])

  return (
    <div key={location.pathname} ref={containerRef} className="h-full min-w-0">
      <Outlet />
    </div>
  )
}

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen min-w-0 overflow-hidden bg-stone-50 dark:bg-stone-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <AnimatedOutlet />
        </main>
      </div>
    </div>
  )
}
