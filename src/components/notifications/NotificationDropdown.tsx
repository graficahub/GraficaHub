'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, Bell, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
  type Notification,
} from '@/types/notifications'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface NotificationDropdownProps {
  onClose: () => void
  userId: string
  userTags: string[]
  isPremium: boolean
}

export default function NotificationDropdown({
  onClose,
  userId,
  userTags,
  isPremium,
}: NotificationDropdownProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [userId, userTags, isPremium])

  const loadNotifications = () => {
    const notifs = getUserNotifications(userId, userTags, isPremium)
    setNotifications(notifs.slice(0, 5)) // Mostra apenas as 5 mais recentes
  }

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id)
    loadNotifications()

    // Se tiver pedido relacionado, navega para pedidos
    if (notification.relatedOrderId) {
      router.push('/dashboard/pedidos-mvp')
    }

    onClose()
  }

  const handleMarkAllRead = () => {
    markAllAsRead(userId)
    loadNotifications()
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'pedido':
        return <Package className="w-4 h-4" />
      case 'admin':
        return <Settings className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute top-16 right-4 w-96 max-h-[600px] bg-slate-900 border border-white/20 rounded-lg shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Notificações</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllRead}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Você não tem notificações no momento.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer transition-colors ${
                    !notification.read
                      ? 'bg-blue-500/10 hover:bg-blue-500/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        notification.type === 'pedido'
                          ? 'bg-blue-500/20 text-blue-400'
                          : notification.type === 'admin'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              router.push('/dashboard/notificacoes')
              onClose()
            }}
          >
            Ver todas as notificações
          </Button>
        </div>
      </motion.div>
    </div>
  )
}


