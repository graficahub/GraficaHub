'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Order } from '@/types/orders'
import Button from '@/components/ui/Button'

interface CancelOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  order: Order | null
  isLoading?: boolean
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  order,
  isLoading = false,
}: CancelOrderModalProps) {
  if (!order) return null

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
            <h2 className="text-2xl font-bold text-white mb-4">Cancelar Pedido</h2>

            <div className="space-y-4 mb-6">
              <p className="text-slate-300">
                Tem certeza que deseja cancelar o pedido <span className="font-semibold text-white">{order.id}</span>?
              </p>
              <p className="text-sm text-slate-400">
                <span className="font-medium text-white">Serviço:</span> {order.service}
              </p>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">
                  ⚠️ Essa ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={onClose}
                disabled={isLoading}
              >
                Voltar
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={onConfirm}
                isLoading={isLoading}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                {isLoading ? 'Cancelando...' : 'Cancelar pedido'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


