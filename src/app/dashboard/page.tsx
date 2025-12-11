'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, Printer } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Sidebar, { SidebarToggle } from '@/components/Sidebar'
import HeaderDashboard from '@/components/HeaderDashboard'
import ImpersonateBanner from '@/components/admin/ImpersonateBanner'
import { isPreviewMode } from '@/utils/adminData'
import PendingOrdersNotification from '@/components/PendingOrdersNotification'
import MetricCard from '@/components/MetricCard'
import { Order, OrderStatus, loadOrdersFromStorage } from '@/types/orders'
import { cancelarPedido } from '@/utils/orders'
import NewOrderModal from '@/components/NewOrderModal'
import CancelOrderModal from '@/components/CancelOrderModal'

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
  const [materials, setMaterials] = useState<Material[]>([
    { id: '1', name: 'Lona 440g', technology: 'EcoSolvente/Solvente' },
    { id: '2', name: 'Adesivo vinil', technology: 'EcoSolvente/Solvente' },
    { id: '3', name: 'Papel fotográfico', technology: 'Sublimação' },
  ])

  // Estados para modais
  const [showAddPrinter, setShowAddPrinter] = useState(false)
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  // Carrega pedidos do localStorage
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = () => {
    const storedOrders = loadOrdersFromStorage()
    
    // Se não houver pedidos salvos, mantém os mockOrders iniciais para demonstração
    if (storedOrders.length === 0) {
      const initialOrders: Order[] = [
        { 
          id: 'PED-001', 
          service: 'Lona 440g', 
          category: 'Lona',
          quantity: 1,
          status: 'Em aberto', 
          deadline: 'Hoje',
          createdAt: new Date().toISOString(),
        },
        { 
          id: 'PED-002', 
          service: 'Adesivo vinil', 
          category: 'Adesivo',
          quantity: 1,
          status: 'Em produção', 
          deadline: 'Amanhã',
          createdAt: new Date().toISOString(),
        },
        { 
          id: 'PED-003', 
          service: 'Banner 510g', 
          category: 'Banner',
          quantity: 1,
          status: 'Em aberto', 
          deadline: '2 dias',
          createdAt: new Date().toISOString(),
        },
        { 
          id: 'PED-004', 
          service: 'Papel fotográfico', 
          category: 'Papel fotográfico',
          quantity: 1,
          status: 'Concluído', 
          deadline: 'Concluído',
          createdAt: new Date().toISOString(),
        },
        { 
          id: 'PED-005', 
          service: 'Tecido poliéster', 
          category: 'Tecido poliéster',
          quantity: 1,
          status: 'Em produção', 
          deadline: 'Hoje',
          createdAt: new Date().toISOString(),
        },
        { 
          id: 'PED-006', 
          service: 'Adesivo perfurado', 
          category: 'Adesivo perfurado',
          quantity: 1,
          status: 'Em aberto', 
          deadline: '3 dias',
          createdAt: new Date().toISOString(),
        },
      ]
      setOrders(initialOrders)
    } else {
      setOrders(storedOrders)
    }
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
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'Em produção':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'Cancelado':
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
      case 'Em aberto':
      default:
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    }
  }

  // Autenticação é garantida pelo layout server-side
  // user pode ser null temporariamente enquanto carrega do localStorage, mas isso não deve bloquear renderização

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Efeito vignette */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)'
        }}
      />

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
        {!isPreviewMode() && <ImpersonateBanner />}
        {/* Notificação de pedidos pendentes */}
        <PendingOrdersNotification />
        
        {/* Header */}
        <HeaderDashboard
          title="Dashboard"
          subtitle={user?.email ? `Bem-vindo de volta, ${user.email}` : 'Dashboard'}
          userEmail={user?.email || ''}
          onLogout={handleLogout}
        />

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
                    <h2 className="text-lg font-semibold text-white">Pedidos recentes</h2>
                    <p className="text-xs text-slate-400 mt-1">
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
                  <p className="text-xs text-slate-400 mb-2">Filtrar por status:</p>
                  <div className="flex flex-wrap gap-2">
                    {(['Todos', 'Em aberto', 'Em produção', 'Concluído', 'Cancelado'] as FilterStatus[]).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          activeFilter === filter
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
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
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Serviço</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Prazo</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
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
                              border-b border-white/5 transition-colors
                              ${index % 2 === 0 ? 'bg-white/2' : 'bg-white/5'}
                              ${order.status === 'Cancelado' ? 'opacity-60' : ''}
                              hover:bg-white/10
                            `}
                          >
                            <td className="py-3 px-4 text-sm text-white font-mono">{order.id}</td>
                            <td className="py-3 px-4 text-sm text-white">{order.service}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-300">{order.deadline}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {order.status !== 'Cancelado' && (
                                  <>
                                    {order.status === 'Em aberto' && (
                                      <button
                                        onClick={() => router.push(`/pedidos/${order.id}/propostas`)}
                                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
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
                                  <span className="text-sm text-slate-500">Cancelado</span>
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
                <h2 className="text-lg font-semibold text-white mb-4">Configuração da gráfica</h2>
                
                {/* Seção de Impressoras */}
                <Card className="p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <span>🖨️</span>
                      Impressoras
                    </h3>
                    <button
                      onClick={() => setShowAddPrinter(true)}
                      className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                    >
                      + Adicionar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {printers.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">
                        Nenhuma impressora cadastrada
                      </p>
                    ) : (
                      printers.map((printer) => (
                        <div
                          key={printer.id}
                          className="p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <p className="text-sm font-medium text-white">
                            {printer.name || 'Impressora sem nome'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
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
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
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
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <p className="text-sm font-medium text-white">{material.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{material.technology}</p>
                      </div>
                    ))}
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
              <h3 className="text-xl font-semibold text-white mb-4">Adicionar Impressora</h3>
              
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
              <h3 className="text-xl font-semibold text-white mb-4">Adicionar Material</h3>
              
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
