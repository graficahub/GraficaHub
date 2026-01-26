'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, X, Edit, Trash2 } from 'lucide-react'
import Sidebar, { SidebarToggle } from '@/components/Sidebar'
import HeaderDashboard from '@/components/HeaderDashboard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Order, OrderStatus, loadOrdersFromStorage, saveOrdersToStorage, generateOrderId } from '@/types/orders'
import { loadMaterialsFromStorage, Material } from '@/utils/materials'

type FilterStatus = 'Todos' | 'Aguardando' | 'Enviado' | 'Aceito' | 'Concluído'

interface OrderWithClient extends Order {
  clientName?: string
  deliveryZip?: string
}

export default function PedidosPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState<OrderWithClient[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderWithClient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('Todos')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])

  // Formulário de novo pedido
  const [newOrder, setNewOrder] = useState({
    clientName: '',
    deliveryZip: '',
    materialId: '',
    size: '',
    observations: '',
  })

  // Autenticação é feita pelo layout server-side
  // Removida verificação client-side para evitar redirects indevidos

  useEffect(() => {
    loadOrders()
    loadMaterials()
  }, [])

  const loadOrders = () => {
    const storedOrders = loadOrdersFromStorage()
    // Converte para OrderWithClient (adiciona campos clientName e deliveryZip se não existirem)
    const ordersWithClient: OrderWithClient[] = storedOrders.map(order => ({
      ...order,
      clientName: (order as any).clientName || 'Cliente não informado',
      deliveryZip: (order as any).deliveryZip || '-',
    }))
    setOrders(ordersWithClient)
  }

  const loadMaterials = () => {
    const storedMaterials = loadMaterialsFromStorage()
    setMaterials(storedMaterials)
  }

  useEffect(() => {
    let filtered = orders

    // Filtro por status
    if (activeFilter !== 'Todos') {
      const statusMap: Record<FilterStatus, OrderStatus> = {
        'Todos': 'Em aberto',
        'Aguardando': 'Em aberto',
        'Enviado': 'Em produção',
        'Aceito': 'Em produção',
        'Concluído': 'Concluído',
      }
      filtered = filtered.filter(o => {
        if (activeFilter === 'Aguardando') return o.status === 'Em aberto'
        if (activeFilter === 'Enviado') return o.status === 'Em produção'
        if (activeFilter === 'Aceito') return o.status === 'Em produção'
        if (activeFilter === 'Concluído') return o.status === 'Concluído'
        return true
      })
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        o =>
          o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (o.clientName && o.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredOrders(filtered)
  }, [orders, activeFilter, searchTerm])

  const handleCreateOrder = () => {
    if (!newOrder.clientName || !newOrder.materialId) {
      alert('Preencha pelo menos o nome do cliente e o material')
      return
    }

    const selectedMaterial = materials.find(m => m.id === newOrder.materialId)
    if (!selectedMaterial) return

    const orders = loadOrdersFromStorage()
    const newOrderData: OrderWithClient = {
      id: generateOrderId(),
      service: selectedMaterial.nome || selectedMaterial.name || 'Material',
      category: 'OUTRO',
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.nome || selectedMaterial.name || 'Material',
      quantity: 1,
      status: 'Em aberto',
      deadline: 'A definir',
      description: newOrder.observations,
      createdAt: new Date().toISOString(),
      userId: user?.email,
      clientName: newOrder.clientName,
      deliveryZip: newOrder.deliveryZip,
      width: newOrder.size,
    }

    orders.push(newOrderData)
    saveOrdersToStorage(orders)
    loadOrders()

    // Reset form
    setNewOrder({
      clientName: '',
      deliveryZip: '',
      materialId: '',
      size: '',
      observations: '',
    })
    setShowCreateModal(false)
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Em aberto':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'Em produção':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      case 'Concluído':
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'Cancelado':
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
    }
  }

  const getStatusLabel = (status: OrderStatus): FilterStatus => {
    if (status === 'Em aberto') return 'Aguardando'
    if (status === 'Em produção') return 'Enviado'
    if (status === 'Concluído') return 'Concluído'
    return 'Aguardando'
  }

  // Autenticação é garantida pelo layout server-side
  // Não precisa mais verificar isLoading ou !user

  return (
    <div className="min-h-screen w-full bg-gray-50">

      <Sidebar
        userEmail={user?.email || ''}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {!sidebarOpen && <SidebarToggle onClick={() => setSidebarOpen(true)} />}

      <main className="md:ml-64 min-h-screen">
        <HeaderDashboard
          title="Pedidos"
          subtitle="Gerencie todos os seus pedidos"
          userEmail={user?.email || ''}
          onLogout={logout}
        />

        <div className="p-4 md:p-8">
          {/* Topo: Botões e Filtros */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 max-w-md w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Buscar pedidos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar novo pedido
              </Button>
            </div>

            {/* Filtros de Status */}
            <div className="flex flex-wrap gap-2">
              {(['Todos', 'Aguardando', 'Enviado', 'Aceito', 'Concluído'] as FilterStatus[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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

          {/* Tabela de Pedidos */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Pedido</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Material</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Quantidade</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, index) => (
                      <tr
                        key={order.id}
                        className={`border-b border-white/5 transition-colors ${
                          index % 2 === 0 ? 'bg-white/2' : 'bg-white/5'
                        } hover:bg-white/10`}
                      >
                        <td className="py-3 px-4 text-sm text-white font-mono">{order.id}</td>
                        <td className="py-3 px-4 text-sm text-white">{order.clientName || '-'}</td>
                        <td className="py-3 px-4 text-sm text-white">
                          {order.materialName || order.service || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-300">{order.quantity}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
      </main>

      {/* Modal: Criar Pedido */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Criar Novo Pedido</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Nome do cliente"
                  type="text"
                  placeholder="Ex: João Silva"
                  value={newOrder.clientName}
                  onChange={(e) => setNewOrder({ ...newOrder, clientName: e.target.value })}
                />

                <Input
                  label="CEP de entrega"
                  type="text"
                  placeholder="00000-000"
                  value={newOrder.deliveryZip}
                  onChange={(e) => setNewOrder({ ...newOrder, deliveryZip: e.target.value })}
                />

                <Select
                  label="Material desejado"
                  placeholder="Selecione o material"
                  value={newOrder.materialId}
                  onChange={(e) => setNewOrder({ ...newOrder, materialId: e.target.value })}
                  options={materials.map((m) => ({ 
                    value: m.id, 
                    label: m.nome || m.name || 'Material sem nome' 
                  }))}
                />

                <Input
                  label="Tamanho/Área"
                  type="text"
                  placeholder="Ex: 1,20m x 2,00m"
                  value={newOrder.size}
                  onChange={(e) => setNewOrder({ ...newOrder, size: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Observações</label>
                  <textarea
                    value={newOrder.observations}
                    onChange={(e) => setNewOrder({ ...newOrder, observations: e.target.value })}
                    placeholder="Observações adicionais..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleCreateOrder}
                  disabled={!newOrder.clientName || !newOrder.materialId}
                >
                  Criar Pedido
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

