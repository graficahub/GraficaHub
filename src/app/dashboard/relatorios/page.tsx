'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Sidebar, { SidebarToggle } from '@/components/Sidebar'
import HeaderDashboard from '@/components/HeaderDashboard'
import Card from '@/components/ui/Card'
import MetricCard from '@/components/MetricCard'
import { loadOrdersFromStorage, Order } from '@/types/orders'
import { loadMaterialsFromStorage, Material } from '@/utils/materials'
import { loadPrintersFromStorage, Printer } from '@/utils/printers'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

export default function RelatoriosPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Autenticação é feita pelo layout server-side
  // Removida verificação client-side para evitar redirects indevidos

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const storedOrders = loadOrdersFromStorage()
    const storedMaterials = loadMaterialsFromStorage()
    const storedPrinters = loadPrintersFromStorage()
    setOrders(storedOrders)
    setMaterials(storedMaterials)
    setPrinters(storedPrinters)
  }

  // Calcula métricas
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const ordersThisMonth = orders.filter((order) => {
    const orderDate = new Date(order.createdAt)
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
  }).length

  const completedOrders = orders.filter((o) => o.status === 'Concluído')
  const totalValue = completedOrders.reduce((sum, order) => {
    const material = materials.find((m) => m.id === order.materialId)
    if (material && order.width && order.height) {
      const width = parseFloat(order.width.replace(',', '.').replace('m', ''))
      const height = parseFloat(order.height.replace(',', '.').replace('m', ''))
      const area = width * height * order.quantity
      const price = material.precoPorM2 || material.pricePerM2 || 0
      return sum + price * area
    }
    return sum
  }, 0)
  const averageTicket = completedOrders.length > 0 ? totalValue / completedOrders.length : 0

  // Materiais mais usados
  const materialUsage: Record<string, number> = {}
  orders.forEach((order) => {
    if (order.materialId) {
      materialUsage[order.materialId] = (materialUsage[order.materialId] || 0) + order.quantity
    }
  })

  const materialsMostUsed = Object.entries(materialUsage)
    .map(([materialId, count]) => {
      const material = materials.find((m) => m.id === materialId)
      return {
        name: material?.nome || material?.name || 'Desconhecido',
        value: count,
      }
    })
    .sort((a, b) => b.value - a.value)
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

  // Faturamento estimado por mês
  const revenueData: { month: string; faturamento: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
    const monthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear() && order.status === 'Concluído'
    })

    const monthRevenue = monthOrders.reduce((sum, order) => {
      const material = materials.find((m) => m.id === order.materialId)
      if (material && order.width && order.height) {
        const width = parseFloat(order.width.replace(',', '.').replace('m', ''))
        const height = parseFloat(order.height.replace(',', '.').replace('m', ''))
        const area = width * height * order.quantity
        const price = material.precoPorM2 || material.pricePerM2 || 0
        return sum + price * area
      }
      return sum
    }, 0)

    revenueData.push({ month: monthName, faturamento: monthRevenue })
  }

  // Impressoras mais utilizadas (mock - baseado em materiais compatíveis)
  const printerUsage: Record<string, number> = {}
  orders.forEach((order) => {
    if (order.materialId) {
      const material = materials.find((m) => m.id === order.materialId)
      const printerIds = material?.impressorasCompatíveis || material?.compatiblePrinters || []
      printerIds.forEach((printerId) => {
        printerUsage[printerId] = (printerUsage[printerId] || 0) + 1
      })
    }
  })

  const printersMostUsed = Object.entries(printerUsage)
    .map(([printerId, count]) => {
      const printer = printers.find((p) => p.id === printerId)
      return {
        name: printer?.name || 'Desconhecida',
        value: count,
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // Autenticação é garantida pelo layout server-side
  // Não precisa mais verificar isLoading ou !user

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)',
        }}
      />

      <Sidebar
        userEmail={user?.email || ''}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {!sidebarOpen && <SidebarToggle onClick={() => setSidebarOpen(true)} />}

      <main className="md:ml-64 min-h-screen">
        <HeaderDashboard
          title="Relatórios"
          subtitle="Análise e métricas do seu negócio"
          userEmail={user?.email || ''}
          onLogout={logout}
        />

        <div className="p-4 md:p-8">
          {/* Cards de Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Pedidos no mês"
              value={ordersThisMonth}
              icon={<span>📦</span>}
            />
            <MetricCard
              label="Ticket médio"
              value={`R$ ${averageTicket.toFixed(2)}`}
              icon={<span>💰</span>}
            />
            <MetricCard
              label="Materiais cadastrados"
              value={materials.length}
              icon={<span>📦</span>}
            />
            <MetricCard
              label="Impressoras ativas"
              value={printers.length}
              icon={<span>🖨️</span>}
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de Barras: Pedidos por Mês */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pedidos por Mês</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthsData}>
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
            </Card>

            {/* Gráfico de Pizza: Materiais Mais Usados */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Materiais Mais Usados</h3>
              {materialsMostUsed.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={materialsMostUsed}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {materialsMostUsed.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  Nenhum dado disponível
                </div>
              )}
            </Card>
          </div>

          {/* Gráfico de Linha: Faturamento Estimado */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Faturamento Estimado</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
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
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="faturamento"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Tabela: Impressoras Mais Utilizadas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Impressoras Mais Utilizadas</h3>
            {printersMostUsed.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Posição</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Impressora</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Uso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printersMostUsed.map((printer, index) => (
                      <tr
                        key={printer.name}
                        className={`border-b border-white/5 ${index % 2 === 0 ? 'bg-white/2' : 'bg-white/5'}`}
                      >
                        <td className="py-3 px-4 text-sm text-white font-medium">#{index + 1}</td>
                        <td className="py-3 px-4 text-sm text-white">{printer.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-300">{printer.value} pedidos</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Nenhum dado disponível</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}

