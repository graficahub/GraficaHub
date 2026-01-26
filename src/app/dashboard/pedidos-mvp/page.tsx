'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { Plus, CheckCircle, XCircle, Package, AlertCircle } from 'lucide-react'
import Sidebar, { SidebarToggle } from '@/components/Sidebar'
import { getUnreadOrderNotificationsCount } from '@/types/notifications'
import HeaderDashboard from '@/components/HeaderDashboard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  loadOrdersByUser,
  loadPendingOrdersForPrinter,
  acceptOrder,
  rejectOrder,
  choosePrinterForOrder,
  type OrderMVP,
} from '@/utils/ordersMVP'
import { loadMaterialCatalog } from '@/utils/materialCatalogStorage'

export default function PedidosMVPPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'meus' | 'pendentes'>('meus')
  const [myOrders, setMyOrders] = useState<OrderMVP[]>([])
  const [pendingOrders, setPendingOrders] = useState<OrderMVP[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [hasPendingOrdersBadge, setHasPendingOrdersBadge] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Autenticação é feita pelo layout server-side
  useEffect(() => {
    if (user) {
      loadData()
      updateBadge()
      const interval = setInterval(() => {
        loadData()
        updateBadge()
      }, 5000) // Atualiza a cada 5s
      return () => clearInterval(interval)
    }
  }, [user])

  const updateBadge = () => {
    if (!user?.email) return
    const tags = (user as any).tags || []
    const isPremium = (user as any).premium || false
    const count = getUnreadOrderNotificationsCount(user.email, tags, isPremium)
    setHasPendingOrdersBadge(count > 0)
  }

  // Verifica se há tab na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab === 'pendentes') {
      setActiveTab('pendentes')
    }
  }, [])

  const loadData = () => {
    if (!user) return

    // Carrega pedidos do usuário (comprador)
    const orders = loadOrdersByUser(user.email)
    setMyOrders(orders)

    // Carrega pedidos pendentes (gráfica)
    const pending = loadPendingOrdersForPrinter(user.email)
    setPendingOrders(pending)

    // Carrega catálogo
    const catalog = loadMaterialCatalog()
    setMaterials(catalog)
  }

  const handleAccept = (orderId: string) => {
    if (!user) return

    const mensagem = prompt('Deseja adicionar uma mensagem? (opcional)') || undefined
    
    if (acceptOrder(orderId, user.email, mensagem)) {
      loadData()
      alert('Pedido aceito com sucesso!')
    } else {
      alert('Erro ao aceitar pedido')
    }
  }

  const handleReject = (orderId: string) => {
    if (!user) return

    if (confirm('Tem certeza que deseja recusar este pedido?')) {
      if (rejectOrder(orderId, user.email)) {
        loadData()
        alert('Pedido recusado')
      }
    }
  }

  const handleChoosePrinter = (orderId: string, graficaId: string) => {
    if (confirm(`Tem certeza que deseja escolher esta gráfica?`)) {
      if (choosePrinterForOrder(orderId, graficaId)) {
        loadData()
        alert('Gráfica escolhida com sucesso!')
      }
    }
  }

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId)
    if (!material) return 'Material não encontrado'
    return `${material.categoria} - ${material.subcategoria} - ${material.acabamento}`
  }

  const getGraficaName = (email: string) => {
    try {
      const users = JSON.parse(localStorage.getItem('graficaHubUsers') || '[]')
      const user = users.find((u: any) => u.email === email)
      return user?.companyName || email
    } catch {
      return email
    }
  }

  // Autenticação é garantida pelo layout server-side
  // Não precisa mais verificar !user

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Sidebar isMobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      {!sidebarOpen && <SidebarToggle onClick={() => setSidebarOpen(true)} />}

      <main className="md:ml-64 min-h-screen">
        <HeaderDashboard title="Pedidos" />

        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Pedidos</h1>
            <Button
              variant="primary"
              onClick={() => router.push('/pedido/criar')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Pedido
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('meus')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'meus'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Meus Pedidos
            </button>
            <button
              onClick={() => setActiveTab('pendentes')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'pendentes'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pedidos Compatíveis ({pendingOrders.length})
            </button>
          </div>

          {/* Meus Pedidos (Comprador) */}
          {activeTab === 'meus' && (
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <Card className="p-12 text-center">
                  <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhum pedido criado
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Crie seu primeiro pedido para começar
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => router.push('/pedido/criar')}
                  >
                    Criar Pedido
                  </Button>
                </Card>
              ) : (
                myOrders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Pedido {order.id}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'finalizado'
                            ? 'bg-green-500/20 text-green-400'
                            : order.status === 'aceito'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {order.status === 'finalizado' && 'Finalizado'}
                        {order.status === 'aceito' && 'Aguardando escolha'}
                        {order.status === 'pendente' && 'Pendente'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-slate-300">
                        <strong>Material:</strong> {getMaterialName(order.materialId)}
                      </p>
                      <p className="text-sm text-slate-300">
                        <strong>Quantidade:</strong> {order.quantidade}
                      </p>
                      {order.observacoes && (
                        <p className="text-sm text-slate-300">
                          <strong>Observações:</strong> {order.observacoes}
                        </p>
                      )}
                    </div>

                    {order.aceites.length > 0 && (
                      <div className="mb-4 p-4 bg-white/5 rounded-lg">
                        <h4 className="text-sm font-semibold text-white mb-3">
                          Gráficas que aceitaram ({order.aceites.length}):
                        </h4>
                        <div className="space-y-2">
                          {order.aceites.map((aceite, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {getGraficaName(aceite.graficaId)}
                                </p>
                                {aceite.mensagem && (
                                  <p className="text-xs text-slate-400 mt-1">
                                    {aceite.mensagem}
                                  </p>
                                )}
                              </div>
                              {order.status !== 'finalizado' && (
                                <Button
                                  variant="primary"
                                  onClick={() => handleChoosePrinter(order.id, aceite.graficaId)}
                                >
                                  Escolher
                                </Button>
                              )}
                              {order.graficaEscolhida === aceite.graficaId && (
                                <span className="text-xs text-green-400 font-medium">
                                  ✓ Escolhida
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.status === 'pendente' && order.aceites.length === 0 && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm text-yellow-400">
                          Aguardando gráficas compatíveis aceitarem o pedido...
                        </p>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Pedidos Pendentes (Gráfica) */}
          {activeTab === 'pendentes' && (
            <div className="space-y-4">
              {pendingOrders.length === 0 ? (
                <Card className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhum pedido pendente
                  </h3>
                  <p className="text-slate-400">
                    Quando houver pedidos compatíveis com suas impressoras, eles aparecerão aqui.
                  </p>
                </Card>
              ) : (
                pendingOrders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Pedido {order.id}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-slate-300">
                        <strong>Material:</strong> {getMaterialName(order.materialId)}
                      </p>
                      <p className="text-sm text-slate-300">
                        <strong>Quantidade:</strong> {order.quantidade}
                      </p>
                      {order.observacoes && (
                        <p className="text-sm text-slate-300">
                          <strong>Observações:</strong> {order.observacoes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        onClick={() => handleAccept(order.id)}
                        className="flex items-center gap-2 flex-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aceitar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(order.id)}
                        className="flex items-center gap-2 flex-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Recusar
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

