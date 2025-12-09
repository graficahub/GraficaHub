'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Eye, AlertTriangle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  loadPublishHistory,
  restorePublication,
  getCurrentPublication,
  type PublicationSnapshot,
} from '@/types/publications'
import { hasUnsavedChanges, clearDirtyState } from '@/utils/adminData'
import { useRouter } from 'next/navigation'
// Não precisa importar essas funções aqui, apenas para exibição

export default function AdminPublicacoesPage() {
  const router = useRouter()
  const [publications, setPublications] = useState<PublicationSnapshot[]>([])
  const [currentPub, setCurrentPub] = useState<PublicationSnapshot | null>(null)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [publicationToRestore, setPublicationToRestore] = useState<PublicationSnapshot | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    loadData()
    checkDirty()
    
    // Verifica dirty state periodicamente
    const interval = setInterval(checkDirty, 1000)
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    const history = loadPublishHistory()
    setPublications(history)
    setCurrentPub(getCurrentPublication())
  }

  const checkDirty = () => {
    setIsDirty(hasUnsavedChanges())
  }

  const handleRestore = (publication: PublicationSnapshot) => {
    setPublicationToRestore(publication)
    setShowRestoreModal(true)
  }

  const handleConfirmRestore = () => {
    if (!publicationToRestore) return

    const success = restorePublication(publicationToRestore)
    
    if (success) {
      clearDirtyState()
      setShowRestoreModal(false)
      setPublicationToRestore(null)
      
      // Recarrega a página para refletir a restauração
      setTimeout(() => {
        router.refresh()
      }, 500)
      
      alert(`Versão restaurada com sucesso. O sistema voltou para o estado da publicação: ${publicationToRestore.name}`)
    } else {
      alert('Erro ao restaurar publicação. Tente novamente.')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '-'
    }
  }

  const getPublicationSummary = (pub: PublicationSnapshot) => {
    const materialCount = pub.materialCatalog?.length || 0
    const couponCount = pub.coupons?.filter((c: any) => c.active).length || 0
    return {
      materials: materialCount,
      coupons: couponCount,
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="px-4 md:px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Publicações</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Histórico das últimas 3 versões publicadas
          </p>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {isDirty && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400 mb-1">
                Você tem alterações não salvas no rascunho
              </p>
              <p className="text-xs text-yellow-300">
                Se restaurar uma versão agora, o rascunho atual será descartado. 
                Se quiser preservá-lo, publique ou salve antes de restaurar.
              </p>
            </div>
          </div>
        )}

        {publications.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-slate-400 mb-4">Nenhuma publicação encontrada</p>
            <p className="text-sm text-slate-500">
              As publicações aparecerão aqui quando você usar &quot;Salvar e publicar&quot; pela primeira vez.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publications.map((pub, index) => {
              const summary = getPublicationSummary(pub)
              const isCurrent = currentPub?.id === pub.id
              
              return (
                <Card key={pub.id} className="p-6">
                  {isCurrent && (
                    <div className="mb-3 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full inline-block">
                      <span className="text-xs font-medium text-blue-400">Versão Atual</span>
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{pub.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>📅</span>
                      <span>{formatDate(pub.createdAt)}</span>
                    </div>
                    
                    {pub.description && (
                      <p className="text-sm text-slate-300">{pub.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                      <div>
                        <span className="text-xs text-slate-400">Materiais:</span>
                        <span className="text-sm text-white font-medium ml-1">{summary.materials}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Cupons ativos:</span>
                        <span className="text-sm text-white font-medium ml-1">{summary.coupons}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant={isCurrent ? 'outline' : 'primary'}
                    fullWidth
                    onClick={() => handleRestore(pub)}
                    disabled={isCurrent}
                    className="flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {isCurrent ? 'Versão Atual' : 'Restaurar esta versão'}
                  </Button>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal: Confirmar Restauração */}
      <AnimatePresence>
        {showRestoreModal && publicationToRestore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-start gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Confirmar Restauração</h3>
                  <p className="text-sm text-slate-300">
                    Tem certeza que deseja restaurar o sistema para o estado da publicação{' '}
                    <strong className="text-white">&quot;{publicationToRestore.name}&quot;</strong>?
                  </p>
                </div>
              </div>

              {isDirty && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    <strong>Atenção:</strong> Você tem alterações não salvas no rascunho. 
                    Ao restaurar, essas alterações serão descartadas.
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-6 text-sm text-slate-300">
                <p>Esta ação irá:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
                  <li>Substituir a versão publicada atual</li>
                  <li>Substituir o rascunho atual</li>
                  <li>Restaurar todos os dados para o estado desta publicação</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setShowRestoreModal(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleConfirmRestore}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Confirmar Restauração
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

