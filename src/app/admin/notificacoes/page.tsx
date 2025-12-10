'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Send, Users, Tag, Crown } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import {
  createNotification,
  loadAllNotifications,
  type Notification,
  type NotificationType,
} from '@/types/notifications'

const AVAILABLE_TAGS = ['Pioneiro', 'Diamante', 'Ouro', 'Prata', 'Bronze']

export default function AdminNotificacoesPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<NotificationType>('admin')
  const [allUsers, setAllUsers] = useState(false)
  const [premiumOnly, setPremiumOnly] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [sentNotifications, setSentNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<Array<{ email: string; companyName: string; tags?: string[] }>>([])

  useEffect(() => {
    loadSentNotifications()
    loadUsers()
  }, [])

  const loadUsers = () => {
    try {
      const stored = localStorage.getItem('graficaHubUsers')
      const usersData = stored ? JSON.parse(stored) : []
      setUsers(usersData.map((u: any) => ({
        email: u.email,
        companyName: u.companyName,
        tags: u.tags || [],
      })))
    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
    }
  }

  const loadSentNotifications = () => {
    const all = loadAllNotifications()
    // Filtra apenas notificações do tipo admin ou sistema
    const adminNotifs = all.filter(n => n.type === 'admin' || n.type === 'sistema')
    setSentNotifications(adminNotifs.slice(0, 20).reverse()) // Últimas 20
  }

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const handleSubmit = () => {
    if (!title || !message) {
      alert('Preencha título e mensagem')
      return
    }

    if (allUsers) {
      // Notificação para todos
      createNotification({
        userId: null,
        title,
        message,
        type,
        scope: {
          allUsers: true,
        },
      })
    } else if (selectedUserIds.length > 0) {
      // Notificações para usuários específicos
      selectedUserIds.forEach(userId => {
        createNotification({
          userId,
          title,
          message,
          type,
        })
      })
    } else {
      // Notificação segmentada
      createNotification({
        userId: null,
        title,
        message,
        type,
        scope: {
          premiumOnly,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        },
      })
    }

    // Limpa formulário
    setTitle('')
    setMessage('')
    setAllUsers(false)
    setPremiumOnly(false)
    setSelectedTags([])
    setSelectedUserIds([])

    loadSentNotifications()
    alert('Comunicado enviado com sucesso!')
  }

  const getScopeDescription = (notif: Notification): string => {
    if (notif.userId) return 'Usuário específico'
    if (notif.scope?.allUsers) return 'Todos os usuários'
    if (notif.scope?.premiumOnly) return 'Apenas premium'
    if (notif.scope?.tags && notif.scope.tags.length > 0) {
      return `Tags: ${notif.scope.tags.join(', ')}`
    }
    return 'Segmentado'
  }

  const getImpactedUsersCount = (notif: Notification): number => {
    if (notif.userId) return 1
    
    if (notif.scope?.allUsers) {
      return users.length
    }
    
    if (notif.scope?.premiumOnly) {
      return users.filter(u => (u as any).premium).length
    }
    
    if (notif.scope?.tags && notif.scope.tags.length > 0) {
      return users.filter(u => 
        notif.scope!.tags!.some(tag => u.tags?.includes(tag))
      ).length
    }
    
    return 0
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="px-4 md:px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Notificações / Comunicados</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Envie comunicados e notificações para os usuários
          </p>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Send className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Criar Comunicado</h2>
            </div>

            <div className="space-y-4">
              <Input
                label="Título *"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Nova funcionalidade disponível"
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mensagem *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={5}
                  placeholder="Digite a mensagem do comunicado..."
                />
              </div>

              <Select
                label="Tipo"
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                options={[
                  { value: 'sistema', label: 'Sistema' },
                  { value: 'admin', label: 'Admin' },
                ]}
              />

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-3">Segmentação</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allUsers}
                      onChange={(e) => {
                        setAllUsers(e.target.checked)
                        if (e.target.checked) {
                          setPremiumOnly(false)
                          setSelectedTags([])
                          setSelectedUserIds([])
                        }
                      }}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-white">Todos os usuários</span>
                  </label>

                  {!allUsers && (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={premiumOnly}
                          onChange={(e) => setPremiumOnly(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                        />
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-white">Apenas usuários premium</span>
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Por tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_TAGS.map(tag => (
                            <button
                              key={tag}
                              onClick={() => handleToggleTag(tag)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                selectedTags.includes(tag)
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Usuários específicos
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto bg-white/5 rounded-lg p-3 border border-white/10">
                          {users.map(user => (
                            <label
                              key={user.email}
                              className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedUserIds.includes(user.email)}
                                onChange={() => handleToggleUser(user.email)}
                                className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-white">
                                {user.companyName} ({user.email})
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={!title || !message}
                className="flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Comunicado
              </Button>
            </div>
          </Card>

          {/* Listagem de comunicados enviados */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Comunicados Enviados</h2>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {sentNotifications.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  Nenhum comunicado enviado ainda
                </p>
              ) : (
                sentNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold">{notif.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          notif.type === 'sistema'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {notif.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{notif.message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{new Date(notif.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>{getScopeDescription(notif)}</span>
                      <span>•</span>
                      <span>{getImpactedUsersCount(notif)} usuários</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}






