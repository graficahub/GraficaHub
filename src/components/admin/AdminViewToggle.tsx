'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, ArrowLeft } from 'lucide-react'
import { isAdmin, getCurrentUser, setCurrentUser as setCurrentUserUtil } from '@/utils/admin'
import { isImpersonating, getAdminBackup, getTestUser, saveAdminBackup, clearAdminBackup } from '@/utils/impersonate'
import { setPreviewMode } from '@/utils/adminData'

export default function AdminViewToggle() {
  const router = useRouter()
  const [isImpersonatingMode, setIsImpersonatingMode] = useState(false)

  useEffect(() => {
    setIsImpersonatingMode(isImpersonating())
  }, [])

  const handleToggleView = () => {
    if (isImpersonatingMode) {
      // Voltar para admin
      const adminBackup = getAdminBackup()
      if (adminBackup) {
        setCurrentUserUtil(adminBackup)
        clearAdminBackup()
        setPreviewMode(false)
        router.push('/admin')
      }
    } else {
      // Ver como usuário (modo preview)
      const currentUser = getCurrentUser()
      if (currentUser && isAdmin()) {
        // Salva backup do admin
        saveAdminBackup(currentUser)
        
        // Define usuário de teste
        const testUser = getTestUser()
        setCurrentUserUtil(testUser)
        
        // Ativa modo preview
        setPreviewMode(true)
        
        router.push('/admin/preview')
      }
    }
  }

  if (!isAdmin() && !isImpersonatingMode) {
    return null
  }

  return (
    <button
      onClick={handleToggleView}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
    >
      {isImpersonatingMode ? (
        <>
          <ArrowLeft className="w-4 h-4" />
          Voltar para admin
        </>
      ) : (
        <>
          <Eye className="w-4 h-4" />
          Ver como usuário
        </>
      )}
    </button>
  )
}

