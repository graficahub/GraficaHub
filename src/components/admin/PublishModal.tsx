'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string, description?: string) => void
}

export default function PublishModal({ isOpen, onClose, onConfirm }: PublishModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleConfirm = () => {
    if (!name.trim()) {
      alert('Por favor, informe um nome para a publicação')
      return
    }

    onConfirm(name.trim(), description.trim() || undefined)
    setName('')
    setDescription('')
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    onClose()
  }

  // Gera sugestão de nome baseada na data
  const getSuggestedName = () => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    return `Publicação ${month}/${year}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Publicar Alterações</h3>
              <button
                onClick={handleClose}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  label="Nome da publicação *"
                  type="text"
                  placeholder={getSuggestedName()}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Ex: &quot;Ajuste de catálogo 01/2025&quot;, &quot;Versão cupom pioneiros&quot;
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descrição / Notas (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Adição de novos materiais de lona e reajuste de preços"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                />
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400">
                  <strong>Importante:</strong> Esta publicação será salva no histórico e poderá ser restaurada posteriormente.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleConfirm}
                disabled={!name.trim()}
              >
                Publicar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


