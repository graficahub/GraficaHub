'use client'

import { useState, useEffect } from 'react'
import { Save, Upload, X, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import { hasUnsavedChanges, publishAllDrafts, discardAllDrafts, clearDirtyState } from '@/utils/adminData'
import { useRouter } from 'next/navigation'
import PublishModal from './PublishModal'
import { createPublicationSnapshot } from '@/types/publications'

export default function AdminSaveControls() {
  const router = useRouter()
  const [isDirty, setIsDirty] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Verifica estado dirty periodicamente
    const checkDirty = () => {
      setIsDirty(hasUnsavedChanges())
    }
    
    checkDirty()
    const interval = setInterval(checkDirty, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleSaveDraft = () => {
    // Salvar rascunho já é automático ao editar, mas podemos forçar uma atualização
    clearDirtyState()
    setIsDirty(false)
    setMessage({
      type: 'success',
      text: 'Rascunho salvo com sucesso. Ainda não visível para os usuários.',
    })
    setTimeout(() => setMessage(null), 3000)
  }

  const handlePublish = () => {
    // Abre modal para nomear a publicação
    setShowPublishModal(true)
  }

  const handleConfirmPublish = (name: string, description?: string) => {
    setShowPublishModal(false)
    
    // Primeiro publica os dados (copia DRAFT → PUBLISHED)
    const result = publishAllDrafts()
    
    if (result.failed.length === 0) {
      // Aguarda um pouco para garantir que os dados foram salvos
      setTimeout(() => {
        // Cria snapshot da publicação (DEPOIS de publicar)
        const snapshot = createPublicationSnapshot(name, description)
        
        if (snapshot) {
          setIsDirty(false)
          setMessage({
            type: 'success',
            text: `Alterações publicadas como "${name}". Todos os usuários agora veem a nova versão.`,
          })
          // Recarrega a página para refletir os dados publicados
          setTimeout(() => {
            router.refresh()
          }, 1000)
        } else {
          setMessage({
            type: 'error',
            text: 'Erro ao criar snapshot da publicação.',
          })
        }
      }, 100)
    } else {
      setMessage({
        type: 'error',
        text: `Erro ao publicar alguns dados: ${result.failed.join(', ')}`,
      })
    }
    
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDiscard = () => {
    if (!confirm('Tem certeza que deseja descartar todas as alterações não publicadas?')) {
      return
    }
    
    const result = discardAllDrafts()
    
    if (result.failed.length === 0) {
      setIsDirty(false)
      setMessage({
        type: 'success',
        text: 'Rascunho descartado. Retornamos à versão publicada.',
      })
      // Recarrega a página
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } else {
      setMessage({
        type: 'error',
        text: `Erro ao descartar alguns dados: ${result.failed.join(', ')}`,
      })
    }
    
    setTimeout(() => setMessage(null), 5000)
  }

  return (
    <>
      <div className="p-4 border-t border-white/10 space-y-2">
        {isDirty && (
          <div className="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
            Você tem alterações não salvas
          </div>
        )}
        
        <Button
          variant="outline"
          fullWidth
          onClick={handleSaveDraft}
          disabled={!isDirty}
          className="flex items-center justify-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          Salvar rascunho
        </Button>
        
        <Button
          variant="primary"
          fullWidth
          onClick={handlePublish}
          disabled={!isDirty}
          className="flex items-center justify-center gap-2 text-sm"
        >
          <Upload className="w-4 h-4" />
          Salvar e publicar
        </Button>
        
        <Button
          variant="outline"
          fullWidth
          onClick={handleDiscard}
          disabled={!isDirty}
          className="flex items-center justify-center gap-2 text-sm text-red-400 border-red-500/30 hover:bg-red-500/20"
        >
          <X className="w-4 h-4" />
          Cancelar modificações
        </Button>
      </div>

      {/* Modal de publicação */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handleConfirmPublish}
      />

      {/* Mensagens de feedback */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            } flex items-center gap-2 shadow-lg`}
          >
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

