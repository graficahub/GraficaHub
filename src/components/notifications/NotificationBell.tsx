'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getUnreadCount } from '@/types/notifications'
import NotificationDropdown from './NotificationDropdown'

export default function NotificationBell() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    const updateCount = () => {
      const tags = (user as any).tags || []
      const isPremium = (user as any).premium || false
      const count = getUnreadCount(user.email, tags, isPremium)
      setUnreadCount(count)
    }

    updateCount()
    const interval = setInterval(updateCount, 5000) // Atualiza a cada 5s

    return () => clearInterval(interval)
  }, [user])

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          userId={user.email}
          userTags={(user as any).tags || []}
          isPremium={(user as any).premium || false}
        />
      )}
    </div>
  )
}






