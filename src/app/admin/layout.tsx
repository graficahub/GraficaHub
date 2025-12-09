'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAdmin } from '@/utils/admin'
import AdminSidebar, { AdminSidebarToggle } from '@/components/admin/AdminSidebar'
import AdminViewToggle from '@/components/admin/AdminViewToggle'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Verifica se é admin
    if (typeof window !== 'undefined') {
      if (!isAdmin()) {
        router.replace('/auth')
      } else {
        setIsChecking(false)
      }
    }
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-300">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)',
        }}
      />

      <AdminSidebar
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {!sidebarOpen && <AdminSidebarToggle onClick={() => setSidebarOpen(true)} />}

      <main className="md:ml-64 min-h-screen">
        {/* Header com toggle de visão */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="px-4 md:px-8 py-4 flex items-center justify-end">
            <AdminViewToggle />
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}

