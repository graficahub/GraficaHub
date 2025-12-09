'use client'

import { motion } from 'framer-motion'
import { X, Save, DollarSign } from 'lucide-react'
import Button from '@/components/ui/Button'

interface SaveDefaultPriceModalProps {
  isOpen: boolean
  materialName: string
  precoPorM2: number
  onClose: () => void
  onSave: () => void
  onSkip: () => void
}

export default function SaveDefaultPriceModal({
  isOpen,
  materialName,
  precoPorM2,
  onClose,
  onSave,
  onSkip,
}: SaveDefaultPriceModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Salvar Preço Padrão?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-slate-300 mb-4">
            Você utilizou <strong className="text-white">R$ {precoPorM2.toFixed(2)}/m²</strong> para o material{' '}
            <strong className="text-white">{materialName}</strong>.
          </p>
          <p className="text-slate-400 text-sm">
            Deseja salvar esse valor como preço padrão para seus próximos pedidos?
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onSkip}>
            Somente neste pedido
          </Button>
          <Button variant="primary" fullWidth onClick={onSave} className="flex items-center justify-center gap-2">
            <DollarSign className="w-4 h-4" />
            Salvar como padrão
          </Button>
        </div>
      </motion.div>
    </div>
  )
}





