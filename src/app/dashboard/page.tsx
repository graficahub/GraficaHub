'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, Printer } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Sidebar, { SidebarToggle } from '@/components/Sidebar'
import HeaderDashboard from '@/components/HeaderDashboard'
import ImpersonateBanner from '@/components/admin/ImpersonateBanner'
import { isImpersonating } from '@/utils/impersonate'
import PendingOrdersNotification from '@/components/PendingOrdersNotification'
import MetricCard from '@/components/MetricCard'
import { Order, OrderStatus, loadOrdersFromStorage } from '@/types/orders'
import { cancelarPedido } from '@/utils/orders'
import NewOrderModal from '@/components/NewOrderModal'
import CancelOrderModal from '@/components/CancelOrderModal'
import { loadUserActiveMaterials } from '@/utils/userMaterials'

type Material = {
  id: string
  name: string
  technology: string
}

// Opções pré-definidas
const WIDTH_OPTIONS = [
  { value: '0,60m', label: '0,60m' },
  { value: '1,00m', label: '1,00m' },
  { value: '1,20m', label: '1,20m' },
  { value: '1,60m', label: '1,60m' },
  { value: '1,80m', label: '1,80m' },
  { value: '2,00m', label: '2,00m' },
  { value: '2,50m', label: '2,50m' },
  { value: '3,20m', label: '3,20m' },
  { value: '5,00m', label: '5,00m' },
]

const INK_TECHNOLOGY_OPTIONS = [
  { value: 'Sublimação', label: 'Sublimação' },
  { value: 'EcoSolvente/Solvente', label: 'EcoSolvente/Solvente' },
  { value: 'UV', label: 'UV' },
  { value: 'DTF', label: 'DTF' },
  { value: 'DTF-UV', label: 'DTF-UV' },
]

type FilterStatus = 'Todos' | 'Em aberto' | 'Em produção' | 'Concluído' | 'Cancelado'

export default function DashboardPage() {
  const { user, isLoading, logout, updateUser } = useAuth()
  const router = useRouter()

  // Estados locais
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('Todos')
  const [printers, setPrinters] = useState<Printer[]>([])
  const [materials, setMaterials] = useState<Material[]>([])

  // Estados para modais
  const [showAddPrinter, setShowAddPrinter] = useState(false)
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isUpdatingReceiveOrders, setIsUpdatingReceiveOrders] = useState(false)

  // Estados para formulários
  const [newPrinter, setNewPrinter] = useState<Omit<Printer, 'id'>>({
    name: '',
    width: '',
    inkTechnology: '',
  })
  const [newMaterial, setNewMaterial] = useState<Omit<Material, 'id'>>({
    name: '',
    technology: '',
  })

  const hasPrinters = (user?.printers?.length ?? 0) > 0
  const hasMaterials = user ? loadUserActiveMaterials(user.email).length > 0 : false
  const shouldShowReceiveOrdersBanner =
    !!user && !user.receiveOrdersEnabled && !user.dismissReceiveOrdersBanner

  useEffect(() => {
    if (!user || isLoading) return
    if (!user.dismissReceiveOrdersBanner && !user.receiveOrdersEnabled && hasPrinters && hasMaterials) {
      setIsUpdatingReceiveOrders(true)
      updateUser({ receiveOrdersEnabled: true })
        .catch((err) => console.error('Erro ao ativar recebimento de pedidos:', err))
        .finally(() => setIsUpdatingReceiveOrders(false))
    }
  }, [user, isLoading, hasPrinters, hasMaterials, updateUser])

  // Carrega pedidos do localStorage
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = () => {
    const storedOrders = loadOrdersFromStorage()
    setOrders(storedOrders)
  }

  // Aplica filtro
  useEffect(() => {
    if (activeFilter === 'Todos') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter(o => o.status === activeFilter))
    }
  }, [orders, activeFilter])

  // Carrega impressoras do usuário
  useEffect(() => {
    if (user?.printers) {
      setPrinters(user.printers)
    }
  }, [user])

  // Autenticação é feita pelo layout server-side
  // Verifica apenas se precisa completar onboarding
  useEffect(() => {
    if (user) {
      const onboardingComplete = typeof window !== 'undefined' && 
        localStorage.getItem('GH_ONBOARDING_COMPLETE') === 'true'
      const needsOnboarding = !onboardingComplete && (!user.cpfCnpj || user.cpfCnpj.trim() === '')
      if (needsOnboarding) {
        router.replace('/onboarding')
      }
    }
  }, [user, router])

  // Calcula estatísticas
  const activeOrders = orders.filter(o => o.status !== 'Cancelado')
  const openOrders = activeOrders.filter(o => o.status === 'Em aberto').length
  
  // Pedidos hoje (criados hoje)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const ordersToday = orders.filter(order => {
    const orderDate = new Date(order.createdAt)
    orderDate.setHours(0, 0, 0, 0)
    return orderDate.getTime() === today.getTime()
  }).length

  // Concluídos nos últimos 30 dias
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const completedLast30Days = orders.filter(order => {
    if (order.status !== 'Concluído') return false
    const orderDate = new Date(order.createdAt)
    return orderDate >= thirtyDaysAgo
  }).length

  const printersCount = printers.length

  // Funções para adicionar impressora
  const handleAddPrinter = () => {
    if (!newPrinter.width || !newPrinter.inkTechnology) {
      return
    }

    const printer: Printer = {
      id: Date.now().toString(),
      ...newPrinter,
    }

    const updatedPrinters = [...printers, printer]
    setPrinters(updatedPrinters)

    if (user) {
      updateUser({ printers: updatedPrinters }).catch(console.error)
    }

    setNewPrinter({ name: '', width: '', inkTechnology: '' })
    setShowAddPrinter(false)
  }

  // Funções para adicionar material
  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.technology) {
      return
    }

    const material: Material = {
      id: Date.now().toString(),
      ...newMaterial,
    }

    setMaterials([...materials, material])
    setNewMaterial({ name: '', technology: '' })
    setShowAddMaterial(false)
  }

  // Função para criar novo pedido
  const handleCreateOrderSuccess = (orderId: string) => {
    console.log('✅ Pedido criado:', orderId)
    loadOrders() // Recarrega os pedidos
  }

  // Função para cancelar pedido
  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order)
    setShowCancelOrderModal(true)
  }

  const handleConfirmCancelOrder = () => {
    if (!orderToCancel) return

    cancelarPedido(orderToCancel.id)
    loadOrders() // Recarrega os pedidos
    setShowCancelOrderModal(false)
    setOrderToCancel(null)
  }

  const handleLogout = async () => {
    await logout()
  }

  // Função para obter cor do status
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-700 border border-green-200'
      case 'Em produção':
        return 'bg-blue-100 text-blue-700 border border-blue-200'
      case 'Cancelado':
        return 'bg-gray-100 text-gray-700 border border-gray-300'
      case 'Em aberto':
      default:
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
    }
  }

  // Autenticação é garantida pelo layout server-side
  // user pode ser null temporariamente enquanto carrega do localStorage, mas isso não deve bloquear renderização

  return (
    <div className="min-h-screen w-full bg-gray-50">

      {/* Sidebar */}
      <Sidebar 
        userEmail={user?.email || ''} 
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Botão para abrir sidebar no mobile */}
      {!sidebarOpen && <SidebarToggle onClick={() => setSidebarOpen(true)} />}

      {/* Conteúdo principal */}
      <main className="md:ml-64 min-h-screen">
        {/* Banner de visualização como usuário (apenas se não for preview mode) */}
        {isImpersonating() && <ImpersonateBanner />}
        {/* Notificação de pedidos pendentes */}
        <PendingOrdersNotification />
        
        {/* Header */}
        <HeaderDashboard
          title="Dashboard"
          subtitle={user?.email ? `Bem-vindo de volta, ${user.email}` : 'Dashboard'}
          userEmail={user?.email || ''}
          onLogout={handleLogout}
        />

        {shouldShowReceiveOrdersBanner && (
          <div className="mx-4 md:mx-8 mt-6 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Para receber pedidos, complete impressoras e materiais.
                  </p>
                  <p className="text-xs text-amber-800">
                    Você pode continuar criando pedidos, mas não entrará no algoritmo de entrega.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() => router.push('/setup')}
                >
                  Completar agora
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    setIsUpdatingReceiveOrders(true)
                    try {
                      await updateUser({ dismissReceiveOrdersBanner: true })
                    } finally {
                      setIsUpdatingReceiveOrders(false)
                    }
                  }}
                  disabled={isUpdatingReceiveOrders}
                >
                  Não mostrar mais
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo */}
        <div className="p-4 md:p-8">
          {/* Cards de Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Pedidos em aberto"
              value={openOrders}
              icon={<span>📦</span>}
            />
            <MetricCard
              label="Pedidos hoje"
              value={ordersToday}
              icon={<span>📦</span>}
            />
            <MetricCard
              label="Concluídos (30 dias)"
              value={completedLast30Days}
              icon={<span>✅</span>}
            />
            <MetricCard
              label="Impressoras ativas"
              value={printersCount}
              icon={<span>🖨️</span>}
            />
          </div>

          {/* Grid principal: Pedidos + Impressoras/Materiais */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seção de Pedidos - Ocupa 2/3 em desktop */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Pedidos recentes</h2>
                    <p className="text-xs text-gray-600 mt-1">
                      Pedidos recentes da sua gráfica
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setShowNewOrderModal(true)}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Criar pedido
                  </Button>
                </div>

                {/* Filtros */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Filtrar por status:</p>
                  <div className="flex flex-wrap gap-2">
                    {(['Todos', 'Em aberto', 'Em produção', 'Concluído', 'Cancelado'] as FilterStatus[]).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          activeFilter === filter
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabela de pedidos */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Serviço</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Prazo</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            Nenhum pedido encontrado.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order, index) => (
                          <tr 
                            key={order.id} 
                            onMouseEnter={() => setHoveredOrderId(order.id)}
                            onMouseLeave={() => setHoveredOrderId(null)}
                            className={`
                              border-b border-gray-100 transition-colors
                              ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                              ${order.status === 'Cancelado' ? 'opacity-60' : ''}
                              hover:bg-gray-100
                            `}
                          >
                            <td className="py-3 px-4 text-sm text-gray-900 font-mono">{order.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{order.service}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">{order.deadline}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {order.status !== 'Cancelado' && (
                                  <>
                                    {order.status === 'Em aberto' && (
                                      <button
                                        onClick={() => router.push(`/pedidos/${order.id}/propostas`)}
                                        className="text-sm text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Ver propostas
                                      </button>
                                    )}
                                    {(order.status === 'Em aberto' || order.status === 'Em produção') && (
                                      <button
                                        onClick={() => handleCancelOrder(order)}
                                        className={`
                                          text-sm transition-colors
                                          ${hoveredOrderId === order.id 
                                            ? 'text-red-400 hover:text-red-300' 
                                            : 'text-transparent'
                                          }
                                        `}
                                      >
                                        Cancelar
                                      </button>
                                    )}
                                  </>
                                )}
                                {order.status === 'Cancelado' && (
                                  <span className="text-sm text-gray-600">Cancelado</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Coluna direita: Impressoras e Materiais */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuração da gráfica</h2>
                
                {/* Seção de Impressoras */}
                <Card className="p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <span>🖨️</span>
                      Impressoras
                    </h3>
                    <button
                      onClick={() => setShowAddPrinter(true)}
                      className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                    >
                      + Adicionar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {printers.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-3">
                          Nenhuma impressora cadastrada
                        </p>
                        <Button variant="primary" onClick={() => setShowAddPrinter(true)}>
                          Adicionar
                        </Button>
                      </div>
                    ) : (
                      printers.map((printer) => (
                        <div
                          key={printer.id}
                          className="p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {printer.name || 'Impressora sem nome'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {printer.width} • {printer.inkTechnology}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Seção de Materiais */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <span>📦</span>
                      Materiais
                    </h3>
                    <button
                      onClick={() => setShowAddMaterial(true)}
                      className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                    >
                      + Adicionar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {materials.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-3">
                          Nenhum material cadastrado
                        </p>
                        <Button variant="primary" onClick={() => setShowAddMaterial(true)}>
                          Adicionar
                        </Button>
                      </div>
                    ) : (
                      materials.map((material) => (
                        <div
                          key={material.id}
                          className="p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <p className="text-sm font-medium text-gray-900">{material.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{material.technology}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Criar Novo Pedido */}
      <NewOrderModal
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onSuccess={handleCreateOrderSuccess}
        userId={user?.email}
      />

      {/* Modal Cancelar Pedido */}
      <CancelOrderModal
        isOpen={showCancelOrderModal}
        onClose={() => {
          setShowCancelOrderModal(false)
          setOrderToCancel(null)
        }}
        onConfirm={handleConfirmCancelOrder}
        order={orderToCancel}
      />

      {/* Modal Adicionar Impressora */}
      <AnimatePresence>
        {showAddPrinter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Adicionar Impressora</h3>
              
              <div className="space-y-4">
                <Input
                  label="Nome/modelo (opcional)"
                  type="text"
                  placeholder="Ex: Epson F6070"
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                />

                <Input
                  label="Largura"
                  type="text"
                  placeholder="Ex: 1,60m ou 160cm"
                  value={newPrinter.width}
                  onChange={(e) => setNewPrinter({ ...newPrinter, width: e.target.value })}
                />

                <Select
                  label="Tecnologia da tinta"
                  placeholder="Selecione a tecnologia"
                  value={newPrinter.inkTechnology}
                  onChange={(e) => setNewPrinter({ ...newPrinter, inkTechnology: e.target.value })}
                  options={INK_TECHNOLOGY_OPTIONS}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowAddPrinter(false)
                    setNewPrinter({ name: '', width: '', inkTechnology: '' })
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleAddPrinter}
                  disabled={!newPrinter.width || !newPrinter.inkTechnology}
                >
                  Adicionar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Adicionar Material */}
      <AnimatePresence>
        {showAddMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Adicionar Material</h3>
              
              <div className="space-y-4">
                <Input
                  label="Nome do material"
                  type="text"
                  placeholder="Ex: Lona 440g"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                />

                <Select
                  label="Tecnologia compatível"
                  placeholder="Selecione a tecnologia"
                  value={newMaterial.technology}
                  onChange={(e) => setNewMaterial({ ...newMaterial, technology: e.target.value })}
                  options={INK_TECHNOLOGY_OPTIONS}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowAddMaterial(false)
                    setNewMaterial({ name: '', technology: '' })
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleAddMaterial}
                  disabled={!newMaterial.name || !newMaterial.technology}
                >
                  Adicionar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
