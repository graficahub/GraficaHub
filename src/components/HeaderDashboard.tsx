'use client'

import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import NotificationBell from '@/components/notifications/NotificationBell'

interface HeaderDashboardProps {
  title: string
  subtitle?: string
  userEmail?: string
  onLogout?: () => void
}

export default function HeaderDashboard({
  title,
  subtitle,
  userEmail,
  onLogout,
}: HeaderDashboardProps) {
  const router = useRouter()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => router.push('/settings')}
              className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              title="Configurações"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              title="Sair"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

