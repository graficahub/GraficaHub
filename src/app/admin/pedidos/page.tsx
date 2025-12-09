'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { loadOrdersFromStorage, Order, OrderStatus } from '@/types/orders'

interface OrderWithClient extends Order {
  clientName?: string
  graficaName?: string
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<OrderWithClient[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderWithClient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'Todos'>('Todos')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = () => {
    const storedOrders = loadOrdersFromStorage()
    
    // Obtém nomes das gráficas
    try {
      const storedUsers = localStorage.getItem('graficaHubUsers')
      const users = storedUsers ? JSON.parse(storedUsers) : []
      
      const ordersWithClient: OrderWithClient[] = storedOrders.map((order) => {
        const user = users.find((u: any) => u.email === order.userId)
        return {
          ...order,
          clientName: (order as any).clientName || 'Cliente não informado',
          graficaName: user?.companyName || order.userId || 'Gráfica desconhecida',
        }
      })
      
      setOrders(ordersWithClient)
    } catch (err) {
      console.error('❌ Erro ao carregar pedidos:', err)
      setOrders(storedOrders)
    }
  }

  useEffect(() => {
    let filtered = orders

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (o.clientName && o.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (o.graficaName && o.graficaName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro por status
    if (statusFilter !== 'Todos') {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }

    // Filtro por data
    if (dateFilter) {
      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.createdAt)
        const filterDate = new Date(dateFilter)
        
        if (dateFilter.length === 4) {
          // Filtro por ano
          return orderDate.getFullYear() === filterDate.getFullYear()
        } else if (dateFilter.length === 7) {
          // Filtro por mês/ano
          return (
            orderDate.getMonth() === filterDate.getMonth() &&
            orderDate.getFullYear() === filterDate.getFullYear()
          )
        } else {
          // Filtro por data completa
          return (
            orderDate.getDate() === filterDate.getDate() &&
            orderDate.getMonth() === filterDate.getMonth() &&
            orderDate.getFullYear() === filterDate.getFullYear()
          )
        }
      })
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter, dateFilter])

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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return '-'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="px-4 md:px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Pedidos</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Visualize todos os pedidos da plataforma
          </p>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
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
            <Select
              placeholder="Filtrar por status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'Todos')}
              options={[
                { value: 'Todos', label: 'Todos' },
                { value: 'Em aberto', label: 'Em aberto' },
                { value: 'Em produção', label: 'Em produção' },
                { value: 'Concluído', label: 'Concluído' },
                { value: 'Cancelado', label: 'Cancelado' },
              ]}
              className="w-48"
            />
            <Input
              type="date"
              placeholder="Filtrar por data"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>

        {/* Tabela de Pedidos */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">ID do Pedido</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Gráfica</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Cliente Final</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Material</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Data de Criação</th>
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
                      <td className="py-3 px-4 text-sm text-white">{order.graficaName || '-'}</td>
                      <td className="py-3 px-4 text-sm text-white">{order.clientName || '-'}</td>
                      <td className="py-3 px-4 text-sm text-white">
                        {order.materialName || order.service || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}


