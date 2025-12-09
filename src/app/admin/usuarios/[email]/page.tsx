'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Key, Ban, CheckCircle, Trash2, Tag, Gift, BarChart3 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { loadOrdersFromStorage, Order } from '@/types/orders'
import { loadCoupons, isCouponValidForUser } from '@/utils/couponsStorage'
import { Coupon } from '@/types/coupons'

interface User {
  companyName: string
  email: string
  password: string
  cpfCnpj?: string
  phone?: string
  address?: {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
  }
  createdAt?: string
  status?: 'ativo' | 'suspenso'
  tags?: string[]
  coupons?: Array<{
    code: string
    type: string
    value: number
    createdAt: string
    isUsed?: boolean
  }>
}

const AVAILABLE_TAGS = ['Pioneiro', 'Diamante', 'Ouro', 'Prata', 'Bronze']

export default function AdminUserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const userEmail = decodeURIComponent(params.email as string)

  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('grafica123')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadUserData()
    loadOrders()
    loadCouponsData()
  }, [userEmail])

  const loadCouponsData = () => {
    if (!user) return
    const allCoupons = loadCoupons()
    // Filtra cupons que se aplicam a este usuário
    const userTags = user.tags || []
    const applicableCoupons = allCoupons.filter((coupon) =>
      isCouponValidForUser(coupon, userEmail, userTags)
    )
    setAvailableCoupons(applicableCoupons)
  }

  useEffect(() => {
    if (user) {
      loadCouponsData()
    }
  }, [user])

  const loadUserData = () => {
    try {
      const stored = localStorage.getItem('graficaHubUsers')
      if (stored) {
        const users = JSON.parse(stored)
        const foundUser = users.find((u: User) => u.email === userEmail)
        if (foundUser) {
          // Garante campos padrão
          const userData: User = {
            ...foundUser,
            status: foundUser.status || 'ativo',
            tags: foundUser.tags || [],
            coupons: foundUser.coupons || [],
          }
          setUser(userData)
        }
      }
    } catch (err) {
      console.error('❌ Erro ao carregar usuário:', err)
    }
  }

  const loadOrders = () => {
    const allOrders = loadOrdersFromStorage()
    const userOrders = allOrders.filter((order) => order.userId === userEmail)
    setOrders(userOrders)
  }

  const saveUser = (updatedUser: User) => {
    try {
      const stored = localStorage.getItem('graficaHubUsers')
      if (stored) {
        const users = JSON.parse(stored)
        const index = users.findIndex((u: User) => u.email === userEmail)
        if (index !== -1) {
          users[index] = updatedUser
          localStorage.setItem('graficaHubUsers', JSON.stringify(users))
          setUser(updatedUser)
        }
      }
    } catch (err) {
      console.error('❌ Erro ao salvar usuário:', err)
    }
  }

  const handleResetPassword = () => {
    if (!user) return
    const updatedUser = { ...user, password: newPassword }
    saveUser(updatedUser)
    setShowResetPassword(false)
    alert(`Senha redefinida para: ${newPassword}\n\nRecomende que o usuário altere no próximo acesso.`)
  }

  const handleToggleStatus = () => {
    if (!user) return
    const newStatus: 'ativo' | 'suspenso' = user.status === 'ativo' ? 'suspenso' : 'ativo'
    const updatedUser = { ...user, status: newStatus }
    saveUser(updatedUser)
  }

  const handleDeleteUser = () => {
    if (!user) return
    try {
      const stored = localStorage.getItem('graficaHubUsers')
      if (stored) {
        const users = JSON.parse(stored)
        const filtered = users.filter((u: User) => u.email !== userEmail)
        localStorage.setItem('graficaHubUsers', JSON.stringify(filtered))
        router.push('/admin/usuarios')
      }
    } catch (err) {
      console.error('❌ Erro ao excluir usuário:', err)
    }
  }

  const handleToggleTag = (tag: string) => {
    if (!user) return
    const currentTags = user.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    const updatedUser = { ...user, tags: newTags }
    saveUser(updatedUser)
  }


  // Estatísticas do usuário
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const ordersThisMonth = orders.filter((order) => {
    const orderDate = new Date(order.createdAt)
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
  }).length

  const ordersByStatus = {
    'Em aberto': orders.filter((o) => o.status === 'Em aberto').length,
    'Em produção': orders.filter((o) => o.status === 'Em produção').length,
    'Concluído': orders.filter((o) => o.status === 'Concluído').length,
    'Cancelado': orders.filter((o) => o.status === 'Cancelado').length,
  }

  // Pedidos por mês (últimos 6 meses)
  const monthlyData: { month: string; pedidos: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
    const monthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
    }).length
    monthlyData.push({ month: monthName, pedidos: monthOrders })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    )
  }

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      Pioneiro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Diamante: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      Ouro: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      Prata: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
      Bronze: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    }
    return colors[tag] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/usuarios')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{user.companyName}</h1>
              <p className="text-slate-400 mt-1 text-sm md:text-base">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda: Informações e Ações */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Informações Básicas</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-400">Nome da Gráfica</span>
                  <p className="text-sm text-white">{user.companyName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Email</span>
                  <p className="text-sm text-white">{user.email}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">CNPJ/CPF</span>
                  <p className="text-sm text-white">{user.cpfCnpj || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Telefone</span>
                  <p className="text-sm text-white">{user.phone || '-'}</p>
                </div>
                {user.address && (
                  <div>
                    <span className="text-xs text-slate-400">Endereço</span>
                    <p className="text-sm text-white">
                      {[
                        user.address.street,
                        user.address.number,
                        user.address.complement,
                        user.address.neighborhood,
                        user.address.city,
                        user.address.state,
                        user.address.zipCode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-400">Data de Cadastro</span>
                  <p className="text-sm text-white">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('pt-BR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Status</span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'ativo'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {user.status === 'ativo' ? 'Ativo' : 'Suspenso'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tags */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Tags de Classificação</h2>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      user.tags?.includes(tag)
                        ? getTagColor(tag)
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </Card>

            {/* Cupons Aplicáveis */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Cupons Aplicáveis
              </h2>
              {availableCoupons.length > 0 ? (
                <div className="space-y-2">
                  {availableCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white font-mono">{coupon.code}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            coupon.active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {coupon.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {coupon.type === 'percentual'
                          ? `${coupon.value}% de desconto`
                          : coupon.type === 'frete_gratis'
                          ? 'Frete grátis'
                          : `R$ ${coupon.value.toFixed(2)} de desconto`}
                      </p>
                      {coupon.minOrderValue && (
                        <p className="text-xs text-slate-500 mt-1">
                          Valor mínimo: R$ {coupon.minOrderValue.toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Nenhum cupom disponível para este usuário
                </p>
              )}
            </Card>

            {/* Estatísticas de Pedidos */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estatísticas de Pedidos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-2xl font-bold text-white">{orders.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Este mês</p>
                  <p className="text-2xl font-bold text-blue-400">{ordersThisMonth}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Em aberto</p>
                  <p className="text-2xl font-bold text-yellow-400">{ordersByStatus['Em aberto']}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Concluídos</p>
                  <p className="text-2xl font-bold text-green-400">{ordersByStatus['Concluído']}</p>
                </div>
              </div>
              {monthlyData.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="pedidos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Coluna Direita: Ações Administrativas */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Ações Administrativas</h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowResetPassword(true)}
                  className="flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Resetar Senha
                </Button>

                <Button
                  variant={user.status === 'ativo' ? 'outline' : 'primary'}
                  fullWidth
                  onClick={handleToggleStatus}
                  className="flex items-center justify-center gap-2"
                >
                  {user.status === 'ativo' ? (
                    <>
                      <Ban className="w-4 h-4" />
                      Suspender
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Reativar
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 text-red-400 border-red-500/30 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Usuário
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal: Resetar Senha */}
      <AnimatePresence>
        {showResetPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Resetar Senha</h3>
              <div className="space-y-4">
                <Input
                  label="Nova senha"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button variant="outline" fullWidth onClick={() => setShowResetPassword(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" fullWidth onClick={handleResetPassword}>
                    Confirmar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirmar Exclusão */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Confirmar Exclusão</h3>
              <p className="text-sm text-slate-300 mb-6">
                Tem certeza que deseja excluir o usuário <strong>{user.companyName}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setShowDeleteConfirm(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleDeleteUser}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

