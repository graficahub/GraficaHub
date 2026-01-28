'use client'

import { useRouter } from 'next/navigation'
import { AlertCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { clearAdminBackup, getAdminBackup } from '@/utils/impersonate'
import { getCurrentUser, setCurrentUser } from '@/utils/admin'

export default function ImpersonateBanner() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(true)
  const adminBackup = getAdminBackup()
  const currentUser = getCurrentUser()
  const hasValidBackup =
    !!adminBackup?.email && adminBackup.role === 'admin' && currentUser?.role === 'user'

  useEffect(() => {
    if (!hasValidBackup) {
      clearAdminBackup()
    }
  }, [hasValidBackup])

  const handleReturnToAdmin = () => {
    if (adminBackup) {
      setCurrentUser(adminBackup)
      clearAdminBackup()
      router.push('/admin')
    }
  }

  if (!isVisible || !hasValidBackup) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/20 border-b border-yellow-500/30 backdrop-blur-sm">
      <div className="px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <p className="text-sm text-yellow-400">
            Você está visualizando o sistema como usuário comum.{' '}
            <button
              onClick={handleReturnToAdmin}
              className="underline font-medium hover:text-yellow-300 transition-colors"
            >
              Clique aqui para voltar ao modo admin.
            </button>
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

