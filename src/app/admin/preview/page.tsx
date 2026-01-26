'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { isAdmin } from '@/utils/admin'
import { isPreviewMode, setPreviewMode } from '@/utils/adminData'
import Sidebar, { SidebarToggle } from '@/components/Sidebar'
import HeaderDashboard from '@/components/HeaderDashboard'
import ImpersonateBanner from '@/components/admin/ImpersonateBanner'
import { getCurrentUser } from '@/utils/admin'
import { getAdminBackup, clearAdminBackup, setCurrentUser as setCurrentUserUtil } from '@/utils/impersonate'

export default function AdminPreviewPage() {
  const router = useRouter()

  useEffect(() => {
    // Verifica se é admin e está em modo preview
    if (typeof window !== 'undefined') {
      if (!isAdmin() || !isPreviewMode()) {
        router.replace('/admin')
      }
    }
  }, [router])

  const handleBackToAdmin = () => {
    const adminBackup = getAdminBackup()
    if (adminBackup) {
      setCurrentUserUtil(adminBackup)
      clearAdminBackup()
      setPreviewMode(false)
      router.push('/admin')
    }
  }

  // Esta página renderiza o dashboard normal, mas em modo preview
  // O dashboard já detecta o banner e lê dados do draft
  return (
    <div className="min-h-screen w-full bg-gray-50">

      {/* Banner especial de preview */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500/20 border-b border-blue-500/30 backdrop-blur-sm">
        <div className="px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-blue-400">
              <strong>Visualizando como usuário (preview das alterações)</strong> – isso não afeta os usuários reais.
            </p>
          </div>
          <button
            onClick={handleBackToAdmin}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para admin
          </button>
        </div>
      </div>

      {/* Redireciona para o dashboard normal que já tem toda a lógica */}
      {typeof window !== 'undefined' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.href = '/dashboard';`,
          }}
        />
      )}
    </div>
  )
}

