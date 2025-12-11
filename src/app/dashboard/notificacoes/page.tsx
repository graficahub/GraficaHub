'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { Bell, Package, Settings, CheckCircle } from 'lucide-react'
import Sidebar, { SidebarToggle } from '@/components/Sidebar'
import HeaderDashboard from '@/components/HeaderDashboard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
  type Notification,
} from '@/types/notifications'

export default function NotificacoesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Autenticação é feita pelo layout server-side
  useEffect(() => {
    if (user) {
      loadNotifications()
      const interval = setInterval(loadNotifications, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadNotifications = () => {
    if (!user) return
    const tags = (user as any).tags || []
    const isPremium = (user as any).premium || false
    const notifs = getUserNotifications(user.email, tags, isPremium)
    setNotifications(notifs)
  }

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id)
    loadNotifications()

    if (notification.relatedOrderId) {
      router.push('/dashboard/pedidos-mvp')
    }
  }

  const handleMarkAllRead = () => {
    if (!user) return
    markAllAsRead(user.email)
    loadNotifications()
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'pedido':
        return <Package className="w-5 h-5" />
      case 'admin':
        return <Settings className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Autenticação é garantida pelo layout server-side
  // Não precisa mais verificar !user

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Sidebar
        userEmail={user?.email || ''}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        hasPendingOrdersBadge={false}
      />
      {!sidebarOpen && <SidebarToggle onClick={() => setSidebarOpen(true)} />}

      <main className="md:ml-64 min-h-screen">
        <HeaderDashboard
          title="Notificações"
          subtitle="Central de notificações e comunicados"
          userEmail={user?.email || ''}
        />

        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Suas Notificações</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllRead}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-slate-400">
                Você não tem notificações no momento.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-6 cursor-pointer transition-all ${
                    !notification.read
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg flex-shrink-0 ${
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
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-slate-300 mb-3">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>
                          {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {notification.relatedOrderId && (
                          <span className="text-blue-400">
                            Pedido #{notification.relatedOrderId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

