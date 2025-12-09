'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '@/components/ui/Card'
import MetricCard from '@/components/MetricCard'
import { loadOrdersFromStorage, Order } from '@/types/orders'
import { loadMaterialsFromStorage, Material } from '@/utils/materials'
// Função auxiliar para obter usuários (duplicada do useAuth para uso no admin)
function getStoredUsers() {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem('graficaHubUsers')
    return stored ? JSON.parse(stored) : []
  } catch (err) {
    console.error('❌ Erro ao carregar usuários:', err)
    return []
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    ordersToday: 0,
    ordersThisMonth: 0,
    ordersThisYear: 0,
    averageTicket: 0,
    totalMaterials: 0,
  })

  const [monthlyData, setMonthlyData] = useState<{ month: string; pedidos: number }[]>([])
  const [topMaterials, setTopMaterials] = useState<{ name: string; count: number }[]>([])
  const [averagePrice, setAveragePrice] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    // Carrega dados
    const users = getStoredUsers()
    const orders = loadOrdersFromStorage()
    const materials = loadMaterialsFromStorage()

    // Calcula estatísticas
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const ordersToday = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      orderDate.setHours(0, 0, 0, 0)
      return orderDate.getTime() === today.getTime()
    }).length

    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    const ordersThisMonth = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
    }).length

    const ordersThisYear = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate.getFullYear() === currentYear
    }).length

    // Calcula ticket médio
    const completedOrders = orders.filter((o) => o.status === 'Concluído')
    let totalValue = 0
    completedOrders.forEach((order) => {
      const material = materials.find((m) => m.id === order.materialId)
      if (material && order.width && order.height) {
        const width = parseFloat(order.width.replace(',', '.').replace('m', ''))
        const height = parseFloat(order.height.replace(',', '.').replace('m', ''))
        const area = width * height * order.quantity
        const price = material.precoPorM2 || material.pricePerM2 || 0
        totalValue += price * area
      }
    })
    const averageTicket = completedOrders.length > 0 ? totalValue / completedOrders.length : 0

    // Calcula preço médio dos materiais
    const prices = materials.map((m) => m.precoPorM2 || m.pricePerM2 || 0).filter((p) => p > 0)
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0

    // Materiais mais usados
    const materialUsage: Record<string, number> = {}
    orders.forEach((order) => {
      if (order.materialId) {
        materialUsage[order.materialId] = (materialUsage[order.materialId] || 0) + order.quantity
      }
    })

    const topMaterialsList = Object.entries(materialUsage)
      .map(([materialId, count]) => {
        const material = materials.find((m) => m.id === materialId)
        return {
          name: material?.nome || material?.name || 'Desconhecido',
          count,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Pedidos por mês (últimos 6 meses)
    const monthsData: { month: string; pedidos: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
      }).length
      monthsData.push({ month: monthName, pedidos: monthOrders })
    }

    setStats({
      totalUsers: users.length,
      ordersToday,
      ordersThisMonth,
      ordersThisYear,
      averageTicket,
      totalMaterials: materials.length,
    })

    setMonthlyData(monthsData)
    setTopMaterials(topMaterialsList)
    setAveragePrice(avgPrice)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="px-4 md:px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Painel Administrativo – GraficaHub
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Visão geral do sistema
          </p>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <MetricCard
            label="Total de usuários"
            value={stats.totalUsers}
            icon={<span>👥</span>}
          />
          <MetricCard
            label="Pedidos hoje"
            value={stats.ordersToday}
            icon={<span>📦</span>}
          />
          <MetricCard
            label="Pedidos no mês"
            value={stats.ordersThisMonth}
            icon={<span>📊</span>}
          />
          <MetricCard
            label="Pedidos no ano"
            value={stats.ordersThisYear}
            icon={<span>📈</span>}
          />
          <MetricCard
            label="Ticket médio"
            value={`R$ ${stats.averageTicket.toFixed(2)}`}
            icon={<span>💰</span>}
          />
          <MetricCard
            label="Materiais cadastrados"
            value={stats.totalMaterials}
            icon={<span>📦</span>}
          />
        </div>

        {/* Gráficos e Relatórios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Pedidos por Mês */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pedidos por Mês</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                Nenhum dado disponível
              </div>
            )}
          </Card>

          {/* Top 5 Materiais Mais Usados */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top 5 Materiais Mais Usados</h3>
            {topMaterials.length > 0 ? (
              <div className="space-y-3">
                {topMaterials.map((material, index) => (
                  <div
                    key={material.name}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-blue-400">#{index + 1}</span>
                      <span className="text-sm text-white">{material.name}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-300">{material.count} pedidos</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                Nenhum dado disponível
              </div>
            )}
          </Card>
        </div>

        {/* Preço Médio dos Materiais */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Preço Médio dos Materiais</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-blue-400">R$ {averagePrice.toFixed(2)}</div>
            <div className="text-sm text-slate-400">por m²</div>
          </div>
        </Card>
      </div>
    </div>
  )
}

