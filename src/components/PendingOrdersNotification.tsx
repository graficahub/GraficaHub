'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { loadPendingOrdersForPrinter } from '@/utils/ordersMVP'
import { motion, AnimatePresence } from 'framer-motion'

export default function PendingOrdersNotification() {
  const { user } = useAuth()
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!user) return

    const updateCount = () => {
      const pending = loadPendingOrdersForPrinter(user.email)
      setPendingCount(pending.length)
    }

    updateCount()
    const interval = setInterval(updateCount, 5000) // Atualiza a cada 5s

    return () => clearInterval(interval)
  }, [user])

  if (!user || pendingCount === 0 || !isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 right-4 z-40 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
      >
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Novos Pedidos Disponíveis!</h4>
            <p className="text-sm text-blue-100 mb-3">
              Você tem {pendingCount} pedido{pendingCount > 1 ? 's' : ''} compatível{pendingCount > 1 ? 'is' : ''} aguardando sua resposta.
            </p>
            <button
              onClick={() => router.push('/dashboard/pedidos-mvp?tab=pendentes')}
              className="text-sm font-medium underline hover:text-blue-200"
            >
              Ver pedidos
            </button>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}



