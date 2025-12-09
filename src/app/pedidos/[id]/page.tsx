'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { loadOrdersFromStorage, Order } from '@/types/orders'
import { getGraficaData, formatarEnderecoCompleto } from '@/utils/proposalPrivacy'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ArrowLeft, Phone, Mail, MapPin, Building2 } from 'lucide-react'

export default function PedidoDetalhesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const pedidoId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [graficaData, setGraficaData] = useState<ReturnType<typeof getGraficaData> | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth')
      return
    }

    loadOrderData()
  }, [user, isLoading, pedidoId])

  const loadOrderData = () => {
    try {
      const orders = loadOrdersFromStorage()
      const foundOrder = orders.find((o) => o.id === pedidoId)

      if (!foundOrder) {
        alert('Pedido não encontrado')
        router.push('/dashboard')
        return
      }

      setOrder(foundOrder)

      // Se o pedido tem proposta aceita, carrega dados da gráfica
      if (foundOrder.acceptedGraficaId) {
        const grafica = getGraficaData(foundOrder.acceptedGraficaId)
        setGraficaData(grafica)
      }
    } catch (err) {
      console.error('❌ Erro ao carregar pedido:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user || !order) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em aberto':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Em produção':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'Concluído':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Cancelado':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleString('pt-BR')
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)',
        }}
      />

      <main className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Pedido #{pedidoId}
              </h1>
              <p className="text-slate-400 mt-1">
                Detalhes do pedido e informações da gráfica
              </p>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações do Pedido */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Informações do Pedido</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400">Serviço</span>
                  <p className="text-sm text-white font-medium">{order.service}</p>
                </div>
                {order.materialName && (
                  <div>
                    <span className="text-xs text-slate-400">Material</span>
                    <p className="text-sm text-white">{order.materialName}</p>
                  </div>
                )}
                {(order.width || order.height) && (
                  <div>
                    <span className="text-xs text-slate-400">Dimensões</span>
                    <p className="text-sm text-white">
                      {order.width} x {order.height}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-400">Quantidade</span>
                  <p className="text-sm text-white">{order.quantity} unidade(s)</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Prazo</span>
                  <p className="text-sm text-white">{order.deadline}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Status</span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                {order.description && (
                  <div>
                    <span className="text-xs text-slate-400">Descrição</span>
                    <p className="text-sm text-white mt-1">{order.description}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-400">Data de criação</span>
                  <p className="text-sm text-slate-300">{formatDate(order.createdAt)}</p>
                </div>
                {order.acceptedAt && (
                  <div>
                    <span className="text-xs text-slate-400">Data do aceite</span>
                    <p className="text-sm text-slate-300">{formatDate(order.acceptedAt)}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Informações da Gráfica */}
            {order.acceptedGraficaId && graficaData ? (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Gráfica Escolhida</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-400">Nome da Gráfica</span>
                    <p className="text-sm text-white font-medium">{graficaData.companyName}</p>
                  </div>

                  {graficaData.address && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400">Endereço Completo</span>
                      </div>
                      <p className="text-sm text-white">
                        {formatarEnderecoCompleto(graficaData.address)}
                      </p>
                    </div>
                  )}

                  {graficaData.phone && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400">Telefone / WhatsApp</span>
                      </div>
                      <p className="text-sm text-white">{graficaData.phone}</p>
                    </div>
                  )}

                  {graficaData.email && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400">E-mail</span>
                      </div>
                      <p className="text-sm text-white">{graficaData.email}</p>
                    </div>
                  )}

                  {graficaData.displayName && (
                    <div>
                      <span className="text-xs text-slate-400">Nome do Responsável</span>
                      <p className="text-sm text-white">{graficaData.displayName}</p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Gráfica Escolhida</h2>
                <p className="text-sm text-slate-400">
                  Nenhuma proposta foi aceita ainda. Acesse a página de propostas para escolher uma gráfica.
                </p>
                {!order.acceptedProposalId && (
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => router.push(`/pedidos/${pedidoId}/propostas`)}
                  >
                    Ver Propostas
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}


