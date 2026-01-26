'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, Package, FileText, Settings, LogOut, Ticket, History, Bell, ScrollText } from 'lucide-react'
import { signOut } from '@/lib/auth'
import AdminSaveControls from './AdminSaveControls'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

interface AdminSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export default function AdminSidebar({ isMobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems: NavItem[] = [
    {
      label: 'Visão Geral',
      path: '/admin',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Usuários',
      path: '/admin/usuarios',
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: 'Pedidos',
      path: '/admin/pedidos',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: 'Materiais',
      path: '/admin/materiais',
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: 'Cupons e Descontos',
      path: '/admin/cupons',
      icon: <Ticket className="w-5 h-5" />,
    },
    {
      label: 'Publicações',
      path: '/admin/publicacoes',
      icon: <History className="w-5 h-5" />,
    },
    {
      label: 'Notificações',
      path: '/admin/notificacoes',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      label: 'Notificações',
      path: '/admin/notificacoes',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      label: 'Logs do sistema',
      path: '/admin/logs',
      icon: <ScrollText className="w-5 h-5" />,
    },
    {
      label: 'Configurações',
      path: '/admin/configuracoes',
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin'
    }
    return pathname?.startsWith(path)
  }

  const handleLogout = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('❌ Erro ao fazer logout:', error)
      }
      // Sempre redireciona para login, mesmo se houver erro
      router.push('/login')
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error)
      router.push('/login')
    }
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen
          bg-white border-r border-gray-200
          flex flex-col
          z-40
          transition-all duration-300
          shadow-sm
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo e botão de colapsar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">GraficaHub</h1>
                <p className="text-xs text-gray-600 mt-1">Painel Administrativo</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
              >
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={onMobileClose}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fechar sidebar"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      router.push(item.path)
                      if (onMobileClose) {
                        onMobileClose()
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${
                        active
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className={active ? 'text-blue-600' : 'text-gray-500'}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Controles de salvar/publicar */}
        {!isCollapsed && <AdminSaveControls />}

        {/* Botão de logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-gray-700 hover:bg-red-50 hover:text-red-600
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Sair' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

// Componente para botão de abrir sidebar no mobile
export function AdminSidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      aria-label="Abrir menu"
    >
      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}

